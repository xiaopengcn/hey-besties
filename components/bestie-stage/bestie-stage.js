function normalizeIndex(index, length) {
  if (!length) {
    return 0;
  }
  return (index % length + length) % length;
}

function buildStageSlots(participants, currentIndex) {
  var count = participants.length;
  var visibleCount = Math.max(3, count);
  var positions = ['left', 'center', 'right'];
  var slots = [];

  for (var offset = 0; offset < visibleCount; offset++) {
    var targetIndex = offset - 1;
    var participantIndex = currentIndex + targetIndex;
    var normalizedIndex = count ? normalizeIndex(participantIndex, count) : -1;
    var participant = count ? participants[normalizedIndex] : null;
    var isPlaceholder = !participant || offset >= count;

    slots.push({
      slotKey: positions[offset],
      position: positions[offset] || 'right',
      isActive: offset === 1,
      isPlaceholder: isPlaceholder,
      targetIndex: participant ? normalizedIndex : -1,
      participant: participant
    });
  }

  return slots;
}

Component({
  properties: {
    participants: {
      type: Array,
      value: [],
      observer: function () {
        this.syncStage();
      }
    },
    activeIndex: {
      type: Number,
      value: 0,
      observer: function (value) {
        if (typeof value === 'number' && value !== this.data.currentIndex) {
          this.setData({ currentIndex: value });
        }
        this.syncStage();
      }
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
    currentIndex: 0,
    stageSlots: [],
    activeParticipant: null
  },

  lifetimes: {
    attached: function () {
      var initialIndex = normalizeIndex(this.data.activeIndex || 0, this.data.participants.length || 1);
      this.setData({ currentIndex: initialIndex });
      this.syncStage();
    }
  },

  methods: {
    syncStage: function () {
      var participants = this.data.participants || [];
      var currentIndex = normalizeIndex(this.data.currentIndex || 0, participants.length || 1);
      var stageSlots = buildStageSlots(participants, currentIndex);
      var activeParticipant = participants.length ? participants[currentIndex] : null;

      this.setData({
        currentIndex: participants.length ? currentIndex : 0,
        stageSlots: stageSlots,
        activeParticipant: activeParticipant
      });
    },

    shiftStage: function (step) {
      var participants = this.data.participants || [];
      if (participants.length <= 1) {
        return;
      }

      var nextIndex = normalizeIndex((this.data.currentIndex || 0) + step, participants.length);
      this.setData({ currentIndex: nextIndex });
      this.syncStage();
      this.triggerEvent('swipe', { index: nextIndex });
    },

    onSlotTap: function (e) {
      var index = Number(e.currentTarget.dataset.index);
      if (index < 0 || index === this.data.currentIndex) {
        return;
      }

      this.setData({ currentIndex: index });
      this.syncStage();
      this.triggerEvent('swipe', { index: index });
    },

    onStageTouchStart: function (e) {
      var touch = e.touches && e.touches[0];
      this._touchStartX = touch ? touch.clientX : 0;
    },

    onStageTouchEnd: function (e) {
      var touch = e.changedTouches && e.changedTouches[0];
      var endX = touch ? touch.clientX : 0;
      var deltaX = endX - (this._touchStartX || 0);

      if (Math.abs(deltaX) < 36) {
        return;
      }

      this.shiftStage(deltaX < 0 ? 1 : -1);
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
