# Analytics

## Zweck

Traffic-Analyse und Echtzeit-Statistiken für Proxy-Hosts.

## Kontext

Bietet detaillierte Einblicke in den Datenverkehr und ist seit Frontend-Phase 1 in zwei UI-Bereiche getrennt:

- `/analytics` für allgemeine Traffic-/Performance-Übersicht
- `/analytics/geo` für Geo-Intelligence (Herkunft, Hotspots, Länder-/IP-Risiko)

## Wichtige Dateien

- `backend/internal/analytics.js` (14 KB) — Business-Logik
- `backend/models/analytic_count.js` (1 KB) — Zähler-Modell
- `backend/models/analytics_logs.js` (1 KB) — Log-Modell
- `backend/routes/analytics.js` (8 KB) — API-Routen
- `backend/routes/nginx/analytics.js` (3 KB) — Nginx-Analytics-Routen
- `frontend/src/pages/Analytics/index.tsx` — Traffic Overview
- `frontend/src/pages/Analytics/GeoIntelligence.tsx` — Geo-Intelligence Seite
- `frontend/src/pages/Analytics/hooks/useAnalyticsData.ts` — gemeinsame Datenlogik
- `frontend/src/pages/Analytics/hooks/useGeoIntelligence.ts` — Geo-Aggregationen und Risk-Heuristik
- `frontend/src/pages/Analytics/utils/` — Format-, Geo- und Risiko-Utilities
- `frontend/src/pages/Analytics/components/` — modulare Analytics-/Geo-UI-Komponenten
- `frontend/src/pages/Analytics/components/AnalyticsTopListCard.tsx` — wiederverwendete Top-Listenkarte
- `frontend/src/pages/Analytics/components/AnalyticsGeoNoticeCard.tsx` — Hinweis auf Geo-Unterseite

## Verhalten

- Sammelt Traffic-Daten pro Host (Requests, Status-Codes)
- Speichert aggregierte Zähler in `analytic_count`-Tabelle
- Nutzt im Frontend `getAnalyticsSummary()` + `getAnalyticsSeries()` als Phase-1-Datenbasis
- Leitet Geo-Risiko in Phase 1 heuristisch aus vorhandenen Daten ab (keine echten IPS-Blockevents)
- Nutzt für neue Analytics-/Geo-Texte i18n-Keys (`analytics.*`, `analytics.geo.*`) in allen vorhandenen UI-Sprachen
- Nutzt für Regionen in Geo-Intelligence stabile Region-Keys (`europe`, `north-america`, ...) mit UI-seitiger i18n-Label-Auflösung
- GoAccess für erweiterte Analyse auf Port `:91`

## Abhängigkeiten

- `recharts` — Chart-Bibliothek im Frontend
- `react-simple-maps` — Weltkarten-Visualisierung
- GoAccess (optional, externe Binary)

## Offene Fragen

Siehe zentrale Sammelseite [Offene Fragen](../offene-fragen.md).

## Verwandte Seiten

- [Modulübersicht](./README.md)
- [Umgebungsvariablen](../konfiguration/umgebungsvariablen.md)
