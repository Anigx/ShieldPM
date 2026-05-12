import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";

export interface AnalyticsTopListItem {
	label: string;
	count: number;
	title?: string;
}

interface AnalyticsTopListCardProps {
	titleId: string;
	items: AnalyticsTopListItem[];
	emptyId?: string;
}

export function AnalyticsTopListCard({
	titleId,
	items,
	emptyId = "analytics.list.no-data",
}: AnalyticsTopListCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<T id={titleId} />
				</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length ? (
					<div className="space-y-2">
						{items.map((item) => (
							<div key={`${titleId}-${item.label}`} className="flex items-center justify-between gap-2 text-sm">
								<span className="truncate text-muted-foreground" title={item.title ?? item.label}>
									{item.label}
								</span>
								<span className="text-slate-200">{item.count.toLocaleString("de-DE")}</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground py-4 text-center">
						<T id={emptyId} />
					</p>
				)}
			</CardContent>
		</Card>
	);
}
