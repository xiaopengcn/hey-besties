const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MAX_PARTICIPANTS,
  createMockUser,
  generateStageId,
  generateUserId,
  isCloudAvailable,
  isProductionEnvironment,
  shouldUseVirtualBesties,
  createStage,
  getStage,
  joinStage,
  updateMyOutfit,
  addMockParticipant,
  leaveStage,
  startPolling,
  stopPolling
} = require('../utils/stage-service');

function createMockWx() {
  var storage = {};
  return {
    getAccountInfoSync: function () {
      return {
        miniProgram: {
          envVersion: 'develop'
        }
      };
    },
    cloud: {
      database: null
    },
    getStorageSync: function (key) {
      return storage[key] || null;
    },
    setStorageSync: function (key, value) {
      storage[key] = value;
    }
  };
}

function seedStorage(mockWx, key, value) {
  mockWx.setStorageSync(key, value);
}

var sampleOutfit = {
  id: 'besties-1234-1710000000000',
  scene: {
    id: 'besties',
    name: '闺蜜出游',
    mood: '好拍照又轻快'
  },
  theme: { title: '糖果元气出街风', vibe: '轻快抢镜' },
  elements: ['珊瑚粉', '棉感', '发卡'],
  palette: { primary: '#ff95a6', className: 'palette-coral' },
  look: {
    route: 'separates',
    layers: {
      top: {
        id: 'tee-baby',
        name: '短袖上衣',
        shape: 'tee',
        color: '珊瑚粉',
        material: '棉感',
        colorClass: 'coral',
        materialClass: 'mat-cotton',
        textureKey: 'cotton-soft',
        paletteClass: 'palette-coral'
      },
      bottom: {
        id: 'shorts-mini',
        name: '短裤',
        shape: 'shorts',
        color: '珊瑚粉',
        material: '棉感',
        colorClass: 'coral',
        materialClass: 'mat-cotton',
        textureKey: 'cotton-soft',
        paletteClass: 'palette-coral'
      },
      dress: null,
      outerwear: null,
      accessory: {
        id: 'clip',
        name: '发卡',
        shape: 'hair-clip',
        accent: '发卡'
      }
    }
  },
  weatherSummary: '',
  summary: '珊瑚粉、棉感、发卡',
  createdAt: 1710000000000
};

var secondOutfit = {
  id: 'besties-5678-1710000000000',
  scene: {
    id: 'besties',
    name: '闺蜜出游',
    mood: '好拍照又轻快'
  },
  theme: { title: '薄荷奶油周末出游', vibe: '轻松耐看' },
  elements: ['薄荷绿', '麻料感', '托特包'],
  palette: { primary: '#94ddc8', className: 'palette-mint' },
  look: {
    route: 'dress',
    layers: {
      top: null,
      bottom: null,
      dress: {
        id: 'dress-maxi',
        name: '长裙连衣裙',
        shape: 'maxi-dress',
        color: '薄荷绿',
        material: '麻料感',
        colorClass: 'mint',
        materialClass: 'mat-linen',
        textureKey: 'linen-grid',
        paletteClass: 'palette-mint'
      },
      outerwear: null,
      accessory: {
        id: 'underarm-bag',
        name: '腋下包',
        shape: 'underarm-bag',
        accent: '托特包'
      }
    }
  },
  weatherSummary: '',
  summary: '薄荷绿、麻料感、托特包',
  createdAt: 1710000000000
};

var userA = { userId: 'user-a-0001', nickName: '小糖', avatarUrl: '' };
var userB = { userId: 'user-b-0002', nickName: '小桃', avatarUrl: '' };
var userC = { userId: 'user-c-0003', nickName: '小薄荷', avatarUrl: '' };
var userD = { userId: 'user-d-0004', nickName: '小星', avatarUrl: '' };

function setupMockEnv() {
  var mockWx = createMockWx();
  global.wx = mockWx;
  return mockWx;
}

function teardownMockEnv() {
  delete global.wx;
}

// Pure function tests — no WeChat runtime needed

test('createMockUser returns valid user shape', function () {
  var user = createMockUser(1);
  assert.equal(typeof user.userId, 'string');
  assert.equal(typeof user.nickName, 'string');
  assert.equal(typeof user.avatarUrl, 'string');
  assert.ok(user.userId.length > 0);
  assert.ok(user.nickName.length > 0);
});

test('createMockUser returns different names for different indices', function () {
  var u0 = createMockUser(0);
  var u1 = createMockUser(1);
  var u2 = createMockUser(2);
  assert.notEqual(u0.nickName, u1.nickName);
  assert.notEqual(u1.nickName, u2.nickName);
});

