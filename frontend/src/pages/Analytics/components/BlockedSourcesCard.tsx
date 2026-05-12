import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import { getRiskBadgeClass } from "src/pages/Analytics/utils/analyticsRisk";
import type { GeoIpHotspot } from "../hooks/useGeoIntelligence";

interface BlockedSourcesCardProps {
	items: GeoIpHotspot[];
	isHeuristic?: boolean;
}

export function BlockedSourcesCard({ items, isHeuristic = true }: BlockedSourcesCardProps) {
	const sourceItems = items.filter((item) => item.risk === "critical" || item.risk === "high").slice(0, 6);
	const titleId = isHeuristic ? "analytics.geo.suspicious-sources" : "analytics.geo.blocked-sources";

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between gap-2">
					<CardTitle>
						<T id={titleId} />
					</CardTitle>
					{isHeuristic ? (
						<span className="text-[11px] rounded border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-purple-300">
							<T id="analytics.geo.heuristic" />
						</span>
					) : null}
				</div>
			</CardHeader>
			<CardContent>
				{sourceItems.length ? (
					<div className="space-y-2">
						{sourceItems.map((item) => (
							<div key={`blocked-${item.ip}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
								<span className="font-mono truncate" title={item.ip}>
									{item.ip}
								</span>
								<span>{item.count.toLocaleString("de-DE")}</span>
								<span className={`rounded px-2 py-0.5 text-xs ${getRiskBadgeClass(item.risk)}`}>{item.riskLabel}</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						<T id="analytics.geo.no-blocked-or-suspicious-sources" />
					</p>
				)}
			</CardContent>
		</Card>
	);
}

