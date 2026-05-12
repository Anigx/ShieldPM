import { useMemo } from "react";
import { useIntl } from "react-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import { getRegionLabelId } from "src/pages/Analytics/utils/geo";
import type { RegionTraffic } from "../hooks/useGeoIntelligence";

interface RegionTrafficCardProps {
	items: RegionTraffic[];
}

export function RegionTrafficCard({ items }: RegionTrafficCardProps) {
	const intl = useIntl();
	const chartData = useMemo(
		() =>
			items.map((item) => ({
				...item,
				regionLabel: intl.formatMessage({ id: getRegionLabelId(item.region) }),
			})),
		[items, intl],
	);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>
					<T id="analytics.geo.region-traffic" />
				</CardTitle>
			</CardHeader>
			<CardContent className="h-[220px]">
				{items.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chartData}>
							<XAxis
								dataKey="regionLabel"
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								interval={0}
							/>
							<YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
							<Tooltip
								cursor={{ fill: "transparent" }}
								contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: 8 }}
							/>
							<Bar dataKey="requests" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<p className="text-sm text-muted-foreground">
						<T id="analytics.geo.no-region-data" />
					</p>
				)}
			</CardContent>
		</Card>
	);
}
