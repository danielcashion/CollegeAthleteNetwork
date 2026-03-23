# Visitor intelligence (FingerprintJS + ipapi + Aurora)



Production-oriented visitor identification and attribution for The College Athlete Network (CAN).



## What ships in this folder



| Area | Location |

|------|----------|

| Client collection (lazy OSS FingerprintJS) | `client/collectFingerprint.ts`, `client/fingerprintProvider.ts` |

| UI trigger (once per page view, Strict Mode–safe) | `src/components/VisitorIntelligence/*` |

| API route | `src/app/api/visitor-events/route.ts` |

| Validation + IP + sanitization | `server/validatePayload.ts`, `server/getClientIp.ts`, `server/sanitize.ts` |

| ipapi enrichment | `server/ipapiClient.ts` |

| MySQL pool + transactional ingest | `server/mysqlPool.ts`, `server/ingestPageview.ts` |

| Rules engine | `scoring/engine.ts` |

| Shared types | `types.ts` |



## Environment variables



| Variable | Purpose |

|----------|---------|

| `IPAPI_ACCESS_KEY` | Preferred server-side ipapi key (falls back to `NEXT_PUBLIC_IPAPI_KEY`) |

| `DATABASE_URL` or `MYSQL_*` | Aurora MySQL for ingestion from the Next.js API route |

| `MYSQL_SSL=true` | Enable TLS to Aurora (recommended in AWS) |

| `MYSQL_SSL_CA_PATH` | Optional path to a PEM CA file; if unset, the Amazon RDS CA bundle is used so TLS verifies (fixes `unable to get local issuer certificate` locally). |

| `MYSQL_SSL_REJECT_UNAUTHORIZED=false` | **Dev only:** disable TLS verification if you cannot use the RDS CA bundle (do not use in production). |



**API route:** if `DATABASE_URL` or `MYSQL_HOST` is not set, `POST /api/visitor-events` returns **503**.



### Vercel + Aurora



1. Set **`DATABASE_URL`** (or **`MYSQL_HOST`**, **`MYSQL_USER`**, **`MYSQL_PASSWORD`**, **`MYSQL_DATABASE`**, **`MYSQL_PORT`**) in the Vercel project so `POST /api/visitor-events` can open MySQL to Aurora.

2. Set **`IPAPI_ACCESS_KEY`** (or **`NEXT_PUBLIC_IPAPI_KEY`**) for geo enrichment.

3. For TLS to Aurora, set **`MYSQL_SSL=true`** (and adjust **`MYSQL_SSL_REJECT_UNAUTHORIZED`** if you use custom CAs).



**Network:** Vercel serverless must be able to reach the DB endpoint (for example public Aurora, RDS Proxy with a reachable endpoint, or another supported connectivity path). A database that is only reachable inside a private VPC without a proxy or tunnel will not work from Vercel until you add appropriate network access.



## Database



1. Run `database/migrations/001_visitor_intelligence.sql` on Aurora MySQL 8.

2. Run `database/migrations/002_visitor_intelligence_seed.sql` for `website_known_infra_patterns`.



IPs are stored with `INET6_ATON()` / `INET6_NTOA()`-compatible `VARBINARY(16)` columns.



## Migrating to Fingerprint Pro / `@fingerprint/agent`



1. **Provider id:** set `fingerprintProvider: "fingerprint_pro"` on the client payload when you switch libraries.

2. **Visitor id:** update `createFingerprintJsGetter` in `client/fingerprintProvider.ts` to call the Pro/Agent SDK (e.g. `FpjsAgent.load({ ... })` then `get()`), and map the commercial `visitorId` (and optional `requestId`) into `VisitorEventClientPayload`.

3. **Server validation:** extend `visitorEventClientSchema` in `server/validatePayload.ts` if you add fields (`requestId`, `linkedId`, etc.).

4. **Storage:** `fingerprint_visitor_id` remains the stable key; add new columns later if you need Pro metadata without breaking existing rows.



Open-source and Pro can run side-by-side behind `FingerprintProviderId` until you cut over.



## Analytics views



Defined in `001_visitor_intelligence.sql`:



- `vw_website_state_demand_daily`

- `vw_website_school_market_daily`

- `vw_website_infrastructure_noise_daily`

- `vw_returning_visitors_daily`



Tune `WHERE` clauses as your product definition of “actionable” solidifies.

