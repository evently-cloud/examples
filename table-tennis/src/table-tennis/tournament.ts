

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
import {PlayerEntity, TournamentCompleted, TournamentCreated, TournamentEntity} from "./events.js"
import {playMatch} from "./match-play.js"
import {registerPlayer} from "./player-registration.js"
import {chance, keyify, Match} from "./table-tennis.js"

const kinds = ["Open", "Invitational", "Championship", "Games", "Tournament"]

export async function runTournament(eventSink: EventSink): Promise<void> {
  const tourneyName = `${chance.city()} ${chance.company()} ${chance.year({min: 1900, max: 2100})} ${chance.pickone(kinds)}`
  console.log(`starting ${tourneyName}, registering players...`)

  // can't Promise.all() with benchmarks.
  const players: PlayerEntity[] = []
  for (let p = 0; p < 16; p++) {
    const key = await registerPlayer(eventSink, chance.name(), chance.country())
    players.push(key)
  }

  // shuffle players
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * players.length);
    [players[i], players[j]] = [players[j], players[i]];
  }

  const tournamentKey = keyify(tourneyName)
  console.log(`Tournament key: ${tournamentKey}`)
  const tournament: TournamentEntity = new TournamentEntity(tournamentKey)
  await eventSink(new TournamentCreated(tourneyName, tournament, players))

  let matchNumber = 1
  while (players.length > 1) {
    const matches: Match[] = []
    for (let p = 0; p < players.length; p += 2) {
      matches.push({players: [players[p], players[p + 1]]})
    }

    // can't Promise.all() with benchmarks.
    players.length = 0
    for (let match of matches) {
      const w = await playMatch(eventSink, match, tournament, matchNumber++)
      players.push(w)
    }
  }

  // last player is the winner
  await eventSink(new TournamentCompleted(tournament, players[0]))
}
