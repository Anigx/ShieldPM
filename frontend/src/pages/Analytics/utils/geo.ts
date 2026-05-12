import type { AnalyticsSummary } from "src/api/backend";

export type RegionKey =
	| "europe"
	| "north-america"
	| "south-america"
	| "asia"
	| "africa"
	| "oceania"
	| "unknown";

const regionSets: Record<Exclude<RegionKey, "unknown">, Set<string>> = {
	"europe": new Set(["BG", "AT", "NL", "LU", "RO", "DE", "FR", "IT", "ES", "PL", "CH", "GB", "SE"]),
	"north-america": new Set(["US", "CA", "MX"]),
	"south-america": new Set(["BR", "AR", "CL", "CO", "PE"]),
	"asia": new Set(["CN", "JP", "KR", "IN", "SG", "TR", "AE"]),
	"africa": new Set(["ZA", "NG", "EG", "MA", "KE"]),
	"oceania": new Set(["AU", "NZ"]),
};

export function getCountryPercentage(count: number, total: number): number {
	if (!total) return 0;
	return Math.round((count / total) * 1000) / 10;
}

export function countryCodeToRegion(code: string): RegionKey {
	const normalized = code.toUpperCase();

	if (regionSets["europe"].has(normalized)) return "europe";
	if (regionSets["north-america"].has(normalized)) return "north-america";
	if (regionSets["south-america"].has(normalized)) return "south-america";
	if (regionSets["asia"].has(normalized)) return "asia";
	if (regionSets["africa"].has(normalized)) return "africa";
	if (regionSets["oceania"].has(normalized)) return "oceania";

	return "unknown";
}

export function getRegionLabelId(region: RegionKey): string {
	switch (region) {
		case "europe":
			return "analytics.geo.region.europe";
		case "north-america":
			return "analytics.geo.region.north-america";
		case "south-america":
			return "analytics.geo.region.south-america";
		case "asia":
			return "analytics.geo.region.asia";
		case "africa":
			return "analytics.geo.region.africa";
		case "oceania":
			return "analytics.geo.region.oceania";
		case "unknown":
		default:
			return "analytics.geo.region.unknown";
	}
}

export function countryCodeToName(code?: string): string {
	if (!code) return "Unbekannt";
	try {
		const displayNames = new Intl.DisplayNames(["de"], { type: "region" });
		return displayNames.of(code.toUpperCase()) ?? code.toUpperCase();
	} catch (_error) {
		return code.toUpperCase();
	}
}

export function getTopHotspot(summary: AnalyticsSummary | null): string {
	return summary?.topCountries?.[0]?.countryCode ?? "-";
}

export function getActiveCountryCount(summary: AnalyticsSummary | null): number {
	return summary?.topCountries?.length ?? 0;
}

export function getCountryFlag(countryCode?: string): string {
	if (!countryCode || countryCode.length !== 2) return "??";
	const chars = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...chars);
}
