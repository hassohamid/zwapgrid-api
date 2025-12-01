import { NextResponse } from "next/server";

const ZWAPGRID_API = "https://apione.zwapgrid.com/accounting";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ consentId: string }> }
) {
	const { consentId } = await params;

	const res = await fetch(
		`${ZWAPGRID_API}/api/v1/consents/${consentId}/accountingperiods`,
		{
			headers: {
				"x-api-key": process.env.ZWAPGRID_API_KEY!,
				"x-correlation-id": crypto.randomUUID(),
			},
		}
	);

	if (!res.ok) {
		const error = await res.text();
		console.error("Failed to fetch accounting periods:", res.status, error);
		return NextResponse.json(
			{ error: "Failed to fetch accounting periods", details: error },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return NextResponse.json(data);
}
