"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompanyInfo {
	partyLegalEntity?: {
		registrationName?: string;
		companyId?: {
			id?: string;
		};
	};
}

interface Connection {
	id: string;
	consent_id: string;
	name: string;
	status: number;
	source?: string;
	zwapgrid_status?: number;
	created_at: string;
	companyInfo?: CompanyInfo;
}

export default function Dashboard() {
	const [connections, setConnections] = useState<Connection[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedConnection, setSelectedConnection] =
		useState<Connection | null>(null);

	useEffect(() => {
		fetchConnections();
	}, []);

	async function fetchConnections() {
		try {
			const res = await fetch("/api/consents");
			const consents = await res.json();

			// Only keep connected consents (status 1)
			const connected = consents.filter(
				(c: Connection) => c.zwapgrid_status === 1 || c.status === 1,
			);

			// Fetch company info for each connected consent
			const withCompanyInfo = await Promise.all(
				connected.map(async (consent: Connection) => {
					try {
						const companyRes = await fetch(
							`/api/consent/${consent.consent_id}/company`,
						);
						if (companyRes.ok) {
							const companyInfo = await companyRes.json();
							return { ...consent, companyInfo };
						}
					} catch (e) {
						console.error("Failed to fetch company info", e);
					}
					return consent;
				}),
			);

			setConnections(withCompanyInfo);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-[#09090b]">
			{/* Header */}
			<header className="border-b border-white/[0.08]">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<span className="text-lg font-semibold text-white">
							Zwapgrid Test
						</span>
					</div>
					<Link
						href="/"
						className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Company
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Stats */}
				<div className="mb-8 grid grid-cols-3 gap-4">
					<div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
						<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
							Connected Companies
						</p>
						<p className="mt-2 text-3xl font-semibold text-white">
							{connections.length}
						</p>
					</div>
					<div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
						<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
							Data Sources
						</p>
						<p className="mt-2 text-3xl font-semibold text-white">
							{
								[...new Set(connections.map((c) => c.source))].filter(Boolean)
									.length
							}
						</p>
					</div>
					<div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
						<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
							Status
						</p>
						<p className="mt-2 flex items-center gap-2 text-lg font-medium text-emerald-400">
							<span className="h-2 w-2 rounded-full bg-emerald-400" />
							All systems operational
						</p>
					</div>
				</div>

				{/* Section Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-white">Companies</h1>
						<p className="mt-1 text-sm text-zinc-500">
							Your connected accounting systems
						</p>
					</div>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-20">
						<svg
							className="h-8 w-8 animate-spin text-violet-500"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				) : connections.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] p-16 text-center">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20">
							<svg
								className="h-7 w-7 text-violet-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-white">
							No companies connected
						</h3>
						<p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
							Connect your first company to start pulling accounting data from
							their system
						</p>
						<Link
							href="/"
							className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add Company
						</Link>
					</div>
				) : (
					<>
						{/* Companies Table */}
						<div className="overflow-hidden rounded-xl border border-white/[0.08]">
							<table className="w-full">
								<thead>
									<tr className="border-b border-white/[0.08] bg-white/[0.02]">
										<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
											Company
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
											Org Number
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
											Source
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
											Connected
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/[0.05]">
									{connections.map((connection) => (
										<tr
											key={connection.id}
											className="bg-white/[0.01] transition-colors hover:bg-white/[0.03]"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20">
														<span className="text-sm font-semibold text-violet-400">
															{(
																connection.companyInfo?.partyLegalEntity
																	?.registrationName || connection.name
															)
																.charAt(0)
																.toUpperCase()}
														</span>
													</div>
													<span className="font-medium text-white">
														{connection.companyInfo?.partyLegalEntity
															?.registrationName || connection.name}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="font-mono text-sm text-zinc-400">
													{connection.companyInfo?.partyLegalEntity?.companyId
														?.id || "—"}
												</span>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-zinc-300">
													{connection.source || "—"}
												</span>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
													<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
													Connected
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-zinc-500">
												{new Date(connection.created_at).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 text-right">
												<button
													onClick={() => setSelectedConnection(connection)}
													className="rounded-lg px-3 py-1.5 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/10"
												>
													View Data
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Detail Modal */}
						{selectedConnection && (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
								<div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0f0f11] p-6 shadow-2xl">
									<div className="mb-6 flex items-start justify-between">
										<div>
											<h2 className="text-xl font-semibold text-white">
												{selectedConnection.companyInfo?.partyLegalEntity
													?.registrationName || selectedConnection.name}
											</h2>
											<p className="mt-1 font-mono text-sm text-zinc-500">
												{
													selectedConnection.companyInfo?.partyLegalEntity
														?.companyId?.id
												}
											</p>
										</div>
										<button
											onClick={() => setSelectedConnection(null)}
											className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
										>
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>

									<div className="space-y-3">
										<Link
											href={`/dashboard/${selectedConnection.consent_id}/income-statement`}
											className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
													<svg
														className="h-5 w-5 text-emerald-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={2}
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
														/>
													</svg>
												</div>
												<div>
													<p className="font-medium text-white">
														Income Statement
													</p>
													<p className="text-sm text-zinc-500">
														Revenue, expenses & profit
													</p>
												</div>
											</div>
											<svg
												className="h-5 w-5 text-zinc-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</Link>

										<Link
											href={`/dashboard/${selectedConnection.consent_id}/balance-sheet`}
											className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
													<svg
														className="h-5 w-5 text-blue-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={2}
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
														/>
													</svg>
												</div>
												<div>
													<p className="font-medium text-white">
														Balance Sheet
													</p>
													<p className="text-sm text-zinc-500">
														Assets, liabilities & equity
													</p>
												</div>
											</div>
											<svg
												className="h-5 w-5 text-zinc-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</Link>

										<Link
											href={`/dashboard/${selectedConnection.consent_id}/invoices`}
											className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
													<svg
														className="h-5 w-5 text-amber-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={2}
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
														/>
													</svg>
												</div>
												<div>
													<p className="font-medium text-white">Invoices</p>
													<p className="text-sm text-zinc-500">
														Sales & supplier invoices
													</p>
												</div>
											</div>
											<svg
												className="h-5 w-5 text-zinc-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</Link>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
