import { IconMapPin, IconMinus, IconPlus, IconReload } from "@tabler/icons-react";
import { geoCentroid } from "d3-geo";
import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useMemo, useState } from "react";
import {
	ComposableMap,
	Geographies,
	Geography,
	Line,
	Marker,
	ZoomableGroup,
} from "react-simple-maps";
import { Button } from "src/components/ui/button";
import { T } from "src/locale";
import { getRiskStroke } from "src/pages/Analytics/utils/analyticsRisk";
import { formatPercent } from "src/pages/Analytics/utils/format";
import type { GeoCountryInsight } from "../hooks/useGeoIntelligence";

isoCountries.registerLocale(enLocale);

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeoThreatMapProps {
	countryInsights: GeoCountryInsight[];
	selectedCountryCode: string | null;
	onSelectCountry: (countryCode: string | null) => void;
	mode: "choropleth" | "bubble" | "threat";
	layers: {
		traffic: boolean;
		anomalies: boolean;
		blocked: boolean;
		sources: boolean;
	};
}

interface HoverState {
	country: GeoCountryInsight;
}

export function GeoThreatMap({ countryInsights, selectedCountryCode, onSelectCountry, mode, layers }: GeoThreatMapProps) {
	const [zoom, setZoom] = useState(1);
	const [center, setCenter] = useState<[number, number]>([0, 15]);
	const [hovered, setHovered] = useState<HoverState | null>(null);

	const countryMap = useMemo(() => {
		const map = new Map<string, GeoCountryInsight>();
		for (const country of countryInsights) {
			map.set(country.countryCode, country);
		}
		return map;
	}, [countryInsights]);

	const maxCountryCount = countryInsights[0]?.requests ?? 1;
	const primaryCountry = countryInsights[0] ?? null;

	const resetView = () => {
		setZoom(1);
		setCenter([0, 15]);
		onSelectCountry(null);
	};

	return (
		<div className="relative rounded-xl border border-slate-800 bg-[#071124] overflow-hidden">
			<div className="h-[460px] w-full bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.16),transparent_40%)]">
				<ComposableMap projectionConfig={{ scale: 160 }}>
					<ZoomableGroup zoom={zoom} center={center} onMoveEnd={(position) => setCenter(position.coordinates)}>
						<Geographies geography={GEO_URL}>
							{({ geographies }) => {
								const centroidMap = new Map<string, [number, number]>();

								return (
									<>
										{geographies.map((geo) => {
											const code = isoCountries.numericToAlpha2(geo.id)?.toUpperCase() ?? "";
											const country = countryMap.get(code);
											const centroid = geoCentroid(geo) as [number, number];
											centroidMap.set(code, centroid);

											let fill = "#1b2a40";
											if (country && layers.traffic) {
												const intensity = Math.max(0.12, Math.log(country.requests + 1) / Math.log(maxCountryCount + 1));
												fill = `rgba(14,165,233,${Math.min(0.8, intensity + 0.1)})`;
											}
											if (country && (country.risk === "high" || country.risk === "critical") && layers.anomalies) {
												fill = country.risk === "critical" ? "rgba(239,68,68,0.55)" : "rgba(249,115,22,0.45)";
											}
											if (selectedCountryCode && selectedCountryCode === code) {
												fill = "rgba(168,85,247,0.55)";
											}

											return (
												<g key={geo.rsmKey}>
													<Geography
														geography={geo}
														fill={fill}
														stroke="#24364f"
														strokeWidth={0.4}
														onMouseEnter={() => {
															if (country) setHovered({ country });
														}}
														onMouseLeave={() => setHovered(null)}
														onClick={() => {
															if (!country) return;
															onSelectCountry(country.countryCode);
															setCenter(centroid);
															setZoom(2.2);
														}}
														style={{
															default: { outline: "none" },
															hover: { outline: "none", cursor: country ? "pointer" : "default" },
															pressed: { outline: "none" },
														}}
													/>

													{country && layers.traffic ? (
														<Marker coordinates={centroid}>
															<circle
																r={Math.max(2.5, Math.min(12, Math.log(country.requests + 1) * 2.2))}
																fill={getRiskStroke(country.risk)}
																fillOpacity={mode === "bubble" ? 0.85 : 0.65}
																stroke="#0b1220"
																strokeWidth={1.2}
															/>
														</Marker>
													) : null}
												</g>
											);
										})}

										{primaryCountry && layers.sources
											? countryInsights.slice(1, 7).map((country) => {
													const from = centroidMap.get(primaryCountry.countryCode);
													const to = centroidMap.get(country.countryCode);
													if (!from || !to) return null;
													return (
														<Line
															key={`${primaryCountry.countryCode}-${country.countryCode}`}
															from={from}
															to={to}
															stroke="#f97316"
															strokeWidth={0.6}
															strokeDasharray="2 3"
															strokeOpacity={0.7}
														/>
													);
												})
											: null}
									</>
								);
							}}
						</Geographies>
					</ZoomableGroup>
				</ComposableMap>
			</div>

			<div className="absolute left-4 top-4 flex flex-col gap-2">
				<Button variant="outline" size="icon" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={() => setZoom((value) => Math.min(4, value + 0.25))}>
					<IconPlus className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="icon" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>
					<IconMinus className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="icon" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={resetView}>
					<IconReload className="h-4 w-4" />
				</Button>
			</div>

			<div className="absolute bottom-3 left-3 rounded-md border border-slate-700 bg-slate-900/75 px-3 py-2 text-xs text-slate-200 flex flex-wrap gap-x-4 gap-y-1">
				<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /><T id="analytics.geo.legend.normal" /></span>
				<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" /><T id="analytics.geo.legend.suspicious" /></span>
				<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /><T id="analytics.geo.legend.critical" /></span>
				<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400" /><T id="analytics.geo.legend.blocked" /></span>
				<span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-orange-400" /><T id="analytics.geo.legend.connections" /></span>
			</div>

			{hovered ? (
				<div className="absolute right-4 top-4 w-[280px] rounded-lg border border-slate-700 bg-slate-950/95 p-4 shadow-xl">
					<h4 className="font-semibold text-slate-100 flex items-center gap-2">
						<IconMapPin className="h-4 w-4 text-cyan-300" />
						{hovered.country.countryName}
					</h4>
					<p className="text-sm mt-2 text-slate-200">
						{hovered.country.requests.toLocaleString("de-DE")} <T id="analytics.geo.requests" />
					</p>
					<p className="text-sm text-slate-300">
						{formatPercent(hovered.country.percentage)} <T id="analytics.geo.of-traffic" />
					</p>
					{hovered.country.suspiciousPaths > 0 ? (
						<p className="text-sm text-orange-300 mt-3">
							{hovered.country.suspiciousPaths} <T id="analytics.geo.suspicious-paths-detected" />
						</p>
					) : null}
					{(hovered.country.heuristicBlocked ?? 0) > 0 && layers.blocked ? (
						<p className="text-sm text-purple-300">
							{hovered.country.heuristicBlocked} <T id="analytics.geo.blocked-heuristic-inline" />
						</p>
					) : null}
					{hovered.country.topPath ? (
						<p className="text-sm text-slate-300 mt-2">
							<T id="analytics.geo.top-path" />: {hovered.country.topPath}
						</p>
					) : null}
					<p className="text-sm text-slate-100 mt-3">
						<T id="analytics.geo.risk-score" />: <span className="font-semibold">{hovered.country.riskLabel}</span>
					</p>
				</div>
			) : null}
		</div>
	);
}

