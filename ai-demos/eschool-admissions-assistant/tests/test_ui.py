"""End-to-end browser checks for the static demo, using inlined assets.

This avoids depending on a local network server in restricted browser sandboxes.
Requires playwright and a locally installed Chromium executable.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
ASSETS = ROOT / 'assets'


def build_inline():
    html = (WEB / 'demo.html').read_text(encoding='utf-8')
    html = re.sub(r'<link rel="stylesheet" href="styles\.css\?v=\d+">', lambda _: '<style>' + (WEB / 'styles.css').read_text(encoding='utf-8') + '</style>', html)
    html = re.sub(r'<script src="app\.js\?v=\d+" defer></script>', lambda _: '<script>' + (WEB / 'app.js').read_text(encoding='utf-8') + '</script>', html)
    return html


def test():
    ASSETS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width':1440, 'height':1000}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(build_inline(), wait_until='load')
        assert page.locator('.school-card').count() == 8
        page.screenshot(path=str(ASSETS/'eSchool desktop preview.png'), full_page=True)

        # Query should only return verified schools within budget.
        page.locator('.example-pill').first.click()
        assert page.locator('.school-card').count() == 2, page.locator('#results-count').inner_text()
        names = page.locator('.card-heading h3').all_inner_texts()
        assert set(names) == {'Acacia Springs Academy', 'Tendo Valley Primary'}, names

        # Saved and comparison actions operate on real results.
        first = page.locator('.school-card').first
        first.locator('[data-action="save"]').click()
        assert page.locator('#saved-count').inner_text() == '1'
        first.locator('[data-action="compare"]').click()
        assert page.locator('#compare-count').inner_text() == '1'
        page.locator('.school-card').nth(1).locator('[data-action="compare"]').click()
        page.locator('#open-compare').click()
        assert 'Compare schools (2)' in page.locator('#modal-title').inner_text()
        assert page.locator('.compare-table').count() == 1
        page.locator('#close-modal').click()

        # Details and application guide work, but never submit data.
        page.locator('.school-card').first.locator('[data-action="details"]').click()
        assert 'Acacia Springs Academy' == page.locator('#modal-title').inner_text()
        page.get_by_role('button', name='View application steps').click()
        assert 'Application guide' in page.locator('#modal-title').inner_text()
        page.get_by_role('button', name='Preview application checklist').click()
        assert 'no application has been submitted' in page.locator('.draft-complete').inner_text()
        page.locator('#close-modal').click()

        # Missing fee and deadline must remain explicitly missing.
        page.locator('#clear-filters').click()
        page.locator('.example-pill').nth(2).click()
        assert page.locator('.school-card').count() == 1
        assert 'Ask the school' in page.locator('.school-card .card-stats').inner_text()
        page.locator('#guide-question').fill('How much does Little River Learning House cost?')
        page.locator('#guide-form button').click()
        assert 'not been provided' in page.locator('.guide-bubble.assistant').last.inner_text()

        # No matches and reset should be recoverable.
        page.locator('#filter-budget').select_option('2000000')
        assert page.locator('#empty-state').is_visible()
        page.locator('#reset-empty').click()
        assert page.locator('.school-card').count() == 8
        assert errors == [], errors

        # Layout stays within viewport at key mobile widths.
        for w in [320,390,768]:
            phone = browser.new_page(viewport={'width':w,'height':844}, device_scale_factor=1)
            phone.set_content(build_inline(),wait_until='load')
            assert phone.locator('.school-card').count() == 8
            assert phone.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), w
            if w == 390:
                phone.screenshot(path=str(ASSETS/'eSchool mobile preview.png'),full_page=True)
            phone.close()
        browser.close()
        print('PASS: 8 records, search, shortlist, compare, details, application checklist, missing data, recovery, guide and responsive widths')


if __name__ == '__main__':
    test()