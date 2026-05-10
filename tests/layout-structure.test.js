const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('home page uses a horizontal scene carousel and a compact top title', () => {
  const homeWxml = readProjectFile('pages/home/home.wxml');
  const homeWxss = readProjectFile('pages/home/home.wxss');

  assert.match(homeWxml, /<nav-bar[^>]*title="今天是什么局"/);
  assert.doesNotMatch(homeWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(homeWxml, /<scroll-view[^>]*class="scene-carousel"[^>]*scroll-x="true"/);
  assert.match(homeWxml, /weather-status/);
  assert.match(homeWxml, /class="hero-bubbles"/);
  assert.match(homeWxml, /hero-bubble--one/);
  assert.match(homeWxml, /hero-bubble--two/);
  assert.match(homeWxml, /hero-bubble--three/);
  assert.doesNotMatch(homeWxml, /hero-bubble--four/);
  assert.match(homeWxss, /animation-direction:\s*alternate/);
  assert.match(homeWxss, /@keyframes bubbleOrbitOne/);
  assert.match(homeWxss, /@keyframes bubbleOrbitTwo/);
  assert.match(homeWxss, /@keyframes bubbleOrbitThree/);
  assert.match(homeWxss, /\.hero-bubble::before/);
  assert.doesNotMatch(homeWxss, /mix-blend-mode:\s*screen/);
  assert.match(homeWxss, /@keyframes sunDrift/);
});

test('result and poster pages rely on compact nav titles and floating tool actions', () => {
  const resultWxml = readProjectFile('pages/result/result.wxml');
  const posterWxml = readProjectFile('pages/poster/poster.wxml');

  assert.match(resultWxml, /今日出门灵感/);
  assert.match(resultWxml, /闺蜜舞台/);
  assert.doesNotMatch(resultWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(resultWxml, /class="doll-tools"/);
  assert.match(resultWxml, /class="tool-orb/);
  assert.match(resultWxml, /<image[^>]*class="tool-orb__icon-image"/);
  assert.match(resultWxml, /weather-chip|weather-summary/);

  assert.match(posterWxml, /<nav-bar[^>]*title="出门小海报"/);
  assert.doesNotMatch(posterWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(posterWxml, /class="poster-tools"/);
  assert.match(posterWxml, /class="tool-orb/);
  assert.match(posterWxml, /<image[^>]*class="tool-orb__icon-image"/);
});

test('visible product copy keeps a fresh editorial tone', () => {
  const visibleCopyFiles = [
    'pages/home/home.wxml',
    'pages/result/result.wxml',
    'pages/poster/poster.wxml',
    'pages/favorites/favorites.wxml',
    'components/bestie-stage/bestie-stage.wxml',
    'pages/home/home.js',
    'pages/poster/poster.js',
    'utils/generator.js',
    'utils/poster-model.js',
    'utils/share.js',
    'app.json',
    'data/scenes.js'
  ];
  const visibleCopy = visibleCopyFiles.map(readProjectFile).join('\n');

  assert.match(visibleCopy, /衣柜|上镜|出门|小灵感|漂亮营业/);
  assert.doesNotMatch(visibleCopy, /纸片人上身预览|分享图预览|生成今天的穿搭灵感|看看我喜欢的结果/);
  assert.doesNotMatch(visibleCopy, /海报生成失败|保存失败|天气获取失败|删除/);
});

test('bestie stage marks me explicitly and uses a left-side hand orb for borrow actions', () => {
  const stageWxml = readProjectFile('components/bestie-stage/bestie-stage.wxml');
  const stageWxss = readProjectFile('components/bestie-stage/bestie-stage.wxss');

  assert.match(stageWxml, /class="doll-me-tag"/);
  assert.match(stageWxml, /class="copy-orb-wrap"/);
  assert.match(stageWxml, /class="copy-orb[^"]*"/);
  assert.match(stageWxml, /icon-hand\.svg/);
  assert.doesNotMatch(stageWxml, /借我穿/);
  assert.match(stageWxss, /left:\s*36rpx/);
});

test('viral upgrade exposes mode rail, companion entry, and food route', () => {
  const appJson = readProjectFile('app.json');
  const homeWxml = readProjectFile('pages/home/home.wxml');
  const homeJs = readProjectFile('pages/home/home.js');

  assert.match(appJson, /pages\/food\/food/);
  assert.match(homeWxml, /class="mode-rail"/);
  assert.match(homeWxml + homeJs, /OOTD with x/);
  assert.match(homeWxml + homeJs, /携崽|携喵|携汪/);
  assert.match(homeWxml + homeJs, /今天吃什么/);
  assert.match(homeJs, /selectedMode/);
  assert.match(homeJs, /selectedCompanionMode/);
  assert.match(homeJs, /goFood/);
});

test('paper doll and result page render companion outfits when present', () => {
  const resultWxml = readProjectFile('pages/result/result.wxml');
  const resultJs = readProjectFile('pages/result/result.js');
  const paperWxml = readProjectFile('components/paper-doll/paper-doll.wxml');
  const paperWxss = readProjectFile('components/paper-doll/paper-doll.wxss');

  assert.match(resultJs, /options\.companion/);
  assert.match(resultJs, /companionMode/);
  assert.match(resultWxml, /companionSummary/);
  assert.match(resultWxml, /companion="\{\{outfit\.companion\}\}"/);
  assert.match(resultWxml, /companionOutfit="\{\{outfit\.companionOutfit\}\}"/);
  assert.match(paperWxml, /class="companion companion--\{\{companion\.type\}\}"/);
  assert.match(paperWxml, /companion-outfit/);
  assert.match(paperWxss, /\.companion--baby/);
  assert.match(paperWxss, /\.companion--cat/);
  assert.match(paperWxss, /\.companion--dog/);
});

test('food page has voting, random decision, and round advancement surfaces', () => {
  const foodWxml = readProjectFile('pages/food/food.wxml');
  const foodJs = readProjectFile('pages/food/food.js');
  const foodWxss = readProjectFile('pages/food/food.wxss');

  assert.match(foodWxml, /今天吃什么/);
  assert.match(foodWxml, /bindtap="onVoteTap"/);
  assert.match(foodWxml, /bindtap="onAdvanceTap"/);
  assert.match(foodWxml, /bindtap="onRandomTap"/);
  assert.match(foodJs, /createFoodSession/);
  assert.match(foodJs, /castVote/);
  assert.match(foodJs, /advanceRound/);
  assert.match(foodJs, /pickRandom/);
  assert.match(foodWxss, /\.food-option-card/);
});

test('food page uses 3-column grid and no hero winner card', () => {
  const foodWxml = readProjectFile('pages/food/food.wxml');
  const foodWxss = readProjectFile('pages/food/food.wxss');

  // Must use a 3-column grid, not 2 columns
  assert.match(foodWxss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);

  // Must NOT have a standalone winner hero card block
  assert.doesNotMatch(foodWxml, /food-winner/);
  assert.doesNotMatch(foodWxml, /hero-card/);

  // Must have a status line for random result
  assert.match(foodWxml, /status-line/);
  assert.match(foodWxss, /\.status-line/);

  // Must have highlighted/random/selected state classes on grid cards
  // Template uses dynamic class: food-option-card-- + highlightedIds[item.id]
  assert.match(foodWxml, /highlightedIds\[item\.id\]/);
  assert.match(foodWxml, /food-option-card--'/);
  assert.match(foodWxml, /food-option-card--rolling/);
  assert.match(foodWxss, /\.food-option-card--selected/);
  assert.match(foodWxss, /\.food-option-card--rolling/);
});

test('paper-doll companion has cat/dog structural hooks for triangle shapes', () => {
  const paperWxml = readProjectFile('components/paper-doll/paper-doll.wxml');
  const paperWxss = readProjectFile('components/paper-doll/paper-doll.wxss');

  // Cat should have ear and tail elements
  assert.match(paperWxml, /companion-ear/);
  assert.match(paperWxml, /companion-tail/);
  assert.match(paperWxml, /companion-bandana/);

  // CSS should define triangle-based cat/dog shapes
  assert.match(paperWxss, /\.companion--cat\s+\.companion-ear/);
  assert.match(paperWxss, /\.companion--dog\s+\.companion-ear/);

  // Border-based triangles used for ears
  assert.match(paperWxss, /border-left:\s*\d+rpx\s+solid\s+transparent/);
  assert.match(paperWxss, /border-right:\s*\d+rpx\s+solid\s+transparent/);

  // Dog-specific: bandana element styled differently
  assert.match(paperWxss, /\.companion--dog\s+\.companion-bandana/);

  // Ensure cat ear styling uses triangles
  assert.match(paperWxss, /\.companion--cat\s+\.companion-ear\s*\{/);
  assert.match(paperWxss, /\.companion--dog\s+\.companion-ear\s*\{/);
});
