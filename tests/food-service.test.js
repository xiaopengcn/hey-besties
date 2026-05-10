const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createFoodSession,
  getVoteOptions,
  castVote,
  advanceRound,
  pickRandom,
  getSessionState
} = require('../utils/food-service');

test('food session creates with 3 participants each having 3 options', () => {
  const session = createFoodSession(0.42);

  assert.ok(session.sessionId);
  assert.match(session.sessionId, /^food-/);
  assert.equal(session.participants.length, 3);
  assert.equal(session.round, 1);
  assert.equal(session.phase, 'voting');

  const names = session.participants.map(function (p) { return p.name; });
  assert.ok(names.includes('我'));
  assert.ok(names.includes('小桃'));
  assert.ok(names.includes('小薄荷'));

  session.participants.forEach(function (p) {
    assert.equal(p.options.length, 3);
    p.options.forEach(function (opt) {
      assert.ok(opt.id);
      assert.ok(opt.name);
      assert.ok(opt.votes >= 0);
    });
  });
});

test('all food options across participants are distinct', () => {
  const session = createFoodSession(0.5);
  const allNames = [];
  session.participants.forEach(function (p) {
    p.options.forEach(function (opt) {
      allNames.push(opt.name);
    });
  });
  // There should be 9 distinct food options
  const unique = allNames.filter(function (v, i, a) { return a.indexOf(v) === i; });
  assert.equal(unique.length, 9);
});

test('getVoteOptions returns current round options', () => {
  const session = createFoodSession(0.3);
  const options = getVoteOptions(session);

  assert.ok(options.length >= 9);
  options.forEach(function (opt) {
    assert.ok(opt.id);
    assert.ok(opt.name);
    assert.ok(opt.participantId);
    assert.ok(opt.votes >= 0);
  });
});

test('castVote increments vote count and records voter', () => {
  const session = createFoodSession(0.5);
  const options = getVoteOptions(session);
  const target = options[0];

  castVote(session, target.id, '我');
  const updated = getVoteOptions(session);
  const voted = updated.find(function (o) { return o.id === target.id; });
  assert.equal(voted.votes, 1);

  const state = getSessionState(session);
  assert.equal(state.userVotes['我'].length, 1);
});

test('castVote allows voting for up to 3 options', () => {
  const session = createFoodSession(0.5);
  const options = getVoteOptions(session);

  castVote(session, options[0].id, '我');
  castVote(session, options[1].id, '我');
  castVote(session, options[2].id, '我');

  const state = getSessionState(session);
  assert.equal(state.userVotes['我'].length, 3);
});

test('advanceRound moves top options to next round', () => {
  const session = createFoodSession(0.5);
  const options = getVoteOptions(session);

  // Give distinct vote counts
  castVote(session, options[0].id, '我');
  castVote(session, options[0].id, '小桃');
  castVote(session, options[0].id, '小薄荷');

  castVote(session, options[1].id, '我');
  castVote(session, options[1].id, '小桃');

  castVote(session, options[2].id, '我');

  castVote(session, options[3].id, '小桃');

  const next = advanceRound(session);
  assert.equal(next.round, 2);
  assert.equal(next.phase, 'voting');

  // Top options should advance (at least the top voted ones)
  const nextOptions = getVoteOptions(next);
  assert.ok(nextOptions.length <= options.length);
  assert.ok(nextOptions.length >= 3);
});

test('advanceRound to final round enters decision phase', () => {
  const session = createFoodSession(0.5);
  const options = getVoteOptions(session);

  // Vote heavily for specific options
  castVote(session, options[0].id, '我');
  castVote(session, options[0].id, '小桃');
  castVote(session, options[0].id, '小薄荷');

  castVote(session, options[1].id, '我');
  castVote(session, options[1].id, '小桃');

  castVote(session, options[2].id, '小薄荷');

  const round2 = advanceRound(session);

  // Vote again in round 2
  const round2Options = getVoteOptions(round2);
  round2Options.forEach(function (opt) {
    castVote(round2, opt.id, '我');
  });

  const round3 = advanceRound(round2);
  assert.equal(round3.round, 3);
  assert.equal(round3.phase, 'decision');
});

test('pickRandom with seed deterministically selects an option', () => {
  const session = createFoodSession(0.5);
  const options = getVoteOptions(session);

  // Same seed should always pick same option
  const pick1 = pickRandom(options, 0.7);
  const pick2 = pickRandom(options, 0.7);
  assert.equal(pick1.id, pick2.id);
  assert.equal(pick1.name, pick2.name);

  // Different seed picks potentially different
  const pick3 = pickRandom(options, 0.1);
  // It's fine if it matches by coincidence; just check it's a valid option
  assert.ok(options.some(function (o) { return o.id === pick3.id; }));
});

test('pickRandom also works on a food session directly', () => {
  const session = createFoodSession(0.5);
  const result = pickRandom(session, 0.7);

  assert.ok(result.selected);
  assert.ok(result.selected.id);
  assert.ok(result.selected.name);
  assert.equal(result.method, 'random');
});

test('getSessionState returns correct summary', () => {
  const session = createFoodSession(0.5);
  const state = getSessionState(session);

  assert.equal(state.round, 1);
  assert.equal(state.phase, 'voting');
  assert.equal(state.participants.length, 3);
  assert.equal(state.totalOptions, 9);
  assert.ok(typeof state.userVotes === 'object');
  assert.equal(state.isFinal, false);
});

test('getRandomSequence produces deterministic rolling highlight ids', () => {
  const {
    getRandomSequence
  } = require('../utils/food-service');

  // With a fixed seed and a known list of option ids, the sequence should be deterministic
  const optionIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  const seq1 = getRandomSequence(optionIds, 0.5);
  const seq2 = getRandomSequence(optionIds, 0.5);

  // Same input produces identical sequence
  assert.deepEqual(seq1, seq2);

  // Sequence length is at least 8 (feels like a real roll)
  assert.ok(seq1.length >= 8);

  // Every element in the sequence is a valid option id
  seq1.forEach(function (id) {
    assert.ok(optionIds.includes(id));
  });

  // Last element is the "final pick"
  const finalPick = seq1[seq1.length - 1];
  assert.ok(optionIds.includes(finalPick));

  // Different seed produces different sequence
  const seq3 = getRandomSequence(optionIds, 0.1);
  const allSame = seq1.every(function (id, i) { return id === seq3[i]; });
  assert.equal(allSame, false);
});

test('getRandomSequence works with real food session option ids', () => {
  const {
    createFoodSession,
    getVoteOptions,
    getRandomSequence
  } = require('../utils/food-service');

  const session = createFoodSession(0.42);
  const options = getVoteOptions(session);
  const ids = options.map(function (o) { return o.id; });

  const sequence = getRandomSequence(ids, 0.7);
  assert.ok(sequence.length >= 8);
  assert.ok(sequence.length <= 20);

  // Every id in the sequence should be a real option id
  sequence.forEach(function (id) {
    assert.ok(ids.includes(id));
  });

  // Last element should be a valid option id
  assert.ok(ids.includes(sequence[sequence.length - 1]));
});

test('different seeds produce different food options', () => {
  const session1 = createFoodSession(0.1);
  const session2 = createFoodSession(0.9);

  const names1 = getVoteOptions(session1).map(function (o) { return o.name; });
  const names2 = getVoteOptions(session2).map(function (o) { return o.name; });

  // At least some options should differ
  const allSame = names1.every(function (n, i) { return n === names2[i]; });
  assert.equal(allSame, false);
});
