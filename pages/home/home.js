const scenes = require('../../data/scenes');

Page({
  data: {
    scenes,
    selectedSceneId: scenes[0].id,
    currentScene: scenes[0],
    selectedIndexLabel: `01 / ${String(scenes.length).padStart(2, '0')}`
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
