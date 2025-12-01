import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ZWAPGRID_API = "https://apione.zwapgrid.com/consents";

export async function POST(request: Request) {
	const body = await request.json();
	const { name } = body;

	const correlationId = crypto.randomUUID();

	// 1. Create consent
	const consentRes = await fetch(`${ZWAPGRID_API}/api/v1/consents`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": process.env.ZWAPGRID_API_KEY!,
			"x-correlation-id": correlationId,
		},
		body: JSON.stringify({
			name: name || `consent-${Date.now()}`,
		}),
	});

	if (!consentRes.ok) {
		const error = await consentRes.text();
		console.error("Zwapgrid create consent failed:", consentRes.status, error);
		return NextResponse.json(
			{ error: "Failed to create consent", status: consentRes.status, details: error },
			{ status: 500 }
		);
	}

	// Extract consent ID from location header
	const location = consentRes.headers.get("location");
	const consentId = location?.split("/").pop();

	if (!consentId) {
		return NextResponse.json(
			{ error: "Failed to get consent ID from response" },
			{ status: 500 }
		);
	}

	// 2. Store consent in database
	const supabase = await createClient();
	const { error: dbError } = await supabase.from("consents").insert({
		consent_id: consentId,
		name: name || `consent-${Date.now()}`,
		status: 0,
	});

	if (dbError) {
		console.error("Failed to store consent:", dbError);
	}

	// 3. Generate OTC
	const otcRes = await fetch(
		`${ZWAPGRID_API}/api/v1/consents/${consentId}/otc`,
		{
			method: "POST",
			headers: {
				"x-api-key": process.env.ZWAPGRID_API_KEY!,
				"x-correlation-id": crypto.randomUUID(),
			},
		}
	);

	if (!otcRes.ok) {
		const error = await otcRes.text();
		console.error("Zwapgrid OTC failed:", otcRes.status, error);
		return NextResponse.json(
			{ error: "Failed to generate OTC", status: otcRes.status, details: error },
			{ status: 500 }
		);
	}

	const otc = await otcRes.json();

	// 4. Return onboarding URL (OTC must be URL-encoded)
	const encodedOtc = encodeURIComponent(otc.code);
	const onboardingUrl = `https://onboarding.zwapgrid.com/consent/${consentId}/?otc=${encodedOtc}`;

	return NextResponse.json({
		consentId,
		onboardingUrl,
	});
}
