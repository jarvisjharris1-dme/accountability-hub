# Accountable — iPhone layout and save/send review

Review date: October 18, 2026. Changes prepared for review; the mobile update is not deployed.

Accountable serves men and women. The approved workshop curriculum and Jarvis’s conversational voice are preserved.

## Findings from the five supplied iPhone screenshots

| Finding | Prepared change |
| --- | --- |
| Seven navigation items crowd together | Five primary destinations: Home, Mirror, Circle, Workshops, Goals. Profile and Administration move to the header. |
| Large header and empty space reduce the usable screen | Compact logo, avatar, spacing, and safe-area handling. |
| Floating red support button covers text and controls | Move support access into the header; remove floating and duplicated Home controls. |
| Navigation and support compete with the keyboard | Hide app chrome while a text field is focused and the visual viewport indicates an open keyboard. Keep dialogs scrollable within the visible area. |
| Seven large stage cards delay workshop access | Compact stage selector on mobile, retaining the stage grid on larger screens. |
| Home shortcuts open sections rather than the intended action | Open a new reflection, a new goal, or Circle chat directly. Browser Back returns to the previous section. |
| Progress can disagree between Home and Workshops | Read the reader’s workshop completion table and the goal’s saved percentage. Preserve completed sessions when reviewing them. |
| First Awareness workshop contains only “Test” | A narrowly scoped, optional SQL cleanup is prepared separately. It has not been executed. |

## Save/send checks

| Check | Result and limit |
| --- | --- |
| Reflection save and reload in the live account | Passed. The marked test record was removed afterward. |
| Goal creation, milestone, completion, and reload in the live account | Passed. The marked goal and milestone were removed afterward. |
| Circle message between the two owner-controlled accounts | Saved and survived reload. Recipient-scoped database access confirmed the second account could read the message. A labeled test message remains for inspection. Receiving-account UI and device notifications were not verified. |
| New changes: failed reflection/goal/support saves | Automated component checks confirm the editor remains available and success is not reported on failure. |
| Workshop review and completion | Automated checks confirm Review does not reset completion, completion errors remain retryable, and progress-load errors block misleading Start actions. |
| Onboarding | Correct goal status/category values; errors are checked before completion; retries reuse the initial goal ID. Photo upload now receives the account ID and update callback. End-to-end photo upload was not exercised. |

Support copy now describes the confirmed behavior: requests appear in the Circle’s Support section. It does not promise immediate device alerts.

## Verification

- Clean dependency installation completed with the committed lockfile.
- Production build passed.
- Eleven focused automated component tests passed (`npm test`). These use mocked data and do not replace real-device testing.
- Full application and Vite configuration TypeScript checks now pass (`npm run typecheck`). Component props/callbacks, notification defaults, and shared query/environment types were corrected in the release follow-up.
- Browser access to the local preview was unavailable. The supplied images establish the current iPhone problems; they do not verify the revised layout.

## Release checks still needed

1. Open the prepared build on an actual iPhone in Safari and the installed app. Check 320–430 px widths, portrait/landscape, text enlargement, safe areas, and no horizontal clipping.
2. Open the keyboard in Mirror, Goals, Circle chat, and Support. Confirm text and Save/Send controls remain reachable; close the keyboard and confirm navigation returns.
3. Confirm reload and browser Back preserve the selected section/stage. Test Profile and admin access on the owner account and absence of admin access on a regular account.
4. Repeat a small reflection/goal/message test after deployment; confirm visibility and clean up only the marked fixtures.
5. Run the optional placeholder cleanup only as part of the agreed production release, after reviewing the exact target row. Retain the row and its user progress.

GitHub write access was restored. The source and validation follow-up are tracked in pull request #2: https://github.com/jarvisjharris1-dme/accountability-hub/pull/2. The original downloadable patch is a pre-release snapshot; the pull request is the current source. The optional placeholder cleanup is separate from the frontend build and has not been executed.
