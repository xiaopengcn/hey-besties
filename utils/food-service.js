var foodData = require('../data/food');

function normalizeSeed(seed) {
  if (typeof seed === 'number' && seed >= 0) {
    return seed % 1;
  }
  return Math.random();
}

function shuffleWithSeed(array, seed) {
  var result = array.slice();
  var s = seed;
  for (var i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    var j = Math.floor((s / 2147483647) * (i + 1));
    var tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

function generateOptions(participantName, seed, offset) {
  var pool = foodData.pools[participantName];
  if (!pool) {
    return [];
  }
  var shuffled = shuffleWithSeed(pool.options, seed + offset);
  return shuffled.slice(0, 3).map(function (opt, index) {
    return {
      id: opt.id + '-' + Math.round((seed + offset + index * 0.1) * 10000),
      name: opt.name,
      emoji: opt.emoji || '',
      tags: opt.tags || [],
      votes: 0,
      participantId: participantName
    };
  });
}

function generateSessionId() {
  return 'food-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function createFoodSession(seedInput) {
  var seed = normalizeSeed(seedInput);
  var sessionId = generateSessionId();
  var participants = foodData.participantNames.map(function (name, index) {
    return {
      name: name,
      options: generateOptions(name, seed, index * 0.33),
      votedFor: []
    };
  });

  return {
    sessionId: sessionId,
    participants: participants,
    round: 1,
    phase: 'voting',
    userVotes: {},
    history: [],
    seed: seed,
    createdAt: Date.now()
  };
}

function getVoteOptions(session) {
  var allOptions = [];
  session.participants.forEach(function (p) {
    p.options.forEach(function (opt) {
      allOptions.push(Object.assign({}, opt, { participantId: p.name }));
    });
  });
  return allOptions;
}

function castVote(session, optionId, userName) {
  if (!session.userVotes[userName]) {
    session.userVotes[userName] = [];
  }

  // Allow up to 3 votes per user
  if (session.userVotes[userName].length >= 3) {
    return;
  }

  // Don't double-vote the same option
  if (session.userVotes[userName].indexOf(optionId) >= 0) {
    return;
  }

  session.userVotes[userName].push(optionId);
  session.history.push({ action: 'vote', user: userName, optionId: optionId, time: Date.now() });

  // Increment vote count on the option
  session.participants.forEach(function (p) {
    p.options.forEach(function (opt) {
      if (opt.id === optionId) {
        opt.votes = (opt.votes || 0) + 1;
      }
    });
  });
}

function advanceRound(session) {
  var allOptions = [];
  session.participants.forEach(function (p) {
    p.options.forEach(function (opt) {
      allOptions.push({
        id: opt.id,
        name: opt.name,
        emoji: opt.emoji || '',
        tags: opt.tags || [],
        votes: opt.votes,
        participantId: p.name
      });
    });
  });

  // Sort by votes descending
  allOptions.sort(function (a, b) { return b.votes - a.votes; });

  // Top half advance, minimum 3
  var advanceCount = Math.max(3, Math.ceil(allOptions.length / 2));
  var advancing = allOptions.slice(0, advanceCount);

  // If it's round 2 advancing, go to decision phase
  var nextRound = session.round + 1;
  var isDecision = nextRound >= 3;

  var nextSession = {
    sessionId: session.sessionId,
    participants: [
      {
        name: '精选池',
        options: advancing.map(function (o) {
          return {
            id: o.id,
            name: o.name,
            emoji: o.emoji || '',
            tags: o.tags || [],
            votes: 0,
            participantId: o.participantId
          };
        })
      }
    ],
    round: nextRound,
    phase: isDecision ? 'decision' : 'voting',
    userVotes: {},
    history: session.history.slice(),
    seed: session.seed,
    createdAt: session.createdAt
  };

  return nextSession;
}

function pickRandom(source, seedInput) {
  var seed = normalizeSeed(seedInput);
  var isSession = source && source.participants && !Array.isArray(source);
  var options;

  if (isSession) {
    options = getVoteOptions(source);
  } else if (Array.isArray(source)) {
    options = source;
  } else {
    return null;
  }

  if (!options || options.length === 0) {
    return null;
  }

  var index = Math.floor(seed * options.length) % options.length;
  var selected = options[index];

  // When called with an array, return the option directly
  if (Array.isArray(source)) {
    return selected;
  }

  // When called with a session, return enriched result
  return {
    selected: {
      id: selected.id,
      name: selected.name,
      emoji: selected.emoji || '',
      tags: selected.tags || []
    },
    method: 'random',
    fromOptions: options.length,
    seed: seed
  };
}

function getSessionState(session) {
  var allOptions = getVoteOptions(session);
  return {
    sessionId: session.sessionId,
    round: session.round,
    phase: session.phase,
    participants: session.participants.map(function (p) { return { name: p.name, optionCount: p.options.length }; }),
    totalOptions: allOptions.length,
    userVotes: session.userVotes,
    isFinal: session.phase === 'decision',
    historyLength: session.history.length
  };
}

function getRandomSequence(optionIds, seedInput, finalId) {
  var seed = normalizeSeed(seedInput);
  var ids = optionIds.slice();
  if (ids.length === 0) {
    return [];
  }

  // Build a deterministic pseudo-random sequence of option ids for the
  // rolling highlight. The last step can be pinned to the final winner
  // so the motion and result feel like one continuous draw.
  var s = seed * 2147483647;
  s = (s * 16807 + 0) % 2147483647;
  var length = 10 + Math.floor((s / 2147483647) * 7);

  var sequence = [];
  var previousId = null;
  for (var i = 0; i < length; i++) {
    s = (s * 16807 + 0) % 2147483647;
    var index = Math.floor((s / 2147483647) * ids.length) % ids.length;
    var nextId = ids[index];

    if (ids.length > 1 && nextId === previousId) {
      nextId = ids[(index + 1) % ids.length];
    }

    sequence.push(nextId);
    previousId = nextId;
  }

  if (finalId && ids.indexOf(finalId) >= 0) {
    sequence[sequence.length - 1] = finalId;
  }

  return sequence;
}

module.exports = {
  createFoodSession: createFoodSession,
  getVoteOptions: getVoteOptions,
  castVote: castVote,
  advanceRound: advanceRound,
  pickRandom: pickRandom,
  getSessionState: getSessionState,
  getRandomSequence: getRandomSequence
};
