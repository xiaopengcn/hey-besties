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

test('poster model includes weather copy when the outfit is weather-aware', () => {
  const outfit = generateOutfitForScene('date', 0.12, {
    status: 'ready',
    cityName: '上海',
    districtName: '徐汇',
    temperature: 22,
    feelsLike: 23,
    conditionCode: '101',
    conditionText: '多云',
    isRaining: false,
    isHot: false,
    isCold: false,
    fetchedAt: 1710000000000
  });
  const poster = buildPosterModel(outfit);

  assert.ok(poster.copyLines.some((line) => /上海|22|多云/.test(line)));
});
