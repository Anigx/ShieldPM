import {
	IconActivity,
	IconChartBar,
	IconDatabase,
	IconShieldCheck,
} from "@tabler/icons-react";
import { useIntl } from "react-intl";
import { Loading } from "src/components";
import {
	AnalyticsGeoNoticeCard,
	AnalyticsHeader,
	AnalyticsKpiCard,
	AnalyticsTopListCard,
	AnalyticsTrafficChart,
	RecentRequestsTable,
	StatusCodeChart,
	TopCountriesCard,
} from "src/pages/Analytics/components";
import type { StatusBadge } from "src/pages/Analytics/components/AnalyticsHeader";
import { useAnalyticsData } from "src/pages/Analytics/hooks/useAnalyticsData";
import { formatBytes, formatNumber, formatPercent } from "src/pages/Analytics/utils/format";

export default function Analytics() {
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
		networkSpeed,
		dbStats,
		isDemo,
		totals,
	} = useAnalyticsData("24h");

	if ((loading && !summary) || hostsLoading) {
		return (
			<div className="p-8 text-center">
				<Loading />
			</div>
		);
	}

	const statusBadges: StatusBadge[] = [
		{
			label: totals.errorRate <= 0.1 ? intl.formatMessage({ id: "analytics.status.stable" }) : intl.formatMessage({ id: "analytics.status.watch" }),
			variant: totals.errorRate <= 0.1 ? "stable" : "warning",
		},
		{
			label:
				totals.status4xx + totals.status5xx > 0
					? intl.formatMessage({ id: "analytics.status.suspicious-requests" })
					: intl.formatMessage({ id: "analytics.status.no-suspicious" }),
			variant: totals.status5xx > 0 ? "alert" : "warning",
		},
		{
			label: intl.formatMessage({ id: "dashboard.certificates-expiring" }),
			variant: "warning",
		},
	];

	const topCountries = (summary?.topCountries ?? []).map((country) => ({
		countryCode: country.countryCode,
		count: country.count,
		percentage: totals.total ? (country.count / totals.total) * 100 : 0,
	}));

	const topIps = (summary?.topIps ?? []).map((item) => ({
		label: isDemo ? intl.formatMessage({ id: "analytics.hidden-ip" }) : item.ip,
		count: item.count,
	}));
	const topReferers = (summary?.topReferers ?? []).map((item) => ({
		label: item.referer,
		count: item.count,
	}));
	const topPaths = (summary?.topPaths ?? []).map((item) => ({
		label: item.path,
		count: item.count,
	}));
	const topUserAgents = (summary?.topUserAgents ?? []).map((item) => ({
		label: item.userAgent,
		count: item.count,
	}));

	return (
		<div className="p-4 md:p-8 pt-6 space-y-6">
			<AnalyticsHeader
				title={intl.formatMessage({ id: "analytics.title" })}
				subtitle={intl.formatMessage({ id: "analytics.overview.subtitle" })}
				hosts={hosts}
				selectedHostId={selectedHostId}
				onHostChange={setSelectedHostId}
				range={range}
				onRangeChange={setRange}
				statusBadges={statusBadges}
			/>

			<div className="grid gap-4 md:grid-cols-4">
				<AnalyticsKpiCard
					title={intl.formatMessage({ id: "analytics.total-requests" })}
					value={formatNumber(summary?.count)}
					description={intl.formatMessage({ id: "analytics.since-service-start" })}
					icon={IconActivity}
					iconClassName="text-cyan-300"
				/>
				<AnalyticsKpiCard
					title={intl.formatMessage({ id: "analytics.success-rate" })}
					value={formatPercent(totals.successRate)}
					description={intl.formatMessage({ id: "analytics.responses" }, { count: formatNumber(totals.status2xx) })}
					icon={IconShieldCheck}
					iconClassName="text-green-300"
				/>
				<AnalyticsKpiCard
					title={intl.formatMessage({ id: "analytics.bandwidth-live" })}
					value={`${formatBytes(networkSpeed)}/s`}
					description={intl.formatMessage({ id: "analytics.current-throughput" })}
					icon={IconChartBar}
					iconClassName="text-blue-300"
				/>
				<AnalyticsKpiCard
					title={intl.formatMessage({ id: "analytics.database" })}
					value={formatBytes(dbStats?.size ?? 0)}
					description={`${dbStats?.engine?.toUpperCase() ?? intl.formatMessage({ id: "analytics.database.engine-fallback" })} • ${dbStats?.connections?.open ?? 0} ${intl.formatMessage({ id: "analytics.connections" })}`}
					trend={intl.formatMessage(
						{ id: "analytics.database.trend" },
						{
							reads: formatNumber(dbStats?.io?.reads ?? 0),
							writes: formatNumber(dbStats?.io?.writes ?? 0),
						},
					)}
					icon={IconDatabase}
					iconClassName="text-violet-300"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<AnalyticsTrafficChart data={series} />
				<StatusCodeChart data={series} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
				<TopCountriesCard titleId="analytics.top-countries" countries={topCountries} />
				<AnalyticsTopListCard titleId="analytics.top-ips" items={topIps} />
				<AnalyticsTopListCard titleId="analytics.top-referrers" items={topReferers} />
				<AnalyticsTopListCard titleId="analytics.top-paths" items={topPaths} />
				<AnalyticsTopListCard titleId="analytics.top-user-agents" items={topUserAgents} />
			</div>

			<AnalyticsGeoNoticeCard />

			<RecentRequestsTable
				title={intl.formatMessage({ id: "analytics.recent-requests" })}
				requests={summary?.recentRequests ?? []}
				isDemo={isDemo}
			/>
		</div>
	);
}
