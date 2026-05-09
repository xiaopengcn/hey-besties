const { getSystemMetrics } = require('./utils/system');

App({
  globalData: {
    system: getSystemMetrics(),
    currentOutfit: null
  },
  onLaunch() {
    this.globalData.system = getSystemMetrics();
  }
});
