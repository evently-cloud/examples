import {EventSink} from "../event-sink"
import {MatchCompleted, MatchEntity, MatchStarted, PlayerEntity, TournamentEntity} from "./events.js"
import {playGame} from "./game-play.js"
import {chance, Match, oppositePlayer, Player} from "./table-tennis.js"


export async function playMatch(eventSink:    EventSink,
                                match:        Match,
                                tournament:   TournamentEntity,
                                matchNumber:  number): Promise<PlayerEntity> {
  // using " to test NOTIFY parser
  const matchEntity = new MatchEntity(`${tournament.key}"${matchNumber}`)
  const [player1, player2] = match.players

  console.info(`starting match ${matchNumber}, ${player1.key} vs. ${player2.key}`)

  // What I don't like is the uncertainty about player1 vs player2 data. should it be their key, or name?
  await eventSink(new MatchStarted(player1.key, player2.key, matchEntity, tournament, [player1, player2]))

  // pick a starting server
  let server = chance.bool()
    ? Player.ONE
    : Player.TWO

  let gameNumber = 1
  const wins = [0, 0]

  while (gameNumber <= 3 || Math.abs(wins[0] - wins[1]) < 2) {
    const game = await playGame(eventSink, matchEntity, gameNumber++, [player1, player2], server)
    wins[game.winner]++
    console.info(`    Game ${gameNumber - 1} won by ${match.players[game.winner]}`)
    server = oppositePlayer(server)
  }

  const winner = wins[Player.ONE] > wins[Player.TWO] ? Player.ONE : Player.TWO
  const winnerKey = match.players[winner]

  await eventSink(new MatchCompleted(matchEntity, winnerKey))

  console.info(`(${matchEntity.key}) Winner: ${winnerKey} ${wins[Player.ONE]} to ${wins[Player.TWO]}`)
  return winnerKey
}

