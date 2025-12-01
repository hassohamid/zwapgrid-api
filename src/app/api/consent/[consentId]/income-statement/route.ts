import { NextResponse } from "next/server";

const ZWAPGRID_API = "https://apione.zwapgrid.com/accounting";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ consentId: string }> }
) {
	const { consentId } = await params;
	const { searchParams } = new URL(request.url);

	const startDate = searchParams.get("startDate") || "2024-01-01";
	const endDate = searchParams.get("endDate") || "2024-12-31";
	const level = searchParams.get("level") || "3"; // Max detail

	const res = await fetch(
		`${ZWAPGRID_API}/api/v1/consents/${consentId}/incomestatement?StartDate=${startDate}&EndDate=${endDate}&Level=${level}`,
		{
			headers: {
				"x-api-key": process.env.ZWAPGRID_API_KEY!,
				"x-correlation-id": crypto.randomUUID(),
			},
		}
	);

	if (!res.ok) {
		const error = await res.text();
		console.error("Failed to fetch income statement:", res.status, error);
		return NextResponse.json(
			{ error: "Failed to fetch income statement", details: error },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return NextResponse.json(data);
}
