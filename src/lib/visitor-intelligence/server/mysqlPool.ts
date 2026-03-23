import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import type { PoolOptions, SslOptions } from "mysql2";
import rdsCaBundle from "aws-ssl-profiles";

let pool: mysql.Pool | null = null;

/**
 * TLS options for Aurora / RDS MySQL.
 *
 * Without a CA bundle, Node often throws `HANDSHAKE_SSL_ERROR: unable to get local issuer certificate`
 * because the server cert chains to Amazon's RDS CAs, not the public Web PKI.
 *
 * - Default: use the `aws-ssl-profiles` bundle (same family mysql2 ships with) + verify.
 * - `MYSQL_SSL_REJECT_UNAUTHORIZED=false`: dev-only; skip verification (not for production).
 * - `MYSQL_SSL_CA_PATH=/abs/or/rel/path.pem`: optional override CA file.
 *
 * Returns are asserted as mysql2 `SslOptions` so TS does not widen to Node `tls.ConnectionOptions`
 * (same symptom: createPool overload error on `pfx`).
 */
function resolveMysqlSslOptions(): SslOptions | undefined {
  const enabled =
    process.env.MYSQL_SSL === "true" ||
    process.env.DATABASE_URL?.includes("ssl=true") ||
    false;
  if (!enabled) {
    return undefined;
  }

  const rejectUnauthorized = process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false";
  if (!rejectUnauthorized) {
    return { rejectUnauthorized: false } satisfies SslOptions;
  }

  const caPath = process.env.MYSQL_SSL_CA_PATH?.trim();
  if (caPath) {
    const resolved = path.isAbsolute(caPath) ? caPath : path.join(process.cwd(), caPath);
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(resolved, "utf8"),
    } satisfies SslOptions;
  }

  return {
    rejectUnauthorized: true,
    ca: rdsCaBundle.ca,
  } satisfies SslOptions;
}

/** True when the value is a full URL Node can parse (e.g. `mysql://...`), not a bare hostname. */
function isFullConnectionUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value.trim());
}

/**
 * Aurora MySQL connection pool (Next.js route). Uses `DATABASE_URL` when it is a full URL
 * (`mysql://user:pass@host:port/db`), otherwise `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
 *
 * If `DATABASE_URL` is mistakenly set to a hostname only (common on Vercel), it is treated as `MYSQL_HOST`
 * and combined with the other `MYSQL_*` variables instead of calling `new URL()` (which would throw).
 */
export function getMysqlPool(): mysql.Pool {
  if (pool) return pool;

  const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
  if (rawDatabaseUrl && isFullConnectionUrl(rawDatabaseUrl)) {
    const u = new URL(rawDatabaseUrl);
    const user = decodeURIComponent(u.username);
    const password = decodeURIComponent(u.password);
    if (!user) {
      throw new Error(
        "DATABASE_URL must include a username (e.g. mysql://user:password@host:3306/database). " +
          "If you prefer separate vars, unset DATABASE_URL and use MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE.",
      );
    }
    const dbName = u.pathname.replace(/^\//, "").split("?")[0];
    const ssl: PoolOptions["ssl"] =
      process.env.MYSQL_SSL === "true" || u.searchParams.get("ssl") === "true"
        ? resolveMysqlSslOptions()
        : undefined;
    const poolConfig: PoolOptions = {
      host: u.hostname,
      port: Number(u.port || 3306),
      user,
      password,
      database: dbName || undefined,
      ssl,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 5),
      enableKeepAlive: true,
    };
    pool = mysql.createPool(poolConfig);
    return pool;
  }

  const host =
    process.env.MYSQL_HOST?.trim() ??
    (rawDatabaseUrl && !isFullConnectionUrl(rawDatabaseUrl) ? rawDatabaseUrl : undefined);
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE?.trim();
  if (!host || !user || !database) {
    throw new Error(
      "Database not configured: set DATABASE_URL or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE",
    );
  }

  const ssl: PoolOptions["ssl"] = process.env.MYSQL_SSL === "true" ? resolveMysqlSslOptions() : undefined;

  const poolConfig: PoolOptions = {
    host,
    port: Number(process.env.MYSQL_PORT || 3306),
    user,
    password,
    database,
    ssl,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 5),
    enableKeepAlive: true,
  };
  pool = mysql.createPool(poolConfig);
  return pool;
}
