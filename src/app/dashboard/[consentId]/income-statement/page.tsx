"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

interface IncomeStatementRow {
	accountNumber: string;
	accountName: string;
	amount: number;
	level: number;
	isCategory?: boolean;
}

interface AccountingPeriod {
	startDate: string;
	endDate: string;
	[key: string]: unknown;
}

export default function IncomeStatementPage() {
	const params = useParams();
	const consentId = params.consentId as string;

	const [data, setData] = useState<IncomeStatementRow[]>([]);
	const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRow, setSelectedRow] = useState<IncomeStatementRow | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);

	useEffect(() => {
		fetchPeriods();
	}, [consentId]);

	useEffect(() => {
		if (selectedPeriod) {
			fetchData();
		}
	}, [selectedPeriod]);

	async function fetchPeriods() {
		try {
			const res = await fetch(`/api/consent/${consentId}/accounting-periods`);
			const json = await res.json();
			const periodList = Array.isArray(json) ? json : json.data || json.periods || json.items || [];
			setPeriods(periodList);

			// Auto-select current/latest period
			if (periodList.length > 0) {
				const now = new Date();
				const current = periodList.find((p: AccountingPeriod) =>
					new Date(p.startDate) <= now && new Date(p.endDate) >= now
				) || periodList[periodList.length - 1];
				setSelectedPeriod(current);
			} else {
				setLoading(false);
			}
		} catch (err) {
			console.error(err);
			setLoading(false);
		}
	}

	async function fetchData() {
		if (!selectedPeriod) return;
		setLoading(true);
		try {
			// EndDate can't be in the future - use today if needed
			const today = new Date().toISOString().split("T")[0];
			const endDate = selectedPeriod.endDate > today ? today : selectedPeriod.endDate;

			const res = await fetch(
				`/api/consent/${consentId}/income-statement?startDate=${selectedPeriod.startDate}&endDate=${endDate}&level=3`
			);
			const json = await res.json();

			// Parse the nested Zwapgrid structure
			const rows: IncomeStatementRow[] = [];
			const categories = json.financialReport?.categories || [];

			for (const category of categories) {
				// Add category row
				const categoryName = category.descriptions?.find((d: { languageId: string; text: string }) => d.languageId === "SWE")?.text
					|| category.descriptions?.[0]?.text || "Unknown";
				const categoryAmount = category.balance?.baseCurrencies?.[0]?.baseAmount || 0;

				rows.push({
					accountNumber: "",
					accountName: categoryName,
					amount: categoryAmount,
					level: 0,
					isCategory: true,
				});

				// Add subcategories
				for (const subCat of category.subCategories || []) {
					const subCatName = subCat.descriptions?.find((d: { languageId: string; text: string }) => d.languageId === "SWE")?.text
						|| subCat.descriptions?.[0]?.text || "Unknown";
					const subCatAmount = subCat.balance?.baseCurrencies?.[0]?.baseAmount || 0;

					rows.push({
						accountNumber: "",
						accountName: subCatName,
						amount: subCatAmount,
						level: 1,
						isCategory: true,
					});

					// Add accounts
					for (const account of subCat.accounts || []) {
						const accName = account.accountingAccount?.description?.text || "Unknown";
						const accNumber = account.accountingAccount?.id || "";
						const accAmount = account.balance?.baseCurrencies?.[0]?.baseAmount || 0;

						rows.push({
							accountNumber: accNumber,
							accountName: accName,
							amount: accAmount,
							level: 2,
							isCategory: false,
						});
					}
				}
			}

			// Add profit/loss row at the end
			const profitLoss = json.profitLossBalance?.baseCurrencies?.[0]?.baseAmount;
			if (profitLoss !== undefined) {
				rows.push({
					accountNumber: "",
					accountName: "Resultat",
					amount: profitLoss,
					level: 0,
					isCategory: true,
				});
			}

			setData(rows);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	const formatAmount = (amount?: number) => {
		if (amount === undefined || amount === null) return "—";
		return new Intl.NumberFormat("sv-SE", {
			style: "currency",
			currency: "SEK",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="min-h-screen bg-[#09090b]">
			{/* Header */}
			<header className="border-b border-white/[0.08]">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard"
							className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-white"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
							</svg>
							Back
						</Link>
						<div className="h-6 w-px bg-white/[0.1]" />
						<h1 className="text-lg font-semibold text-white">Income Statement</h1>
					</div>
					{periods.length > 0 && (
						<select
							value={selectedPeriod ? `${selectedPeriod.startDate}|${selectedPeriod.endDate}` : ""}
							onChange={(e) => {
								const [start, end] = e.target.value.split("|");
								const period = periods.find(p => p.startDate === start && p.endDate === end);
								if (period) setSelectedPeriod(period);
							}}
							className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none"
						>
							{periods.map((p, idx) => (
								<option key={idx} value={`${p.startDate}|${p.endDate}`}>
									{p.startDate} — {p.endDate}
								</option>
							))}
						</select>
					)}
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-8">
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<svg className="h-8 w-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
					</div>
				) : data.length === 0 ? (
					<div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-12 text-center">
						<p className="text-zinc-500">No income statement data available</p>
					</div>
				) : (
					<div className="rounded-xl border border-white/[0.08] overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02]">
									<TableHead className="text-zinc-500">Account</TableHead>
									<TableHead className="text-zinc-500">Name</TableHead>
									<TableHead className="text-right text-zinc-500">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((row, idx) => (
									<TableRow
										key={idx}
										onClick={() => setSelectedRow(row)}
										className={`cursor-pointer border-white/[0.05] transition-colors hover:bg-white/[0.03] ${
											row.isCategory ? "bg-white/[0.02]" : ""
										}`}
									>
										<TableCell className="font-mono text-sm text-zinc-400">
											{row.accountNumber || ""}
										</TableCell>
										<TableCell
											className={`${row.isCategory ? "font-semibold text-white" : "text-zinc-300"}`}
											style={{ paddingLeft: `${(row.level || 0) * 24 + 16}px` }}
										>
											{row.accountName || "—"}
										</TableCell>
										<TableCell className={`text-right font-mono ${
											row.isCategory ? "font-semibold" : ""
										} ${(row.amount || 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>
											{formatAmount(row.amount)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</main>

			{/* Detail Sheet */}
			<Sheet open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
				<SheetContent className="border-white/[0.1] bg-[#0f0f11]">
					<SheetHeader>
						<SheetTitle className="text-white">
							{selectedRow?.accountName || "Account Details"}
						</SheetTitle>
					</SheetHeader>
					{selectedRow && (
						<div className="mt-6 space-y-4">
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
									Account Number
								</p>
								<p className="mt-1 font-mono text-lg text-white">
									{selectedRow.accountNumber || "—"}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
									Amount
								</p>
								<p className={`mt-1 text-2xl font-semibold ${(selectedRow.amount || 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>
									{formatAmount(selectedRow.amount)}
								</p>
							</div>
							<div className="border-t border-white/[0.08] pt-4">
								<p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
									All Data
								</p>
								<pre className="mt-2 overflow-auto rounded-lg bg-white/[0.03] p-4 text-xs text-zinc-400">
									{JSON.stringify(selectedRow, null, 2)}
								</pre>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
