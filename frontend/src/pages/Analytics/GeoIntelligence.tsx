import {
	IconAlertTriangle,
	IconCircleCheck,
	IconFilter,
	IconFlame,
	IconShield,
	IconTargetArrow,
	IconWorld,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Loading } from "src/components";
import { Button } from "src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { useToast } from "src/hooks";
import { T } from "src/locale";
import { useAnalyticsData, type AnalyticsRange } from "src/pages/Analytics/hooks/useAnalyticsData";
import { useGeoIntelligence } from "src/pages/Analytics/hooks/useGeoIntelligence";
import {
	BlockedSourcesCard,
	GeoInsightsPanel,
	GeoThreatMap,
	HotspotTimelineCard,
	RegionTrafficCard,
	TopIpHotspotsCard,
} from "./components";

export default function GeoIntelligence() {
	const { toast } = useToast();
	const intl = useIntl();
	const {
		hosts,
		hostsLoading,
		selectedHostId,
		setSelectedHostId,
		range,
		setRange,
		summary,
		series,
		loading,
		isDemo,
	} = useAnalyticsData("24h");
	const geo = useGeoIntelligence({
		summary,
		series,
		isDemo,
		hiddenIpLabel: intl.formatMessage({ id: "analytics.hidden-ip" }),
	});

	const [mode, setMode] = useState<"choropleth" | "bubble" | "threat">("threat");
	const [layers, setLayers] = useState({
		traffic: true,
		anomalies: true,
		blocked: true,
		sources: true,
	});

	const ipCardRef = useRef<HTMLDivElement | null>(null);

	if ((loading && !summary) || hostsLoading) {
		return (
			<div className="p-8 text-center">
				<Loading />
			</div>
		);
	}

	const blockedLabel = `${geo.heuristicBlockedRequests.toLocaleString("de-DE")} ${intl.formatMessage({ id: "analytics.geo.heuristic-short" })}`;

	return (
		<div className="p-4 md:p-8 pt-6 space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">
					<T id="analytics.geo.title" />
				</h2>
				<p className="text-muted-foreground">
					<T id="analytics.geo.subtitle" />
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
					<p className="text-xs text-muted-foreground flex items-center gap-2"><IconWorld className="h-4 w-4 text-cyan-300" /><T id="analytics.geo.kpi.active-countries" /></p>
					<p className="text-2xl font-semibold mt-1">{geo.activeCountryCount}</p>
				</div>
				<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
					<p className="text-xs text-muted-foreground flex items-center gap-2"><IconAlertTriangle className="h-4 w-4 text-orange-300" /><T id="analytics.geo.kpi.suspicious-countries" /></p>
					<p className="text-2xl font-semibold mt-1">{geo.suspiciousCountryCount}</p>
				</div>
				<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
					<p className="text-xs text-muted-foreground flex items-center gap-2"><IconShield className="h-4 w-4 text-purple-300" /><T id="analytics.geo.kpi.blocked-requests" /></p>
					<p className="text-2xl font-semibold mt-1">{blockedLabel}</p>
				</div>
				<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
					<p className="text-xs text-muted-foreground flex items-center gap-2"><IconTargetArrow className="h-4 w-4 text-cyan-300" /><T id="analytics.geo.kpi.top-hotspot" /></p>
					<p className="text-2xl font-semibold mt-1">{geo.topHotspot}</p>
				</div>
				<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
					<p className="text-xs text-muted-foreground flex items-center gap-2"><IconFlame className="h-4 w-4 text-red-300" /><T id="analytics.geo.kpi.peak" /></p>
					<p className="text-2xl font-semibold mt-1">{geo.peakTime}</p>
				</div>
			</div>

			<div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-3">
				<div className="flex flex-col xl:flex-row xl:items-center gap-3">
					<div className="flex flex-col sm:flex-row gap-2">
						<Select value={selectedHostId} onValueChange={setSelectedHostId}>
							<SelectTrigger className="w-full sm:w-[240px]">
								<SelectValue placeholder={intl.formatMessage({ id: "column.host" })} />
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

						<Select value={range} onValueChange={(nextRange) => setRange(nextRange as AnalyticsRange)}>
							<SelectTrigger className="w-full sm:w-[220px]">
								<SelectValue>
									<T id={`analytics.geo.range.${range}`} />
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1h">
									<T id="analytics.geo.range.1h" />
								</SelectItem>
								<SelectItem value="24h">
									<T id="analytics.geo.range.24h" />
								</SelectItem>
								<SelectItem value="7d">
									<T id="analytics.geo.range.7d" />
								</SelectItem>
								<SelectItem value="30d">
									<T id="analytics.geo.range.30d" />
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						{[
							{ key: "choropleth", labelId: "analytics.geo.mode.choropleth" },
							{ key: "bubble", labelId: "analytics.geo.mode.bubble" },
							{ key: "threat", labelId: "analytics.geo.mode.threat-layer" },
						].map((entry) => (
							<Button
								key={entry.key}
								variant={mode === entry.key ? "default" : "outline"}
								size="sm"
								onClick={() => setMode(entry.key as "choropleth" | "bubble" | "threat")}
							>
								<T id={entry.labelId} />
							</Button>
						))}
					</div>

					<Button
						variant="outline"
						size="sm"
						className="gap-2 xl:ml-auto"
						onClick={() =>
							toast({
								title: intl.formatMessage({ id: "analytics.geo.filter.title" }),
								description: intl.formatMessage({ id: "analytics.geo.filter.phase2" }),
							})
						}
					>
						<IconFilter className="h-4 w-4" />
						<T id="analytics.geo.filter" />
					</Button>
				</div>

				<div className="flex flex-wrap gap-2">
					{[
						{ key: "traffic", labelId: "analytics.geo.layer.traffic" },
						{ key: "anomalies", labelId: "analytics.geo.layer.anomalies" },
						{ key: "blocked", labelId: "analytics.geo.layer.blocked" },
						{ key: "sources", labelId: "analytics.geo.layer.top-attack-sources" },
					].map((entry) => (
						<Button
							key={entry.key}
							variant={layers[entry.key as keyof typeof layers] ? "default" : "outline"}
							size="sm"
							onClick={() =>
								setLayers((current) => ({
									...current,
									[entry.key]: !current[entry.key as keyof typeof current],
								}))
							}
						>
							<T id={entry.labelId} />
						</Button>
					))}
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-12">
				<div className="xl:col-span-8">
					<GeoThreatMap
						countryInsights={geo.countryInsights}
						selectedCountryCode={geo.selectedCountryCode}
						onSelectCountry={geo.setSelectedCountryCode}
						mode={mode}
						layers={layers}
					/>
				</div>
				<div className="xl:col-span-4">
					<GeoInsightsPanel
						countries={geo.countryInsights}
						suspiciousCountries={geo.suspiciousCountries}
						selectedCountry={geo.selectedCountry}
						onSelectCountry={geo.setSelectedCountryCode}
						onFilterCountry={() => {
							if (!geo.selectedCountry) {
								toast({
									title: intl.formatMessage({ id: "analytics.geo.toast.notice" }),
									description: intl.formatMessage({ id: "analytics.geo.toast.select-country-first" }),
								});
								return;
							}
							toast({
								title: intl.formatMessage({ id: "analytics.geo.toast.country-filter-active" }),
								description: intl.formatMessage(
									{ id: "analytics.geo.toast.country-focus-set" },
									{ country: geo.selectedCountry.countryName },
								),
							});
						}}
						onShowIps={() => {
							ipCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
						}}
						onComingSoonAction={(action) => {
							toast({
								title:
									action === "rule"
										? intl.formatMessage({ id: "analytics.geo.action.create-rule" })
										: intl.formatMessage({ id: "analytics.geo.action.block" }),
								description: intl.formatMessage({ id: "analytics.geo.toast.coming-soon" }),
							});
						}}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div ref={ipCardRef}>
					<TopIpHotspotsCard items={geo.topIpHotspots} />
				</div>
				<RegionTrafficCard items={geo.regionTraffic} />
				<BlockedSourcesCard items={geo.topIpHotspots} isHeuristic />
				<HotspotTimelineCard items={geo.timelineData} showBlocked blockedIsHeuristic />
			</div>

			<div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
				<IconCircleCheck className="h-4 w-4 text-cyan-300" />
				<T id="analytics.geo.heuristic-note" />
			</div>
		</div>
	);
}

