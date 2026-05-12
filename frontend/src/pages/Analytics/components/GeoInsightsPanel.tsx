import { IconArrowRight, IconBolt, IconFilter, IconListSearch, IconPlus, IconShieldLock } from "@tabler/icons-react";
import { Flag } from "src/components";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import { getRiskBadgeClass } from "src/pages/Analytics/utils/analyticsRisk";
import type { GeoCountryInsight } from "../hooks/useGeoIntelligence";

interface GeoInsightsPanelProps {
	countries: GeoCountryInsight[];
	suspiciousCountries: GeoCountryInsight[];
	selectedCountry: GeoCountryInsight | null;
	onSelectCountry: (code: string) => void;
	onFilterCountry: () => void;
	onShowIps: () => void;
	onComingSoonAction: (action: "rule" | "block") => void;
}

export function GeoInsightsPanel({
	countries,
	suspiciousCountries,
	selectedCountry,
	onSelectCountry,
	onFilterCountry,
	onShowIps,
	onComingSoonAction,
}: GeoInsightsPanelProps) {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>
						<T id="analytics.top-countries" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{countries.length ? (
						countries.slice(0, 6).map((country) => (
							<button
								type="button"
								key={country.countryCode}
								className={`w-full flex items-center justify-between rounded-md px-2 py-2 text-left transition-colors ${
									selectedCountry?.countryCode === country.countryCode
										? "bg-cyan-500/15"
										: "hover:bg-slate-900/70"
								}`}
								onClick={() => onSelectCountry(country.countryCode)}
							>
								<div className="flex items-center gap-2 min-w-0">
									<Flag
										countryCode={country.countryCode}
										className="h-4 w-4 rounded-sm overflow-hidden"
									/>
									<span className="text-sm truncate">{country.countryCode}</span>
								</div>
								<span className="text-sm text-slate-200">
									{country.requests.toLocaleString("de-DE")}
								</span>
							</button>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							<T id="analytics.geo.no-country-data" />
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle>
						<T id="analytics.geo.suspicious-regions" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{suspiciousCountries.length ? (
						suspiciousCountries.slice(0, 3).map((country) => (
							<div key={country.countryCode} className="rounded-md border border-slate-800 p-3">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-medium">{country.countryName}</p>
									<Badge className={getRiskBadgeClass(country.risk)}>{country.riskLabel}</Badge>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									{country.suspiciousPaths > 0 ? (
										<>
											{country.suspiciousPaths} <T id="analytics.geo.suspicious-paths-detected" />
										</>
									) : (
										<T id="analytics.geo.unusual-request-profile" />
									)}
								</p>
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							<T id="analytics.geo.no-suspicious-regions" />
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle>
						<T id="analytics.geo.quick-actions" />
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-2"
						onClick={onFilterCountry}
						disabled={!selectedCountry}
					>
						<IconFilter className="h-4 w-4" />
						<T id="analytics.geo.action.filter-country" />
					</Button>
					<Button variant="outline" size="sm" className="gap-2" onClick={onShowIps}>
						<IconListSearch className="h-4 w-4" />
						<T id="analytics.geo.action.show-ips" />
					</Button>
					<Button variant="outline" size="sm" className="gap-2" onClick={() => onComingSoonAction("rule")}>
						<IconPlus className="h-4 w-4" />
						<T id="analytics.geo.action.create-rule" />
					</Button>
					<Button variant="outline" size="sm" className="gap-2" onClick={() => onComingSoonAction("block")}>
						<IconShieldLock className="h-4 w-4" />
						<T id="analytics.geo.action.block" />
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle>
						<T id="analytics.geo.recommendations" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{suspiciousCountries.length ? (
						<>
							<div className="flex items-center gap-2 text-slate-200">
								<IconBolt className="h-4 w-4 text-orange-400" />
								<T
									id="analytics.geo.recommendation.inspect-country"
									data={{ country: suspiciousCountries[0].countryCode }}
								/>
							</div>
							<div className="flex items-center gap-2 text-slate-200">
								<IconArrowRight className="h-4 w-4 text-cyan-400" />
								<T id="analytics.geo.recommendation.evaluate-geo-blocking" />
							</div>
							<div className="flex items-center gap-2 text-slate-200">
								<IconArrowRight className="h-4 w-4 text-cyan-400" />
								<T id="analytics.geo.recommendation.rate-limit-wp-login" />
							</div>
						</>
					) : (
						<p className="text-muted-foreground">
							<T id="analytics.geo.recommendation.none" />
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
