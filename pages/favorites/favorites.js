const { getFavorites, removeFavorite } = require('../../utils/storage');

Page({
  data: {
    favorites: []
  },
  onShow() {
    this.loadFavorites();
  },
  loadFavorites() {
    this.setData({
      favorites: getFavorites()
    });
  },
  openFavorite(event) {
    const { id } = event.currentTarget.dataset;
    const outfit = this.data.favorites.find((item) => item.id === id);
    if (!outfit) {
      return;
    }
    getApp().globalData.currentOutfit = outfit;
    wx.navigateTo({
      url: '/pages/result/result'
    });
  },
  removeFavorite(event) {
    const { id } = event.currentTarget.dataset;
    removeFavorite(id);
    this.loadFavorites();
  }
});
