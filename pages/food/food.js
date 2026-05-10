var foodService = require('../../utils/food-service');

Page({
  data: {
    session: null,
    options: [],
    state: null,
    selected: null,
    voterName: '我',
    roundTitle: '第一轮心动菜牌',
    actionCopy: '先给想吃的投一票',
    rollingId: null,
    highlightedIds: {},
    statusLine: ''
  },

  _timer: null,
  _rollingTrail: [],

  onLoad() {
    this.startSession();
  },

  onUnload() {
    this.clearRollingTimer();
  },

  startSession() {
    this.clearRollingTimer();
    this._rollingTrail = [];
    var session = foodService.createFoodSession();
    this.setSession(session, null);
    this.setData({ statusLine: '' });
  },

  clearRollingTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  setSession(session, selected) {
    var state = foodService.getSessionState(session);
    this.setData({
      session: session,
      options: foodService.getVoteOptions(session),
      state: state,
      selected: selected,
      highlightedIds: selected ? this._buildHighlight(selected) : {},
      roundTitle: this.buildRoundTitle(state),
      actionCopy: state.isFinal ? '今晚就它漂亮上桌' : '把心动票投给它'
    });
  },

  _buildHighlight(pick) {
    var map = {};
    if (pick && pick.id) {
      map[pick.id] = 'selected';
    }
    return map;
  },

  _buildRollingHighlight(currentId) {
    var map = {};

    this._rollingTrail.forEach(function (id) {
      map[id] = 'trail';
    });

    if (currentId) {
      map[currentId] = 'rolling';
    }

    return map;
  },

  buildRoundTitle(state) {
    if (state.phase === 'decision') return '今晚饭局定妆照';
    if (state.round === 2) return '第二轮缩小纠结';
    return '第一轮心动菜牌';
  },

  onVoteTap(event) {
    var optionId = event.currentTarget.dataset.id;
    var session = this.data.session;
    foodService.castVote(session, optionId, this.data.voterName);
    this.setSession(session, this.data.selected);
  },

  onAdvanceTap() {
    var next = foodService.advanceRound(this.data.session);
    this.setSession(next, null);
  },

  onRandomTap() {
    var session = this.data.session;
    var options = foodService.getVoteOptions(session);
    if (!options || options.length === 0) return;

    var ids = options.map(function (o) { return o.id; });
    var seed = Math.random();
    var finalPick = foodService.pickRandom(session, seed);
    var finalId = finalPick && finalPick.selected ? finalPick.selected.id : (finalPick ? finalPick.id : null);
    var sequence = foodService.getRandomSequence(ids, seed, finalId);

    this.setData({
      rollingId: null,
      highlightedIds: {},
      statusLine: '🎲 今晚吃什么，让命运替你点一下'
    });

    this.clearRollingTimer();
    this._rollingTrail = [];

    var idx = 0;
    var self = this;
    this._timer = setInterval(function () {
      if (idx >= sequence.length) {
        self.clearRollingTimer();
        self._rollingTrail = [];
        self.setData({
          rollingId: null,
          selected: finalPick && finalPick.selected ? finalPick.selected : finalPick,
          highlightedIds: self._buildHighlight(finalPick && finalPick.selected ? finalPick.selected : finalPick),
          statusLine: '✨ 今晚这格漂亮出线'
        });
        return;
      }

      self._rollingTrail.push(sequence[idx]);
      if (self._rollingTrail.length > 3) {
        self._rollingTrail.shift();
      }

      self.setData({
        rollingId: sequence[idx],
        highlightedIds: self._buildRollingHighlight(sequence[idx])
      });
      idx++;
    }, 120);
  },

  onRestartTap() {
    this.startSession();
  }
});
