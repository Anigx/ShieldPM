import { useMemo, useState } from "react";
import type { AnalyticsRequestLog, AnalyticsSummary } from "src/api/backend";
import type { AnalyticsSeriesPoint } from "src/pages/Analytics/hooks/useAnalyticsData";
import {
	getCountryRisk,
	getIpRisk,
	getRiskLabel,
	isSuspiciousPath,
	type RiskLevel,
} from "src/pages/Analytics/utils/analyticsRisk";
import {
	countryCodeToName,
	countryCodeToRegion,
	getActiveCountryCount,
	getCountryPercentage,
	getTopHotspot,
} from "src/pages/Analytics/utils/geo";
import type { RegionKey } from "src/pages/Analytics/utils/geo";

export interface GeoCountryInsight {
	countryCode: string;
	countryName: string;
	requests: number;
	percentage: number;
	risk: RiskLevel;
	riskLabel: string;
	suspiciousPaths: number;
	errorRate: number;
	topPath?: string;
	topIp?: string;
	heuristicBlocked?: number;
}

export interface GeoIpHotspot {
	ip: string;
	countryCode?: string;
	count: number;
	risk: RiskLevel;
	riskLabel: string;
}

export interface RegionTraffic {
	region: RegionKey;
	requests: number;
}

interface UseGeoIntelligenceInput {
	summary: AnalyticsSummary | null;
	series: AnalyticsSeriesPoint[];
	isDemo?: boolean;
	hiddenIpLabel?: string;
}

function createSuspiciousPathMap(recentRequests?: AnalyticsRequestLog[]) {
	const map = new Map<string, number>();
	for (const request of recentRequests ?? []) {
		if (!request.countryCode) continue;
		if (!isSuspiciousPath(request.path)) continue;
		map.set(request.countryCode, (map.get(request.countryCode) ?? 0) + 1);
	}
	return map;
}

function createTopPathMap(recentRequests?: AnalyticsRequestLog[]) {
	const result = new Map<string, string>();
	const counts = new Map<string, Map<string, number>>();

	for (const request of recentRequests ?? []) {
		if (!request.countryCode) continue;
		const current = counts.get(request.countryCode) ?? new Map<string, number>();
		current.set(request.path, (current.get(request.path) ?? 0) + 1);
		counts.set(request.countryCode, current);
	}

	for (const [countryCode, paths] of counts.entries()) {
		let topPath = "";
		let topCount = -1;
		for (const [path, count] of paths.entries()) {
			if (count > topCount) {
				topPath = path;
				topCount = count;
			}
		}
		if (topPath) {
			result.set(countryCode, topPath);
		}
	}

	return result;
}

export function useGeoIntelligence({
	summary,
	series,
	isDemo = false,
	hiddenIpLabel = "***",
}: UseGeoIntelligenceInput) {
	const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);

	const derived = useMemo(() => {
		const totalFromSummary = Number(summary?.count) || 0;
		const totalFromCountries = (summary?.topCountries ?? []).reduce((sum, entry) => sum + entry.count, 0);
		const totalRequests = totalFromSummary > 0 ? totalFromSummary : totalFromCountries;
		const suspiciousPathMap = createSuspiciousPathMap(summary?.recentRequests);
		const topPathMap = createTopPathMap(summary?.recentRequests);

		const countryInsights: GeoCountryInsight[] = (summary?.topCountries ?? []).map((country) => {
			const suspiciousPaths = suspiciousPathMap.get(country.countryCode) ?? 0;
			const errorRate =
				totalRequests > 0
					? (Number(summary?.status4xx ?? 0) + Number(summary?.status5xx ?? 0)) / totalRequests
					: 0;
			const heuristicBlocked = Math.max(0, Math.round(suspiciousPaths * 0.35));
			const risk = getCountryRisk({
				requests: country.count,
				percentage: getCountryPercentage(country.count, totalRequests),
				suspiciousPaths,
				blocked: heuristicBlocked,
				errorRate,
			});

			const topIp = summary?.topIps?.find((ip) => ip.countryCode === country.countryCode)?.ip;

			return {
				countryCode: country.countryCode,
				countryName: countryCodeToName(country.countryCode),
				requests: country.count,
				percentage: getCountryPercentage(country.count, totalRequests),
				risk,
				riskLabel: getRiskLabel(risk),
				suspiciousPaths,
				errorRate,
				topPath: topPathMap.get(country.countryCode),
				topIp,
				heuristicBlocked,
			};
		});

		const topIpHotspots: GeoIpHotspot[] = (summary?.topIps ?? []).map((ip) => {
			const risk = getIpRisk(ip.count);
			return {
				ip: isDemo ? hiddenIpLabel : ip.ip,
				countryCode: ip.countryCode,
				count: ip.count,
				risk,
				riskLabel: getRiskLabel(risk),
			};
		});

		const regionMap = new Map<RegionKey, number>();
		for (const country of summary?.topCountries ?? []) {
			const region = countryCodeToRegion(country.countryCode);
			regionMap.set(region, (regionMap.get(region) ?? 0) + country.count);
		}

		const defaultRegionOrder: RegionKey[] = [
			"europe",
			"north-america",
			"asia",
			"south-america",
			"africa",
			"oceania",
			"unknown",
		];
		const regionTraffic: RegionTraffic[] = defaultRegionOrder
			.filter((region) => regionMap.has(region))
			.map((region) => ({
				region,
				requests: regionMap.get(region) ?? 0,
			}));

		const peak = series.reduce(
			(acc, point) => (point.count > acc.count ? { count: point.count, time: point.timeDisplay } : acc),
			{ count: 0, time: "-" },
		);

		const suspiciousCountries = countryInsights.filter(
			(country) => country.risk === "high" || country.risk === "critical",
		);
		const heuristicBlockedRequests = countryInsights.reduce(
			(sum, country) => sum + (country.heuristicBlocked ?? 0),
			0,
		);

		const timelineData = series.map((point) => ({
			time: point.timeDisplay,
			critical: point.s5xx,
			suspicious: point.s4xx,
			blocked: Math.round(point.s4xx * 0.2),
		}));

		return {
			totalRequests,
			countryInsights,
			topIpHotspots,
			regionTraffic,
			suspiciousCountries,
			heuristicBlockedRequests,
			timelineData,
			peakTime: peak.time,
		};
	}, [summary, series, isDemo, hiddenIpLabel]);

	const selectedCountry = useMemo(() => {
		if (!selectedCountryCode) return derived.countryInsights[0] ?? null;
		return derived.countryInsights.find((country) => country.countryCode === selectedCountryCode) ?? null;
	}, [selectedCountryCode, derived.countryInsights]);

	return {
		activeCountryCount: getActiveCountryCount(summary),
		topHotspot: getTopHotspot(summary),
		suspiciousCountryCount: derived.suspiciousCountries.length,
		heuristicBlockedRequests: derived.heuristicBlockedRequests,
		peakTime: derived.peakTime,
		countryInsights: derived.countryInsights,
		topIpHotspots: derived.topIpHotspots,
		regionTraffic: derived.regionTraffic,
		suspiciousCountries: derived.suspiciousCountries,
		timelineData: derived.timelineData,
		selectedCountry,
		selectedCountryCode,
		setSelectedCountryCode,
	};
}
