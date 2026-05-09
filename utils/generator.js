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

function pickFromPreferred(preferred, fallback, seed, offset) {
  const validPreferred = preferred.filter((item) => fallback.includes(item));
  const source = validPreferred.length ? validPreferred : fallback;
  return pick(source, seed, offset);
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

function resolveWeatherBias(weatherContext) {
  if (!weatherContext || weatherContext.status !== 'ready') {
    return {
      materialPool: null,
      routePool: null,
      outerwearChanceOffset: 0,
      forceOuterwearOff: false,
      preferredBottomIds: null,
      note: ''
    };
  }

  if (weatherContext.isHot) {
    return {
      materialPool: ['棉感', '雪纺感'],
      routePool: ['separates', 'dress'],
      outerwearChanceOffset: -0.35,
      forceOuterwearOff: true,
      preferredBottomIds: ['shorts-mini', 'skirt-mini', 'skirt-pleated', 'skirt-a-line'],
      note: '今天偏热，轻薄透气一点，出门更清爽。'
    };
  }

  if (weatherContext.isCold) {
    return {
      materialPool: ['针织感', '棉感', '麻料感'],
      routePool: ['separates', 'dress'],
      outerwearChanceOffset: 0.4,
      forceOuterwearOff: false,
      preferredBottomIds: ['pants-wide', 'pants-tailored', 'skirt-midi'],
      note: weatherContext.isRaining
        ? '今天偏冷又有雨，利落下装和小外搭会更安心。'
        : '今天偏凉，针织、长线条和轻叠穿都很乖。'
    };
  }

  if (weatherContext.isRaining) {
    return {
      materialPool: ['棉感', '针织感', '牛仔感'],
      routePool: ['separates', 'dress'],
      outerwearChanceOffset: 0.22,
      forceOuterwearOff: false,
      preferredBottomIds: ['pants-wide', 'pants-tailored', 'shorts-mini', 'skirt-mini'],
      note: '今天有雨，利落下装加轻外搭，清爽不狼狈。'
    };
  }

  return {
    materialPool: null,
    routePool: null,
    outerwearChanceOffset: 0,
    forceOuterwearOff: false,
    preferredBottomIds: null,
    note: '今天天气温和，按这场局漂亮发挥就很顺。'
  };
}

function chooseBottomItem(material, seed, preferredBottomIds) {
  if (!preferredBottomIds || !preferredBottomIds.length) {
    return chooseCompatibleItem(wardrobe.bottoms, material, seed, 0.56);
  }

  const preferred = wardrobe.bottoms.filter((item) => preferredBottomIds.includes(item.id) && item.materials.includes(material));
  if (preferred.length) {
    return pick(preferred, seed, 0.56);
  }

  const fallbackPreferred = wardrobe.bottoms.filter((item) => preferredBottomIds.includes(item.id));
  if (fallbackPreferred.length) {
    return pick(fallbackPreferred, seed, 0.56);
  }

  return chooseCompatibleItem(wardrobe.bottoms, material, seed, 0.56);
}

function buildWeatherSummary(weatherContext, weatherBias) {
  if (!weatherContext || weatherContext.status !== 'ready') {
    return '';
  }

  const pieces = [
    `${weatherContext.cityName}${weatherContext.districtName ? `·${weatherContext.districtName}` : ''}`,
    `${weatherContext.temperature}°C`,
    weatherContext.conditionText
  ].filter(Boolean);

  return `${pieces.join(' ')}，${weatherBias.note}`;
}

function buildLook(scene, color, material, accent, seed, weatherBias) {
  const routeSource = weatherBias.routePool && weatherBias.routePool.length ? weatherBias.routePool : scene.preferredRoutes;
  const finalRoute = pickFromPreferred(routeSource, scene.preferredRoutes, seed, 0.32);
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

  if (finalRoute === 'dress') {
    const dressItem = chooseCompatibleItem(wardrobe.dresses, material, seed, 0.48);
    layers.dress = buildGarment(dressItem, color, material);
  } else {
    const topItem = chooseCompatibleItem(wardrobe.tops, material, seed, 0.14);
    const bottomItem = chooseBottomItem(material, seed, weatherBias.preferredBottomIds);
    layers.top = buildGarment(topItem, color, material);
    layers.bottom = buildGarment(bottomItem, color, material);
  }

  const adjustedOuterwearChance = Math.max(0, Math.min(1, (scene.outerwearChance || 0) + weatherBias.outerwearChanceOffset));
  const shouldAddOuterwear = !weatherBias.forceOuterwearOff && ((seed + 0.89) % 1) < adjustedOuterwearChance;
  if (shouldAddOuterwear) {
    const outerwearItem = chooseCompatibleItem(wardrobe.outerwear, material, seed, 0.77);
    layers.outerwear = buildGarment(outerwearItem, color, material);
  }

  return {
    route: finalRoute,
    layers
  };
}

function generateOutfitForScene(sceneId, seedInput, weatherContext) {
  const scene = scenes.find((item) => item.id === sceneId) || scenes[0];
  const seed = normalizeSeed(seedInput);
  const weatherBias = resolveWeatherBias(weatherContext);
  const theme = pick(scene.themes, seed, 0.08);
  const color = pick(scene.colorPool, seed, 0.18);
  const materialPool = weatherBias.materialPool && weatherBias.materialPool.length ? weatherBias.materialPool : scene.materialPool;
  const material = pickFromPreferred(materialPool, scene.materialPool, seed, 0.42);
  const accent = pick(scene.accentPool, seed, 0.66);
  const look = buildLook(scene, color, material, accent, seed, weatherBias);
  const createdAt = Date.now();
  const palette = wardrobe.palettes[color] || wardrobe.palettes['奶油白'];
  const weatherSummary = buildWeatherSummary(weatherContext, weatherBias);

  return {
    id: `${scene.id}-${Math.round(seed * 10000)}-${createdAt}`,
    scene,
    theme,
    elements: [color, material, accent],
    palette,
    look,
    weather: weatherContext && weatherContext.status === 'ready' ? weatherContext : null,
    weatherSummary,
    summary: `${scene.name}的小灵感：${color}、${material}和${accent}一起冒出来。`,
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
    look: outfit.look,
    weatherSummary: outfit.weatherSummary || ''
  };
}

module.exports = {
  generateOutfitForScene,
  createPosterPayload
};
