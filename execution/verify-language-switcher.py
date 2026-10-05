#!/usr/bin/env python3
"""
Browser verification for the header language switcher (`LanguageSwitcher` in
`app/src/components/layout/Header.tsx`).

WHY THIS EXISTS
    Three of the switcher's behaviours cannot be verified without a real
    browser, and none of them are covered by `npm run verify`:

      1. Menu alignment. The `align` prop picks a logical edge (`start-0` vs
         `end-0`) per tree. Getting it wrong hangs the menu off the viewport in
         one direction only — it was measured at 66px of a 128px menu clipped on
         `/ar` at 390px wide. Only layout catches this, so this script asserts on
         bounding boxes rather than on class names.

      2. The keyboard model. `handleListKeyDown` implements the ARIA APG
         select-only combobox: roving `aria-activedescendant`, Home/End,
         Escape, Tab.

      3. The focus return after a locale switch. Switching locale changes the
         `[locale]` route segment, so the header remounts and the focused
         trigger is destroyed; `claimFocusAfterSwitch` hands focus to the newly
         mounted trigger. A keyboard user who switches language would otherwise
         land on `<body>` and have to Tab from the top of the document.

    A jsdom unit test would be worse than nothing here: jsdom implements no
    layout, so `offsetParent` is always `null` and `getBoundingClientRect`
    returns zeroes. A test would assert the opposite of production behaviour on
    (1) and (3). Hence a committed manual script — this is the right form of
    coverage for this component, not a fallback.

    Re-run it after touching `select()`, `closeList()`, `handleListKeyDown`, the
    `align` prop, or the `LOCALES` list.

HOW TO RUN
    1. Start the dev server:   cd app && npm run dev
    2. READ THE PORT FROM ITS STARTUP OUTPUT. Do not assume 3000 — port 3000 is
       often already taken by another checkout, and Next.js silently falls
       through to 3001, 3002, ...  Look for the line:
           - Local:        http://localhost:3001
    3. Run against that port:
           python3 execution/verify-language-switcher.py http://localhost:3001
       or:  BASE_URL=http://localhost:3001 python3 execution/verify-language-switcher.py

    Exits 0 and prints `ALL CHECKS PASSED`, or exits 1 naming the first failure.

WHY PYTHON IN AN OTHERWISE .mjs DIRECTORY
    Playwright is installed here as the Python package (`/usr/local/bin/playwright`);
    the repo has no node `playwright` dependency and this script is not worth
    adding one for. If a node Playwright ever lands in `app/`, port this to
    `.mjs` and delete this file.
    Install, if missing:  pip3 install playwright && playwright install chromium

The routes used are public — no sign-in, no database writes, nothing mutated.
"""

import os
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit(
        "playwright is not installed for this interpreter.\n"
        "  pip3 install playwright && playwright install chromium"
    )

BASE = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BASE_URL", "")).rstrip("/")
if not BASE:
    sys.exit(
        "Pass the dev server's base URL — read the port from `npm run dev` output,\n"
        "do not assume 3000.\n"
        "  python3 execution/verify-language-switcher.py http://localhost:3001"
    )

# A sub-path, so every switch also proves the path survives the locale change.
PATH = "/spreads"
DESKTOP = {"width": 1280, "height": 900}
MOBILE = {"width": 390, "height": 844}
MOBILE_NAV = r"header nav.md\:hidden"

# Kept in step with LOCALE_LABELS in app/src/i18n/locales.ts.
LABELS = {"en": "English", "fa": "فارسی", "ar": "العربية"}
# localePrefix is 'as-needed', so English is unprefixed.
URLS = {"en": PATH, "fa": "/fa" + PATH, "ar": "/ar" + PATH}

failures = []


def check(ok, what, detail=""):
    print(("  PASS  " if ok else "  FAIL  ") + what + (f"   [{detail}]" if detail else ""))
    if not ok:
        failures.append(what)


def active(page):
    """The focused element, described well enough to assert on."""
    return page.evaluate(
        """() => {
          const e = document.activeElement;
          return {
            tag: e.tagName,
            role: e.getAttribute ? e.getAttribute('role') : null,
            isTrigger: !!(e.getAttribute && e.getAttribute('role') === 'combobox'),
            isBody: e === document.body,
            text: (e.textContent || '').trim().slice(0, 24),
          };
        }"""
    )


def desktop_trigger(page):
    return page.locator('header nav [role="combobox"]').first


def open_desktop(page):
    t = desktop_trigger(page)
    t.click()
    page.locator('header [role="listbox"]').first.wait_for(state="visible")
    return t


