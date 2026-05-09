const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('home page uses a horizontal scene carousel and a compact top title', () => {
  const homeWxml = readProjectFile('pages/home/home.wxml');

  assert.match(homeWxml, /<nav-bar[^>]*title="今天是什么局"/);
  assert.doesNotMatch(homeWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(homeWxml, /<scroll-view[^>]*class="scene-carousel"[^>]*scroll-x="true"/);
});

test('result and poster pages rely on compact nav titles and floating tool actions', () => {
  const resultWxml = readProjectFile('pages/result/result.wxml');
  const posterWxml = readProjectFile('pages/poster/poster.wxml');

  assert.match(resultWxml, /<nav-bar[^>]*title="今日穿搭灵感"/);
  assert.doesNotMatch(resultWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(resultWxml, /class="doll-tools"/);

  assert.match(posterWxml, /<nav-bar[^>]*title="分享图预览"/);
  assert.doesNotMatch(posterWxml, /<nav-bar[^>]*subtitle=/);
  assert.match(posterWxml, /class="poster-tools"/);
});
