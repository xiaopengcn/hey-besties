const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateOutfitForScene,
  createPosterPayload
} = require('../utils/generator');

const hotWeather = {
  status: 'ready',
  cityName: '上海',
  districtName: '静安',
  temperature: 31,
  feelsLike: 34,
  conditionCode: '100',
  conditionText: '晴',
  isRaining: false,
  isHot: true,
  isCold: false,
  fetchedAt: 1710000000000
};

const coldRainWeather = {
  status: 'ready',
  cityName: '杭州',
  districtName: '西湖',
  temperature: 9,
  feelsLike: 6,
  conditionCode: '305',
  conditionText: '小雨',
  isRaining: true,
  isHot: false,
  isCold: true,
  fetchedAt: 1710000000000
};

test('generates a date outfit with the requested scene and exactly three elements', () => {
  const outfit = generateOutfitForScene('date', 0);

  assert.equal(outfit.scene.id, 'date');
  assert.equal(outfit.elements.length, 3);
  assert.match(outfit.theme.title, /约会|甜|心动|奶油/);
});

test('generates a friends outing outfit that uses a valid dress route when configured', () => {
  const outfit = generateOutfitForScene('besties', 0.4);

  assert.equal(outfit.scene.id, 'besties');
  assert.ok(['dress', 'separates'].includes(outfit.look.route));

  if (outfit.look.route === 'dress') {
    assert.ok(outfit.look.layers.dress);
    assert.equal(outfit.look.layers.top, null);
    assert.equal(outfit.look.layers.bottom, null);
  }
});

test('creates a separates look without adding a dress layer', () => {
  const outfit = generateOutfitForScene('exhibition', 0.95);

  assert.equal(outfit.look.route, 'separates');
  assert.ok(outfit.look.layers.top);
  assert.ok(outfit.look.layers.bottom);
  assert.equal(outfit.look.layers.dress, null);
});

test('poster payload condenses result data for sharing', () => {
  const outfit = generateOutfitForScene('cafe', 0.2);
  const poster = createPosterPayload(outfit);

  assert.equal(poster.sceneName, outfit.scene.name);
  assert.equal(poster.themeTitle, outfit.theme.title);
  assert.equal(poster.tags.length, 3);
});

test('expanded outfit payload includes a palette and texture metadata for garments', () => {
  const outfit = generateOutfitForScene('date', 0.12);

  assert.ok(outfit.palette);
  assert.match(outfit.palette.primary, /^#/);
  assert.ok(outfit.look.layers.accessory);

  const garment = outfit.look.layers.dress || outfit.look.layers.top;
  assert.ok(garment.textureKey);
  assert.ok(garment.paletteClass);
});

test('some scenes can add an optional outerwear layer without breaking dress routing', () => {
  const outfit = generateOutfitForScene('exhibition', 0.61);

  assert.ok(Object.hasOwn(outfit.look.layers, 'outerwear'));

  if (outfit.look.layers.dress) {
    assert.equal(outfit.look.layers.top, null);
    assert.equal(outfit.look.layers.bottom, null);
  }
});

test('hot weather keeps scene logic but biases toward lighter looks and no forced outerwear', () => {
  const outfit = generateOutfitForScene('besties', 0.4, hotWeather);

  assert.deepEqual(outfit.weather, hotWeather);
  assert.match(outfit.weatherSummary, /31|晴|轻薄|透气/);

  const mainGarment = outfit.look.layers.dress || outfit.look.layers.top;
  assert.ok(['棉感', '雪纺感'].includes(mainGarment.material));
  assert.equal(outfit.look.layers.outerwear, null);
});

test('cold rainy weather adds weather-aware messaging and supports outerwear-friendly styling', () => {
  const outfit = generateOutfitForScene('exhibition', 0.95, coldRainWeather);

  assert.deepEqual(outfit.weather, coldRainWeather);
  assert.match(outfit.weatherSummary, /小雨|9|利落|外搭/);
  assert.equal(outfit.look.route, 'separates');
  assert.ok(['长裤', '长裙', '阔腿西裤'].includes(outfit.look.layers.bottom.name));
});
