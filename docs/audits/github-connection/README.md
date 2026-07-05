# GitHub connection audit

Date: 2026-07-04

## Audit scope

Surface: authenticated GitHub connection and repository synchronization.

User goal: authorize Morphic to access GitHub, synchronize accessible
repositories, and select a repository without leaving the product to hunt
through generic account settings.

Accessibility target: a clear, keyboard-operable path with visible progress,
specific errors, and programmatically disabled pending states.

## Steps

### 1. Enter the GitHub connection flow — blocked

Evidence: `01-current-connect-dead-end.png`

The screen clearly explains that GitHub is required and separates connection
from synchronization. The primary action is nevertheless a dead end: it opens
generic account settings and tells the user to find an avatar and a connection
that is not available. The action label does not describe the actual task, and
the interface cannot recover when the provider is disabled.

Accessibility risk: the red status icon is useful visually, but the status is
not expressed as a concise text label. Screenshot evidence cannot confirm
keyboard focus visibility or screen-reader announcements.

### 2. Authorize GitHub — unavailable in the audited production configuration

The deployed Clerk resource uses development keys and exposes Google, email,
and password sign-in. GitHub is not enabled as a social connection, so neither
the embedded profile nor a custom connection control can start GitHub OAuth.

This is a configuration failure rather than a visual defect. Enabling GitHub
in Clerk is required before any application-level button can complete OAuth.

### 3. Grant repository scopes — unavailable

Morphic requires `repo` and `read:org`. Clerk must request and return both
scopes. The server already rejects tokens missing either scope.

### 4. Synchronize repositories — unavailable

The repository sync endpoint is authenticated, rate-limited, and persists
repository metadata in Postgres. It could not be exercised because Step 2
could not produce a GitHub access token.

## Implemented repair

- Replaced the generic account-settings link with a direct **Authorize
  GitHub** action.
- Added first-party Clerk account linking with `oauth_github`.
- Reauthorizes existing GitHub accounts when required scopes are missing.
- Redirects back into Morphic and automatically starts repository sync.
- Prevents duplicate automatic sync requests.
- Preserves server-side token handling; no provider token is stored in browser
  storage.

## Remaining configuration gate

Enable GitHub for the Clerk instance. The current development instance can use
Clerk's shared GitHub credentials for basic connection testing. Production
must use a dedicated GitHub OAuth application and live Clerk keys before public
customer onboarding.

## Evidence limits

The supplied authenticated screenshot was inspected directly. The independent
browser audit reached the Clerk sign-in gate but did not have the user's
authenticated session, so post-login keyboard behavior, GitHub's consent
screen, token scopes, and a completed sync still require end-to-end
verification after the Clerk connection is enabled.
