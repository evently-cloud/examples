import env from "env-sanitize"

import {SinkProvider} from "./event-sink.ts"
import * as Evently from "./evently/index.ts"
import {PerformanceMeasure} from "./performance-measure.ts"
import {runTournament} from "./table-tennis/tournament.ts"


async function playParallelTournaments(tourneys: number) {
  const measure = new PerformanceMeasure()
  const sinkProvider = await Evently.sinkProvider(measure, tourneys)
  const plays = []
  for (let tourney = 1; tourney <= tourneys; tourney++) {
    plays.push(playTourney(sinkProvider, tourney))
  }

  await Promise.all(plays)

  measure.print()
}

async function playTourney(sinkProvider: SinkProvider, tourney: number) {
  const sink = await sinkProvider(tourney.toString())
  return runTournament(sink)
}


const tourneyCount = env("TOURNEY_COUNT", (x) => x.less(1001), 1)

playParallelTournaments(tourneyCount)
  .catch(err => console.error(err))
