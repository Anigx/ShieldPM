import { IconActivity } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import type { AnalyticsSeriesPoint } from "src/pages/Analytics/hooks/useAnalyticsData";

interface AnalyticsTrafficChartProps {
	data: AnalyticsSeriesPoint[];
}

export function AnalyticsTrafficChart({ data }: AnalyticsTrafficChartProps) {
	return (
		<Card className="col-span-4">
			<CardHeader>
				<CardTitle>
					<T id="analytics.requests-over-time" />
				</CardTitle>
			</CardHeader>
			<CardContent className="pl-2">
				<div className="h-[320px] flex items-center justify-center">
					{data.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={data}>
								<defs>
									<linearGradient id="analyticsCount" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
										<stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="analytics2xx" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
										<stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey="timeDisplay"
									stroke="#94a3b8"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									minTickGap={28}
								/>
								<YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
								<Tooltip
									contentStyle={{
										backgroundColor: "#0f172a",
										borderColor: "#1e293b",
										borderRadius: 8,
									}}
									labelStyle={{ color: "#e2e8f0" }}
								/>
								<Legend />
								<Area
									type="monotone"
									dataKey="count"
									name="Gesamt"
									stroke="#06b6d4"
									fill="url(#analyticsCount)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="s2xx"
									name="2xx"
									stroke="#22c55e"
									fill="url(#analytics2xx)"
									strokeWidth={1.4}
								/>
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<div className="text-muted-foreground flex flex-col items-center gap-2">
							<IconActivity className="h-10 w-10 opacity-50" />
							<T id="analytics.no-data-period" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
