const scenes = require('../../data/scenes');
const { generateOutfitForScene } = require('../../utils/generator');
const { saveFavorite, removeFavorite, isFavorite } = require('../../utils/storage');
const { createShareMessage, createStageShareMessage } = require('../../utils/share');
const {
  createStage,
  getStage,
  joinStage,
  updateMyOutfit,
  addMockParticipant,
  leaveStage,
  startPolling,
  stopPolling,
  generateUserId,
  isCloudAvailable
} = require('../../utils/stage-service');

Page({
  data: {
    sceneName: '',
    outfit: null,
    favorite: false,
    styleSummary: '',
    weatherSummary: '',

    isStageMode: false,
    stageId: '',
    stageParticipants: [],
    stageActiveIndex: 0,
    myUserId: '',
    isDevMode: false
  },

  onLoad(options) {
    var app = getApp();

    if (options.stageId) {
      this.enterStageMode(options.stageId);
      return;
    }

    if (app.globalData.currentOutfit && !options.scene) {
      var outfit = app.globalData.currentOutfit;
      this.setOutfit(outfit);
      return;
    }
    var sceneId = options.scene || scenes[0].id;
    this.generate(sceneId);
  },

  // ── Solo mode ──

  setOutfit(outfit) {
    getApp().globalData.currentOutfit = outfit;
    this.setData({
      sceneName: outfit.scene.name,
      outfit: outfit,
      favorite: isFavorite(outfit.id),
      styleSummary: this.buildStyleSummary(outfit),
      weatherSummary: outfit.weatherSummary || ''
    });
  },

  buildStyleSummary(outfit) {
    var bits = [outfit.theme.title];
    if (outfit.look.layers.outerwear) {
      bits.push('+ ' + outfit.look.layers.outerwear.name);
    }
    bits.push(outfit.elements[0]);
    bits.push(outfit.elements[1]);
    return bits.join(' · ');
  },

  generate(sceneId) {
    var weatherContext = getApp().globalData.weatherContext;
    var outfit = generateOutfitForScene(sceneId, undefined, weatherContext && weatherContext.status === 'ready' ? weatherContext : null);
    this.setOutfit(outfit);
  },

  reroll() {
    this.generate(this.data.outfit.scene.id);
  },

  toggleFavorite() {
    var outfit = this.data.outfit;
    var favorite = this.data.favorite;
    var next = !favorite;
    if (next) {
      saveFavorite(outfit);
      wx.showToast({ title: '收好了', icon: 'success' });
    } else {
      removeFavorite(outfit.id);
      wx.showToast({ title: '取下了', icon: 'none' });
    }
    this.setData({ favorite: next });
  },

  goPoster() {
    wx.navigateTo({ url: '/pages/poster/poster' });
  },

  goBestieStage() {
    var outfit = this.data.outfit;
    var myUserId = generateUserId();
    var isDev = !isCloudAvailable();
    var self = this;

    var userInfo = {
      userId: myUserId,
      nickName: '我',
      avatarUrl: ''
    };

    createStage(outfit.scene.id, outfit, userInfo).then(function (stageId) {
      self.setData({
        isStageMode: true,
        stageId: stageId,
        myUserId: myUserId,
        isDevMode: isDev
      });
      self.startStagePolling(stageId);
      self.pollStageNow(stageId);
    }).catch(function () {
      wx.showToast({ title: '再试一次', icon: 'none' });
    });
  },

  // ── Stage mode ──

  enterStageMode(stageId) {
    var myUserId = generateUserId();
    var isDev = !isCloudAvailable();
    var outfit = getApp().globalData.currentOutfit
      || generateOutfitForScene('besties');
    var self = this;

    var userInfo = {
      userId: myUserId,
      nickName: '我',
      avatarUrl: ''
    };

    joinStage(stageId, outfit, userInfo).then(function () {
      wx.showToast({ title: '来啦', icon: 'success' });
      self.setData({
        isStageMode: true,
        stageId: stageId,
        myUserId: myUserId,
        isDevMode: isDev,
        outfit: outfit
      });
      self.startStagePolling(stageId);
      self.pollStageNow(stageId);
    }).catch(function () {
      wx.showToast({ title: '再试一次', icon: 'none' });
    });
  },

  startStagePolling(stageId) {
    var self = this;
    var timerId = startPolling(stageId, function (stage) {
      self.onStagePoll(stage);
    }, 3000);
    this._pollTimer = timerId;
  },

  pollStageNow(stageId) {
    var self = this;
    getStage(stageId).then(function (stage) {
      self.onStagePoll(stage);
    }).catch(function () {});
  },

  onStagePoll(stage) {
    if (!stage) return;
    var participants = stage.participants || [];
    this.setData({ stageParticipants: participants });
  },

  onStageSwipe(e) {
    this.setData({ stageActiveIndex: e.detail.index });
  },

  onStageCopy(e) {
    var index = e.detail.index;
    var participant = this.data.stageParticipants[index];
    if (!participant) return;
    if (participant.userId === this.data.myUserId) return;
    var self = this;

    var copiedOutfit = Object.assign({}, participant.outfit, {
      id: this.data.outfit ? this.data.outfit.id : participant.outfit.id,
      createdAt: Date.now()
    });
    this.setData({ outfit: copiedOutfit });

    updateMyOutfit(this.data.stageId, this.data.myUserId, copiedOutfit)
      .then(function () {
        wx.showToast({ title: '借到啦', icon: 'success' });
        self.pollStageNow(self.data.stageId);
      }).catch(function () {});
  },

  onStageReroll() {
    var myOutfit = this.data.outfit;
    if (!myOutfit) return;
    var self = this;

    var newOutfit = generateOutfitForScene(myOutfit.scene.id, undefined, myOutfit.weather);
    newOutfit.id = myOutfit.id;
    newOutfit.createdAt = myOutfit.createdAt;
    this.setData({ outfit: newOutfit });

    updateMyOutfit(this.data.stageId, this.data.myUserId, newOutfit)
      .then(function () {
        wx.showToast({ title: '生成好啦', icon: 'success' });
        self.pollStageNow(self.data.stageId);
      }).catch(function () {});
  },

  onStageAddMock() {
    var self = this;
    addMockParticipant(this.data.stageId, this.data.outfit, this.data.outfit.scene.id)
      .then(function () {
        wx.showToast({ title: '闺蜜来啦', icon: 'success' });
        self.pollStageNow(self.data.stageId);
      }).catch(function () {});
  },

  exitStageMode() {
    if (this._pollTimer) {
      stopPolling(this._pollTimer);
      this._pollTimer = null;
    }
    leaveStage(this.data.stageId, this.data.myUserId).catch(function () {});
    this.setData({ isStageMode: false, stageParticipants: [], stageId: '' });
  },

  goScenes() {
    if (this.data.isStageMode) {
      this.exitStageMode();
    }
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.reLaunch({ url: '/pages/home/home' });
      }
    });
  },

  onShareAppMessage() {
    if (this.data.isStageMode) {
      return createStageShareMessage(this.data.stageId, this.data.outfit.scene.id);
    }
    return createShareMessage(this.data.outfit);
  },

  onUnload() {
    if (this._pollTimer) {
      stopPolling(this._pollTimer);
      this._pollTimer = null;
    }
    if (this.data.stageId) {
      leaveStage(this.data.stageId, this.data.myUserId).catch(function () {});
    }
  }
});
