const WEATHER_STORAGE_KEY = 'weather-context';
const WEATHER_CACHE_TTL = 30 * 60 * 1000;

function createWeatherContext(status = 'idle') {
  return {
    status,
    cityName: '',
    districtName: '',
    temperature: null,
    feelsLike: null,
    conditionCode: '',
    conditionText: '',
    isRaining: false,
    isHot: false,
    isCold: false,
    fetchedAt: 0
  };
}

function normalizeWeatherPayload(payload) {
  const temperature = Number(payload.temperature);
  const feelsLike = Number(payload.feelsLike ?? payload.temperature);
  const conditionCode = String(payload.conditionCode || '');
  const conditionText = String(payload.conditionText || '');
  const isRaining = /雨|雪|雷|雹/.test(conditionText) || /^3\d\d$/.test(conditionCode) || /^4\d\d$/.test(conditionCode);

  return {
    status: 'ready',
    cityName: payload.cityName || '',
    districtName: payload.districtName || '',
    temperature,
    feelsLike,
    conditionCode,
    conditionText,
    isRaining,
    isHot: temperature >= 28 || feelsLike >= 30,
    isCold: temperature <= 12 || feelsLike <= 10,
    fetchedAt: payload.fetchedAt || Date.now()
  };
}

function loadCachedWeatherContext() {
  if (typeof wx === 'undefined') {
    return createWeatherContext();
  }

  const cached = wx.getStorageSync(WEATHER_STORAGE_KEY);
  if (!cached || typeof cached !== 'object' || !cached.status) {
    return createWeatherContext();
  }
  return cached;
}

function saveWeatherContext(context) {
  if (typeof wx === 'undefined') {
    return context;
  }
  wx.setStorageSync(WEATHER_STORAGE_KEY, context);
  return context;
}

function shouldUseCachedWeather(context, force) {
  return !force &&
    context &&
    context.status === 'ready' &&
    context.fetchedAt &&
    Date.now() - context.fetchedAt < WEATHER_CACHE_TTL;
}

function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success: resolve,
      fail: reject
    });
  });
}

function callWeatherCloudFunction({ latitude, longitude }) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !wx.cloud.callFunction) {
      reject(new Error('cloud unavailable'));
      return;
    }

    wx.cloud.callFunction({
      name: 'getWeather',
      data: {
        latitude,
        longitude
      },
      success(result) {
        resolve(result.result || {});
      },
      fail: reject
    });
  });
}

function isPermissionDenied(error) {
  const message = String(error && error.errMsg ? error.errMsg : error && error.message ? error.message : '');
  return /auth deny|authorize no response|authorize denied|permission denied/i.test(message);
}

async function fetchWeatherContext(options = {}) {
  const { force = false } = options;
  const cached = loadCachedWeatherContext();
  if (shouldUseCachedWeather(cached, force)) {
    return cached;
  }

  try {
    const location = await getLocation();
    const payload = await callWeatherCloudFunction(location);
    const next = normalizeWeatherPayload(payload);
    saveWeatherContext(next);
    return next;
  } catch (error) {
    const fallback = createWeatherContext(isPermissionDenied(error) ? 'denied' : 'failed');
    saveWeatherContext(fallback);
    return fallback;
  }
}

module.exports = {
  WEATHER_STORAGE_KEY,
  createWeatherContext,
  normalizeWeatherPayload,
  loadCachedWeatherContext,
  saveWeatherContext,
  fetchWeatherContext
};
