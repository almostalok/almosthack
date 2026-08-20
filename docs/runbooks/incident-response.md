# Production Incident Response & Disaster Recovery Runbook

## 1. Incident Severity Definitions

- **SEV-1 (Critical)**: Entire platform down, database unavailable, or active security breach.
- **SEV-2 (Major)**: Core workflow degraded (e.g. submissions failing, judging evaluations inaccessible, registration blocked).
- **SEV-3 (Minor)**: Non-critical feature degradation (e.g. notifications delayed, metrics reporting lag).

---

## 2. Emergency Incident Scenarios & Remediation

### Scenario A: API Backend Down / HTTP 503 Errors
1. **Inspect Liveness vs Readiness**:
   ```bash
   curl -i https://api.almosthack.com/health/live
   curl -i https://api.almosthack.com/health/ready
   ```
2. **If `/health/live` fails**: Process has crashed or container is out-of-memory (OOM). Check container logs for unhandled rejections or memory limits. Restart container replica.
3. **If `/health/live` passes but `/health/ready` fails**: Dependency failure. Inspect JSON response for `database` or `redis` failure status.

### Scenario B: PostgreSQL Database Outage or High Connection Pressure
1. **Symptoms**: Readiness probe reports `database: { status: 'down' }`, logs show `PrismaClientKnownRequestError` with connection timeout.
2. **Diagnosis**: Check active connection count on PostgreSQL (`SELECT count(*) FROM pg_stat_activity;`).
3. **Remediation**:
   - Verify connection pool limits (`DATABASE_URL` pool size).
   - If PostgreSQL process is unresponsive, restart service and verify volume disk space.
   - If replica lag is severe, failover to hot standby replica.

### Scenario C: Redis Outage / Queue Delays
1. **Symptoms**: Readiness probe reports `redis: { status: 'down' }`, BullMQ jobs are paused.
2. **Remediation**:
   - Ping Redis instance: `redis-cli -u $REDIS_URL ping`.
   - If memory limit is reached, inspect eviction policy (`maxmemory-policy volatile-lru`).
   - Restart Redis container. BullMQ automatically retries queued jobs upon reconnection.

### Scenario D: Failed Database Migration during Release
1. **Symptoms**: `prisma migrate deploy` failed midway.
2. **Remediation**:
   - Check `_prisma_migrations` table to find the failed migration row:
     ```sql
     SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;
     ```
   - Resolve database lock or error.
   - Re-run `prisma migrate resolve --rolled-back <migration_name>` or `--applied <migration_name>` as appropriate.
   - Do NOT run `prisma db push` or `prisma migrate reset`.

---

## 3. Disaster Recovery & Database Restoration

1. **Backup Verification**: Verify available daily snapshot or continuous WAL archive.
2. **Point-in-Time Recovery**: Restore database to a new instance from the snapshot closest to before the incident timestamp.
3. **Verification**: Run `pnpm --filter @almosthack/api exec prisma migrate status` against the restored database to confirm schema parity.
4. **DNS / Connection Cutover**: Update production `DATABASE_URL` secret and trigger rolling restart of API and Worker containers.
5. **Post-Recovery Smoke Test**: Execute `scripts/smoke-test.js`.
