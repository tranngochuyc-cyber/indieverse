# Verification — 2026-09-26

- `npm run check`: passed JavaScript/server/catalog syntax checks.
- `npm test`: passed isolated HTTP integration scenario with 12 catalog games, direct page URLs, invalid input and origin rejection, private file protection, independent sessions, and profile/library/collection/comment persistence after server restart. Contact/newsletter validations and local storage tested.
- Browser: saved TUNIC status, rating and note; reloaded into library. Created a two-game collection and verified its detail page. Posted a spoiler-marked personal comment and verified it was concealed. Test-only records removed afterward.
- Browser: checked all 12 review detail pages, catalog filtering, second review page, Celeste search, direct detail reload, Back/Forward, collection/author/feature detail pages and 404.
- Layout: checked main page types at 390px and desktop 1360px; additionally checked home/catalog/reviews/collections/library/profile/settings/contact and game detail at 320px. No document horizontal overflow observed. Fixed mobile rating overlapping game actions and tightened 320px header spacing.
- Browser console: no application errors observed in the captured error log.

External limitations: fonts and Steam artwork need network. Editorial copy/authors/scores are illustrative. Local profiles are not authenticated cloud accounts; contact/newsletter do not send mail. This verification does not establish production readiness or exact reproduction of an inaccessible reference site.

# Verification — 2026-09-27

- `npm test`: passing catalog preservation, 42 unique records, original 12 titles/scores, 42 distinct four-chapter articles, every game/review/curation/feature renderer, minimum article length, three distinct illustrations per game, isolated HTTP persistence and validation.
- `npm run check`: all application, interior, motion, server and editorial JavaScript syntax passes.
- Real browser: national-origin filter returned exactly Coffee Talk and A Space for the Unbound for Indonesia. Saved Coffee Talk as playing with a note; note and status persisted after reload. Created a two-game personal itinerary and confirmed its distinct detail page.
- Browser responsive inspection: 20 interior route types rendered with headings and no horizontal document overflow at 390px and 1365px, including game/review detail, curated itinerary, library, profile, settings, search, author/feature detail, policies and 404. Desktop screenshots inspected for atlas, reading room, itinerary, library and game passport; mobile long-article screenshot inspected.
- Opening hook appeared with focus on Skip; subsequent navigation skipped it. Editorial routes show their own templates rather than the discovery grid. Direct chapter URL and in-article chapter links scroll to their targets after smooth navigation settles.
- Test browser data is isolated on 127.0.0.1:5175, separate from the user's localhost:5173 data.

External reference coverage: Indie Hive list/article and Checkpoint review writing were researched. Infinite Backlog did not expose its full authenticated/JavaScript journeys, so exact parity is not claimed. External artwork can change or fail; image fallback uses official Steam artwork and relabels its caption.

# Verification — v4, 100 games, 2026-09-27

- Syntax check and all 8 tests passed after final edits. Tests cover 100 unique Steam IDs/slugs, preservation of original titles and scores, 100 game/review renderers, independent paragraphs, four chapters, three distinct sourced images, six four-chapter feature essays and private API persistence/validation. Finder regression covers fewer-than-three results and the empty state.
- Home comparison matches the previous discovery markup at all three hero positions before the explicitly requested editorial shelf. The shelf now links to the rewritten A Short Hike, TUNIC and Stardew Valley stories. Desktop cards have equal heights and all three gameplay images loaded.
- Browser at 390px: atlas uses six named region buttons and a country list; South America returned Blazing Chrome, Momodora, UNSIGHTED and VA-11 Hall-A. Selecting Indonesia after a region returned exactly A Space for the Unbound and Coffee Talk, with the incompatible region removed. Back/Forward restored the four-game and two-game states. Selection scrolls to results.
- Desktop and 390px comparison layouts inspected. Co-op challenge recommendations returned appropriate Co-op games; story/2D/Co-op returned one Sea of Stars card without duplication. Comparison changes returned the chosen Balatro/Into the Breach pair.
- All six feature routes inspected at 390px, with four chapters and no horizontal document overflow. A Short Hike masthead and chapter link inspected; Sifu at 320px had no horizontal overflow and readable Vietnamese headings/body. Computed editorial heading font is Be Vietnam Pro with Segoe UI/Arial fallback.
- Desktop masthead, table of contents, captions and article layout inspected. Sifu illustration URLs were replaced with three official website gameplay screenshots, loaded at widths 1920/1920/3840. Stardew Valley's three gameplay illustrations loaded at 1920px. A Short Hike/TUNIC/Obra Dinn/Unbound use the existing official gameplay assets.
- New ANIMAL WELL article and image viewer inspected; thin promotional text images were removed in favor of correctly labeled official artwork. ABZÛ's normalized /games/abzu route renders its proper profile. Artwork is labeled as artwork rather than gameplay.
- Existing purple/amber hues retained with modestly brighter background and panels. Temporary viewport overrides reset. Browser QA did not modify the user's personal library or collections.

Limits: illustrations and web fonts rely on external hosts. The 58 new records include individual editorial analyses and sourced official artwork, with gameplay images where available; they are not reports of direct playtesting. The existing local-only service labels remain visible.

## V6 verification — 27 September 2026
- Syntax check passed; 10/10 automated checks passed, including independent editorial content, 150 unique IDs/slugs, unique game paragraphs, sourced media, route rendering and persistent user data isolation.
- Live browser: all 150 artwork images for 50 new records loaded with naturalWidth > 0; no pending/broken image in the dedicated audit page.
- Tested regional filter: Asia returns9matching dossiers, reset restores150; country selector opens visibly.
- Tested duet1/duet2 changes, direct URL reload and Back; game pairs remain correct.
- Inspected desktop1850 and phone390/320: collection hub/detail, catalog, review1000xRESIST, newreviewAfterimage and featureA Short Hike. 320px header corrected; document clientWidth305 equals scrollWidth305 after correction.
- Live review Blue Prince: sidebar320px; body paragraph rgb(238,233,244); all three sourced artwork illustrations loaded.
- Source: each new record links to its official Steam product page. Direct Steam API connections unavailable; product pages reviewed with web tool and verified header URLs recorded in headers-v6.json. Illustrations labeled artwork; not presented as gameplay captures.
