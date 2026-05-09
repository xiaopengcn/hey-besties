const { buildPosterModel } = require('../../utils/poster-model');
const { exportPosterImage, savePosterImage } = require('../../utils/poster-renderer');
const { createShareMessage } = require('../../utils/share');

Page({
  data: {
    poster: null,
    rendering: false,
    exportReadyPath: '',
    saving: false
  },
  onLoad() {
    const app = getApp();
    if (!app.globalData.currentOutfit) {
      wx.reLaunch({
        url: '/pages/home/home'
      });
      return;
    }
    this.setData({
      poster: buildPosterModel(app.globalData.currentOutfit)
    });
  },
  async generatePosterFile() {
    if (!this.data.poster || this.data.rendering) {
      return;
    }

    this.setData({
      rendering: true
    });

    try {
      const tempFilePath = await exportPosterImage(this, this.data.poster);
      this.setData({
        exportReadyPath: tempFilePath
      });
      wx.showToast({
        title: '生成好啦',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '再试一次',
        icon: 'none'
      });
    } finally {
      this.setData({
        rendering: false
      });
    }
  },
  async savePoster() {
    if (!this.data.poster || this.data.saving) {
      return;
    }

    this.setData({
      saving: true
    });

    try {
      const tempFilePath = await savePosterImage(this, this.data.poster);
      this.setData({
        exportReadyPath: tempFilePath
      });
      wx.showToast({
        title: '已保存',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '再试一次',
        icon: 'none'
      });
    } finally {
      this.setData({
        saving: false
      });
    }
  },
  onShareAppMessage() {
    return createShareMessage(getApp().globalData.currentOutfit);
  }
});
