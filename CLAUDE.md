# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A WeChat Mini Program (微信小程序) that generates outfit inspiration for young women. Users pick a scene (date, besties outing, exhibition, cafe), and the app produces a themed outfit with a paper-doll visualization. Native WXML/WXSS/JS — no third-party framework.

## Commands

```bash
npm test              # Run all tests (Node.js test runner)
npm test -- --test-name-pattern="date"  # Run tests matching a pattern
```

Tests run under Node.js via `node --test`. They exercise the generator and poster model logic directly — no WeChat runtime needed. WeChat-specific modules (`wx.*`) are guarded with `typeof wx === 'undefined'` checks throughout, which is what makes unit testing possible outside the mini-program runtime.

## Architecture

**Page flow**: `pages/home` → `pages/result` → `pages/poster`, with `pages/favorites` as a side entry.

- **home** — Scene selection cards + weather context fetch. User picks a scene, taps generate.
- **result** — Displays the generated outfit (theme, 3 element tags, paper-doll layers). Supports reroll, favorite toggle, and navigate to poster.
- **poster** — Canvas-based shareable poster rendering. Renders the paper-doll + text onto a 750×1334 canvas, exports to temp file, saves to photo album.
- **favorites** — Local-storage-backed list of saved outfits, with tap-to-view and swipe-to-remove.

**Core generation pipeline** (`utils/generator.js`):
1. Pick a scene → select theme, color, material, accent from scene pools (deterministic via seed)
2. Resolve weather bias — hot/cold/rain adjust material pools, route preference, outerwear chance, and bottom preferences
3. Build look: choose route (dress vs separates), assemble garment layers, optionally add outerwear
4. Return a full outfit object with palette, texture metadata, and weather summary

**Data model** (`data/`):
- `scenes.js` — 4 scenes, each with theme/color/material/accent pools, silhouettes, preferred routes
- `wardrobe.js` — Garment catalog (tops, bottoms, dresses, outerwear, accessories) + color palettes + material→CSS class/texture mappings

**Key utils**:
- `utils/weather.js` — Weather context lifecycle: cache (30min TTL), fetch via cloud function, permission handling. Called from home page, consumed by generator.
- `utils/storage.js` — Favorite outfits persisted via `wx.setStorageSync`, capped at 30 items.
- `utils/system.js` — Computes nav bar / status bar / capsule metrics from `wx.getWindowInfo()` + `wx.getMenuButtonBoundingClientRect()`.
- `utils/poster-model.js` — Builds the data model for poster rendering (layout, decorations, copy lines).
- `utils/poster-renderer.js` — Canvas 2D rendering pipeline: gradient background, decorations, rounded-rect cards, paper-doll shapes, text layout.

**Cloud function**: `cloudfunctions/getWeather` — Calls QWeather API (geo lookup + current weather) via Node.js `https`. Requires `QWEATHER_API_KEY` and `QWEATHER_API_HOST` env vars. Returns city/district name, temperature, feels-like, condition text/code.

**Components**:
- `components/nav-bar` — Custom navigation bar (since `navigationStyle: "custom"` is set).
- `components/paper-doll` — The paper-doll visualization that renders outfit layers.

**CSS design system** (`app.wxss`): CSS custom properties define the full design token set — colors (primary coral/pink, secondary warm tones, mint/sky/lilac accents), gradients, shadows, radii, spacing scale. Utility classes for glass cards, hero cards, pill chips, buttons, tags, and orb tools.

**Key constraint**: Code runs both in WeChat runtime and Node.js for tests. Always guard `wx.*` calls with `typeof wx === 'undefined'` checks. The generator is pure JS with no runtime dependencies — `Math.random()` is the only side effect.

## Voice & Tone

All user-facing copy must follow a consistent editorial voice:

- **小清新 / 甜而不腻** — Light, fresh, sweet but never cloying. Think "桃子汽水" not "糖浆".
- **暖** — Warm and intimate, like a close friend texting you. Use gentle, affectionate phrasing.
- **短** — Every sentence earns its place. If it can be said in 4 characters, don't use 12. Remove filler like "可以", "一下", "啦" unless they carry emotional weight.
- **有画面感** — Prefer concrete, sensory words (奶油、薄荷、软糯、轻快) over abstract ones (优质、完美、极佳).
- **不端不装** — Never formal, never stiff. No "请", no marketing-speak, no "您的".

### Copy patterns to follow

| Category | Do | Don't |
|---|---|---|
| Buttons | `抽一套` `心动衣架` `换一套` | `生成今日穿搭推荐` `查看我的收藏` |
| Page titles | `今天是什么局` `心动衣架` | `场景选择` `收藏列表` |
| Lead copy | `挑一个局，颜色和小心机自己冒出来` | `请选择您喜欢的出行场景` |
| Empty states | `衣架还空着` `遇见心动的，就把它挂在这里` | `暂无收藏数据` |
| Weather | `偷看窗外...` `定位害羞了` `小纸条走丢了` | `天气数据获取中` `定位权限被拒绝` `获取失败` |
| Toast | `收好了` `取下了` `生成好啦` | `已收藏` `已取消收藏` `生成成功` |
| Scene intros | `逛街、打卡、拍照都刚好，给镜头一点元气` | `适合逛街、打卡、拍照等多种场景` |
| Error/hint | `再试一次` | `操作失败，请重试` |

### How to apply

When writing any user-facing string — page copy, button labels, toast messages, weather notes, scene descriptions, share text — ask:

1. Does it sound like a bestie talking? If not, soften it.
2. Can it be shorter without losing warmth? If so, cut.
3. Would a 22-year-old girl smile reading it? If not, rewrite.

The test `visible product copy keeps a fresh editorial tone` in `tests/layout-structure.test.js` enforces part of this — it rejects harsh negative language (失败, 删除, 获取失败) in visible copy.
