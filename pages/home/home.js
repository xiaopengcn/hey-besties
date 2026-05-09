const scenes = require('../../data/scenes');
const { createWeatherContext, fetchWeatherContext } = require('../../utils/weather');

Page({
  data: {
    scenes,
    selectedSceneId: scenes[0].id,
    currentScene: scenes[0],
    selectedIndexLabel: `01 / ${String(scenes.length).padStart(2, '0')}`,
    weatherContext: createWeatherContext(),
    weatherTitle: '天气小纸条待签收',
    weatherDetail: '先按今天的局出发，也会很好看。'
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
    if (!weatherContext) {
      return '天气小纸条待签收';
    }
    if (weatherContext.status === 'loading') {
      return '正在偷看窗外的天';
    }
    if (weatherContext.status === 'ready') {
      return `${weatherContext.cityName}${weatherContext.districtName ? `·${weatherContext.districtName}` : ''}`;
    }
    return '先按今天的局来搭';
  },
  getWeatherDetail(weatherContext) {
    if (!weatherContext) {
      return '先按今天的局出发，也会很好看。';
    }
    if (weatherContext.status === 'loading') {
      return '等小纸条回来，冷暖也一起放进衣柜灵感里。';
    }
    if (weatherContext.status === 'ready') {
      return `${weatherContext.temperature}°C · ${weatherContext.conditionText}`;
    }
    if (weatherContext.status === 'denied') {
      return '定位先害羞躲起来，今天就按场景开搭。';
    }
    return '天气小纸条走丢啦，今天先按场景开搭。';
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
