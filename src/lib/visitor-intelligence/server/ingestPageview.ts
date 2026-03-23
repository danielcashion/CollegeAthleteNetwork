/**
 * Transactional upsert/insert for visitor intelligence tables.
 * Used by the Next.js API route.
 */

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { VisitorEventIngestPayload } from "../types";
import { computeAttribution } from "../scoring/engine";
import { fetchIpapiEnrichment } from "./ipapiClient";
import { getMysqlPool } from "./mysqlPool";
import {
  isDataCenterCityFromPatterns,
  isHostingProviderOrg,
  loadInfraPatternsFromRows,
  type InfraPatternRow,
} from "./infrastructureFlags";
import type { Pool, PoolConnection } from "mysql2/promise";

function mysqlUtcDatetime(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function pagePathFromUrl(url: string): string {
  try {
    return new URL(url).pathname.slice(0, 1024);
  } catch {
    return url.slice(0, 1024);
  }
}

function ipParam(ip: string): string | null {
  if (!ip || ip === "unknown") return null;
  return ip;
}

async function loadInfraPatterns(conn: Pool | PoolConnection): Promise<InfraPatternRow[]> {
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT pattern_type, pattern_value, region_code, country_code
       FROM website_known_infra_patterns
       WHERE active_YN = 'Y'`,
    );
    return loadInfraPatternsFromRows(rows);
  } catch {
    return [];
  }
}

/**
 * Persists one pageview and related enrichment/attribution rows.
 */
export async function ingestVisitorPageview(event: VisitorEventIngestPayload): Promise<void> {
  const pool = getMysqlPool();
  const conn = await pool.getConnection();
  const now = new Date();
  const nowSql = mysqlUtcDatetime(now);
  const ipapiKey = process.env.IPAPI_ACCESS_KEY ?? process.env.NEXT_PUBLIC_IPAPI_KEY;

  try {
    const patterns = await loadInfraPatterns(conn);
    const ipStr = ipParam(event.clientIp);
    const ipapi = await fetchIpapiEnrichment(event.clientIp, ipapiKey);

    const isHosting = isHostingProviderOrg(ipapi.org, ipapi.asn);
    const isDcCity = isDataCenterCityFromPatterns(ipapi.city, ipapi.region, patterns);

    await conn.beginTransaction();

    await conn.execute<ResultSetHeader>(
      `INSERT INTO website_visitors (
        fingerprint_visitor_id, first_seen_datetime, last_seen_datetime,
        first_ip_address, last_ip_address, first_user_agent, last_user_agent,
        first_browser_timezone, last_browser_timezone, first_browser_locale, last_browser_locale,
        visit_count, session_count, confidence_returning_human,
        created_datetime, updated_datetime
      ) VALUES (
        ?, ?, ?,
        INET6_ATON(?), INET6_ATON(?), ?, ?,
        ?, ?, ?, ?,
        1, 0, 0,
        ?, ?
      )
      ON DUPLICATE KEY UPDATE
        last_seen_datetime = VALUES(last_seen_datetime),
        last_ip_address = VALUES(last_ip_address),
        last_user_agent = VALUES(last_user_agent),
        last_browser_timezone = VALUES(last_browser_timezone),
        last_browser_locale = VALUES(last_browser_locale),
        visit_count = visit_count + 1,
        updated_datetime = VALUES(updated_datetime)`,
      [
        event.visitorId,
        nowSql,
        nowSql,
        ipStr,
        ipStr,
        event.userAgent,
        event.userAgent,
        event.browserTimezone,
        event.browserTimezone,
        event.browserLocale,
        event.browserLocale,
        nowSql,
        nowSql,
      ],
    );

    const [[vrow]] = await conn.query<RowDataPacket[]>(
      `SELECT website_visitor_id FROM website_visitors WHERE fingerprint_visitor_id = ? LIMIT 1`,
      [event.visitorId],
    );
    const websiteVisitorId = Number(vrow?.website_visitor_id);
    if (!websiteVisitorId) {
      throw new Error("visitor upsert did not return id");
    }

    const [sessResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO website_sessions (
        session_id, website_visitor_id, session_start_datetime, session_end_datetime,
        landing_page_url, landing_referrer, initial_ip_address,
        initial_city, initial_region, initial_country,
        browser_timezone, browser_locale,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        pageview_count, event_count,
        created_datetime, updated_datetime
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, INET6_ATON(?),
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        0, 0,
        ?, ?
      )
      ON DUPLICATE KEY UPDATE
        session_end_datetime = VALUES(session_end_datetime),
        updated_datetime = VALUES(updated_datetime)`,
      [
        event.sessionId,
        websiteVisitorId,
        nowSql,
        nowSql,
        event.pageUrl.slice(0, 2048),
        event.referrerUrl,
        ipStr,
        ipapi.city,
        ipapi.region,
        ipapi.country,
        event.browserTimezone,
        event.browserLocale,
        event.utm.utm_source ?? null,
        event.utm.utm_medium ?? null,
        event.utm.utm_campaign ?? null,
        event.utm.utm_term ?? null,
        event.utm.utm_content ?? null,
        nowSql,
        nowSql,
      ],
    );

    const isNewSession = sessResult.affectedRows === 1;

    if (isNewSession) {
      await conn.execute(
        `UPDATE website_visitors SET session_count = session_count + 1, updated_datetime = ? WHERE website_visitor_id = ?`,
        [nowSql, websiteVisitorId],
      );
    }

    const [[srow]] = await conn.query<RowDataPacket[]>(
      `SELECT website_session_id, pageview_count FROM website_sessions WHERE session_id = ? LIMIT 1`,
      [event.sessionId],
    );
    const websiteSessionId = Number(srow?.website_session_id);
    const priorSessionPv = Number(srow?.pageview_count ?? 0);
    if (!websiteSessionId) {
      throw new Error("session upsert did not return id");
    }

    const [[dayRow]] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT DATE(viewed_datetime)) AS d
       FROM website_pageviews
       WHERE website_visitor_id = ?`,
      [websiteVisitorId],
    );
    const distinctVisitDays = Number(dayRow?.d ?? 0);

    const sessionPageviewCountAfter = priorSessionPv + 1;

    const attribution = computeAttribution({
      browserTimezone: event.browserTimezone,
      browserLocale: event.browserLocale,
      userAgent: event.userAgent,
      ipapiCity: ipapi.city,
      ipapiRegion: ipapi.region,
      ipapiCountry: ipapi.country,
      ipapiOrg: ipapi.org,
      ipapiAsn: ipapi.asn,
      ipapiLatitude: ipapi.latitude,
      ipapiLongitude: ipapi.longitude,
      distinctVisitDays,
      sessionPageviewCount: sessionPageviewCountAfter,
      isDataCenterCity: isDcCity,
      isHostingProvider: isHosting,
    });

    await conn.execute(
      `INSERT INTO website_pageviews (
        pageview_id, website_visitor_id, website_session_id, viewed_datetime,
        page_url, page_path, referrer_url, page_title,
        ip_address, user_agent, browser_timezone, browser_locale, languages_json,
        screen_width, screen_height, device_pixel_ratio, hardware_concurrency, device_memory_gb,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        created_datetime
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        INET6_ATON(?), ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?
      )`,
      [
        event.pageviewId,
        websiteVisitorId,
        websiteSessionId,
        nowSql,
        event.pageUrl.slice(0, 2048),
        pagePathFromUrl(event.pageUrl),
        event.referrerUrl,
        event.pageTitle,
        ipStr,
        event.userAgent,
        event.browserTimezone,
        event.browserLocale,
        JSON.stringify(event.languages),
        event.screenWidth,
        event.screenHeight,
        event.devicePixelRatio,
        event.hardwareConcurrency,
        event.deviceMemoryGb,
        event.utm.utm_source ?? null,
        event.utm.utm_medium ?? null,
        event.utm.utm_campaign ?? null,
        event.utm.utm_term ?? null,
        event.utm.utm_content ?? null,
        nowSql,
      ],
    );

    const [[pvRow]] = await conn.query<RowDataPacket[]>(
      `SELECT website_pageview_id FROM website_pageviews WHERE pageview_id = ? LIMIT 1`,
      [event.pageviewId],
    );
    const websitePageviewId = Number(pvRow?.website_pageview_id);
    if (!websitePageviewId) {
      throw new Error("pageview insert did not return id");
    }

    await conn.execute(
      `UPDATE website_sessions SET
        pageview_count = pageview_count + 1,
        session_end_datetime = ?,
        event_count = event_count + 1,
        updated_datetime = ?
       WHERE website_session_id = ?`,
      [nowSql, nowSql, websiteSessionId],
    );

    const repeatHuman = distinctVisitDays >= 2 ? 1 : 0;
    await conn.execute(
      `UPDATE website_visitors SET
        confidence_returning_human = GREATEST(confidence_returning_human, ?),
        updated_datetime = ?
       WHERE website_visitor_id = ?`,
      [repeatHuman, nowSql, websiteVisitorId],
    );

    await conn.execute(
      `INSERT INTO website_visit_enrichment (
        website_pageview_id,
        ipapi_city, ipapi_region, ipapi_country, ipapi_latitude, ipapi_longitude, ipapi_org, ipapi_asn,
        is_data_center_city, is_hosting_provider, is_mobile_network, is_proxy_or_vpn_suspected,
        enrichment_provider, raw_provider_payload,
        created_datetime, updated_datetime
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 0, 0,
        'ipapi', ?,
        ?, ?
      )`,
      [
        websitePageviewId,
        ipapi.city,
        ipapi.region,
        ipapi.country,
        ipapi.latitude,
        ipapi.longitude,
        ipapi.org,
        ipapi.asn,
        isDcCity ? 1 : 0,
        isHosting ? 1 : 0,
        JSON.stringify(ipapi.raw),
        nowSql,
        nowSql,
      ],
    );

    await conn.execute(
      `INSERT INTO website_visit_attribution (
        website_pageview_id,
        traffic_class, location_confidence_score,
        final_city, final_region, final_country, final_latitude, final_longitude,
        final_location_source,
        school_market_code, school_market_confidence_score,
        reason_codes_json,
        created_datetime, updated_datetime
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?,
        ?, ?,
        ?,
        ?, ?
      )`,
      [
        websitePageviewId,
        attribution.trafficClass,
        attribution.locationConfidenceScore,
        attribution.finalCity,
        attribution.finalRegion,
        attribution.finalCountry,
        attribution.finalLatitude,
        attribution.finalLongitude,
        attribution.finalLocationSource,
        attribution.schoolMarketCode,
        attribution.schoolMarketConfidenceScore,
        JSON.stringify(attribution.reasonCodes),
        nowSql,
        nowSql,
      ],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
