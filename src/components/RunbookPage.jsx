import CommentSection from "./CommentSection";

export default function RunbookPage() {
  return (
    <article>
      <header className="runbook-header">
        <div className="runbook-breadcrumb">
          <a href="#">Runbooks</a> / Auth Service
        </div>
        <h1 className="runbook-title">Auth Service Runbook</h1>
        <div className="runbook-meta">
          <span className="badge">Production</span>
          <span>Last updated May 10, 2026 by Sarah Chen</span>
          <span>•</span>
          <span>Team: Identity</span>
        </div>
      </header>

      <div className="runbook-body">
        <h2>1. Service Overview</h2>
        <p>
          The Auth Service handles authentication and authorization for all
          internal and external facing applications. It manages user sessions,
          JWT token issuance and validation, OAuth 2.0 flows, and RBAC policy
          enforcement.
        </p>

        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Repository</td>
              <td>
                <code>github.com/acme-corp/auth-service</code>
              </td>
            </tr>
            <tr>
              <td>Language</td>
              <td>Go 1.22</td>
            </tr>
            <tr>
              <td>Port</td>
              <td>
                <code>8443</code> (gRPC), <code>8080</code> (HTTP health)
              </td>
            </tr>
            <tr>
              <td>Dependencies</td>
              <td>PostgreSQL 15, Redis 7, Vault</td>
            </tr>
            <tr>
              <td>SLO</td>
              <td>99.95% availability, p99 latency &lt; 150ms</td>
            </tr>
            <tr>
              <td>On-Call Rotation</td>
              <td>Identity Team (PagerDuty)</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Architecture</h2>
        <p>
          The service runs as a Kubernetes deployment across three availability
          zones with a minimum of 6 replicas. Traffic is routed through the API
          Gateway via gRPC.
        </p>
        <pre>
          <code>
{`Client → API Gateway → Auth Service (gRPC :8443)
                            ├── PostgreSQL (users, roles, permissions)
                            ├── Redis (session cache, rate limiting)
                            └── Vault (signing keys, secrets)`}
          </code>
        </pre>

        <div className="callout callout-info">
          <strong>Note:</strong> The Auth Service is on the critical path for
          every authenticated request. Any latency increase here impacts all
          downstream services.
        </div>

        <h2>3. Common Alerts &amp; Troubleshooting</h2>

        <h3>🔴 AUTH_HIGH_ERROR_RATE</h3>
        <p>
          <strong>Threshold:</strong> &gt;1% 5xx responses over 5 minutes
        </p>
        <p>
          <strong>Common causes:</strong>
        </p>
        <ul>
          <li>
            PostgreSQL connection pool exhaustion — check <code>pg_stat_activity</code> for
            idle connections. Restart pods if pool is deadlocked.
          </li>
          <li>
            Vault token expiry — the service auto-renews tokens, but if Vault
            was unreachable during renewal, tokens expire. Check Vault health
            and force a token renewal via <code>POST /admin/vault/renew</code>.
          </li>
          <li>
            Bad deployment — check if a recent deploy correlates with the error
            spike. Rollback immediately if so (see Section 5).
          </li>
        </ul>

        <h3>🟡 AUTH_LATENCY_HIGH</h3>
        <p>
          <strong>Threshold:</strong> p99 &gt; 200ms over 10 minutes
        </p>
        <p>
          <strong>Common causes:</strong>
        </p>
        <ul>
          <li>
            Redis cache miss storm — usually after a Redis restart or
            eviction event. Check Redis memory usage and hit rate. May
            self-resolve in 5–10 minutes as cache warms.
          </li>
          <li>
            Slow database queries — check the <code>auth_slow_queries</code>{" "}
            dashboard for queries exceeding 100ms. Common culprit is the
            permission resolution query for users with 50+ roles.
          </li>
        </ul>

        <h3>🟡 AUTH_TOKEN_SIGNING_FAILURES</h3>
        <p>
          <strong>Threshold:</strong> &gt;0 failures in 1 minute
        </p>
        <p>
          <strong>Action:</strong> This is almost always a Vault connectivity
          issue. Check Vault cluster health. If Vault is down, the Auth Service
          falls back to a local cached signing key (valid for up to 1 hour).
        </p>

        <div className="callout callout-danger">
          <strong>Critical:</strong> If the cached key also expires, all token
          signing stops. Escalate to Infrastructure immediately if Vault has been
          down for more than 30 minutes.
        </div>

        <h2>4. Monitoring</h2>
        <p>
          <strong>Grafana Dashboard:</strong>{" "}
          <a href="#">Auth Service Overview</a>
        </p>
        <p>
          <strong>Key metrics to watch:</strong>
        </p>
        <ul>
          <li>
            <code>auth_requests_total</code> — total request count by status
            code
          </li>
          <li>
            <code>auth_request_duration_seconds</code> — latency histogram
          </li>
          <li>
            <code>auth_active_sessions</code> — gauge of current active sessions
          </li>
          <li>
            <code>auth_token_signing_errors_total</code> — counter for signing
            failures
          </li>
          <li>
            <code>auth_redis_pool_active</code> — Redis connection pool
            utilization
          </li>
        </ul>

        <p>
          <strong>PagerDuty Escalation Policy:</strong> Identity Team → Platform
          On-Call → VP Engineering
        </p>

        <h2>5. Deployment &amp; Rollback</h2>
        <p>
          The Auth Service uses blue-green deployments managed by Argo Rollouts.
          Deployments are triggered automatically from merges to{" "}
          <code>main</code>.
        </p>

        <h3>Deploy</h3>
        <pre>
          <code>
{`# Deployments are automatic, but to manually promote:
kubectl argo rollouts promote auth-service -n identity

# Watch rollout status:
kubectl argo rollouts status auth-service -n identity`}
          </code>
        </pre>

        <h3>Rollback</h3>
        <div className="callout callout-warning">
          <strong>Warning:</strong> Always rollback first, investigate later. If
          the error rate is climbing, don't wait for root cause analysis.
        </div>

        <pre>
          <code>
{`# Abort current rollout and revert to previous stable:
kubectl argo rollouts abort auth-service -n identity
kubectl argo rollouts undo auth-service -n identity

# Verify the rollback:
kubectl argo rollouts status auth-service -n identity`}
          </code>
        </pre>

        <h2>6. Redis Configuration</h2>
        <p>
          The Auth Service uses Redis for session caching and rate limiting.
          Current configuration:
        </p>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Max Connections</td>
              <td>50</td>
            </tr>
            <tr>
              <td>Connection Timeout</td>
              <td>5s</td>
            </tr>
            <tr>
              <td>Max Idle Time</td>
              <td>300s</td>
            </tr>
            <tr>
              <td>Session TTL</td>
              <td>24h</td>
            </tr>
            <tr>
              <td>Rate Limit Window</td>
              <td>60s</td>
            </tr>
          </tbody>
        </table>

        <h2>7. Contacts &amp; Escalation</h2>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Service Owner</td>
              <td>Sarah Chen (schen)</td>
            </tr>
            <tr>
              <td>Tech Lead</td>
              <td>Marcus Johnson (mjohnson)</td>
            </tr>
            <tr>
              <td>Engineering Manager</td>
              <td>Priya Patel (ppatel)</td>
            </tr>
            <tr>
              <td>SRE Contact</td>
              <td>Taylor Brooks (tbrooks)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CommentSection />
    </article>
  );
}
