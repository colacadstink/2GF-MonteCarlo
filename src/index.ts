const REPS = 10000;
const PLAYERS_PER_EVENT = 1904;
const ROUNDS = 9;
const CUT_TO_TOP = 64;
const DNF_CHANCE = 0.01;

type Event = number[];
type EventResults = Record<number, {score: number, count: number}>;

function generateEvent(): Event {
  return Array(PLAYERS_PER_EVENT).fill(0);
}

function simulateRound(event: Event): void {
  for(let i=0; i<event.length; i+=2) {
    const dnfRoll = Math.random();
    const randResult = Math.random();

    if(dnfRoll < DNF_CHANCE) {
      // Finished only one game!
      if(randResult < 0.5) {
        // 50% chance of 3-0
        event[i] += 3;
      } else {
        // 50% chance of 0-3
        event[i+1] += 3;
      }
      continue;
    }

    if(randResult < 0.5) {
      // 50% chance of 3-3
      event[i] += 3;
      event[i+1] += 3;
    } else if (randResult < 0.75) {
      // 25% chance of 7-0
      event[i] += 7;
    } else {
      // 25% chance of 0-7
      event[i+1] += 7;
    }
  }
  event.sort((a, b) => b-a);
}

function simulateEvent(): Event {
  const event = generateEvent();
  for(let i=0; i<ROUNDS; i++) {
    simulateRound(event);
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
  let lastPointsIn = -1;
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
