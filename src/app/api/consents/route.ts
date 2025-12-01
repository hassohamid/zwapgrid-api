import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ZWAPGRID_API = "https://apione.zwapgrid.com/consents";

export async function GET() {
	const supabase = await createClient();

	// Get all consents from our database
	const { data: consents, error } = await supabase
		.from("consents")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// Fetch latest status from Zwapgrid for each consent
	const enrichedConsents = await Promise.all(
		consents.map(async (consent) => {
			try {
				const res = await fetch(
					`${ZWAPGRID_API}/api/v1/consents/${consent.consent_id}`,
					{
						headers: {
							"x-api-key": process.env.ZWAPGRID_API_KEY!,
							"x-correlation-id": crypto.randomUUID(),
						},
					}
				);

				if (res.ok) {
					const zwapgridData = await res.json();
					return {
						...consent,
						source: zwapgridData.source,
						zwapgrid_status: zwapgridData.status,
					};
				}
			} catch (e) {
				console.error("Failed to fetch Zwapgrid data for", consent.consent_id);
			}
			return consent;
		})
	);

	return NextResponse.json(enrichedConsents);
}
