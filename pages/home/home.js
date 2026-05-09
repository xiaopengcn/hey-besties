const scenes = require('../../data/scenes');
const { createWeatherContext, fetchWeatherContext } = require('../../utils/weather');

Page({
  data: {
    scenes,
    selectedSceneId: scenes[0].id,
    currentScene: scenes[0],
    selectedIndexLabel: `01 / ${String(scenes.length).padStart(2, '0')}`,
    weatherContext: createWeatherContext(),
    weatherTitle: '天气小纸条',
    weatherDetail: '等小纸条签收'
  },
  onLoad() {
    const app = getApp();
    this.syncWeatherState(app.globalData.weatherContext || createWeatherContext());
  },
  onShow() {
    this.prefetchWeather();
  },
  onSceneTap(event) {
    const { id } = event.currentTarget.dataset;
    const index = scenes.findIndex((item) => item.id === id);
    this.setData({
      selectedSceneId: id,
      currentScene: scenes[index] || scenes[0],
      selectedIndexLabel: `${String((index >= 0 ? index : 0) + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`
    });
  },
  async prefetchWeather() {
    const app = getApp();
    const current = app.globalData.weatherContext || createWeatherContext();
    if (['ready', 'denied', 'loading'].includes(current.status)) {
      this.syncWeatherState(current);
      return;
    }

    this.setData({
      weatherContext: {
        ...current,
        status: current.status === 'idle' ? 'loading' : current.status
      }
    });
    this.syncWeatherState({
      ...current,
      status: current.status === 'idle' ? 'loading' : current.status
    });

    const weatherContext = await fetchWeatherContext();
    app.globalData.weatherContext = weatherContext;
    this.syncWeatherState(weatherContext);
  },
  syncWeatherState(weatherContext) {
    this.setData({
      weatherContext,
      weatherTitle: this.getWeatherTitle(weatherContext),
      weatherDetail: this.getWeatherDetail(weatherContext)
    });
  },
  getWeatherTitle(weatherContext) {
    if (!weatherContext) return '天气小纸条';
    if (weatherContext.status === 'loading') return '偷看窗外...';
    if (weatherContext.status === 'ready') return `${weatherContext.cityName}${weatherContext.districtName ? '·' + weatherContext.districtName : ''}`;
    return '今天怎么穿';
  },
  getWeatherDetail(weatherContext) {
    if (!weatherContext) return '等小纸条签收';
    if (weatherContext.status === 'loading') return '冷暖一起放进来';
    if (weatherContext.status === 'ready') return `${weatherContext.temperature}°C ${weatherContext.conditionText}`;
    if (weatherContext.status === 'denied') return '定位害羞了，先看场景搭';
    return '小纸条走丢了，先看场景搭';
  },
  goGenerate() {
    wx.navigateTo({
      url: `/pages/result/result?scene=${this.data.selectedSceneId}`
    });
  },
  goFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  }
});
