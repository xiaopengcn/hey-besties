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

test('generator is backwards-compatible when called without companionMode', () => {
  const outfit = generateOutfitForScene('date', 0.2);

  assert.equal(outfit.scene.id, 'date');
  assert.equal(outfit.elements.length, 3);
  assert.ok(outfit.look);
  assert.equal(outfit.companionMode, undefined);
  assert.equal(outfit.companion, undefined);
  assert.equal(outfit.companionOutfit, undefined);
  assert.equal(outfit.companionSummary, undefined);
});

test('generator with companionMode 崽 produces companion data', () => {
  const outfit = generateOutfitForScene('besties', 0.4, null, '崽');

  assert.equal(outfit.companionMode, '崽');
  assert.ok(outfit.companion);
  assert.ok(outfit.companion.id);
  assert.match(outfit.companion.name, /崽|小可爱|崽崽/);
  assert.equal(outfit.companion.type, 'baby');

  assert.ok(outfit.companionOutfit);
  assert.ok(outfit.companionOutfit.color);
  assert.ok(outfit.companionOutfit.material);
  assert.ok(outfit.companionOutfit.accessory);
  assert.ok(outfit.companionOutfit.colorClass);
  assert.ok(outfit.companionOutfit.materialClass);

  assert.ok(outfit.companionSummary);
  assert.match(outfit.companionSummary, /携崽|崽/);
});

test('generator with companionMode 喵 produces cat companion', () => {
  const outfit = generateOutfitForScene('cafe', 0.6, null, '喵');

  assert.equal(outfit.companionMode, '喵');
  assert.ok(outfit.companion);
  assert.equal(outfit.companion.type, 'cat');
  assert.match(outfit.companion.id, /^cat-/);
  assert.ok(outfit.companionOutfit);
  assert.ok(outfit.companionSummary);
});

test('generator with companionMode 汪 produces dog companion', () => {
  const outfit = generateOutfitForScene('exhibition', 0.8, null, '汪');

  assert.equal(outfit.companionMode, '汪');
  assert.ok(outfit.companion);
  assert.equal(outfit.companion.type, 'dog');
  assert.match(outfit.companion.id, /^dog-/);
  assert.ok(outfit.companionOutfit);
  assert.ok(outfit.companionSummary);
});

test('companion outfit has valid garment metadata', () => {
  const outfit = generateOutfitForScene('date', 0.3, null, '崽');

  const companionOutfit = outfit.companionOutfit;
  assert.ok(companionOutfit.color);
  assert.ok(companionOutfit.material);
  assert.ok(companionOutfit.accessory);
  assert.ok(companionOutfit.colorClass);
  assert.ok(companionOutfit.materialClass);
  assert.ok(companionOutfit.paletteClass);
  assert.ok(companionOutfit.textureKey);

  assert.match(companionOutfit.colorClass, /^[a-z-]+$/);
  assert.match(companionOutfit.materialClass, /^mat-[a-z-]+$/);
});

test('poster payload includes companion fields when present', () => {
  const outfit = generateOutfitForScene('besties', 0.5, null, '喵');
  const poster = createPosterPayload(outfit);

  assert.equal(poster.sceneName, outfit.scene.name);
  assert.equal(poster.tags.length, 3);
  assert.equal(poster.companionMode, '喵');
  assert.ok(poster.companion);
  assert.ok(poster.companionOutfit);
});

test('poster payload does not include companion fields when absent', () => {
  const outfit = generateOutfitForScene('cafe', 0.7);
  const poster = createPosterPayload(outfit);

  assert.equal(poster.companionMode, undefined);
  assert.equal(poster.companion, undefined);
});

test('companion mode works with weather context', () => {
  const outfit = generateOutfitForScene('besties', 0.4, hotWeather, '汪');

  assert.deepEqual(outfit.weather, hotWeather);
  assert.match(outfit.weatherSummary, /31|晴|轻薄|透气/);
  assert.equal(outfit.companionMode, '汪');
  assert.ok(outfit.companion);
  assert.ok(outfit.companionOutfit);

  const mainGarment = outfit.look.layers.dress || outfit.look.layers.top;
  assert.ok(['棉感', '雪纺感'].includes(mainGarment.material));
});

test('companion name matches the selected mode', () => {
  const babyOutfit = generateOutfitForScene('date', 0.1, null, '崽');
  const catOutfit = generateOutfitForScene('date', 0.1, null, '喵');
  const dogOutfit = generateOutfitForScene('date', 0.1, null, '汪');

  assert.match(babyOutfit.companion.name, /崽/);
  assert.match(catOutfit.companion.name, /喵/);
  assert.match(dogOutfit.companion.name, /汪/);
});