test('generateStageId returns string with stage- prefix', function () {
  var id = generateStageId();
  assert.match(id, /^stage-\d+-[a-z0-9]+$/);
});

test('generateUserId returns string with user- prefix', function () {
  var id = generateUserId();
  assert.match(id, /^user-\d+-[a-z0-9]+$/);
});

test('isCloudAvailable returns false in Node.js', function () {
  assert.equal(isCloudAvailable(), false);
});

test('non-production defaults enable virtual besties in Node.js', function () {
  assert.equal(isProductionEnvironment(), false);
  assert.equal(shouldUseVirtualBesties(), true);
});

test('MAX_PARTICIPANTS equals 3', function () {
  assert.equal(MAX_PARTICIPANTS, 3);
});

// Mock storage integration tests

test('createStage returns stageId and stores stage in mock', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('besties', sampleOutfit, userA);
    assert.match(stageId, /^stage-/);

    var stage = await getStage(stageId);
    assert.ok(stage);
    assert.equal(stage.sceneId, 'besties');
    assert.equal(stage.participants.length, 3);
    assert.equal(stage.participants[0].nickName, '小糖');
  } finally {
    teardownMockEnv();
  }
});

test('createStage auto-populates 3 mock participants in dev mode', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('date', sampleOutfit, userA);
    var stage = await getStage(stageId);
    assert.equal(stage.participants.length, 3);
    assert.equal(stage.participants[0].nickName, '小糖');
    assert.equal(stage.participants[0].userId, userA.userId);
    assert.equal(stage.participants[1].nickName, '小桃');
    assert.equal(stage.participants[2].nickName, '小薄荷');
  } finally {
    teardownMockEnv();
  }
});

test('createStage in release mode does not auto-populate virtual besties', async function () {
  var mockWx = setupMockEnv();
  mockWx.getAccountInfoSync = function () {
    return {
      miniProgram: {
        envVersion: 'release'
      }
    };
  };

  try {
    var stageId = await createStage('date', sampleOutfit, userA);
    var stage = await getStage(stageId);
    assert.equal(isProductionEnvironment(), true);
    assert.equal(shouldUseVirtualBesties(), false);
    assert.equal(stage.participants.length, 1);
    assert.equal(stage.participants[0].userId, userA.userId);
  } finally {
    teardownMockEnv();
  }
});

test('getStage returns null for non-existent stage', async function () {
  var mockWx = setupMockEnv();
  try {
    var stage = await getStage('stage-nonexistent');
    assert.equal(stage, null);
  } finally {
    teardownMockEnv();
  }
});

test('updateMyOutfit updates participant outfit in stage', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('besties', sampleOutfit, userA);
    await updateMyOutfit(stageId, 'mock-user-1', secondOutfit);

    var stage = await getStage(stageId);
    var updated = stage.participants.find(function (p) { return p.userId === 'mock-user-1'; });
    assert.ok(updated);
    assert.equal(updated.outfit.theme.title, '薄荷奶油周末出游');
  } finally {
    teardownMockEnv();
  }
});

test('addMockParticipant cannot exceed max participants', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('cafe', sampleOutfit, userA);
    // Stage already has 3 participants from createStage mock
    await assert.rejects(
      function () { return addMockParticipant(stageId, sampleOutfit, 'cafe'); },
      /full/
    );
  } finally {
    teardownMockEnv();
  }
});

test('leaveStage removes participant from stage', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('besties', sampleOutfit, userA);
    await leaveStage(stageId, 'mock-user-1');

    var stage = await getStage(stageId);
    assert.equal(stage.participants.length, 2);
    var removed = stage.participants.find(function (p) { return p.userId === 'mock-user-1'; });
    assert.equal(removed, undefined);
  } finally {
    teardownMockEnv();
  }
});

test('leaveStage deletes stage when last participant leaves', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('exhibition', sampleOutfit, userA);
    // Remove self and the 2 virtual besties
    await leaveStage(stageId, userA.userId);
    await leaveStage(stageId, 'mock-user-1');
    await leaveStage(stageId, 'mock-user-2');

    var stage = await getStage(stageId);
    assert.equal(stage, null);
  } finally {
    teardownMockEnv();
  }
});

test('polling calls callback with stage data', async function () {
  var mockWx = setupMockEnv();
  try {
    var stageId = await createStage('date', sampleOutfit, userA);
    var callbackData = null;

    var timerId = startPolling(stageId, function (stage) {
      callbackData = stage;
    }, 100);

    // Wait for first poll
    await new Promise(function (resolve) { setTimeout(resolve, 200); });
    stopPolling(timerId);

    assert.ok(callbackData);
    assert.equal(callbackData._id, stageId);
    assert.equal(callbackData.participants.length, 3);
  } finally {
    teardownMockEnv();
  }
});
