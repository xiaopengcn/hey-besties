const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeWeatherPayload,
  loadCachedWeatherContext
} = require('../utils/weather');

test('normalizes weather payload into generator-friendly flags', () => {
  const weather = normalizeWeatherPayload({
    cityName: '上海',
    districtName: '静安',
    temperature: 29,
    feelsLike: 32,
    conditionCode: '305',
    conditionText: '小雨'
  });

  assert.equal(weather.status, 'ready');
  assert.equal(weather.cityName, '上海');
  assert.equal(weather.isRaining, true);
  assert.equal(weather.isHot, true);
  assert.equal(weather.isCold, false);
  assert.ok(weather.fetchedAt > 0);
});

test('reads cached weather context from storage when available', () => {
  global.wx = {
    getStorageSync(key) {
      assert.equal(key, 'weather-context');
      return {
        status: 'ready',
        cityName: '杭州',
        districtName: '西湖',
        temperature: 18,
        feelsLike: 18,
        conditionCode: '101',
        conditionText: '多云',
        isRaining: false,
        isHot: false,
        isCold: false,
        fetchedAt: 1710000000000
      };
    }
  };

  const weather = loadCachedWeatherContext();

  assert.equal(weather.cityName, '杭州');
  assert.equal(weather.status, 'ready');

  delete global.wx;
});
