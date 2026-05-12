import { IconAdjustmentsHorizontal, IconAlertTriangle, IconRosetteDiscountCheckFilled, IconServer } from "@tabler/icons-react";
import { useIntl } from "react-intl";
import { Button } from "src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { T } from "src/locale";
import type { AnalyticsRange } from "src/pages/Analytics/hooks/useAnalyticsData";

interface HostOption {
	id: number;
	domainNames: string[];
}

export interface StatusBadge {
	label: string;
	variant?: "stable" | "warning" | "alert";
}

interface AnalyticsHeaderProps {
	title: string;
	subtitle: string;
	hosts?: HostOption[];
	selectedHostId: string;
	onHostChange: (hostId: string) => void;
	range: AnalyticsRange;
	onRangeChange: (range: AnalyticsRange) => void;
	statusBadges?: StatusBadge[];
	showFilterButton?: boolean;
}

const rangeOptions: AnalyticsRange[] = ["1h", "24h", "7d", "30d"];

const statusVariantClass: Record<NonNullable<StatusBadge["variant"]>, string> = {
	stable: "bg-green-500/15 text-green-300 border-green-500/40",
	warning: "bg-orange-500/15 text-orange-300 border-orange-500/40",
	alert: "bg-red-500/15 text-red-300 border-red-500/40",
};

export function AnalyticsHeader({
	title,
	subtitle,
	hosts,
	selectedHostId,
	onHostChange,
	range,
	onRangeChange,
	statusBadges,
	showFilterButton = true,
}: AnalyticsHeaderProps) {
	const intl = useIntl();

	return (
		<div className="space-y-4">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">{title}</h2>
					<p className="text-muted-foreground">{subtitle}</p>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
					<Select value={selectedHostId} onValueChange={onHostChange}>
						<SelectTrigger className="w-full sm:w-[220px]">
							<IconServer className="mr-2 h-4 w-4 text-muted-foreground" />
							<SelectValue placeholder={intl.formatMessage({ id: "analytics.host" })} />
						</SelectTrigger>
						<SelectContent>
							{hosts?.map((host) => (
								<SelectItem key={host.id} value={String(host.id)}>
									{host.domainNames[0] ??
										intl.formatMessage(
											{ id: "analytics.host-id" },
											{
												id: host.id,
											},
										)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<div className="flex bg-muted rounded-md p-1">
						{rangeOptions.map((item) => (
							<Button
								key={item}
								variant={range === item ? "default" : "ghost"}
								size="sm"
								className="h-8"
								onClick={() => onRangeChange(item)}
							>
								<T id={`analytics.range.${item}`} />
							</Button>
						))}
					</div>

					{showFilterButton ? (
						<Button variant="outline" size="sm" className="gap-2">
							<IconAdjustmentsHorizontal className="h-4 w-4" />
							<T id="options" />
						</Button>
					) : null}
				</div>
			</div>

			{statusBadges?.length ? (
				<div className="flex flex-wrap gap-2">
					{statusBadges.map((status) => {
						const variant = status.variant ?? "stable";
						const Icon = variant === "stable" ? IconRosetteDiscountCheckFilled : IconAlertTriangle;
						return (
							<span
								key={status.label}
								className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${statusVariantClass[variant]}`}
							>
								<Icon className="h-3.5 w-3.5" />
								{status.label}
							</span>
						);
					})}
				</div>
			) : null}
		</div>
	);
}

