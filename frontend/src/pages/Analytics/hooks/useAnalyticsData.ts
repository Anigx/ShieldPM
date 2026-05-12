import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
	type AnalyticsSummary,
	type DbStats,
	getAnalyticsSeries,
	getAnalyticsSummary,
	getDbStats,
	type TimeSeriesPoint,
} from "src/api/backend";
import { get } from "src/api/backend/base";
import { useHealth, useProxyHosts } from "src/hooks";

export type AnalyticsRange = "1h" | "24h" | "7d" | "30d";

export interface AnalyticsSeriesPoint extends TimeSeriesPoint {
	timeDisplay: string;
}

interface AnalyticsStatusResponse {
	totalSec?: number;
}

export function useAnalyticsData(defaultRange: AnalyticsRange = "24h") {
	const { data: hosts, isLoading: hostsLoading } = useProxyHosts();
	const health = useHealth();
	const isDemo = health.data?.demo;

	const [selectedHostId, setSelectedHostId] = useState<string>("");
	const [range, setRange] = useState<AnalyticsRange>(defaultRange);
	const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
	const [series, setSeries] = useState<AnalyticsSeriesPoint[]>([]);
	const [networkSpeed, setNetworkSpeed] = useState(0);
	const [dbStats, setDbStats] = useState<DbStats | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (hosts?.length && !selectedHostId) {
			setSelectedHostId(String(hosts[0].id));
		}
	}, [hosts, selectedHostId]);

	useEffect(() => {
		if (!selectedHostId) return;

		let active = true;

		const fetchMainData = async () => {
			setLoading(true);
			try {
				const hostId = Number.parseInt(selectedHostId, 10);
				const [summaryData, seriesData] = await Promise.all([
					getAnalyticsSummary(hostId, range),
					getAnalyticsSeries(hostId, range),
				]);

				if (!active) return;

				setSummary(summaryData);
				setSeries(
					seriesData.map((point) => ({
						...point,
						timeDisplay: dayjs(point.timestamp).format("HH:mm"),
					})),
				);
			} catch (error) {
				if (active) {
					console.error("Failed to fetch analytics data", error);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchMainData();
		const interval = setInterval(fetchMainData, 10000);

		return () => {
			active = false;
			clearInterval(interval);
		};
	}, [selectedHostId, range]);

	useEffect(() => {
		let active = true;

		const fetchLiveData = async () => {
			try {
				const [status, db] = await Promise.all([
					get<AnalyticsStatusResponse>({ url: "analytics/status", silentAuth: true }),
					getDbStats(),
				]);
				if (!active) return;
				setNetworkSpeed(status.totalSec ?? 0);
				setDbStats(db);
			} catch (_error) {
				// Keep page stable when optional live metrics are unavailable.
			}
		};

		fetchLiveData();
		const interval = setInterval(fetchLiveData, 5000);
		return () => {
			active = false;
			clearInterval(interval);
		};
	}, []);

	const totals = useMemo(() => {
		const total = Number(summary?.count) || 0;
		const status2xx = Number(summary?.status2xx) || 0;
		const status4xx = Number(summary?.status4xx) || 0;
		const status5xx = Number(summary?.status5xx) || 0;
		const successRate = total > 0 ? (status2xx / total) * 100 : 0;
		const errorRate = total > 0 ? (status4xx + status5xx) / total : 0;

		return {
			total,
			status2xx,
			status4xx,
			status5xx,
			successRate,
			errorRate,
		};
	}, [summary]);

	return {
		hosts,
		hostsLoading,
		isDemo,
		selectedHostId,
		setSelectedHostId,
		range,
		setRange,
		summary,
		series,
		networkSpeed,
		dbStats,
		loading,
		totals,
	};
}
