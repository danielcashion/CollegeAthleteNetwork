/**
 * MySQL entry points for visitor intelligence: pooled Aurora connections and transactional ingest.
 * All queries use parameterized statements via `mysql2/promise`.
 */

export { getMysqlPool } from "./mysqlPool";
export { ingestVisitorPageview } from "./ingestPageview";
