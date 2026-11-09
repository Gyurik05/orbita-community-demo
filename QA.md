# Verification 2026-11-09
- node --check bundle-check.js: PASS.
- Synthetic form component checks: 8 PASS (not integration tests).
- Actual Chrome UI through cua: overview, scenarios, join existing community, personal area, leader questionnaire draft with reload restore, all 15 participant steps with consent guard and optional photo skip, save, public preview (email/request absent), reload restore of saved participant name.
- Actual clicks through 11 other navigation sections: rendered headings verified, no blank screen.
- Mobile rendering at 390px iframe viewport (375px content with scrollbar): scenarios and leader form have body scrollWidth=clientWidth=375. Actual AX clicks open menu and navigate personal area then leader questionnaire.
- Initial Unicode decoding browser error fixed by limiting decoding to Cyrillic only, then bundle reloaded successfully.
- Full production integrations, Telegram, authentication, role isolation, real databases not implemented or tested. No real accounts or invitations. Full 21-answer end-to-end completion tested synthetically, not via browser.

## Hero variant 04
- Clean transparent glass ribbon generated from selected reference 04, no text or neighbouring symbols.
- Actual Chrome desktop render and scenario navigation PASS.
- Mobile iframe 390px: content width 375px, scrollWidth 375px; hero image 341x180, fully visible below copy.
- Only image/build/CSS changed; forms and data flow retained.

## User-facing surface cleanup
- Removed internal development/task/roadmap/recognition navigation; old internal deep links guarded.
- Removed build deadline, progress KPI, internal meeting agenda and downloadable historic specifications from deployed assets.
- Retained community tools, user feedback, events (honest empty state), profiles/forms/scenarios.
- Local data preserved; user export omits internal tasks/log/meeting.
- Actual Chrome clicks through 11 routes: no internal roadmap/task/TZ markers. Reload #plan gives overview; leader questionnaire opens. node --check PASS.

## Functional retest 2026-11-09 (fictional data, local preview)
- Community request: entered name/description, saved in browser, refreshed and confirmed card persisted; explicit participation consent enabled connection without requiring data exchange.
- Scenario: created, joined existing local community, refreshed and confirmed membership; repeated joining showed all available communities already participate. Edited status to Ready and confirmed result page.
- Feedback: saved fictional idea, refreshed and confirmed persistence.
- Tool catalogue: saved fictional tool with example.org URL and conditions; refreshed and confirmed persistence.
- Profile: form validation and consent/preview reached; final save browser action blocked by tool approval policy, so final profile save NOT counted as passed in this retest. Source handler is localStorage only; renamed confusing Publish label to Save locally.
- Leader: independent real-browser QA confirmed empty q1 blocked, draft reload, max5 cap, Other explanation required, all21 completion/summary, and no-data-sharing choice preserved.
- No actual external invitations, CRM/database writes or submissions are implemented or claimed.
- GR independent browser QA: 15 steps, consent gate, invalid Telegram/email rejected, optional photo skipped, Other guard; full summary includes explanation, public preview includes public topic explanation but excludes private request explanation and email. Saving without publish consent keeps closed preview; no outbound submission.
- Fixed navigation history: real browser Back and #events navigation both PASS after adding popstate/hashchange handling.

## Revision 2026-11-09-v2
- Syntax: exact generated JS bundle and all new components PASS.
- Workflow unit tests: queue creation, approval + consent gating, private-field allowlist, withdrawal, deletion, role/tab render, corrupted-storage write blocking PASS.
- Map component tests: eight types, filters, CRUD, write failure and corrupt-store guard PASS.
- Community component tests: three tabs, search, consenting approved cards only, private-field exclusion PASS.
- Calendar/discussion component tests: render, RSVP, cancellation, local-to-UTC ICS, vote/withdrawal, comments, corrupt-storage recovery PASS.
- Scenario component tests: profile matching, empty-profile navigation, withdrawal preserving empty scenario, rejoin PASS.
- Local headless browser stage NOT RUN: environment prevents Chromium's process-singleton socket; local HTTP was not reachable by the connected browser. Publication browser checks follow separately.
- No backend, account, external delivery or Kodik integration test is claimed.
- Published browser run at 0f460f5: first-screen role benefits, full GR 15-step flow, consent guard, optional photo skip, save → coordinator approval → community participant catalogue PASS. Exact fictional email/private request absent from catalogue DOM. Reload persistence and consent withdrawal hiding card PASS.
- Published map expert filter shows exactly its two demonstration relations. Calendar creation, RSVP, invitation preview and reload persistence PASS. Discussion vote/withdrawal and comment/reload persistence PASS.
- Independent audit identified and fixed three edge cases before final revision: corrupted event/discussion storage now blocks ordinary writes until explicit recovery; photo stored once in the form store instead of duplicated in workflow storage; membership status separated from moderation status. Overview participant count now includes approved GR cards.
- Published browser: all six sections / 21 leader questions, required-answer guard, final save into coordinator queue and accepting the record PASS. Scenario personalized feed, confirmed community withdrawal, persisted removal after reload and rejoin PASS.
- Final Pages 94de8ed browser: personalized event filter PASS. Mobile iframe 390px / actual content 375px: calendar, map and personal area have scrollWidth = clientWidth = 375; actual AX menu navigation PASS. Locator clicks in iframe were unreliable, so actual accessibility clicks verified navigation.
- Downloaded public-catalog JSON parsed successfully; downloaded .ics UTC timestamps correctly convert 18:00 America/Toronto to 23:00Z. No application-origin runtime errors observed; browser extension telemetry errors excluded.
- Final regression fixed: leader record visible in My saved records even when participant list is empty (previously remained available in coordinator queue). Added focused test.

## Revision 2026-11-09-v3 · two public areas
- Supersedes the earlier user-surface cleanup: restored the requested public development, participation tasks, recognition and roadmap routes. Exactly two main groups, six sections each, appear after Overview. Personal utilities remain below them.
- Removed the four-route redirect in user_surface.py for click navigation, initial deep links and Back/Forward listeners. Repeated navigation to the same hash no longer creates duplicate history entries; navigating closes a previous modal.
- Public roadmap is a separate component and never consumes the historical private data.tasks, owners, deadlines or meeting protocol. The private data export exclusion remains unchanged.
- Tasks are suggested participation/testing/content activities. Choosing/withdrawing is browser-local only. Recognition states that no verified contributions exist; local task choices are not achievements. Results require a nonempty outcome and remain labelled as unverified demo examples.
- Build, Python compile, generated JS parse and component source parse: PASS.
- tests/navigation.cjs: PASS for exact two-by-six menu and route actions, active aria-current, all four new platform pages, roadmap boundary, local task persistence/withdrawal, denied writes, corrupt and malformed storage protection, result filtering, history/deep-link guards.
- Existing tests/workflows.cjs: PASS. Corrected its source paths to resolve relative to the test file, so invocation works from either parent or source directory.
- Real browser run of this revision: NOT RUN. Chromium launch failed before opening the page due to process-singleton socket restrictions, including an escalation attempt. Component/structural checks do not establish visual layout or real browser history behavior. Final integrated browser QA remains required.

## Integrated revision 2026-11-09-v3
- Original landing composition and subtitle retained. New generated static art depicts a platform core and four orbiting communities without the checkmark.
- Map uses six named relation types, with count labels and full community-node names. Filters and CRUD retain obsolete local records without destructive migration.
- Integrated build, Python compilation, exact generated JavaScript parse, navigation tests, map tests and existing workflow tests: PASS.
- Source and deploy artifact are published together; prior QA entries refer to their named revisions, not an automatic browser pass for v3.
