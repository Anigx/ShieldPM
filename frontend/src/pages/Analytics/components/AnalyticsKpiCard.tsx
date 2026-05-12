import type { ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";

interface AnalyticsKpiCardProps {
	title: string;
	value: string;
	description?: string;
	trend?: string;
	icon: ElementType;
	iconClassName?: string;
}

export function AnalyticsKpiCard({
	title,
	value,
	description,
	trend,
	icon: Icon,
	iconClassName = "text-muted-foreground",
}: AnalyticsKpiCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className={`h-4 w-4 ${iconClassName}`} />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description ? <p className="text-xs text-muted-foreground mt-1">{description}</p> : null}
				{trend ? <p className="text-xs text-cyan-300 mt-1">{trend}</p> : null}
			</CardContent>
		</Card>
	);
}
