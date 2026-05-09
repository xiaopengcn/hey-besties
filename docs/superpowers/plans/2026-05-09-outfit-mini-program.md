# Outfit Mini Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-version WeChat Mini Program that generates scenario-based outfit themes and renders a template-driven paper-doll preview.

**Architecture:** Use a native Mini Program app with a small shared design-token system, a reusable custom nav bar that accounts for the status bar and capsule, and local data-driven generation logic. Keep business logic in plain utility modules that can be tested with Node's built-in test runner before wiring them into pages.

**Tech Stack:** Native WeChat Mini Program (WXML/WXSS/JS), Node `node:test` for logic tests, local storage via `wx.setStorageSync`

---

## File Map

- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `project.config.json`
- Create: `sitemap.json`
- Create: `package.json`
- Create: `components/nav-bar/*`
- Create: `components/paper-doll/*`
- Create: `pages/home/*`
- Create: `pages/result/*`
- Create: `pages/favorites/*`
- Create: `pages/poster/*`
- Create: `utils/system.js`
- Create: `utils/generator.js`
- Create: `utils/storage.js`
- Create: `utils/share.js`
- Create: `data/scenes.js`
- Create: `data/wardrobe.js`
- Create: `tests/generator.test.js`

### Task 1: Project scaffold and shared visual system

**Files:**
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `project.config.json`
- Create: `sitemap.json`

- [ ] Step 1: Define app pages and shared component registration
- [ ] Step 2: Add global CSS tokens for color, spacing, radius, shadow, depth, and safe-area values
- [ ] Step 3: Add shared page-shell and button styles tuned for a young, energetic look
- [ ] Step 4: Add app bootstrap logic for system metrics

### Task 2: Test-first outfit generation logic

**Files:**
- Create: `package.json`
- Create: `tests/generator.test.js`
- Create: `data/scenes.js`
- Create: `data/wardrobe.js`
- Create: `utils/generator.js`

- [ ] Step 1: Write failing tests for scenario-aware theme generation
- [ ] Step 2: Run `node --test tests/generator.test.js` and confirm failure
- [ ] Step 3: Implement minimal scene data and wardrobe rules
- [ ] Step 4: Implement generator helpers until tests pass
- [ ] Step 5: Re-run `node --test tests/generator.test.js`

### Task 3: Status-bar-safe custom navigation

**Files:**
- Create: `utils/system.js`
- Create: `components/nav-bar/nav-bar.js`
- Create: `components/nav-bar/nav-bar.json`
- Create: `components/nav-bar/nav-bar.wxml`
- Create: `components/nav-bar/nav-bar.wxss`

- [ ] Step 1: Normalize system info and menu capsule metrics
- [ ] Step 2: Expose nav height and status-bar height through app global data
- [ ] Step 3: Build reusable custom nav bar component
- [ ] Step 4: Verify pages can reserve top space consistently

### Task 4: Paper-doll renderer

**Files:**
- Create: `components/paper-doll/paper-doll.js`
- Create: `components/paper-doll/paper-doll.json`
- Create: `components/paper-doll/paper-doll.wxml`
- Create: `components/paper-doll/paper-doll.wxss`

- [ ] Step 1: Render a fixed body with layered garment slots
- [ ] Step 2: Map generated outfit data into top, bottom, dress, outerwear, and accessory slots
- [ ] Step 3: Express color and material through class names and CSS variables
- [ ] Step 4: Add subtle motion and staging

### Task 5: Core pages and user flow

**Files:**
- Create: `pages/home/*`
- Create: `pages/result/*`
- Create: `pages/favorites/*`
- Create: `pages/poster/*`

- [ ] Step 1: Build the home page with hero, scenario chips, and CTA
- [ ] Step 2: Build the result page and connect it to the generator
- [ ] Step 3: Build the favorites page with local storage persistence
- [ ] Step 4: Build the poster page for a share-friendly preview
- [ ] Step 5: Add share text and cross-page data handoff

### Task 6: Verification

**Files:**
- Verify: `tests/generator.test.js`
- Verify: app structure under project root

- [ ] Step 1: Run `node --test tests/generator.test.js`
- [ ] Step 2: Sanity-check expected Mini Program files exist
- [ ] Step 3: Review page wiring for obvious broken imports or route names
