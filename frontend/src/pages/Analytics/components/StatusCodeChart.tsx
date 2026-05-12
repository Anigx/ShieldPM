import { IconChartBar } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import type { AnalyticsSeriesPoint } from "src/pages/Analytics/hooks/useAnalyticsData";

interface StatusCodeChartProps {
	data: AnalyticsSeriesPoint[];
}

export function StatusCodeChart({ data }: StatusCodeChartProps) {
	return (
		<Card className="col-span-3">
			<CardHeader>
				<CardTitle>
					<T id="analytics.status-codes" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[320px] flex items-center justify-center">
					{data.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data}>
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
									cursor={{ fill: "transparent" }}
									contentStyle={{
										backgroundColor: "#0f172a",
										borderColor: "#1e293b",
										borderRadius: 8,
									}}
								/>
								<Legend />
								<Bar dataKey="s2xx" name="2xx" stackId="status" fill="#22c55e" />
								<Bar dataKey="s4xx" name="4xx" stackId="status" fill="#f59e0b" />
								<Bar dataKey="s5xx" name="5xx" stackId="status" fill="#ef4444" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="text-muted-foreground flex flex-col items-center gap-2">
							<IconChartBar className="h-10 w-10 opacity-50" />
							<T id="analytics.status.no-data" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
