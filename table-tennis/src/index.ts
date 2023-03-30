import env from "env-sanitize"
import {SinkProvider} from "./event-sink"
import * as Evently from "./evently/index.js"
import {runTournament} from "./table-tennis/tournament.js"

import {createRequire} from "node:module";
const require = createRequire(import.meta.url);

const PerformanceMeasure = require("performance-measure")


async function playParallelTournaments(tourneys: number) {
  const measure = new PerformanceMeasure()
  const sinkProvider = await Evently.sinkProvider(measure, tourneys)
  const plays = []
  for (let tourney = 1; tourney <= tourneys; tourney++) {
    plays.push(playTourney(sinkProvider, tourney))
  }

  await Promise.all(plays)

  console.log(measure.print())
}

async function playTourney(sinkProvider: SinkProvider, tourney: number) {
  const sink = await sinkProvider(tourney.toString())
  return runTournament(sink)
}


const tourneyCount = env("TOURNEY_COUNT", (x) => x.less(1001), 1)

playParallelTournaments(tourneyCount)
  .catch(err => console.error(err))
