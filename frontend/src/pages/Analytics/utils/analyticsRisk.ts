export type RiskLevel = "low" | "medium" | "high" | "critical";

interface CountryRiskInput {
	requests: number;
	percentage?: number;
	suspiciousPaths?: number;
	blocked?: number;
	errorRate?: number;
}

const suspiciousPathPatterns = [
	"/wp-login.php",
	"/xmlrpc.php",
	"/admin",
	"/login",
	"/wp-content/plugins",
	"/.env",
	"/phpmyadmin",
	"/wp-admin",
];

export function getIpRisk(count: number): RiskLevel {
	if (count >= 500) return "critical";
	if (count >= 250) return "high";
	if (count >= 100) return "medium";
	return "low";
}

export function getCountryRisk(input: CountryRiskInput): RiskLevel {
	if ((input.blocked ?? 0) > 20) return "critical";
	if ((input.errorRate ?? 0) > 0.35 && input.requests > 50) return "high";
	if (input.requests >= 300 || (input.suspiciousPaths ?? 0) > 10) return "high";
	if (input.requests >= 100) return "medium";
	return "low";
}

export function isSuspiciousPath(path: string): boolean {
	const normalized = path.toLowerCase();
	return suspiciousPathPatterns.some((pattern) => normalized.includes(pattern));
}

export function getRiskLabel(risk: RiskLevel): string {
	switch (risk) {
		case "critical":
			return "Kritisch";
		case "high":
			return "Hoch";
		case "medium":
			return "Mittel";
		case "low":
		default:
			return "Niedrig";
	}
}

export function getRiskBadgeClass(risk: RiskLevel): string {
	switch (risk) {
		case "critical":
			return "bg-red-950 text-red-200 border border-red-700";
		case "high":
			return "bg-red-500/20 text-red-300 border border-red-500/50";
		case "medium":
			return "bg-orange-500/20 text-orange-300 border border-orange-500/50";
		case "low":
		default:
			return "bg-green-500/20 text-green-300 border border-green-500/50";
	}
}

export function getRiskStroke(risk: RiskLevel): string {
	switch (risk) {
		case "critical":
			return "#dc2626";
		case "high":
			return "#f97316";
		case "medium":
			return "#f59e0b";
		case "low":
		default:
			return "#22d3ee";
	}
}
