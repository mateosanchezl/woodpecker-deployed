# Concrete User-Growth Improvements to Ship Now

## Summary
- Skip dedicated CTA-tracking work for now. Focus on visible improvements that make Peck easier to start, easier to trust, and easier to return to.
- The fastest wins are already supported by the product you have: themed sets, flexible set sizes, quick start, reviews, emails, streaks, achievements, leaderboard, and the MDX blog pipeline.
- Ship these in order: `preset-based entry points`, `friction fixes`, `public proof`, `return emails`, then `more pages tied to existing presets`.

## Immediate Changes
- `1. Expose existing training presets on the public site`
- Extend quick start to accept `focusTheme` and `size`, not just `estimatedRating`.
- Add a new homepage section: `Start by weakness`. Use these 6 cards only: `Forks`, `Pins`, `Mates`, `Sacrifices`, `Skewers`, `Back Rank Mate`.
- Each card should start the same default flow after signup: `100 puzzles`, `5 cycles`, matching `focusTheme`, starter set name like `Forks Starter Set`.
- Add a second homepage section: `Choose your level`. Use these 5 bands only: `800-1000`, `1000-1200`, `1200-1400`, `1400-1600`, `1600-1800`. Each band should map to a starter set centered on that range.
- Add the same two sections to the Woodpecker guide page so the top two public pages both feed directly into a relevant first session.

- `2. Make signup promise the first session clearly`
- Wrap the sign-up page in light marketing copy instead of showing only the Clerk widget.
- Keep the copy concrete: `Free forever`, `No credit card`, `You’ll start with a 100-puzzle starter set`, `Train by theme or level`.
- Preserve the selected preset through signup so a visitor who clicks `Train Forks` lands directly in a forks starter set, not a generic flow.

- `3. Remove logged-out dead ends`
- Redirect signed-out visits to `/training`, `/training/new`, `/progress`, `/leaderboard`, `/achievements`, `/dashboard`, and `/settings` to `/sign-up?next=...`.
- Update public docs and marketing links so they do not send logged-out visitors into auth-only pages unless the redirect is already in place.
- Keep one exception: if a public preview is added later, link to that instead of auth.

- `4. Make the first session feel more specific`
- On quick start, show the set name, theme, puzzle count, and cycle target before puzzle 1 begins.
- Add three starter set variants only: `General Starter`, `Theme Starter`, and `Level Starter`.
- Do not ask for extra setup unless the user explicitly chooses to customize.

## Public Proof
- `5. Turn the existing review flow into testimonials`
- Extend `AppReview` with `isPublic`, `displayName`, and `approvedAt`.
- After a 4-star or 5-star review, ask one follow-up question: `Can we show this on the site?`
- Add a testimonial block to the home page, pricing page, and Woodpecker guide using only approved reviews.
- Show at most 6 testimonials total across the site and rotate them manually or by newest approved first.

- `6. Add public community proof from existing product data`
- Keep the existing `completed puzzles` milestone on the homepage.
- Add one more proof module using data you already have: `top weekly trainers` or `streak highlights`, limited to users already opted into leaderboard visibility.
- If names are incomplete, anonymize them as first name + initial or a generated handle.
- Do not claim `thousands` or rating gains unless backed by real stored data.

## Return and Retention
- `7. Use the existing Resend setup for concrete user emails`
- Send a `welcome` email right after signup with one button: `Start your starter set`.
- Send a `24h no-start` email if the user has not created any set. Include exactly three preset buttons: `Start Forks`, `Start Pins`, `Start Mates`.
- Send a `72h started but not finished` email if the user has a set but no completed cycle. Link straight back to their active set.
- Send a `7-day inactive` email to returning users with one suggested action: `Resume your active set` or `Review your missed puzzles`, whichever applies.
- Keep each rule single-send until the user’s state changes. No newsletter or broad marketing email program.

- `8. Add lightweight share prompts using existing achievements`
- Add a `Copy progress summary` action after first cycle completion, streak milestones, and major achievement unlocks.
- The copied text should be short and product-linked, for example: `Finished cycle 1 of my 100-puzzle forks set on Peck. Repetition works.`
- Start with copy-to-clipboard only. Do not build OG image cards yet.

## Content to Publish With the Existing Blog Pipeline
- `9. Publish the next 8 pages as blog posts, not a new page system`
- Ship these first 8 titles in this exact order:
- `Best Fork Puzzles for Woodpecker Training`
- `How to Train Pins with the Woodpecker Method`
- `How to Build a Mate Pattern Starter Set`
- `Sacrifice Puzzles: When to Drill Them and When Not To`
- `Skewer Puzzles for Club Players`
- `Back Rank Mate Training for Rapid Improvement`
- `What Puzzle Rating Should You Use at 1000, 1200, 1400, and 1600?`
- `How Large Should Your First Woodpecker Set Be?`
- Every post must include one matching preset CTA, one `who this is for` section, one `how Peck configures this set` section, and one internal link to the Woodpecker guide.
- Use the existing MDX blog setup for speed. Do not create a separate docs or landing-page framework first.

## Test Plan
- A user who clicks `Train Forks` or a level band on a public page reaches a matching starter set after signup with no extra setup.
- Signed-out users never hit a broken auth-only experience from public pages.
- Approved public reviews show on marketing pages and non-public reviews never do.
- Welcome and return emails deep-link into the correct next action and stop sending once the user completes that action.
- Each new blog post has a matching preset CTA and links into the existing product flow.
- The first 30 days of work should produce these concrete outputs: homepage preset sections live, sign-up page wrapped, auth dead ends fixed, public testimonials live, 4 lifecycle emails live, and 8 new preset-linked posts published.

## Assumptions
- No dedicated analytics project in this phase beyond basic sanity checks in existing admin reports.
- No paid acquisition in this phase.
- Keep the current stack and current app structure; prefer extending existing routes, review flow, quick start, emails, and MDX content rather than building new systems.
