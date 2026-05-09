const scenes = require('../data/scenes');
const wardrobe = require('../data/wardrobe');

function normalizeSeed(seed) {
  if (typeof seed === 'number' && seed >= 0) {
    return seed % 1;
  }
  return Math.random();
}

function pick(array, seed, offset) {
  const value = (seed + offset) % 1;
  const index = Math.floor(value * array.length) % array.length;
  return array[index];
}

function buildGarment(item, color, material) {
  const palette = wardrobe.palettes[color] || wardrobe.palettes['奶油白'];
  return {
    id: item.id,
    name: item.name,
    shape: item.shape,
    color,
    material,
    colorClass: wardrobe.colorClassMap[color] || 'cream',
    materialClass: wardrobe.materialClassMap[material] || 'mat-cotton',
    textureKey: wardrobe.textureKeyMap[material] || 'cotton-soft',
    paletteClass: palette.className
  };
}

function chooseCompatibleItem(items, material, seed, offset) {
  const compatible = items.filter((item) => item.materials.includes(material));
  const source = compatible.length ? compatible : items;
  return pick(source, seed, offset);
}

function buildLook(scene, color, material, accent, seed) {
  const route = pick(scene.preferredRoutes, seed, 0.32);
  const accessoryShape = wardrobe.accessoryMap[accent];
  const accessory = wardrobe.accessories.find((item) => item.shape === accessoryShape) || pick(wardrobe.accessories, seed, 0.71);
  const layers = {
    top: null,
    bottom: null,
    dress: null,
    outerwear: null,
    accessory: {
      ...accessory,
      accent
    }
  };

  if (route === 'dress') {
    const dressItem = chooseCompatibleItem(wardrobe.dresses, material, seed, 0.48);
    layers.dress = buildGarment(dressItem, color, material);
  } else {
    const topItem = chooseCompatibleItem(wardrobe.tops, material, seed, 0.14);
    const bottomItem = chooseCompatibleItem(wardrobe.bottoms, material, seed, 0.56);
    layers.top = buildGarment(topItem, color, material);
    layers.bottom = buildGarment(bottomItem, color, material);
  }

  const shouldAddOuterwear = ((seed + 0.89) % 1) < (scene.outerwearChance || 0);
  if (shouldAddOuterwear) {
    const outerwearItem = chooseCompatibleItem(wardrobe.outerwear, material, seed, 0.77);
    layers.outerwear = buildGarment(outerwearItem, color, material);
  }

  return {
    route,
    layers
  };
}

function generateOutfitForScene(sceneId, seedInput) {
  const scene = scenes.find((item) => item.id === sceneId) || scenes[0];
  const seed = normalizeSeed(seedInput);
  const theme = pick(scene.themes, seed, 0.08);
  const color = pick(scene.colorPool, seed, 0.18);
  const material = pick(scene.materialPool, seed, 0.42);
  const accent = pick(scene.accentPool, seed, 0.66);
  const look = buildLook(scene, color, material, accent, seed);
  const createdAt = Date.now();
  const palette = wardrobe.palettes[color] || wardrobe.palettes['奶油白'];

  return {
    id: `${scene.id}-${Math.round(seed * 10000)}-${createdAt}`,
    scene,
    theme,
    elements: [color, material, accent],
    palette,
    look,
    summary: `${scene.name} · ${theme.title} · ${color}/${material}/${accent}`,
    createdAt
  };
}

function createPosterPayload(outfit) {
  return {
    id: outfit.id,
    sceneName: outfit.scene.name,
    sceneMood: outfit.scene.mood,
    themeTitle: outfit.theme.title,
    themeVibe: outfit.theme.vibe,
    tags: outfit.elements,
    palette: outfit.palette,
    look: outfit.look
  };
}

module.exports = {
  generateOutfitForScene,
  createPosterPayload
};
