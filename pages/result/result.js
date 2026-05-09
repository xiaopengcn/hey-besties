const scenes = require('../../data/scenes');
const { generateOutfitForScene } = require('../../utils/generator');
const { saveFavorite, removeFavorite, isFavorite } = require('../../utils/storage');
const { createShareMessage } = require('../../utils/share');

Page({
  data: {
    sceneName: '',
    outfit: null,
    favorite: false,
    styleSummary: ''
  },
  onLoad(options) {
    const app = getApp();
    if (app.globalData.currentOutfit && !options.scene) {
      const outfit = app.globalData.currentOutfit;
      this.setOutfit(outfit);
      return;
    }
    const sceneId = options.scene || scenes[0].id;
    this.generate(sceneId);
  },
  setOutfit(outfit) {
    getApp().globalData.currentOutfit = outfit;
    this.setData({
      sceneName: outfit.scene.name,
      outfit,
      favorite: isFavorite(outfit.id),
      styleSummary: this.buildStyleSummary(outfit)
    });
  },
  buildStyleSummary(outfit) {
    const bits = [outfit.theme.title];
    if (outfit.look.layers.outerwear) {
      bits.push(`加一件${outfit.look.layers.outerwear.name}`);
    }
    bits.push(`${outfit.elements[0]}主色`);
    bits.push(`${outfit.elements[1]}质感`);
    return bits.join(' · ');
  },
  generate(sceneId) {
    const outfit = generateOutfitForScene(sceneId);
    this.setOutfit(outfit);
  },
  reroll() {
    this.generate(this.data.outfit.scene.id);
  },
  toggleFavorite() {
    const { outfit, favorite } = this.data;
    const next = !favorite;
    if (next) {
      saveFavorite(outfit);
      wx.showToast({
        title: '已收藏这套',
        icon: 'success'
      });
    } else {
      removeFavorite(outfit.id);
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
    }
    this.setData({
      favorite: next
    });
  },
  goPoster() {
    wx.navigateTo({
      url: '/pages/poster/poster'
    });
  },
  goScenes() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/home/home'
        });
      }
    });
  },
  onShareAppMessage() {
    return createShareMessage(this.data.outfit);
  }
});
