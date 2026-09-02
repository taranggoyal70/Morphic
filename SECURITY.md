# Security

## Reporting

Do not open public issues for vulnerabilities or leaked credentials. Contact the repository owner privately with reproduction steps and affected versions.

## Trust boundaries

- Clerk owns identity and OAuth token storage.
- Morphic requests GitHub access tokens server-side and never returns them to the browser or persists them in Morphic tables.
- Neon Postgres is the sole durable store for user-owned product state.
- Upstash Redis enforces distributed rate limits; process memory is not a security control.
- GitHub Models receives the objective and bounded repository evidence required to compile a workspace using the signed-in user's GitHub authorization.
- Codex executes only after explicit approval, inside a disposable Vercel Sandbox.
- A Codex run may push only its generated branch and open a pull request. It does not merge.
- Clerk webhooks are accepted only after Clerk signature verification.

## Secret handling

Secrets live in Vercel-managed environment variables and an ignored local `.env.local`. Never commit `.env.local`, access tokens, database credentials, sandbox credentials, or webhook signing secrets.

## Operational controls

- Rotate credentials after suspected exposure.
- Review Clerk OAuth scopes before production launch.
- Keep security headers enabled for transport hardening, MIME sniffing prevention, referrer reduction, and frame/object embedding restrictions.
- Keep branch protection and required CI checks enabled on repositories used with Morphic.
- Monitor Vercel Workflow, Sandbox, Clerk, Neon, Upstash, and GitHub Models usage for anomalous activity.
