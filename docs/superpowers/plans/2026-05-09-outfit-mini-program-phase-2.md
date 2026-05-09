# Outfit Mini Program Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real poster export, richer wardrobe templates, and higher-fidelity textures/assets to the outfit mini program.

**Architecture:** Keep the existing native Mini Program shell, but split phase-2 work into three focused units: poster modeling/rendering, richer outfit generation data, and reusable texture/decor asset wiring. Business rules remain testable in plain Node modules, while Mini Program canvas work stays behind a dedicated renderer utility.

**Tech Stack:** Native WeChat Mini Program (WXML/WXSS/JS), canvas APIs, Node `node:test`, built-in `image_gen` for project bitmap assets

---

## File Map

- Modify: `package.json`
- Modify: `tests/generator.test.js`
- Create: `tests/poster-model.test.js`
- Modify: `data/scenes.js`
- Modify: `data/wardrobe.js`
- Modify: `utils/generator.js`
- Create: `utils/poster-model.js`
- Create: `utils/poster-renderer.js`
- Modify: `pages/result/*`
- Modify: `pages/poster/*`
- Modify: `components/paper-doll/*`
- Create: `assets/poster/*`
- Create: `assets/textures/*`

### Task 1: Expand data and generation rules

**Files:**
- Modify: `data/scenes.js`
- Modify: `data/wardrobe.js`
- Modify: `utils/generator.js`
- Test: `tests/generator.test.js`

- [ ] **Step 1: Write failing tests for richer look generation**
- [ ] **Step 2: Run `node --test tests/generator.test.js tests/poster-model.test.js` and verify the generator assertions fail**
- [ ] **Step 3: Expand wardrobe data into palette, texture, optional outerwear, and richer accessories**
- [ ] **Step 4: Implement minimal generator changes to satisfy the new rules**
- [ ] **Step 5: Re-run the targeted tests**

### Task 2: Poster model and export pipeline

**Files:**
- Create: `utils/poster-model.js`
- Create: `utils/poster-renderer.js`
- Create: `tests/poster-model.test.js`
- Modify: `pages/poster/poster.js`
- Modify: `pages/poster/poster.wxml`
- Modify: `pages/poster/poster.wxss`

- [ ] **Step 1: Write failing tests for poster model shaping**
- [ ] **Step 2: Run `node --test tests/poster-model.test.js` and verify failure**
- [ ] **Step 3: Implement a minimal poster model builder**
- [ ] **Step 4: Implement canvas rendering and save-to-album flow in the Mini Program layer**
- [ ] **Step 5: Re-run the targeted tests**

### Task 3: Paper-doll visual fidelity upgrade

**Files:**
- Modify: `components/paper-doll/paper-doll.wxml`
- Modify: `components/paper-doll/paper-doll.wxss`

- [ ] **Step 1: Add support for outerwear and richer accessory presentation**
- [ ] **Step 2: Add palette-based shading classes and texture overlay hooks**
- [ ] **Step 3: Use asset-backed decoration layers where code-only shapes are insufficient**
- [ ] **Step 4: Re-check that dress and separates routes still layer correctly**

### Task 4: Result-page integration

**Files:**
- Modify: `pages/result/result.js`
- Modify: `pages/result/result.wxml`
- Modify: `pages/result/result.wxss`

- [ ] **Step 1: Surface richer outfit explanation and optional outerwear in the result UI**
- [ ] **Step 2: Pass the upgraded outfit model into poster generation**
- [ ] **Step 3: Preserve favorites/share flows**

### Task 5: Asset generation and wiring

**Files:**
- Create: `assets/poster/*`
- Create: `assets/textures/*`
- Modify: `utils/poster-model.js`
- Modify: `components/paper-doll/paper-doll.wxss`

- [ ] **Step 1: Generate sticker/decor bitmap assets with `image_gen`**
- [ ] **Step 2: Move final selected assets into the workspace**
- [ ] **Step 3: Wire poster assets into poster rendering and page preview**
- [ ] **Step 4: Wire texture assets into the paper-doll visual system where useful**

### Task 6: Verification

**Files:**
- Verify: `tests/generator.test.js`
- Verify: `tests/poster-model.test.js`
- Verify: updated page/component files

- [ ] **Step 1: Run `node --test tests/generator.test.js tests/poster-model.test.js`**
- [ ] **Step 2: Sanity-check that all new modules resolve**
- [ ] **Step 3: Review export flow and Mini Program bindings for obvious runtime issues**
