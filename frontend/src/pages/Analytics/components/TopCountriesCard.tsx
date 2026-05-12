import { Flag } from "src/components";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { T } from "src/locale";
import { countryCodeToName } from "src/pages/Analytics/utils/geo";

interface CountryItem {
	countryCode: string;
	count: number;
	percentage?: number;
	riskLabel?: string;
}

interface TopCountriesCardProps {
	titleId?: string;
	countries: CountryItem[];
	emptyId?: string;
}

export function TopCountriesCard({
	titleId = "analytics.top-countries",
	countries,
	emptyId = "analytics.geo.no-country-data",
}: TopCountriesCardProps) {
	const maxCount = countries[0]?.count ?? 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<T id={titleId} />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{countries.length ? (
						countries.map((country) => (
							<div key={country.countryCode} className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2 min-w-0">
									<Flag
										countryCode={country.countryCode}
										className="h-4 w-4 rounded-sm overflow-hidden"
									/>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">
											{countryCodeToName(country.countryCode)}
										</p>
										<p className="text-xs text-muted-foreground">{country.countryCode}</p>
									</div>
								</div>
								<div className="flex items-center gap-3 min-w-[160px]">
									<div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
										<div
											className="h-full bg-cyan-500"
											style={{ width: `${Math.max(4, (country.count / maxCount) * 100)}%` }}
										/>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">{country.count.toLocaleString("de-DE")}</p>
										{typeof country.percentage === "number" ? (
											<p className="text-xs text-muted-foreground">
												{country.percentage.toFixed(1).replace(".", ",")}%
											</p>
										) : null}
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground text-center py-6">
							<T id={emptyId} />
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
