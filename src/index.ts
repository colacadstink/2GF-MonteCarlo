const REPS = 10_000;
const PLAYERS_PER_EVENT = 1904;
const ROUNDS = 9;
const CUT_TO_TOP = 64;

const DNF_CHANCE = 0.009;
const SPLIT_MATCH_CHANCE = 0.425;
// const TWO_OH_CHANCE = 1 - DNF_CHANCE - SPLIT_MATCH_CHANCE;
// TWO_OH_CHANCE + DNF_CHANCE = 0.5878

const GAME_WIN_POINTS = 3;
const TWO_OH_POINTS = 7;

const DRAW_PERCENT_TABLE: Record<number, number> = {
  6: 0.004,
  7: 0.013,
  8: 0.020,
};

type Event = number[];
type EventResults = Record<number, {score: number, count: number}>;

function generateEvent(): Event {
  return Array(PLAYERS_PER_EVENT).fill(0);
}

function simulateRound(event: Event, roundNumber: number): void {
  const drawCount = (DRAW_PERCENT_TABLE[roundNumber] ?? 0) * event.length;

  for(let i=0; i<event.length; i+=2) {
    if(i+1 <= drawCount) {
      // console.log(event[i], event[i+1]);
      event[i] += GAME_WIN_POINTS;
      event[i+1] += GAME_WIN_POINTS;
      continue;
    }

    const randResult = Math.random();
    const coinFlip = Math.random() > 0.5;

    if(randResult < DNF_CHANCE) {
      // Finished only one game!
      if(coinFlip) {
        event[i] += GAME_WIN_POINTS;
      } else {
        event[i+1] += GAME_WIN_POINTS;
      }
    } else if(randResult < DNF_CHANCE + SPLIT_MATCH_CHANCE) {
      // 3-3
      event[i] += GAME_WIN_POINTS;
      event[i+1] += GAME_WIN_POINTS;
    } else {
      // 7-0
      if(coinFlip) {
        event[i] += TWO_OH_POINTS;
      } else {
        event[i+1] += TWO_OH_POINTS;
      }
    }
  }
  event.sort((a, b) => b-a);
}

function simulateEvent(): Event {
  const event = generateEvent();
  for(let i=0; i<ROUNDS; i++) {
    simulateRound(event, i);
  }
  return event;
}

function bucketResults(event: Event): EventResults {
  const results: EventResults = {};
  for(const player of event) {
    if(!results[player]) {
      results[player] = {
        score: player,
        count: 0,
      };
    }
    results[player].count++;
  }

  return results;
}

function getTopCut(results: EventResults) {
  const sortedBuckets = Object.values(results).sort((a, b) => b.score - a.score);
  let playersIn = sortedBuckets[0].count;
  let lastPointsIn = sortedBuckets[0].score;
  let i = 0;
  while(playersIn < CUT_TO_TOP) {
    lastPointsIn = sortedBuckets[i].score;
    i++;
    playersIn += sortedBuckets[i].count;
  }
  return lastPointsIn;
}

const topCutCounts: Record<number, number> = {};
for(let i=0; i<REPS; i++) {
  const event = simulateEvent();
  const results = bucketResults(event);
  const topCut = getTopCut(results);
  if(!topCutCounts[topCut]) {
    topCutCounts[topCut] = 0;
  }
  topCutCounts[topCut]++;
}

let curChance = 0;
const topCutChances: Record<number, number> = {};
for(const entry of Object.entries(topCutCounts).sort((a,b) => {
  return Number(a[0]) - Number(b[0]);
})) {
  curChance += entry[1];
  topCutChances[Number(entry[0])] = (curChance / REPS);
}

console.log(topCutChances);
