const test = require('node:test');
const assert = require('node:assert/strict');

const { generateOutfitForScene } = require('../utils/generator');
const { buildPosterModel } = require('../utils/poster-model');

test('builds a poster model with stable text and asset slots', () => {
  const outfit = generateOutfitForScene('besties', 0.35);
  const poster = buildPosterModel(outfit);

  assert.equal(poster.sceneName, outfit.scene.name);
  assert.equal(poster.themeTitle, outfit.theme.title);
  assert.equal(poster.tags.length, 3);
  assert.equal(poster.decorations.length, 2);
  assert.ok(poster.layout.canvasWidth > 0);
  assert.ok(poster.layout.canvasHeight > 0);
});

test('poster model exposes a look summary ready for canvas drawing', () => {
  const outfit = generateOutfitForScene('cafe', 0.88);
  const poster = buildPosterModel(outfit);

  assert.ok(poster.lookSummary.route);
  assert.ok(poster.lookSummary.palette.primary);
  assert.ok(Array.isArray(poster.copyLines));
  assert.ok(poster.copyLines.length >= 2);
});
