

/*
  data model: https://www.npmjs.com/package/rebracket

  32 players, single elimination

  Round 1 (32)
  Round 2 (16)
  Quarterfinals (8)
  Semifinals (4)
  Final (2)

  Match # will indicate what round it's in

  Matches 1-16 are Round 1
  Matches 17-25 are Round 2
  Matches 26-30 are Quarterfinals
  Matches 31 & 32 are Semifinals
  Match 33 is the Final
 */

import {EventSink} from "../event-sink"
import {TournamentCompleted, TournamentCreated, TournamentEntity} from "./events.js"
import {playMatch} from "./match-play.js"
import {registerPlayer} from "./player-registration.js"
import {chance, keyify, Match} from "./table-tennis.js"

const kinds = ["Open", "Invitational", "Championship", "Games", "Tournament"]

export async function runTournament(eventSink: EventSink): Promise<void> {
  const tourneyName = `${chance.city()} ${chance.company()} ${chance.year({min: 1900, max: 2100})} ${chance.pickone(kinds)}`
  console.log(`starting ${tourneyName}, registering players...`)

  // can't Promise.all() with benchmarks.
  const playerKeys = []
  for (let p = 0; p < 16; p++) {
    const key = await registerPlayer(eventSink, chance.name(), chance.country())
    playerKeys.push(key)
  }

  const tourneyKey = keyify(tourneyName)
  console.log(`Tournament key: ${tourneyKey}`)
  const entity: TournamentEntity = new TournamentEntity(tourneyKey)
  await eventSink(new TournamentCreated(entity, tourneyName, playerKeys))

  let matchNumber = 1
  while (playerKeys.length > 1) {
    const matches: Match[] = []
    for (let p = 0; p < playerKeys.length; p += 2) {
      matches.push({players: [playerKeys[p], playerKeys[p + 1]]})
    }

    // can't Promise.all() with benchmarks.
    playerKeys.length = 0
    for (let match of matches) {
      const w = await playMatch(eventSink, match, tourneyKey, matchNumber++)
      playerKeys.push(w)
    }
  }

  // last player is the winner
  await eventSink(new TournamentCompleted(entity, playerKeys[0]))
}
