# ᗺIPS Unified Platform — Master Documentation

**Version**: 2.5 | **Date**: June 2026 | **Status**: Production-Ready

> "Breathtaking beauty in all forms, funding selfless service to community."

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Three-Site Architecture](#2-three-site-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Route & Interface Map](#4-route--interface-map)
5. [Database Schema — Convex](#5-database-schema--convex)
6. [Database Schema — Supabase](#6-database-schema--supabase)
7. [Convex API Reference](#7-convex-api-reference)
8. [Supabase Edge Functions](#8-supabase-edge-functions)
9. [LexiRose Revenue Engine](#9-lexirose-revenue-engine)
10. [Creator Studio & GameWear](#10-creator-studio--gamewear)
11. [Advertising Hub](#11-advertising-hub)
12. [PKI & Security System](#12-pki--security-system)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [Operations Control Panel (PWA)](#14-operations-control-panel-pwa)
15. [Civic Intelligence System](#15-civic-intelligence-system)
16. [LEACH Protocol](#16-leach-protocol)
17. [BIPS Command — Admin Dashboard](#17-bips-command--admin-dashboard)
18. [Deployment Guide](#18-deployment-guide)
19. [Business Model & Financials](#19-business-model--financials)
20. [Roadmap](#20-roadmap)
21. [Developer Reference](#21-developer-reference)

---

## 1. Platform Overview

The ᗺIPS Unified Platform is a production-ready, multi-domain SaaS ecosystem bridging premium streetwear commerce, civic infrastructure, and gaming culture through avatar-driven storytelling and AI-assisted operations.

### Three Domains

| Domain | Hostname | SiteCode | Purpose |
|---|---|---|---|
| ᗺIPS Montreal | bipsmontreal.com | BIPS_SITE | Civic tech, contacts, shelter network |
| ᗺIPS Gear | bipsgear.com | GEAR_SITE | Gaming hardware, gear configurator, clothing |
| LexiRose | lexirose.ca | LEXI_SITE | Beauty brand, revenue engine, Glow Club |

All three domains are served from a **single Vercel deployment**. Domain detection is purely client-side via `window.location.hostname`.

### Core Systems (All Functional)

- **Operations Control Panel** — Real-time tri-site dashboard, PWA installable at `/ops`
- **BIPS Command Dashboard** — High-contrast admin analytics dashboard at `/admin/dashboard`
- **Civic Intelligence** — Leaflet map, pins, stories, heat index, collaborative maps
- **LexiRose Revenue Engine** — Bundles, subscriptions, routines, affiliates, Shopify sync
- **LEACH Communication Protocol** — Workboard, sync rituals, session mode, AI copilots
- **GameWear Creator Studio** — Art library → Printful → Shopify → Unity/Unreal pipeline
- **PKI Multi-Tenant Security** — Certificate authorities, avatar keypacks, signed requests
- **Advertising Hub** — Campaign builder, asset library, analytics, M365 integration

### Avatars
Lexi, Venessa, Ebram, Amine, Spirit

---

## 2. Three-Site Architecture

### Domain Detection

```typescript
// src/context/DomainContext.tsx
function detectSiteFromHostname(hostname: string): SiteCode {
  if (hostname.includes('bips')) return 'BIPS_SITE';
  if (hostname.includes('lexi')) return 'LEXI_SITE';
  return 'GEAR_SITE'; // default — bipsgear.com and all previews
}
```

### Routing Architecture

```
App.tsx
  ├─ / → GearPage (BIPS Gear public store)
  ├─ /ops → OperationsControlPanel (PWA)
  ├─ /hub → PlatformHubPage (navigation hub)
  ├─ /bips/civic-intel → CivicIntelDashboard
  ├─ /bips/city-trails → CityTrailsPage
  ├─ /bips/neighborhoods → NeighborhoodDashboardPage
  ├─ /lexi/civic-stories → LexiCivicStoriesPage
  ├─ /gear/civic-modes → GearCivicModesPage
  ├─ /auth/* → AuthPage (Supabase email auth)
  ├─ /my/* → User pages (RequireAuth)
  ├─ /admin/* → Admin pages (RequireAdmin)
  │   ├─ /admin/civic-command → AdminCivicCommandPage
  │   ├─ /admin/translations → TranslationConsolePage
  │   └─ /admin/dashboard → AdminDashboardPage ← NEW
  ├─ /leach/*/copilot → AI Copilot consoles
  └─ /app/* → DomainRoutes (RequireAdmin)
       ├─ LEXI_SITE → LexiLayout + LexiRoutes
       ├─ BIPS_SITE → BipsLayout + BipsRoutes
       └─ GEAR_SITE → GearLayout + GearRoutes
```

### Key Architecture Files

| File | Purpose |
|---|---|
| `src/context/DomainContext.tsx` | Hostname detection + config provider |
| `src/routes/DomainRoutes.tsx` | Domain-aware route switching |
| `src/layouts/LexiLayout.tsx` | LexiRose navigation and chrome |
| `src/layouts/BipsLayout.tsx` | BIPS navigation and chrome |
| `src/layouts/GearLayout.tsx` | Gear navigation and chrome |
| `src/lib/auth/RouteGuards.tsx` | RequireAuth / RequireAdmin HOCs |

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 7.12 | Client-side routing |
| Lucide React | 0.562 | Icons |
| Leaflet / React-Leaflet | 5.0 | Map rendering |
| i18next | 26.0 | Internationalization (EN/FR/ES/ZH) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Convex | 1.15 | Real-time reactive database (contacts, messages, ops, analytics) |
| Supabase | 2.105 | PostgreSQL + Auth + Edge Functions (PKI, civic, advertising) |

### Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting, SPA routing, edge CDN |
| Convex Cloud | Real-time backend functions and database |
| Supabase Cloud | PostgreSQL database + Deno edge functions |
| Printful | Print-on-demand fulfillment |
| Shopify | E-commerce storefront (external) |

---

## 4. Route & Interface Map

Live interactive version: `/hub`

### Status Key

| Status | Meaning |
|---|---|
| Active | Fully built, wired to router, functional |
| Stub | Page exists but content is placeholder text only |
| Incomplete | Built but not wired to the main router |
| Not Needed | Exists in codebase but superseded or unused |

### Public Routes

| Route | Component | Status | Notes |
|---|---|---|---|
| `/` | GearPage | Active | BIPS Gear default landing |
| `/auth/login` | AuthPage | Active | Supabase email auth |
| `/auth/register` | AuthPage | Active | |
| `/ops` | OperationsControlPanel | Active | PWA installable |
| `/hub` | PlatformHubPage | Active | This navigation index |
| `/bips/civic-intel` | CivicIntelDashboard | Active | Leaflet map + Supabase |
| `/bips/city-trails` | CityTrailsPage | Active | |
| `/bips/neighborhoods` | NeighborhoodDashboardPage | Active | |
| `/lexi/civic-stories` | LexiCivicStoriesPage | Active | |
| `/gear/civic-modes` | GearCivicModesPage | Active | |
| `/leach/admin/copilot` | LeachAdminCopilotPage | Active | AI via Supabase edge fn |
| `/leach/lexi/copilot` | LeachLexiCopilotPage | Active | AI via Supabase edge fn |

### Authenticated User Routes (`/my/*`)

| Route | Component | Status |
|---|---|---|
| `/my/alerts` | MyAlertsPage | Active |
| `/my/maps` | MyMapsPage | Active |
| `/my/pins` | MyPinsPage | Active |
| `/my/stories` | MyStoriesPage | Active |
| `/my/collab-maps` | CollaborativeMapsPage | Active |

### Admin Routes

| Route | Component | Status |
|---|---|---|
| `/admin/civic-command` | AdminCivicCommandPage | Active |
| `/admin/translations` | TranslationConsolePage | Active |
| `/admin/dashboard` | AdminDashboardPage | Active — 6-module analytics dashboard |

### Domain Routes `/app/*` (Admin-Gated)

Served under `BipsLayout`, `LexiLayout`, or `GearLayout` depending on detected hostname.

**BIPS Domain:**

| Route | Component | Status |
|---|---|---|
| `/app/` | BipsDashboard | Active |
| `/app/contacts` | BipsContactsPage | Active |
| `/app/sites` | BipsSitesPage | Active |
| `/app/provenance` | BipsProvenancePage | Active |
| `/app/rituals` | BipsRitualsPage | Active |
| `/app/hud` | BipsHudTelemetryPage | Active |
| `/app/leach` | LeachLoginPage | Active |
| `/app/leach/dashboard` | LeachLexiDashboard | Active |
| `/app/leach/admin` | LeachKeeAdmin | Active |
| `/app/leach/sync-protocol` | LeachSyncProtocolPage | Active |
| `/app/analytics` | AnalyticsDashboardPage | Active |
| `/app/analytics/cross-domain` | CrossDomainAnalyticsPage | Active |

**LexiRose Domain:**

| Route | Component | Status | Notes |
|---|---|---|---|
| `/app/` | LexiHomePage | Stub | Placeholder text |
| `/app/products` | LexiProductsPage | Stub | Placeholder text |
| `/app/downloads` | LexiDownloadsPage | Stub | Placeholder text |
| `/app/routines` | LexiRoutinesPage | Stub | Placeholder text |
| `/app/admin` | LexiAdminPage | Active | |
| `/app/revenue` | LexiRevenueHubPage | Active | |
| `/app/glow-club` | LexiGlowClubLandingPage | Active | |
| `/app/ai-routine` | LexiAiRoutinePage | Active | |
| `/app/bundles` | LexiBundlesPage | Active | |
| `/app/marketplace` | LexiRoutinesMarketplacePage | Active | |

**Gear Domain:**

| Route | Component | Status | Notes |
|---|---|---|---|
| `/app/` | GearCatalogPage | Stub | Placeholder text |
| `/app/catalog` | GearCatalogPage | Stub | Placeholder text |
| `/app/field-kits` | GearFieldKitsPage | Stub | Placeholder text |
| `/app/ar-accessories` | GearARAccessoriesPage | Stub | Placeholder text |
| `/app/configurator` | GearConfiguratorPage | Active | |

### Incomplete / Unrouted (Built but not in router)

| Page File | Notes |
|---|---|
| `advertising/AdvertisingHubPage.tsx` | Not wired to main router |
| `advertising/CampaignBuilderPage.tsx` | Not wired to main router |
| `advertising/AssetLibraryPage.tsx` | Not wired to main router |
| `advertising/CampaignDashboardPage.tsx` | Not wired to main router |
| `advertising/M365IntegrationPage.tsx` | Not wired to main router |
| `advertising/ThemeCustomizerPage.tsx` | Not wired to main router |
| `creator/ClothingCreatorPage.tsx` | Not wired to main router |
| `creator/DesignEditorPage.tsx` | Not wired to main router |
| `creator/GameWearDetailPage.tsx` | Not wired to main router |

### Not Needed (Superseded or Unused)

| File | Reason |
|---|---|
| `HomePage.tsx` | Superseded by domain-specific landings |
| `LoginPage.tsx` | Replaced by `/auth/login` (AuthPage) |
| `DashboardPage.tsx` | Replaced by per-domain dashboards |
| `MontrealHomePage.tsx` | Superseded by `/bips/civic-intel` |
| `AvatarDetailPage.tsx` | Not in router, feature not prioritized |
| `MobileStorePage.tsx` | Not in router |
| `AboutPage.tsx` | Not in router |
| `ArtPage.tsx` | Not in router |
| `ClothingPage.tsx` | Not in router |
| `ChatPage.tsx` | Not in router, Convex chat feature paused |
| `SiteDetailPage.tsx` | Not in router |

---

## 5. Database Schema — Convex

Convex is the primary real-time database. All tables are defined in `convex/schema.ts`.

### Core BIPS Tables

| Table | Purpose |
|---|---|
| `users` | Authenticated users with roles (admin/member) |
| `contacts` | People, orgs, devices, sites with trust profiles |
| `channels` | Contact communication channels (phone, email, matrix, signal, teams) |
| `trustProfiles` | Trust level + PKI keys per contact |
| `ipsecProfiles` | IPsec security configuration profiles |
| `sites` | Locations: shelter, field, work, other |
| `siteLinks` | Contact ↔ Site relationships with roles |
| `provenanceObjects` | Artifacts, recipes, events with ownership |
| `media` | Files linked to provenance, contacts, or sites |
| `rituals` | Daily flows with steps, scope (triad/site/contact) |
| `hudSessions` | AR HUD device sessions and mode tracking |

### Messaging & Presence

| Table | Purpose |
|---|---|
| `messages` | Chat messages with reactions, replies, pinning |
| `conversations` | Triad or DM conversation groups |
| `location` | User GPS location history |
| `presence` | Online/away/offline status |
| `settings` | Per-user key-value settings store |

### Multi-Domain & Brand

| Table | Purpose |
|---|---|
| `domains` | Hostname → site mapping with branding config |
| `brandProfiles` | Site-specific color, font, tone, logo |
| `socialPosts` | Social media post drafts and schedule |
| `artAssets` | Art library with usage tagging |
| `shopifyLinks` | External Shopify product links per site |

### Analytics

| Table | Purpose |
|---|---|
| `analyticsEvents` | Page views, purchases, clicks, downloads per site |

### LexiRose Revenue

| Table | Purpose |
|---|---|
| `bundles` | Digital product bundles with pricing |
| `glowClubSubscriptions` | Monthly Glow Club subscriber records |
| `beautyRoutines` | Routines marketplace with steps and products |
| `affiliateProducts` | Affiliate links with click/conversion tracking |
| `shopifyProducts` | Synced Shopify product catalog |
| `bundleSales` | Revenue from bundle purchases |
| `revenueProducts` | Digital/physical/subscription products |
| `revenueAffiliates` | Affiliate program entries |
| `revenueBookings` | Bookable service slots |
| `revenueDigitalDownloads` | Downloadable file products |

### Emotional Geometry & Expansion

| Table | Purpose |
|---|---|
| `emotionalGeometry` | User mood vectors |
| `automatedRoutines` | Trigger-based automated flows |
| `hudTelemetry` | AR device telemetry events |
| `contactEdges` | Weighted contact graph edges |
| `siteClusters` | Geographic site cluster groupings |

### LEACH Protocol

| Table | Purpose |
|---|---|
| `workboardItems` | Kanban-style task items with priority and status |
| `syncRituals` | Scheduled check-in and session rituals |
| `sessionMode` | Active work session tracking |

### Gear & Civic

| Table | Purpose |
|---|---|
| `gearBuilds` | Saved gear configurator builds |
| `civicData` | Cached Montreal open data API responses |
| `civicSources` | Civic data source registry with health metadata |

### Operations Control

| Table | Purpose |
|---|---|
| `opsAlerts` | Cross-site operational alerts (info/warning/critical) |
| `opsNotes` | Per-site pinned operational notes |
| `opsSnapshots` | Manual platform state captures with label + data |

Legacy tables (preserved for compatibility):

| Table | Purpose |
|---|---|
| `emotionalCards` | Assignable mood/media cards |
| `cardEvents` | Card trigger history |

---

## 6. Database Schema — Supabase

All migrations are in `supabase/migrations/`. Apply using `mcp__supabase__apply_migration`.

### Migration History

| File | What It Creates |
|---|---|
| `20260109171421_create_gamewear_system.sql` | GameWear tables: gamewear_items, gamewear_editions, gamewear_orders |
| `20260109175528_create_advertising_system.sql` | ad_campaigns, ad_assets, ad_placements, ad_analytics |
| `20260206173451_create_clothing_creation_system.sql` | clothing_designs, clothing_prints, printful_orders |
| `20260206194916_create_user_profiles_with_microsoft.sql` | user_profiles with Microsoft 365 SSO fields |
| `20260206202637_fix_database_security_and_performance.sql` | RLS policies, indexes |
| `20260206214456_complete_security_fixes.sql` | Additional RLS hardening |
| `20260207110011_create_pki_multi_tenant_system.sql` | pki_certificate_authorities, pki_certificates |
| `20260207110109_create_pki_functions_and_views.sql` | PKI SQL functions and views |
| `20260207110606_add_pki_integration_to_domain_services.sql` | PKI integration with domain service tables |
| `20260207112243_create_art_provenance_and_editions.sql` | art_provenance, art_editions |
| `20260207112518_create_avatar_keypack_and_ca_hierarchy.sql` | avatar_keypacks, ca_hierarchy |
| `20260326011628_cleanup_legacy_tables.sql` | Removes deprecated tables |
| `20260430072220_fix_critical_security_issues.sql` | SECURITY DEFINER fixes |
| `20260430074600_revoke_dangerous_function_permissions.sql` | Privilege revocations |
| `20260502021906_revoke_all_dangerous_function_execute_permissions.sql` | EXECUTE permission lockdown |
| `20260502022233_permanent_revoke_pki_function_execute.sql` | PKI function hardening |
| `20260502022501_final_lock_pki_security_definer_permissions.sql` | Final PKI lockdown |
| `20260507063244_create_civic_user_pins.sql` | civic_user_pins, pin types and metadata |
| `20260507065204_create_user_maps_alerts_trails_heat.sql` | user_maps, civic_alerts, city_trails, heat_index_data |
| `20260507072925_revoke_anon_select_on_civic_tables.sql` | Civic table RLS hardening |
| `20260507074227_create_audit_logs_table.sql` | audit_logs for security events |
| `20260507075912_create_collab_maps_borough_mood_neighborhood.sql` | collab_maps, borough_mood, neighborhood_snapshots |
| `20260507082005_create_translations_table.sql` | translations (key/lang/value) |
| `20260508143050_update_admin_events_add_missing_columns.sql` | admin_events schema update |

---

## 7. Convex API Reference

Convex functions are in `convex/*.ts`. The hand-maintained stub is `src/convex/_generated/api.ts`.

> **IMPORTANT**: Because `npx convex dev` is not running in the build environment, `src/convex/_generated/api.ts` is maintained **by hand**. Every new Convex function must be added to this stub.

### `convex/analytics.ts`

| Function | Type | Description |
|---|---|---|
| `trackEvent` | mutation | Record analytics event (page_view, purchase, click, download) |
| `listEventsBySite` | query | Events for a specific site code |
| `getEventStats` | query | Aggregate stats for a site |
| `getAllSitesStats` | query | Stats for all three sites |
| `getTopPages` | query | Top pages by view count |
| `getTopReferrers` | query | Top referrer sources |

### `convex/brand.ts`

| Function | Type | Description |
|---|---|---|
| `getBrandProfile` | query | Get branding config for a site |
| `updateBrandProfile` | mutation | Update colors, fonts, tone |

### `convex/cards.ts`

| Function | Type | Description |
|---|---|---|
| `getAdminCards` | query | All emotional cards (admin) |
| `getCardsForUser` | query | Cards assigned to current user |
| `triggerCardEvent` | mutation | Log card trigger event |
| `deleteCard` | mutation | Remove card |
| `createCard` | mutation | Create new emotional card |

### `convex/channels.ts`

| Function | Type | Description |
|---|---|---|
| Contact channel management (create, list, update, delete) | | |

### `convex/contacts.ts`

| Function | Type | Description |
|---|---|---|
| `listContacts` | query | All contacts with optional type filter |
| `createContact` | mutation | Create contact with channels |
| `getContactDetails` | query | Full contact detail with channels + trust |

### `convex/domains.ts`

| Function | Type | Description |
|---|---|---|
| Domain ↔ hostname config CRUD | | |

### `convex/hud.ts`

| Function | Type | Description |
|---|---|---|
| `getHudContactsView` | query | Contacts formatted for HUD display |
| `getHudSitesView` | query | Sites formatted for HUD |
| `getHudProvenanceView` | query | Provenance for HUD |
| `getHudRitualsView` | query | Rituals for HUD |

### `convex/leach.ts`

| Function | Type | Description |
|---|---|---|
| `createWorkboardItem` | mutation | Add kanban item |
| `updateWorkboardItem` | mutation | Update status/priority |
| `getWorkboardItems` | query | All workboard items |
| `deleteWorkboardItem` | mutation | Remove item |
| `createSyncRitual` | mutation | Add sync ritual |
| `updateSyncRitual` | mutation | Toggle/edit ritual |
| `getSyncRituals` | query | All sync rituals |
| `deleteSyncRitual` | mutation | Remove ritual |
| `startSession` | mutation | Start a work session |
| `endSession` | mutation | End current session |
| `getActiveSession` | query | Current active session |

### `convex/location.ts`

| Function | Type | Description |
|---|---|---|
| `listLocations` | query | Location history for user |
| `getLatestLocation` | query | Most recent position |

### `convex/messages.ts`

| Function | Type | Description |
|---|---|---|
| `getConversations` | query | List conversations for user |
| `sendMessage` | mutation | Send chat message |
| `getOrCreateConversation` | mutation | Get or open DM |
| `getConversation` | query | Conversation with messages |
| `markAsRead` | mutation | Mark conversation read |

### `convex/ops.ts`

| Function | Type | Description |
|---|---|---|
| `listAlerts` | query | All ops alerts |
| `createAlert` | mutation | Create alert (info/warning/critical) |
| `resolveAlert` | mutation | Mark alert resolved |
| `deleteAlert` | mutation | Delete alert |
| `listNotes` | query | Notes, optional site filter |
| `createNote` | mutation | Create pinned note |
| `deleteNote` | mutation | Remove note |
| `saveSnapshot` | mutation | Capture platform state snapshot |
| `listSnapshots` | query | Last 20 snapshots |
| `getOpsSummary` | query | Cross-site stats (lexi + bips + gear + ops) from 9 tables |

### `convex/provenance.ts`

| Function | Type | Description |
|---|---|---|
| `getProvenanceForUser` | query | Provenance objects owned by contact |
| `listProvenanceBySite` | query | All provenance at a site |

### `convex/revenue.ts` / `convex/revenue-engine.ts`

| Function | Type | Description |
|---|---|---|
| Bundle, subscription, affiliate, product CRUD | | Full revenue engine |

### `convex/rituals.ts`

| Function | Type | Description |
|---|---|---|
| `getRituals` | query | Rituals by scope |
| `createBipsRitual` | mutation | Create ritual |

### `convex/sites.ts`

| Function | Type | Description |
|---|---|---|
| `listSites` | query | All sites |
| `createSite` | mutation | Create site |

### `convex/users.ts`

| Function | Type | Description |
|---|---|---|
| `ensureUser` | mutation | Upsert user on login |
| `getAllUsers` | query | All users (admin) |

---

## 8. Supabase Edge Functions

All edge functions are in `supabase/functions/`. Deploy using `mcp__supabase__deploy_edge_function`.

| Slug | Purpose | Auth |
|---|---|---|
| `gamewear-api` | GameWear item CRUD and sync with Printful | JWT optional |
| `printful-api` | Proxy to Printful REST API, keeps API key server-side | None (internal) |
| `ready-player-me` | Avatar generation and keypack creation via RPM | JWT |
| `metamarker-fit` | MetaMarker body scan and AR fitting service | JWT |
| `pki-api` | Certificate issuance, revocation, verification | JWT + admin |
| `leach-admin-copilot` | OpenAI-powered Kee admin assistant | JWT |
| `leach-lexi-copilot` | OpenAI-powered Lexi content assistant | JWT |
| `webhook-relay` | Shopify and Stripe webhook receiver + Convex forwarder | None |

---

## 9. LexiRose Revenue Engine

### Revenue Streams

| Stream | Monthly Target | Implementation |
|---|---|---|
| Glow Club Subscription | $4,500 | Stripe + `glowClubSubscriptions` table |
| Digital Bundles | $7,800 | Convex bundles + Stripe |
| Beauty Routines | $5,200 | Marketplace + subscriber gate |
| Affiliate Products | $3,080 | Click tracking + affiliate links |
| Shopify Products | $4,000 | Shopify sync + webhook-relay |
| **Total** | **$24,580/mo** | |

### Pages

| Route | Purpose |
|---|---|
| `/app/revenue` | Revenue hub: all streams with metrics |
| `/app/glow-club` | Glow Club landing and subscription management |
| `/app/bundles` | Bundle creation and sales tracking |
| `/app/marketplace` | Beauty routines marketplace |
| `/app/ai-routine` | AI routine generator (OpenAI via edge function) |

---

## 10. Creator Studio & GameWear

### Pipeline

```
Art Library (Supabase storage)
  → Design Editor (canvas tools)
    → MetaMarker (AR body scan)
      → Ready Player Me (avatar generation)
        → Printful (print-on-demand fulfillment)
          → Shopify (storefront)
            → Unity / Unreal Engine (game integration)
```

### Pages (Built but not wired to main router)

| Page | File | Status |
|---|---|---|
| Creator Studio Hub | `CreatorStudioPage.tsx` | Not in router |
| Clothing Creator | `creator/ClothingCreatorPage.tsx` | Not in router |
| Design Editor | `creator/DesignEditorPage.tsx` | Not in router |
| GameWear Detail | `creator/GameWearDetailPage.tsx` | Not in router |

**To wire these**: Add routes under `/app/creator/*` in `DomainRoutes.tsx` and protect with RequireAuth.

---

## 11. Advertising Hub

Full campaign management system. Built but not wired to main router.

### Pages (in `src/pages/advertising/`)

| Page | Purpose |
|---|---|
| `AdvertisingHubPage.tsx` | Hub with module cards |
| `CampaignBuilderPage.tsx` | Multi-step campaign creation |
| `CampaignDashboardPage.tsx` | Campaign performance overview |
| `AssetLibraryPage.tsx` | Media asset library with upload |
| `AnalyticsDashboardPage.tsx` | Ad analytics and conversion metrics |
| `M365IntegrationPage.tsx` | Microsoft 365 / Teams integration |
| `ThemeCustomizerPage.tsx` | Site theme override tools |

**To wire these**: Add routes under `/app/advertising/*` in `DomainRoutes.tsx`.

### Components

- `AssetUploadModal.tsx` — Drag-and-drop asset upload
- `TelemetryVisualizer.tsx` — Real-time ad telemetry charts

---

## 12. PKI & Security System

### Certificate Authority Hierarchy

```
Root CA (self-signed, hardware-backed)
  ├─ LexiRose CA (lexirose.ca domain)
  ├─ BIPS Montreal CA (bipsmontreal.com domain)
  └─ BIPS Gear CA (bipsgear.com domain)
       └─ Tenant CAs (per-org sub-authorities)
```

### Certificate Types

| Type | Issued To | Use Case |
|---|---|---|
| `kee` | Administrators | Full platform access |
| `lexi` | LexiRose team | LexiRose operations |
| `k-kwamii` | Elevated creators | GameWear + art pipeline |
| `service` | Edge functions | Inter-service auth |
| `client` | End users | Authenticated API access |
| `anonymous` | Public visitors | Rate-limited public access |

### Supabase Tables

- `pki_certificate_authorities` — CA registry with parent chain
- `pki_certificates` — Issued certificates with status (active/revoked)
- `avatar_keypacks` — RPM avatar + certificate bundle
- `art_provenance` — Art asset ownership chain

### Edge Function

The `pki-api` edge function handles: issue, revoke, verify, list.

---

## 13. Authentication & Authorization

### Supabase Auth (Primary)

- Email/password authentication via Supabase
- Sessions managed by `@supabase/supabase-js` client
- Auth context in `src/lib/auth-context.tsx`
- Auth state hook in `src/hooks/useAuth.ts`
- Route guards in `src/lib/auth/RouteGuards.tsx`

### Convex Auth

- JWT-based via `convex/auth.config.ts`
- Requires external JWT provider (Supabase or Clerk)
- `ctx.auth.getUserIdentity()` used in all protected functions
- `tokenIdentifier` is the canonical user ID in Convex

### Role System (Supabase)

| Role | Access |
|---|---|
| Anonymous | Public civic data, gear store |
| Authenticated | `/my/*` routes, pin/map/story creation |
| Admin | All `/app/*` routes, admin commands |

### RLS Policy Rules

- All Supabase tables have RLS enabled
- SELECT: always uses `auth.uid() = user_id` or membership check
- INSERT/UPDATE: WITH CHECK ensures ownership
- No `USING (true)` policies exist
- Anon role explicitly revoked from sensitive civic tables

---

## 14. Operations Control Panel (PWA)

### Access

URL: `/ops`
Install: Chrome/Edge → browser menu → "Install App" (works on Android and desktop)

### Tabs

| Tab | Data Source | Purpose |
|---|---|---|
| Overview | `api.ops.getOpsSummary` | Live cross-site stats for all 3 domains |
| LexiRose | `api.ops.getOpsSummary` + notes | LexiRose metrics, notes, quick links |
| BIPS MTL | `api.ops.getOpsSummary` + workboard | BIPS metrics, active tasks, notes |
| Gear | `api.ops.getOpsSummary` + notes | Gear metrics, notes, store links |
| Workboard | `api.leach.getWorkboardItems` | Full kanban: create/update/delete tasks |
| Alerts | `api.ops.listAlerts` | Create/resolve/delete ops alerts |
| Notes | `api.ops.listNotes` | Cross-site pinned notes |
| Session | `api.leach.*` | Start/end work sessions, view sync rituals |

### PWA Files

| File | Purpose |
|---|---|
| `public/manifest.json` | PWA manifest — start URL `/ops`, standalone display |
| `public/sw.js` | Service worker — caches app shell, skips Convex/Supabase |
| `index.html` | PWA meta tags + service worker registration |

### Real-Time Data Flow

All data uses `useQuery` from Convex React — subscriptions are live WebSocket connections. No manual refresh needed. The `getOpsSummary` query fetches from 9 tables concurrently via `Promise.all`.

---

## 15. Civic Intelligence System

### Architecture

- **Map**: React-Leaflet + OpenStreetMap tiles
- **Data**: Supabase tables (`civic_user_pins`, `user_maps`, `civic_alerts`, `city_trails`, `borough_mood`, `neighborhood_snapshots`)
- **Caching**: Montreal open data APIs cached in Convex `civicData` table

### Features

| Feature | Route | Description |
|---|---|---|
| Civic Intel Map | `/bips/civic-intel` | Full Leaflet map with layers, pins, heat index |
| City Trails | `/bips/city-trails` | Montreal trail discovery |
| Neighborhoods | `/bips/neighborhoods` | Borough mood rings and snapshots |
| Civic Stories | `/lexi/civic-stories` | LexiRose civic narrative posts |
| Gear Civic Modes | `/gear/civic-modes` | Gear HUD civic mode configuration |
| Collab Maps | `/my/collab-maps` | Real-time collaborative map editing |

### Civic Map Components (in `src/pages/civic-intel/`)

| Component | Purpose |
|---|---|
| `MapContainer.tsx` | Leaflet map initialization |
| `LayerSidebar.tsx` | Toggle civic data layers |
| `DetailSidebar.tsx` | Pin/story detail panel |
| `PinCreationModal.tsx` | New pin form |
| `HeatIndexRing.tsx` | City heat visualization |
| `StoryModeToggle.tsx` | Story layer toggle |
| `TopBar.tsx` | Search and filter |
| `BottomBar.tsx` | Status and layer count |

### Hooks (in `src/pages/civic-intel/hooks/`)

| Hook | Purpose |
|---|---|
| `useCivicLayers.ts` | Layer visibility state |
| `useHeatIndex.ts` | Heat index data fetch |
| `usePins.ts` | Pin CRUD with Supabase |
| `useSearch.ts` | Full-text search |
| `useStoryMode.ts` | Story mode toggle |

---

## 16. LEACH Protocol

LEACH (Lexi-Ekram Async Communication Hub) is the operational sync protocol between Kee (admin/Ekram) and Lexi.

### Components

| System | Purpose |
|---|---|
| Workboard | Kanban tasks with status and priority |
| Sync Rituals | Scheduled daily/weekly check-ins |
| Session Mode | Timed co-work sessions |
| AI Copilots | OpenAI-powered assistants via Supabase edge functions |

### Pages

| Route | Component | Auth |
|---|---|---|
| `/leach/admin/copilot` | LeachAdminCopilotPage | Public (access-controlled by knowledge) |
| `/leach/lexi/copilot` | LeachLexiCopilotPage | Public |
| `/app/leach` | LeachLoginPage | Admin |
| `/app/leach/dashboard` | LeachLexiDashboard | Admin |
| `/app/leach/admin` | LeachKeeAdmin | Admin |
| `/app/leach/sync-protocol` | LeachSyncProtocolPage | Admin |

### Convex Tables

- `workboardItems` — Tasks with status (todo/in_progress/blocked/done) and priority
- `syncRituals` — Recurring sync schedules
- `sessionMode` — Active session with label, start time, duration

---

## 17. BIPS Command — Admin Dashboard

### Overview

The BIPS Command Admin Dashboard is a high-contrast, cinematic analytics interface providing unified visibility across all BIPS ecosystem revenue streams, content operations, and performance metrics.

**Route**: `/admin/dashboard`
**File**: `src/pages/admin/AdminDashboardPage.tsx`
**Auth**: `RequireAdmin` — admin-gated via `RouteGuards.tsx`

### Design System

| Property | Value |
|---|---|
| Background | Pure black `#000000` |
| Primary text | White `#ffffff` |
| Accent color | Neon red `#FF0033` |
| Success / inbound | Green `#22c55e` |
| Muted / labels | Dark gray `#333333`, `#444444`, `#666666` |
| Typography | Montserrat (Google Fonts — loaded in `index.html`) |
| Font weights | 400, 500, 600, 700, 800, 900 |
| Card background | Near-black `#0a0a0a` |
| Card border | `#1a1a1a` (hoverable to `#FF003340`) |

Montserrat is injected globally in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

### Layout

- Full-width sticky header with `BIPS COMMAND` wordmark and live pulse indicator
- Tab bar with 6 modules — active tab indicated by `#FF0033` bottom border
- `max-w-6xl` main content area, `px-6 py-8` padding
- All `fontFamily` applied inline (`style={{ fontFamily: 'Montserrat, sans-serif' }}`) for reliable cross-context rendering

### The Six Modules

#### 1. TikTok Performance (`tiktok`)

Tracks the full TikTok funnel from views to revenue.

**KPI Cards (6):**

| Metric | Description |
|---|---|
| Total Views | Aggregate video views across all TikTok content |
| Link Clicks | Clicks from TikTok bio / in-video links |
| Conversions | Completed purchases attributed to TikTok |
| Glow Club Signups | New Glow Club subscribers from TikTok traffic |
| Amazon Clicks | Clicks to Amazon affiliate links via TikTok |
| Affiliate Revenue | Attributed Amazon affiliate revenue |

**Top Videos Table:**

Ranked list of best-performing videos with: rank badge, title, views, clicks, conversions, and calculated CTR (`clicks / views * 100`). Row hover triggers a neon-red tint (`#FF003308` background).

```typescript
interface TopVideo {
  id: string;
  title: string;
  views: number;    // raw integer
  clicks: number;
  conversions: number;
}
// CTR displayed as: ((clicks / views) * 100).toFixed(1) + '%'
```

---

#### 2. Revenue Streams (`revenue`)

Aggregate view of all BIPS ecosystem revenue sources.

**KPI Cards (4):** Total Revenue, MRR, Avg. Deal Size, Revenue Sources

**Revenue Stream Breakdown:**

Each stream rendered as a card with: icon, source name, dollar amount, animated progress bar (width = `amount / total * 100%`), and month-over-month change percentage. Positive change = `#FF0033` bar; negative = `#444`.

| Stream | Data Source |
|---|---|
| Amazon Affiliate | Amazon Associates monthly payout |
| Glow Club MRR | Stripe `glowClubSubscriptions` recurring revenue |
| Digital Products | CapCut templates, bundles via `bundleSales` |
| Brand Deals | Negotiated sponsorships |
| Creator Studio | LEXI asset licensing |
| Gear Merch | Printful-fulfilled product sales |
| Civic Contracts | BIPS Montreal municipal contracts |

---

#### 3. Website Analytics (`analytics`)

Tracks sitewide traffic and conversion performance.

**KPI Cards (6):** Page Views, Sessions, Product Clicks, Bounce Rate, Avg. Time on Page, Organic Search %

**Live Data**: Queries the Supabase `ad_analytics` table on mount:
```typescript
const { data } = await supabase
  .from('ad_analytics')
  .select('views, clicks, conversions')
  .limit(50);
// Falls back to static defaults if query returns empty or errors
```

**Conversion Funnel:**

Horizontal bar chart showing 5 stages: Landing → Product View → Add to Cart → Checkout → Purchase. Bar width = stage conversion percentage. First bar is always `#FF0033`; subsequent bars fade opacity proportionally.

**SEO Metrics Grid (4 cards):** Domain Authority, Indexed Pages, Backlinks, Core Web Vitals

---

#### 4. Glow Club Management (`glow`)

Subscription member management and health metrics.

**KPI Cards (6):** Active Members, MRR, Churn Rate, Avg. LTV, New This Month, At-Risk Members

**Tier Distribution (3 cards):**

| Tier | Price | Top border color |
|---|---|---|
| Core | $10/mo | `#FF0033` |
| Pro | $13/mo | `#cc0028` |
| Elite | $17.50/mo | `#880018` |

Each tier card shows member count and tier MRR.

**Recent Activity Feed:**

Timeline list of latest membership events: New signup, Upgrade, Cancellation, Renewal. Each item has a colored dot (green = positive event, red = cancellation), event label, context detail, and relative timestamp.

---

#### 5. Content Pipeline (`content`)

Tracks the status of all content assets across the creation workflow.

**Status Summary (4 cards):** Draft, Review, Approved, Live — each card shows count in the status accent color.

**Status Colors:**

| Status | Color |
|---|---|
| Draft | `#333333` |
| Review | `#f59e0b` (amber) |
| Approved | `#22c55e` (green) |
| Live | `#FF0033` (neon red) |

**Content Item List:**

Each item row shows: type badge (Script / Board / Template / Asset), title, last-updated date, status chip, and chevron arrow. Row border highlights to `#FF003340` on hover.

```typescript
interface ContentItem {
  id: string;
  title: string;
  type: 'script' | 'storyboard' | 'template' | 'asset';
  status: 'draft' | 'review' | 'approved' | 'live';
  updatedAt: string; // YYYY-MM-DD
}
```

---

#### 6. Financial Ledger (`ledger`)

Full P&L view with transaction log and category breakdowns.

**KPI Cards (4):** Total Inbound, Total Outbound, Net Profit, Reinvestment Rate

Reinvestment rate = `outbound / inbound * 100`.

**Category Breakdowns (two columns):**

Left column: inbound revenue grouped by category (sorted descending). Right column: outbound expenses by category. Values formatted as `$X,XXX`.

**Transaction Log:**

Chronological list of all transactions. Each row has:
- Colored dot: green = inbound, red = outbound
- Description and category · date
- Amount: `+$X,XXX` in green for inbound, `−$X,XXX` in red for outbound

```typescript
interface LedgerEntry {
  id: string;
  description: string;
  amount: number;      // positive = inbound, negative = outbound
  type: 'inbound' | 'outbound';
  category: string;
  date: string;        // YYYY-MM-DD
}
```

---

### Shared Components

#### `KpiCard`

```typescript
interface StatCard {
  label: string;    // All-caps label above the value
  value: string;    // Formatted display value
  change?: number;  // Percentage vs. last month (positive = up, negative = down)
  icon: React.ElementType;  // Lucide icon
  accent?: boolean; // If true: red top-left radial glow, red icon background
}
```

- `accent: true` adds a `radial-gradient(#FF003308)` background overlay and colors the icon container `#FF003320` with the icon in `#FF0033`
- Change indicator: green `ArrowUpRight` / red `ArrowDownRight` with `%` label and "vs last month" muted text
- On hover: border transitions to `#FF003340`

#### `SectionTitle`

```typescript
function SectionTitle({ children }: { children: React.ReactNode })
// Renders: 10px, font-black, tracking-[0.2em], uppercase, color: #FF0033
```

#### `fmt` / `fmtUsd`

```typescript
fmt(2840000)  // → "2.8M"
fmt(453000)   // → "453K"
fmt(142)      // → "142"

fmtUsd(14820) // → "$14,820"
fmtUsd(-2300) // → "$2,300"  (always positive, sign handled by caller)
```

---

### Data Architecture

The dashboard uses a **hybrid data model**: static mock data shapes the UI skeleton while live Supabase queries feed real values where tables exist.

| Module | Live Query | Fallback |
|---|---|---|
| TikTok | None (aggregated externally) | Static mock |
| Revenue | None (tracked in ledger) | Static mock |
| Analytics | `supabase.from('ad_analytics').select(...)` | `241K views, 87.4K sessions, 42% bounce` |
| Glow Club | None (Stripe webhooks → Convex) | Static mock |
| Content | None (editorial system TBD) | Static mock |
| Ledger | None (manual entry TBD) | Static `MOCK_LEDGER` |

**To connect live data**, replace the `MOCK_*` constants and static values with Supabase queries following this pattern:

```typescript
// Inside the module component
useEffect(() => {
  async function load() {
    const { data, error } = await supabase
      .from('your_table')
      .select('...')
      .order('created_at', { ascending: false });

    if (data && !error) {
      // transform and setYourState(data)
    }
  }
  load();
}, []);
```

**Suggested tables to create for full live data:**

| Table | Columns | Module |
|---|---|---|
| `tiktok_metrics` | `period, views, clicks, conversions, glow_signups, amz_clicks` | TikTok |
| `tiktok_videos` | `title, views, clicks, conversions, posted_at` | TikTok top videos |
| `revenue_entries` | `source, amount, period` | Revenue streams |
| `content_pipeline` | `title, type, status, updated_at` | Content |
| `ledger_entries` | `description, amount, type, category, date` | Ledger |

Create these with `mcp__supabase__apply_migration` — each table needs RLS enabled with `authenticated`-only policies.

---

### Implementation Notes

**Font loading**: Montserrat is loaded via `<link>` in `index.html`. All components apply it via `style={{ fontFamily: 'Montserrat, sans-serif' }}` rather than a Tailwind class to guarantee rendering regardless of Tailwind purge.

**Hover effects on divs**: Border color changes use inline `onMouseEnter` / `onMouseLeave` handlers with direct `style` mutations (not Tailwind `hover:`) because the accent color `#FF0033` is not a Tailwind default:

```tsx
onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#FF003340'; }}
onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'; }}
```

**Animated progress bars**: CSS `transition-all duration-700` on the bar's `width` provides the entrance animation when the component mounts.

**Adding a new module**:

1. Add a new `TabId` value to the `TabId` union type
2. Add an entry to the `TABS` array with an appropriate Lucide icon
3. Create a new `function YourModule()` component
4. Add `{activeTab === 'your-id' && <YourModule />}` to the `main` render block

---

## 18. Deployment Guide

### Prerequisites

1. Node.js 20+
2. Convex account + project at convex.dev
3. Supabase project (already provisioned)
4. Vercel account (or any static host)

### Environment Variables

Create `.env` from `.env.example`:

```env
# Required
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Optional (feature-specific)
VITE_OPENAI_API_KEY=sk-...           # AI copilots
VITE_PRINTFUL_API_KEY=...            # Clothing creator
VITE_MAPBOX_TOKEN=pk.eyJ...          # Premium map tiles
```

### Step 1: Deploy Convex

```bash
npx convex deploy
```

This deploys all files in `convex/` including schema, mutations, queries, and actions. The Convex URL goes in `VITE_CONVEX_URL`.

> **Note**: `src/convex/_generated/api.ts` is a hand-maintained stub — it does NOT get auto-generated. When adding new Convex functions, manually add them to this file.

### Step 2: Apply Supabase Migrations

Run all migrations in order via the Supabase MCP tool or CLI:

```bash
# Via Supabase CLI (if available)
supabase db push

# Or apply each migration file manually via Supabase dashboard SQL editor
```

### Step 3: Deploy Edge Functions

Deploy via the Supabase MCP tool (`mcp__supabase__deploy_edge_function`) or CLI:

```bash
supabase functions deploy gamewear-api
supabase functions deploy printful-api
supabase functions deploy ready-player-me
supabase functions deploy metamarker-fit
supabase functions deploy pki-api
supabase functions deploy leach-admin-copilot
supabase functions deploy leach-lexi-copilot
supabase functions deploy webhook-relay
```

### Step 4: Configure Supabase Auth

In Supabase dashboard:
1. Authentication → Providers → Enable Email
2. Disable "Confirm email" for development (optional)
3. Set Site URL to your production domain
4. Add redirect URLs for each domain

### Step 5: Build and Deploy Frontend

```bash
npm run build
# dist/ folder is output
```

Deploy `dist/` to Vercel:
1. Import project from Git
2. Set all `VITE_*` environment variables
3. Add rewrite rule: `/* → /index.html` (SPA routing)
4. Add all three domain names (bipsgear.com, bipsmontreal.com, lexirose.ca)

### Step 6: Multi-Domain Setup (Vercel)

In Vercel project settings → Domains:
- Add `bipsgear.com` (primary)
- Add `bipsmontreal.com`
- Add `lexirose.ca`

Domain routing happens automatically via client-side hostname detection. No server config needed.

### Step 7: PWA Icons

Add PWA icons to `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

These are referenced in `public/manifest.json`.

### Local Development

```bash
npm install
# Set VITE_CONVEX_URL in .env
npx convex dev &   # runs in background, auto-deploys changes
npm run dev        # Vite dev server
```

---

## 19. Business Model & Financials

### Revenue Projections (LexiRose)

| Stream | Monthly | Annual |
|---|---|---|
| Glow Club Subscriptions | $4,500 | $54,000 |
| Digital Bundles | $7,800 | $93,600 |
| Beauty Routines Marketplace | $5,200 | $62,400 |
| Affiliate Products | $3,080 | $36,960 |
| Shopify Product Sales | $4,000 | $48,000 |
| **Total** | **$24,580** | **$294,960** |

### Social Impact Allocation

15% of net revenue allocated to:
- Civic infrastructure maintenance
- Montreal shelter network support
- Open-source BIPS tooling

### Bootstrap Costs (Monthly)

| Service | Cost |
|---|---|
| Vercel Pro | $20 |
| Convex (Starter) | $0–25 |
| Supabase (Pro) | $25 |
| Printful (COGS) | Variable |
| **Total Fixed** | ~$70/mo |

---

## 20. Roadmap

### Completed

- [x] Multi-domain hostname detection and routing
- [x] Convex real-time database with full schema
- [x] Supabase PKI multi-tenant certificate system
- [x] Civic Intelligence Map (Leaflet + Supabase)
- [x] LEACH Protocol (workboard, sync rituals, session)
- [x] LEACH AI Copilots (admin + lexi via OpenAI)
- [x] LexiRose Revenue Engine (bundles, Glow Club, affiliates)
- [x] Gear Configurator (Convex-persisted builds)
- [x] Operations Control Panel (PWA at /ops)
- [x] Platform Navigation Hub (/hub)
- [x] Advertising Hub (built, needs router wiring)
- [x] Creator Studio (built, needs router wiring)
- [x] Collaborative Maps (real-time Supabase)
- [x] Translation Console (EN/FR/ES/ZH)
- [x] Cross-domain analytics
- [x] i18n with browser language detection
- [x] BIPS Command Admin Dashboard (/admin/dashboard) — 6-module cinematic analytics UI

### Short-Term (Next Sprint)

- [ ] Connect Admin Dashboard to live Supabase tables (see Section 17 — Data Architecture)
- [ ] Create `tiktok_metrics`, `tiktok_videos`, `content_pipeline`, `ledger_entries` tables
- [ ] Wire Advertising Hub to `/app/advertising/*` router
- [ ] Wire Creator Studio to `/app/creator/*` router
- [ ] Fill Lexi domain stub pages (Products, Downloads, Routines)
- [ ] Fill Gear domain stub pages (Catalog, Field Kits, AR Accessories)
- [ ] Add PWA icons (192 + 512px)
- [ ] Complete Convex auth.config.ts JWT provider wiring

### Medium-Term

- [ ] Shopify webhook integration (order fulfillment sync)
- [ ] Ready Player Me avatar builder UI
- [ ] MetaMarker AR fitting flow
- [ ] Game engine export pipeline (Unity + Unreal packages)
- [ ] Push notifications for ops alerts (PWA)
- [ ] Mobile-native wrapper (Capacitor or React Native)

### Long-Term

- [ ] Community marketplace (user-submitted routines)
- [ ] Multi-city civic network (beyond Montreal)
- [ ] DAO governance for social impact allocation
- [ ] Avatar NFT provenance on-chain

---

## 21. Developer Reference

### Project Structure

```
/
├─ convex/               # Convex backend functions
│   ├─ schema.ts         # Full database schema
│   ├─ analytics.ts      # Analytics events
│   ├─ brand.ts          # Brand profiles
│   ├─ cards.ts          # Emotional cards
│   ├─ channels.ts       # Contact channels
│   ├─ contacts.ts       # Contact management
│   ├─ domains.ts        # Domain config
│   ├─ hud.ts            # AR HUD views
│   ├─ leach.ts          # LEACH workboard/session
│   ├─ location.ts       # GPS location
│   ├─ media.ts          # File references
│   ├─ messages.ts       # Chat
│   ├─ ops.ts            # Operations control
│   ├─ presence.ts       # Online status
│   ├─ provenance.ts     # Artifact provenance
│   ├─ revenue.ts        # Revenue products
│   ├─ revenue-engine.ts # Bundle/subscription engine
│   ├─ rituals.ts        # Daily rituals
│   ├─ settings.ts       # User settings
│   ├─ sites.ts          # Site registry
│   ├─ socialPosts.ts    # Social media
│   ├─ trust.ts          # Trust profiles
│   └─ users.ts          # User management
├─ src/
│   ├─ convex/_generated/
│   │   └─ api.ts        # HAND-MAINTAINED STUB — update manually
│   ├─ context/
│   │   └─ DomainContext.tsx
│   ├─ layouts/
│   │   ├─ BipsLayout.tsx
│   │   ├─ GearLayout.tsx
│   │   └─ LexiLayout.tsx
│   ├─ lib/
│   │   ├─ auth.ts        # Supabase auth client
│   │   ├─ auth-context.tsx
│   │   ├─ auth/guards.ts
│   │   ├─ auth/RouteGuards.tsx
│   │   ├─ convex.ts      # Convex client init
│   │   ├─ pki/           # PKI utilities
│   │   └─ security/      # Rate limiting, audit log, sanitize
│   ├─ pages/             # All page components
│   │   ├─ admin/
│   │   │   ├─ AdminDashboardPage.tsx  # BIPS Command — 6-module dashboard
│   │   │   └─ TranslationConsolePage.tsx
│   ├─ routes/
│   │   └─ DomainRoutes.tsx
│   └─ App.tsx
├─ supabase/
│   ├─ functions/         # Deno edge functions
│   └─ migrations/        # SQL migration files
└─ public/
    ├─ manifest.json      # PWA manifest
    └─ sw.js              # Service worker
```

### Hand-Maintained Convex Stub

`src/convex/_generated/api.ts` is NOT auto-generated in this environment. When you add a new Convex function:

1. Add the function to the appropriate `convex/*.ts` file
2. Add the function reference to `src/convex/_generated/api.ts` manually:

```typescript
// Example: adding a new function to ops
ops: {
  // ... existing
  myNewFunction: {} as any,
},
```

### Key Patterns

**Domain-aware data fetching:**
```typescript
const { config } = useDomain();
const siteCode = config?.siteCode ?? 'GEAR_SITE';
const events = useQuery(api.analytics.listEventsBySite, { siteCode });
```

**Ops real-time summary:**
```typescript
const summary = useQuery(api.ops.getOpsSummary);
// summary is undefined while loading, null if not authenticated
// summary.lexi.activeSubscribers — etc.
```

**Supabase RLS pattern:**
```sql
CREATE POLICY "Users can view own pins"
  ON civic_user_pins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Glossary

| Term | Definition |
|---|---|
| BIPS | ᗺIPS — the platform brand (backwards B = ᗺ) |
| LEACH | Lexi-Ekram Async Communication Hub — operational sync protocol |
| Kee | Admin avatar / Ekram's persona in the LEACH system |
| Triad | The three-person core team (Lexi, Kee, Spirit) |
| HUD | Heads-Up Display — AR overlay for field operations |
| MetaMarker | AR body scanning service for avatar fitting |
| GameWear | Custom AR-overlay clothing that appears in-game |
| Provenance | Verified ownership chain of artifacts and recipes |
| SiteCode | Internal identifier: LEXI_SITE, BIPS_SITE, GEAR_SITE |
| PWA | Progressive Web App — installable browser app |
| Glow Club | LexiRose monthly beauty subscription ($29/mo) |
