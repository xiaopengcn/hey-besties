Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    subtitle: {
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
      const app = getApp();
      const system = app.globalData.system || {};
      this.setData({
        navBarTop: system.navBarTop || 20,
        capsuleHeight: system.capsuleHeight || 32,
        capsuleWidth: system.capsuleWidth || 96
      });
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
