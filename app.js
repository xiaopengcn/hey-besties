const { getSystemMetrics } = require('./utils/system');
const { createWeatherContext, loadCachedWeatherContext } = require('./utils/weather');

App({
  globalData: {
    system: getSystemMetrics(),
    currentOutfit: null,
    weatherContext: createWeatherContext()
  },
  onLaunch() {
    this.globalData.system = getSystemMetrics();
    this.globalData.weatherContext = loadCachedWeatherContext();

    if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.init) {
      wx.cloud.init({
        traceUser: true
      });
    }
  }
});
