const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateOutfitForScene,
  createPosterPayload
} = require('../utils/generator');

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
