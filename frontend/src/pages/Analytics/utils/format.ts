import dayjs from "dayjs";

export function formatBytes(bytes: number, decimals = 2): string {
	if (!bytes) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(value?: number): string {
	return (value ?? 0).toLocaleString("de-DE");
}

export function formatPercent(value: number, precision = 1): string {
	return `${value.toFixed(precision).replace(".", ",")}%`;
}

export function formatDuration(durationMs: number): string {
	if (durationMs < 1000) return `${durationMs} ms`;
	return `${(durationMs / 1000).toFixed(2).replace(".", ",")} s`;
}

export function formatTime(value?: string): string {
	if (!value) return "-";
	return dayjs(value).format("HH:mm:ss");
}