def run(page):
    # ── 1. Every locale is offered, in its own script, correctly marked ──────
    print("\n1. The three locales, each in its own script")
    for loc in ("ar", "fa", "en"):
        page.goto(BASE + URLS[loc], wait_until="networkidle")
        t = desktop_trigger(page)
        check(t.inner_text().strip() == LABELS[loc], f"/{loc}: trigger shows {LABELS[loc]}",
              t.inner_text().strip())
        check(t.get_attribute("aria-expanded") == "false", f"/{loc}: aria-expanded false when closed")
        open_desktop(page)
        check(t.get_attribute("aria-expanded") == "true", f"/{loc}: aria-expanded true when open")
        opts = page.locator('header [role="listbox"] [role="option"]')
        got = [opts.nth(i).inner_text().strip() for i in range(opts.count())]
        check(got == [LABELS[c] for c in ("en", "fa", "ar")], f"/{loc}: all three options, in LOCALES order",
              " / ".join(got))
        selected = [
            opts.nth(i).get_attribute("aria-selected") == "true" for i in range(opts.count())
        ]
        check(selected == [c == loc for c in ("en", "fa", "ar")],
              f"/{loc}: aria-selected marks exactly the current locale", str(selected))
        page.keyboard.press("Escape")

    # ── 2. Alignment: the menu stays on screen in both trees, all locales ────
    # This is what `align` is for. A physical property, or one logical edge used
    # for both trees, clips the menu in one direction.
    print("\n2. Alignment — the menu never leaves the viewport")
    for viewport, name, nav in ((DESKTOP, "desktop", "header nav"), (MOBILE, "mobile", MOBILE_NAV)):
        page.set_viewport_size(viewport)
        for loc in ("ar", "fa", "en"):
            page.goto(BASE + URLS[loc], wait_until="networkidle")
            if name == "mobile":
                page.locator('header button[aria-label="Toggle menu"]').click()
            trig = page.locator(f'{nav} [role="combobox"]').first
            trig.wait_for(state="visible")
            trig.click()
            lb = page.locator(f'{nav} [role="listbox"]').first
            lb.wait_for(state="visible")
            box = lb.bounding_box()
            inside = box["x"] >= 0 and box["x"] + box["width"] <= viewport["width"]
            check(inside, f"{name} /{loc}: menu within the {viewport['width']}px viewport",
                  f"x={box['x']:.0f} w={box['width']:.0f}")
            noscroll = page.evaluate("() => document.body.scrollWidth <= document.body.clientWidth")
            check(noscroll, f"{name} /{loc}: no horizontal page overflow")

    # ── 3. The keyboard model ───────────────────────────────────────────────
    print("\n3. Keyboard — APG select-only combobox")
    page.set_viewport_size(DESKTOP)
    page.goto(BASE + URLS["ar"], wait_until="networkidle")
    t = desktop_trigger(page)
    t.focus()
    page.keyboard.press("Enter")
    lb = page.locator('header [role="listbox"]').first
    lb.wait_for(state="visible")
    check(active(page)["role"] == "listbox", "focus moves to the listbox on open")
    check(lb.get_attribute("aria-activedescendant").endswith("-option-ar"),
          "aria-activedescendant starts on the current locale",
          lb.get_attribute("aria-activedescendant"))
    check(active(page)["role"] == "listbox",
          "aria-activedescendant sits on the element that holds DOM focus")
    page.keyboard.press("ArrowUp")
    check(lb.get_attribute("aria-activedescendant").endswith("-option-fa"), "ArrowUp moves the active option")
    page.keyboard.press("Home")
    check(lb.get_attribute("aria-activedescendant").endswith("-option-en"), "Home jumps to the first option")
    page.keyboard.press("End")
    check(lb.get_attribute("aria-activedescendant").endswith("-option-ar"), "End jumps to the last option")
    page.keyboard.press("ArrowDown")
    check(lb.get_attribute("aria-activedescendant").endswith("-option-ar"),
          "ArrowDown clamps at the last option (no wrap)")
    page.keyboard.press("Escape")
    check(page.locator('header [role="listbox"]').count() == 0, "Escape closes the listbox")
    check(active(page)["isTrigger"], "Escape returns focus to the trigger", str(active(page)))
    page.keyboard.press("Enter")
    page.locator('header [role="listbox"]').first.wait_for(state="visible")
    page.keyboard.press("Tab")
    check(page.locator('header [role="listbox"]').count() == 0, "Tab closes the listbox")
    check(not active(page)["isBody"], "Tab continues the tab order rather than dropping to body",
          str(active(page)))

    # Dismissal
    t = open_desktop(page)
    t.click()
    check(page.locator('header [role="listbox"]').count() == 0, "trigger click closes the listbox")
    check(active(page)["isTrigger"], "trigger click-to-close leaves focus on the trigger (Safari)",
          str(active(page)))
    open_desktop(page)
    page.mouse.click(640, 700)
    check(page.locator('header [role="listbox"]').count() == 0, "outside click closes the listbox")

    # ── 4. Switching: all three locales, path preserved, focus returned ──────
    # The focus assertion is the regression this script exists for: before
    # `claimFocusAfterSwitch`, activeElement here was `<body>`.
    print("\n4. Switching — path preserved and focus returned")
    hops = [("ar", "fa"), ("fa", "en"), ("en", "ar")]
    for frm, to in hops:
        page.goto(BASE + URLS[frm], wait_until="networkidle")
        t = desktop_trigger(page)
        t.focus()
        page.keyboard.press("Enter")  # keyboard only — no mouse anywhere in this hop
        page.locator('header [role="listbox"]').first.wait_for(state="visible")
        page.keyboard.press("Home")
        for _ in range(("en", "fa", "ar").index(to)):
            page.keyboard.press("ArrowDown")
        page.keyboard.press("Enter")
        page.wait_for_url(BASE + URLS[to], timeout=15000)
        page.wait_for_timeout(1200)  # let the remount settle before reading focus
        check(page.url == BASE + URLS[to], f"{frm} -> {to} keeps the {PATH} sub-path", page.url)
        a = active(page)
        check(a["isTrigger"] and not a["isBody"],
              f"{frm} -> {to}: focus returns to the remounted trigger", str(a))
        check(desktop_trigger(page).inner_text().strip() == LABELS[to],
              f"{frm} -> {to}: trigger now reads {LABELS[to]}")
        page.keyboard.press("Tab")
        check(not active(page)["isBody"],
              f"{frm} -> {to}: next Tab continues from the header, not the document top",
              str(active(page)))

    # Selecting the current locale is a no-op that still closes and refocuses.
    page.goto(BASE + URLS["ar"], wait_until="networkidle")
    open_desktop(page)
    page.locator('header [role="listbox"] [role="option"]', has_text=LABELS["ar"]).first.click()
    page.wait_for_timeout(600)
    check(page.url == BASE + URLS["ar"], "selecting the current locale does not navigate", page.url)
    check(page.locator('header [role="listbox"]').count() == 0, "selecting the current locale closes the menu")
    check(active(page)["isTrigger"], "selecting the current locale refocuses the trigger")

    # ── 5. The mobile tree is a second, separate switcher ───────────────────
    print("\n5. The mobile tree switches too")
    page.set_viewport_size(MOBILE)
    page.goto(BASE + URLS["ar"], wait_until="networkidle")
    page.locator('header button[aria-label="Toggle menu"]').click()
    page.locator(f'{MOBILE_NAV} [role="combobox"]').first.click()
    page.locator(f'{MOBILE_NAV} [role="listbox"]').first.wait_for(state="visible")
    page.locator(f'{MOBILE_NAV} [role="listbox"] [role="option"]', has_text=LABELS["fa"]).first.click()
    page.wait_for_url(BASE + URLS["fa"], timeout=15000)
    check(page.url == BASE + URLS["fa"], "mobile ar -> fa keeps the sub-path", page.url)
    check(page.locator(MOBILE_NAV).count() == 0, "mobile switch also closes the hamburger menu")

    # ── 6. Accessible naming ────────────────────────────────────────────────
    print("\n6. Accessible name — field label plus current value")
    page.set_viewport_size(DESKTOP)
    page.goto(BASE + URLS["ar"], wait_until="networkidle")
    name = page.evaluate(
        """() => {
          const e = document.querySelector('header nav [role="combobox"]');
          return e.getAttribute('aria-labelledby').split(' ')
                  .map(i => (document.getElementById(i) || {}).textContent || '')
                  .join(' ').trim();
        }"""
    )
    check(LABELS["ar"] in name and len(name) > len(LABELS["ar"]),
          "trigger is named by its sr-only label plus the current locale", name)


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    pg = browser.new_page(viewport=DESKTOP)
    try:
        pg.goto(BASE + PATH, wait_until="networkidle", timeout=20000)
    except Exception as exc:
        browser.close()
        sys.exit(
            f"could not reach {BASE}{PATH}: {exc}\n"
            "Is the dev server running, and is this the port it actually bound?\n"
            "Read the `- Local:` line from `npm run dev` output."
        )
    if pg.locator('header nav [role="combobox"]').count() == 0:
        browser.close()
        sys.exit(
            f"no language switcher found at {BASE}{PATH}.\n"
            "This is usually the wrong port — another checkout without this\n"
            "component may be serving 3000. Check `npm run dev` output."
        )
    try:
        run(pg)
    finally:
        browser.close()

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED:")
    for f in failures:
        print("  - " + f)
    sys.exit(1)
print("ALL CHECKS PASSED")
