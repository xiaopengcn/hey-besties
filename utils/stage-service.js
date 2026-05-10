const { generateOutfitForScene } = require('./generator');

const STAGES_COLLECTION = 'stages';
const MOCK_STAGES_KEY = 'mock-stages';
const MAX_PARTICIPANTS = 3;
var USE_CLOUD = false;

const MOCK_NAMES = ['小糖', '小桃', '小薄荷'];

function createMockUser(index) {
  return {
    userId: 'mock-user-' + index,
    nickName: MOCK_NAMES[index % MOCK_NAMES.length],
    avatarUrl: ''
  };
}

function generateStageId() {
  return 'stage-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function generateUserId() {
  return 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

function isCloudAvailable() {
  return USE_CLOUD && typeof wx !== 'undefined' && wx.cloud && wx.cloud.database;
}

function getMiniProgramEnvVersion() {
  if (typeof wx === 'undefined') {
    return 'develop';
  }

  try {
    if (typeof wx.getAccountInfoSync === 'function') {
      var accountInfo = wx.getAccountInfoSync();
      if (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.envVersion) {
        return accountInfo.miniProgram.envVersion;
      }
    }
  } catch (e) {}

  if (typeof __wxConfig !== 'undefined' && __wxConfig && __wxConfig.envVersion) {
    return __wxConfig.envVersion;
  }

  return 'develop';
}

function isProductionEnvironment() {
  var envVersion = getMiniProgramEnvVersion();
  return envVersion === 'release' || envVersion === 'production';
}

function shouldUseVirtualBesties() {
  return !isProductionEnvironment();
}

// ── Mock storage ──

function getMockStages() {
  if (typeof wx === 'undefined') return {};
  return wx.getStorageSync(MOCK_STAGES_KEY) || {};
}

function saveMockStages(stages) {
  if (typeof wx === 'undefined') return;
  wx.setStorageSync(MOCK_STAGES_KEY, stages);
}

function buildMockParticipant(index, baseOutfit, sceneId) {
  var variantOutfit = index === 0
    ? baseOutfit
    : generateOutfitForScene(sceneId, (index * 0.37) % 1);
  return {
    userId: 'mock-user-' + index,
    nickName: MOCK_NAMES[index % MOCK_NAMES.length],
    avatarUrl: '',
    outfit: variantOutfit,
    joinedAt: Date.now() - index * 1000
  };
}

function buildSelfParticipant(userInfo, outfit) {
  return {
    userId: userInfo.userId,
    nickName: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl || '',
    outfit: outfit,
    joinedAt: Date.now()
  };
}

function buildInitialParticipants(userInfo, outfit, sceneId) {
  var participants = [buildSelfParticipant(userInfo, outfit)];

  if (shouldUseVirtualBesties()) {
    participants.push(buildMockParticipant(1, outfit, sceneId));
    participants.push(buildMockParticipant(2, outfit, sceneId));
  }

  return participants;
}

// ── Mock implementations (pure, no network) ──

function createStageMock(sceneId, outfit, userInfo) {
  var stageId = generateStageId();
  var stages = getMockStages();
  stages[stageId] = {
    _id: stageId,
    sceneId: sceneId,
    participants: buildInitialParticipants(userInfo, outfit, sceneId),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  saveMockStages(stages);
  return stageId;
}

function getStageMock(stageId) {
  var stages = getMockStages();
  return stages[stageId] || null;
}

function joinStageMock(stageId, outfit, userInfo) {
  var stages = getMockStages();
  var stage = stages[stageId];
  if (!stage) throw new Error('stage not found');
  if (stage.participants.length >= MAX_PARTICIPANTS) throw new Error('stage full');
  if (!stage.participants.some(function (p) { return p.userId === userInfo.userId; })) {
    stage.participants.push({
      userId: userInfo.userId,
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl || '',
      outfit: outfit,
      joinedAt: Date.now()
    });
    stage.updatedAt = Date.now();
    saveMockStages(stages);
  }
}

function updateMyOutfitMock(stageId, userId, outfit) {
  var stages = getMockStages();
  var stage = stages[stageId];
  if (!stage) throw new Error('stage not found');
  stage.participants = stage.participants.map(function (p) {
    if (p.userId === userId) {
      return Object.assign({}, p, { outfit: outfit, joinedAt: p.joinedAt });
    }
    return p;
  });
  stage.updatedAt = Date.now();
  saveMockStages(stages);
}

function addMockParticipantImpl(stageId, outfit, sceneId) {
  var stages = getMockStages();
  var stage = stages[stageId];
  if (!stage) throw new Error('stage not found');
  if (stage.participants.length >= MAX_PARTICIPANTS) throw new Error('stage full');
  var nextIndex = stage.participants.length;
  stage.participants.push(buildMockParticipant(nextIndex, outfit, sceneId));
  stage.updatedAt = Date.now();
  saveMockStages(stages);
}

function leaveStageMock(stageId, userId) {
  var stages = getMockStages();
  var stage = stages[stageId];
  if (!stage) return;
  stage.participants = stage.participants.filter(function (p) {
    return p.userId !== userId;
  });
  if (stage.participants.length === 0) {
    delete stages[stageId];
  } else {
    stage.updatedAt = Date.now();
  }
  saveMockStages(stages);
}

// ── Public API — cloud-first with mock fallback ──

function createStage(sceneId, outfit, userInfo) {
  if (!isCloudAvailable()) {
    return Promise.resolve(createStageMock(sceneId, outfit, userInfo));
  }

  return new Promise(function (resolve) {
    var db = wx.cloud.database();
    db.collection(STAGES_COLLECTION).add({
      data: {
        sceneId: sceneId,
        participants: buildInitialParticipants(userInfo, outfit, sceneId),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      success: function (res) { resolve(res._id); },
      fail: function () {
        resolve(createStageMock(sceneId, outfit, userInfo));
      }
    });
  });
}

function getStage(stageId) {
  if (!isCloudAvailable()) {
    return Promise.resolve(getStageMock(stageId));
  }

  return new Promise(function (resolve) {
    var db = wx.cloud.database();
    db.collection(STAGES_COLLECTION).doc(stageId).get({
      success: function (res) { resolve(res.data); },
      fail: function () {
        resolve(getStageMock(stageId));
      }
    });
  });
}

function joinStage(stageId, outfit, userInfo) {
  if (!isCloudAvailable()) {
    try {
      joinStageMock(stageId, outfit, userInfo);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();
    db.collection(STAGES_COLLECTION).doc(stageId).get({
      success: function (res) {
        var stage = res.data;
        if (!stage) { reject(new Error('stage not found')); return; }
        if (stage.participants.length >= MAX_PARTICIPANTS) { reject(new Error('stage full')); return; }
        if (stage.participants.some(function (p) { return p.userId === userInfo.userId; })) {
          resolve(updateMyOutfit(stageId, userInfo.userId, outfit));
          return;
        }
        db.collection(STAGES_COLLECTION).doc(stageId).update({
          data: {
            participants: db.command.push({
              userId: userInfo.userId,
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl || '',
              outfit: outfit,
              joinedAt: Date.now()
            }),
            updatedAt: Date.now()
          },
          success: resolve,
          fail: reject
        });
      },
      fail: function () {
        try {
          joinStageMock(stageId, outfit, userInfo);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}

function updateMyOutfit(stageId, userId, outfit) {
  if (!isCloudAvailable()) {
    try {
      updateMyOutfitMock(stageId, userId, outfit);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();
    db.collection(STAGES_COLLECTION).doc(stageId).get({
      success: function (res) {
        var stage = res.data;
        if (!stage) { reject(new Error('stage not found')); return; }
        var participants = stage.participants.map(function (p) {
          if (p.userId === userId) {
            return Object.assign({}, p, { outfit: outfit, joinedAt: p.joinedAt });
          }
          return p;
        });
        db.collection(STAGES_COLLECTION).doc(stageId).update({
          data: { participants: participants, updatedAt: Date.now() },
          success: resolve,
          fail: reject
        });
      },
      fail: function () {
        try {
          updateMyOutfitMock(stageId, userId, outfit);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}

function addMockParticipant(stageId, outfit, sceneId) {
  if (!shouldUseVirtualBesties() || isCloudAvailable()) {
    return Promise.resolve();
  }
  try {
    addMockParticipantImpl(stageId, outfit, sceneId);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

function leaveStage(stageId, userId) {
  if (!isCloudAvailable()) {
    leaveStageMock(stageId, userId);
    return Promise.resolve();
  }

  return new Promise(function (resolve) {
    var db = wx.cloud.database();
    db.collection(STAGES_COLLECTION).doc(stageId).get({
      success: function (res) {
        var stage = res.data;
        if (!stage) { resolve(); return; }
        var participants = stage.participants.filter(function (p) {
          return p.userId !== userId;
        });
        if (participants.length === 0) {
          db.collection(STAGES_COLLECTION).doc(stageId).remove({
            success: resolve,
            fail: resolve
          });
          return;
        }
        db.collection(STAGES_COLLECTION).doc(stageId).update({
          data: { participants: participants, updatedAt: Date.now() },
          success: resolve,
          fail: resolve
        });
      },
      fail: function () {
        leaveStageMock(stageId, userId);
        resolve();
      }
    });
  });
}

function startPolling(stageId, callback, interval) {
  var delay = interval || 3000;
  getStage(stageId).then(callback).catch(function () {});
  var timerId = setInterval(function () {
    getStage(stageId).then(callback).catch(function () {});
  }, delay);
  return timerId;
}

function stopPolling(timerId) {
  clearInterval(timerId);
}

module.exports = {
  MAX_PARTICIPANTS: MAX_PARTICIPANTS,
  createMockUser: createMockUser,
  generateStageId: generateStageId,
  generateUserId: generateUserId,
  createStage: createStage,
  getStage: getStage,
  joinStage: joinStage,
  updateMyOutfit: updateMyOutfit,
  addMockParticipant: addMockParticipant,
  leaveStage: leaveStage,
  startPolling: startPolling,
  stopPolling: stopPolling,
  isCloudAvailable: isCloudAvailable,
  isProductionEnvironment: isProductionEnvironment,
  shouldUseVirtualBesties: shouldUseVirtualBesties
};
