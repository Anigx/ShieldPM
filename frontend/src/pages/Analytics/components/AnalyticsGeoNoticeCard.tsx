import { Card, CardContent } from "src/components/ui/card";
import { T } from "src/locale";

export function AnalyticsGeoNoticeCard() {
	return (
		<Card className="border-cyan-900/60 bg-slate-950/50">
			<CardContent className="p-4 text-sm text-muted-foreground">
				<T id="analytics.geo.notice" />
			</CardContent>
		</Card>
	);
}
