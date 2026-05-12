import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import { getRiskBadgeClass } from "src/pages/Analytics/utils/analyticsRisk";
import type { GeoIpHotspot } from "../hooks/useGeoIntelligence";

interface TopIpHotspotsCardProps {
	items: GeoIpHotspot[];
}

export function TopIpHotspotsCard({ items }: TopIpHotspotsCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>
					<T id="analytics.geo.top-ip-hotspots" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length ? (
					<div className="space-y-2">
						{items.slice(0, 6).map((item) => (
							<div key={item.ip} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
								<span className="font-mono truncate" title={item.ip}>
									{item.ip}
								</span>
								<span className="text-slate-200">{item.count.toLocaleString("de-DE")}</span>
								<span className={`rounded px-2 py-0.5 text-xs ${getRiskBadgeClass(item.risk)}`}>
									{item.riskLabel}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						<T id="analytics.geo.no-ip-hotspots" />
					</p>
				)}
			</CardContent>
		</Card>
	);
}
