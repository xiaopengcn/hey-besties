Component({
  properties: {
    participants: {
      type: Array,
      value: []
    },
    activeIndex: {
      type: Number,
      value: 0
    },
    myUserId: {
      type: String,
      value: ''
    },
    isDevMode: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentIndex: 0
  },

  methods: {
    onSwiperChange: function (e) {
      var index = Number(e.detail.current) || 0;
      this.setData({ currentIndex: index });
      this.triggerEvent('swipe', { index: index });
    },

    onCopyTap: function (e) {
      var index = Number(e.currentTarget.dataset.index);
      this.triggerEvent('copy', { index: index });
    },

    onRerollTap: function () {
      this.triggerEvent('reroll');
    },

    onAddMockTap: function () {
      this.triggerEvent('addmock');
    }
  }
});
