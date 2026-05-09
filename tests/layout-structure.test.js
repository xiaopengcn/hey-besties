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

  assert.match(resultWxml, /<nav-bar[^>]*title="今日出门灵感"/);
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
