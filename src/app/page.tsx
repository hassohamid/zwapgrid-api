"use client";

import { useState } from "react";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	async function startOnboarding() {
		setLoading(true);
		try {
			const res = await fetch("/api/consent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name || undefined }),
			});
			const data = await res.json();

			if (data.onboardingUrl) {
				window.location.href = data.onboardingUrl;
			} else {
				console.error(data);
				alert("Failed to start onboarding");
			}
		} catch (err) {
			console.error(err);
			alert("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#09090b]">
			{/* Gradient orbs */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-[120px]" />
				<div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
				<div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-[120px]" />
			</div>

			{/* Grid pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
					backgroundSize: "64px 64px",
				}}
			/>

			<main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
				<div className="w-full max-w-md">
					{/* Logo / Brand */}
					<div className="mb-12 text-center">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
							<svg
								className="h-6 w-6 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-semibold tracking-tight text-white">
							Connect Your Accounting
						</h1>
						<p className="mt-2 text-sm text-zinc-500">
							Securely link your accounting system in seconds
						</p>
					</div>

					{/* Card */}
					<div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl">
						<div className="space-y-6">
							{/* Input */}
							<div>
								<label
									htmlFor="ref"
									className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
								>
									Name (optional)
								</label>
								<input
									id="ref"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Acme Corp"
									className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
								/>
							</div>

							{/* Button */}
							<button
								onClick={startOnboarding}
								disabled={loading}
								className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 p-px font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
							>
								<span className="relative flex items-center justify-center gap-2 rounded-[7px] bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 transition-all group-hover:from-violet-500 group-hover:to-blue-500">
									{loading ? (
										<>
											<svg
												className="h-4 w-4 animate-spin"
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
											Connecting...
										</>
									) : (
										<>
											Start Connection
											<svg
												className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M13 7l5 5m0 0l-5 5m5-5H6"
												/>
											</svg>
										</>
									)}
								</span>
							</button>
						</div>

						{/* Trust badges */}
						<div className="mt-8 flex items-center justify-center gap-6 border-t border-white/[0.05] pt-6">
							<div className="flex items-center gap-1.5 text-xs text-zinc-600">
								<svg
									className="h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
								Bank-level security
							</div>
							<div className="flex items-center gap-1.5 text-xs text-zinc-600">
								<svg
									className="h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
								Read-only access
							</div>
						</div>
					</div>

					{/* Footer */}
					<p className="mt-6 text-center text-xs text-zinc-600">
						Powered by{" "}
						<span className="font-medium text-zinc-500">Zwapgrid</span>
					</p>
				</div>
			</main>
		</div>
	);
}
