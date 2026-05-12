import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";

interface TimelineItem {
	time: string;
	critical: number;
	suspicious: number;
	blocked: number;
}

interface HotspotTimelineCardProps {
	items: TimelineItem[];
	showBlocked?: boolean;
	blockedIsHeuristic?: boolean;
}

export function HotspotTimelineCard({
	items,
	showBlocked = true,
	blockedIsHeuristic = true,
}: HotspotTimelineCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between gap-2">
					<CardTitle>
						<T id="analytics.geo.hotspot-timeline" />
					</CardTitle>
					{showBlocked && blockedIsHeuristic ? (
						<span className="text-[11px] rounded border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-purple-300">
							<T id="analytics.geo.blocked-is-heuristic" />
						</span>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="h-[220px]">
				{items.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={items}>
							<XAxis
								dataKey="time"
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								minTickGap={26}
							/>
							<YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
							<Tooltip
								contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: 8 }}
							/>
							<Legend />
							<Line
								dataKey="critical"
								name="Kritisch"
								type="monotone"
								stroke="#ef4444"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								dataKey="suspicious"
								name="Auffällig"
								type="monotone"
								stroke="#f59e0b"
								strokeWidth={2}
								dot={false}
							/>
							{showBlocked ? (
								<Line
									dataKey="blocked"
									name="Blockiert"
									type="monotone"
									stroke="#a855f7"
									strokeWidth={2}
									dot={false}
								/>
							) : null}
						</LineChart>
					</ResponsiveContainer>
				) : (
					<p className="text-sm text-muted-foreground">
						<T id="analytics.geo.no-timeline-data" />
					</p>
				)}
			</CardContent>
		</Card>
	);
}
