# Launch Plan: [Feature / Release Name]

> Owner: [name]
> Target launch: [YYYY-MM-DD HH:MM TZ]
> Spec: [link]
> PR(s): [link]

## Pre-Launch Checklist

### Code Quality

- [ ] Full test suite green (unit + integration + e2e)
- [ ] Build clean, no warnings
- [ ] Lint and type checks clean
- [ ] Code reviewed and approved (see review.md)
- [ ] No TODO / FIXME that should be resolved before launch
- [ ] No `console.log`, `print`, or `dbg!` debug calls in production paths
- [ ] Error handling covers expected failure modes

### Security

- [ ] No secrets in code or VCS
- [ ] `npm audit` / equivalent shows no critical or high CVEs
- [ ] Input validation on all user-facing endpoints
- [ ] Auth + authz checks on every new endpoint
- [ ] Security headers set (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Rate limiting on auth and expensive endpoints
- [ ] CORS restricted to expected origins (no `*`)
- [ ] External data treated as untrusted at the boundary

### Performance

- [ ] Core Web Vitals in "Good" thresholds on representative pages
- [ ] No N+1 queries in critical paths
- [ ] Images optimized (compression, responsive sizes, lazy loading)
- [ ] Bundle size within budget
- [ ] New DB query paths have appropriate indexes
- [ ] Caching configured for static assets and hot queries

### Accessibility

- [ ] Keyboard reaches every interactive element
- [ ] Screen reader conveys structure and state
- [ ] Color contrast ≥ WCAG 2.1 AA (4.5:1 body text)
- [ ] Focus managed for modals and dynamic content
- [ ] Form errors descriptive and associated with fields
- [ ] No new axe-core or Lighthouse a11y warnings

### Infrastructure

- [ ] All new env vars set in production (and staging mirrors prod)
- [ ] DB migrations applied on staging, ready for prod
- [ ] DNS and TLS configured
- [ ] CDN configured for static assets
- [ ] Logging and error reporting wired up
- [ ] Health check endpoint exists and returns 200
- [ ] Backups running and recently verified

### Documentation

- [ ] README updated for any new setup step
- [ ] API docs updated
- [ ] ADR written for any non-obvious architectural decision
- [ ] CHANGELOG updated
- [ ] User-facing docs updated (if applicable)
- [ ] Internal runbook updated for on-call

## Feature Flag

- **Name:** `feature.[...]`
- **Owner:** [person]
- **Default state at launch:** OFF
- **Expiration / cleanup date:** [YYYY-MM-DD, max 2 weeks after full rollout]
- **Both states tested in CI:** [ ] yes

## Rollout Plan

```
1. Deploy to staging
   └── Full e2e green, manual smoke test
2. Deploy to production, flag OFF
   └── Health check, error monitor clean for 15min
3. Flag ON for internal team
   └── 24h monitoring window
4. Canary: 5% of users
   └── 24–48h monitoring window
5. 25% → 50% → 100%
   └── Monitor at each step
6. Flag ON globally
   └── 1 week of monitoring, then flag cleanup
```

## Rollout Decision Thresholds

| Metric | Advance | Hold | Roll back |
|---|---|---|---|
| Error rate | ≤ 1.1× baseline | 1.1×–2× baseline | > 2× baseline |
| P95 latency | ≤ 1.2× baseline | 1.2×–1.5× baseline | > 1.5× baseline |
| New JS error types | 0 | < 0.1% sessions | > 0.1% sessions |
| Business metric | neutral/up | down < 5% | down > 5% |

## Rollback Plan

**Trigger conditions** (any one triggers rollback):

- Error rate > 2× baseline for 5+ minutes
- P95 latency > 1.5× baseline for 5+ minutes
- Data integrity issue reported or observed
- Security vulnerability discovered
- Business metric drops > 5% attributable to this change

**Rollback steps:**

1. Flip the feature flag OFF (target time: < 1 minute)
2. If the issue persists, redeploy the previous build:
   ```
   git revert <commit> && <deploy command>
   ```
   Target time: < 5 minutes.
3. If DB migrations must be rolled back: `<rollback command>`
   Target time: < 15 minutes.
4. Verify rollback succeeded: health check 200, error rate back to baseline.
5. Notify team and customers (if user-visible).
6. Write a short incident note. Link it here.

**Data considerations:**

- Data written by the new feature is: [preserved | cleaned up | migrated]
- Rollback-safe: [yes / with caveats]

## Monitoring

Dashboards to watch (add links):

- Application error rate: [link]
- P95 latency: [link]
- Business metric: [link]
- Infra: CPU, memory, DB connections, queue depth: [link]
- Client-side: Core Web Vitals, JS errors: [link]

## First-Hour Post-Deploy Verification

- [ ] Health endpoint returns 200
- [ ] Error monitoring shows no new error types
- [ ] Latency dashboard shows no regression
- [ ] Critical user flow tested manually
- [ ] Logs are flowing and readable
- [ ] Rollback mechanism verified (dry run)

## Communication

- [ ] Team notified of deploy window
- [ ] On-call aware and briefed
- [ ] Customer-facing announcement drafted (if applicable)
- [ ] Status page updated (if applicable)

## Post-Launch

- [ ] 1 week of monitoring completed, no rollback
- [ ] Feature flag cleaned up (and dead code paths removed)
- [ ] Retro notes captured (what went well, what to improve)
- [ ] Spec and plan marked as `implemented`
