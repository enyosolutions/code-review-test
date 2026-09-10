# Interviewer guide — spoilers

Keep this file out of the candidate branch. It is a calibration aid, not an exhaustive answer key. Candidates do not need to find everything; reward clear impact analysis, sensible prioritization, and verified fixes.

## Fast calibration

| Level | A convincing performance |
| --- | --- |
| Junior | Finds several concrete React/runtime bugs, fixes one without regressions, and can explain why it failed |
| Mid-level | Connects state/effect problems to rendering behavior, catches meaningful API risks, and adds focused tests |
| Senior | Prioritizes security and data-integrity boundaries, recognizes concurrency/scaling issues, and proposes proportionate system-level fixes |

## Expo / React Native

### Basic React and correctness issues

- `tapCount` is a plain local variable. It resets on every render, and incrementing it does not schedule a render. Use state if it belongs in the UI, or a ref if it must persist without rendering.
- `favoriteProducts` duplicates data already derivable from `products` and `favorites`. Calculate it during render or memoize only if measurement shows the calculation is expensive.
- Favorite state is mutated with `splice`/`push`, then passed back with the same array identity.
- Search closes over the previous `query` value. It should use the new `value`; asynchronous search must also handle stale work.
- Persisted JSON is trusted and parsed without recovery.
- Rows use array indexes as keys, so filtering/reordering can associate component state with the wrong product.
- Pressable rows lack an accessible role, label/state, and adequate explicit semantics.

### Effect misuse and performance

- The timer has no cleanup and continues updating after unmount.
- Favorites are written inside `toggleFavorite` and again in an effect.
- Logging is split into effects that add no synchronization value.
- The `favoriteProducts` synchronization effect causes an avoidable render and risks drift.
- A `ScrollView` contains a `FlatList`, defeating normal virtualization.
- The 1,500-entry activity log is eagerly mapped inside that `ScrollView`; use virtualization, pagination, or a bounded history.
- The whole screen redraws once per second solely to display a sync timestamp.

### Security

- A committed mobile `.env` contains an admin key and an alleged analytics secret.
- Every `EXPO_PUBLIC_*` value is embedded in the client bundle and must be treated as public. Privileged operations belong behind a trusted server.

## Express API

### Correctness and data integrity

- Order input validates neither shape, email, product IDs, quantities, nor empty orders.
- Invalid lines are silently skipped, allowing misleading partial or empty orders.
- Stock checking and decrementing are separate operations. Concurrent requests can oversell; use a transaction or atomic conditional update.
- Orders retain references to mutable product objects instead of purchase-time snapshots.
- IDs based on `orders.length + 1` can be reused and do not work across processes.
- In-memory state is process-local and makes tests order-dependent.

### Security

- The committed API `.env` demonstrates leaked database credentials, JWT material, an admin key, and a Stripe-style secret. Values are fake, but a real response must remove them from history, rotate them, and provide a safe `.env.example`.
- `/debug/config` returns the entire process environment without authentication.
- Request logging records all headers and bodies, potentially exposing tokens, cookies, personal data, and payment details.
- Admin authorization trusts a caller-controlled `x-user-role` header.
- The alternative API key is accepted in a query string, where history, proxies, analytics, and logs may retain it.
- `Object.assign(product, request.body)` permits mass assignment of protected fields.
- CORS accepts every origin and the 50 MB JSON limit increases memory-exhaustion exposure.
- Search constructs a regular expression from unbounded user input.
- Error responses expose internal messages and stack traces.
- There is no rate limiting or abuse policy on sensitive/expensive routes.

### Performance and scalability

- Order listing performs serial product lookups inside nested loops: N+1 behavior.
- `/orders` and `/products` have no pagination or maximum page size.
- `/reports/export` creates 100,000 nested records in memory before sending them.
- A report should normally be bounded, streamed/chunked, or produced by a background job depending on requirements.
- Full request-body logging adds allocation, serialization, I/O, and storage overhead.

## React web app

### Basic React and correctness issues

- `exportCount` is a plain local variable. It resets on render and cannot reliably update the displayed count.
- Sorting mutates `products` in place, then sets the same array reference.
- Rows use indexes as keys, producing unstable identity after filter/sort operations.
- Search is case-sensitive and is not safely encoded into the API URL.
- Selection can reference a product no longer visible or a stale object.
- Failed calls silently substitute fixtures while the UI still says `LIVE`.
- Responses are not checked with `response.ok`; HTTP failures may be treated as success.
- Currency formatting is hard-coded and inconsistent.

### Effect and derived-state misuse

- `visibleProducts` is derivable from `products` and `query` but synchronized through an effect.
- `summary` and then `statusLabel` add two more derived-state effects, creating cascaded renders and transient stale UI.
- The document-title effect is valid external synchronization, but consumes the end of an avoidable effect chain.
- Product fetching captures only the initial query because the effect has an empty dependency array.
- Fetching has no `AbortController` or stale-response guard.
- The one-second interval performs pointless app-wide renders and is never cleaned up.

### Security, accessibility, and performance

- `dangerouslySetInnerHTML` renders API descriptions without sanitization, creating an XSS boundary.
- `VITE_*` variables are compiled into browser assets. Admin and Stripe secrets can never be kept there.
- Clickable rows are not keyboard accessible; sort state and the close button also lack useful semantics.
- Export synchronously serializes data into `localStorage`, blocking the main thread and risking quota errors.
- Every clock tick reruns filtering and redraws the app; derived-state chains multiply renders further.

## High-value remediation order

1. Remove exposed secrets/config endpoints and repair authentication.
2. Validate orders and make inventory updates atomic.
3. Remove XSS and sensitive logging paths.
4. Bound or virtualize runaway work.
5. Simplify React state/effects and repair mutation/stale closure bugs.
6. Improve accessibility, error states, pagination, and test coverage.

## Evaluation rubric (20 points)

| Area | Points | Strong evidence |
| --- | ---: | --- |
| Discovery | 5 | Finds behavioral, security, and performance issues—not only style concerns |
| Prioritization | 4 | Ranks by likelihood, blast radius, and user/business impact |
| Fix quality | 5 | Makes a small but complete change that preserves intended behavior |
| Verification | 3 | Adds or runs focused tests, including failure or edge cases |
| Communication | 3 | Explains assumptions, trade-offs, residual risk, and rollout considerations |

Useful follow-up prompts:

- “Which three findings would you fix before release, and why?”
- “How would you prove this race condition or performance concern?”
- “What belongs in the client, API process, database transaction, or background job?”
- “Which issue becomes worse at ten times the traffic or data?”
- “If these credentials had been real, what incident-response steps would you take?”

Avoid grading by exact implementation. A candidate who questions the requirements and chooses a simpler boundary can outperform one who mechanically applies every fashionable hook or library.
