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
        title: '小海报来啦',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '小海报迷路啦',
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
        title: '已收进相册',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '相册还没开门',
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
