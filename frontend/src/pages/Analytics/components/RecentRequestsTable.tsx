import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import type { AnalyticsRequestLog } from "src/api/backend";
import { Flag } from "src/components";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { T } from "src/locale";
import { formatDuration, formatTime } from "src/pages/Analytics/utils/format";

interface RecentRequestsTableProps {
	requests?: AnalyticsRequestLog[];
	isDemo?: boolean;
	title?: string;
}

type RequestFilter = "all" | "GET" | "POST" | "2xx" | "4xx" | "5xx";

const filters: RequestFilter[] = ["all", "GET", "POST", "2xx", "4xx", "5xx"];

function matchesFilter(request: AnalyticsRequestLog, filter: RequestFilter) {
	if (filter === "all") return true;
	if (filter === "GET" || filter === "POST") return request.method.toUpperCase() === filter;
	if (filter === "2xx") return request.status >= 200 && request.status < 300;
	if (filter === "4xx") return request.status >= 400 && request.status < 500;
	if (filter === "5xx") return request.status >= 500;
	return true;
}

function getStatusBadgeClass(status: number) {
	if (status >= 200 && status < 300) return "bg-green-500/20 text-green-300 border-green-500/40";
	if (status >= 300 && status < 400) return "bg-blue-500/20 text-blue-300 border-blue-500/40";
	if (status >= 400 && status < 500) return "bg-orange-500/20 text-orange-300 border-orange-500/40";
	return "bg-red-500/20 text-red-300 border-red-500/40";
}

function getMethodBadgeClass(method: string) {
	switch (method.toUpperCase()) {
		case "GET":
			return "bg-blue-500/20 text-blue-300 border-blue-500/40";
		case "POST":
			return "bg-purple-500/20 text-purple-300 border-purple-500/40";
		case "PUT":
		case "PATCH":
			return "bg-orange-500/20 text-orange-300 border-orange-500/40";
		case "DELETE":
			return "bg-red-500/20 text-red-300 border-red-500/40";
		default:
			return "bg-slate-500/20 text-slate-300 border-slate-500/40";
	}
}

export function RecentRequestsTable({ requests = [], isDemo = false, title }: RecentRequestsTableProps) {
	const intl = useIntl();
	const [activeFilter, setActiveFilter] = useState<RequestFilter>("all");
	const [query, setQuery] = useState("");
	const resolvedTitle = title ?? intl.formatMessage({ id: "analytics.recent-requests" });
	const hiddenIpLabel = intl.formatMessage({ id: "analytics.hidden-ip" });

	const filteredRequests = useMemo(() => {
		return requests.filter((request) => {
			if (!matchesFilter(request, activeFilter)) return false;
			if (!query.trim()) return true;
			const normalized = query.toLowerCase();
			return (
				request.path.toLowerCase().includes(normalized) ||
				request.ip.toLowerCase().includes(normalized) ||
				request.method.toLowerCase().includes(normalized)
			);
		});
	}, [requests, activeFilter, query]);

	return (
		<Card>
			<CardHeader className="space-y-4">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
					<CardTitle>{resolvedTitle}</CardTitle>
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder={intl.formatMessage({ id: "analytics.table.search-placeholder" })}
						className="w-full lg:w-[340px]"
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					{filters.map((filter) => (
						<Button
							key={filter}
							variant={activeFilter === filter ? "default" : "outline"}
							size="sm"
							onClick={() => setActiveFilter(filter)}
						>
							{filter === "all" ? intl.formatMessage({ id: "analytics.table.filter.all" }) : filter}
						</Button>
					))}
				</div>
			</CardHeader>
			<CardContent>
				{filteredRequests.length ? (
					<div className="relative w-full overflow-auto">
						<table className="w-full text-sm">
							<thead className="border-b border-slate-800 text-muted-foreground">
								<tr>
									<th className="h-10 text-left font-medium px-2">
										<T id="analytics.table.time" />
									</th>
									<th className="h-10 text-left font-medium px-2">
										<T id="analytics.table.method" />
									</th>
									<th className="h-10 text-left font-medium px-2">
										<T id="analytics.table.status" />
									</th>
									<th className="h-10 text-left font-medium px-2">
										<T id="analytics.table.path" />
									</th>
									<th className="h-10 text-left font-medium px-2">IP</th>
									<th className="h-10 text-left font-medium px-2">
										<T id="analytics.table.country" />
									</th>
									<th className="h-10 text-right font-medium px-2">
										<T id="analytics.table.duration" />
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredRequests.map((request, index) => (
									<tr
										key={`${request.time}-${request.ip}-${index}`}
										className="border-b border-slate-900 hover:bg-slate-900/40"
									>
										<td className="p-2 whitespace-nowrap">{formatTime(request.time)}</td>
										<td className="p-2">
											<Badge className={getMethodBadgeClass(request.method)}>
												{request.method}
											</Badge>
										</td>
										<td className="p-2">
											<Badge className={getStatusBadgeClass(request.status)}>
												{request.status}
											</Badge>
										</td>
										<td className="p-2 max-w-[360px] truncate" title={request.path}>
											{request.path}
										</td>
										<td className="p-2 font-mono text-xs">{isDemo ? hiddenIpLabel : request.ip}</td>
										<td className="p-2">
											{request.countryCode ? (
												<div className="flex items-center gap-2">
													<Flag
														countryCode={request.countryCode}
														className="h-4 w-4 rounded-sm overflow-hidden"
													/>
													<span className="text-xs text-muted-foreground">
														{request.countryCode}
													</span>
												</div>
											) : (
												<span className="text-xs text-muted-foreground">-</span>
											)}
										</td>
										<td className="p-2 text-right whitespace-nowrap">
											{formatDuration(request.duration)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-sm text-muted-foreground text-center py-8">
						<T id="analytics.table.no-results" />
					</p>
				)}
			</CardContent>
		</Card>
	);
}
