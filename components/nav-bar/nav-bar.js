Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },
  data: {
    navBarTop: 20,
    capsuleHeight: 32,
    capsuleWidth: 96
  },
  lifetimes: {
    attached() {
      const capsule = wx.getMenuButtonBoundingClientRect();
      if (capsule) {
        this.setData({
          navBarTop: capsule.top,
          capsuleHeight: capsule.height,
          capsuleWidth: capsule.width
        });
      } else {
        const app = getApp();
        const system = app.globalData.system || {};
        this.setData({
          navBarTop: system.navBarTop || 20,
          capsuleHeight: system.capsuleHeight || 32,
          capsuleWidth: system.capsuleWidth || 96
        });
      }
    }
  },
  methods: {
    onBack() {
      if (getCurrentPages().length > 1) {
        wx.navigateBack();
      } else {
        wx.reLaunch({ url: '/pages/home/home' });
      }
    }
  }
});
