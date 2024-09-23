const REPS = 10000;
const PLAYERS_PER_EVENT = 2048;
const ROUNDS = 9;
const CUT_TO_TOP = 64;

type Event = number[];
type EventResults = Record<number, {score: number, count: number}>;

function generate_event(): Event {
  return Array(PLAYERS_PER_EVENT).fill(0);
}

function simulate_round(event: Event): void {
  for(let i=0; i<event.length; i+=2) {
    const randResult = Math.random();
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
  const start = Date.now();
  const event = generate_event();
  for(let i=0; i<ROUNDS; i++) {
    simulate_round(event);
  }
  const end = Date.now();
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

console.log(topCutCounts);
