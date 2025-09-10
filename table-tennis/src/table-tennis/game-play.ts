import {EventSink} from "../event-sink"
import {GameCompleted, GameEntity, GameStarted, MatchEntity, PlayerEntity} from "./events.js"
import {playRally} from "./rally-play.js"
import {Game, oppositePlayer, Player} from "./table-tennis.js"


export async function playGame(eventSink:   EventSink,
                               match:       MatchEntity,
                               gameNumber:  number,
                               players:     [PlayerEntity, PlayerEntity],
                               server:      Player): Promise<Game> {

  const game = new GameEntity(`${match.key}_${gameNumber}`)
  await eventSink(new GameStarted(game, match))

  // play a rally
  const score = [0, 0]
  let rallyCount = 0

  while (true) {
    const rally = await playRally(eventSink, game, server)
    rallyCount++

    // track score
    score[rally.winner]++
    const winner = maybeWinner(score)
    if (winner && Player[winner]) {
      await eventSink(new GameCompleted(game, players[winner]))
      return {
        winner
      }
    }

    // switch server every 2 rallies, or every other rally if both players have 10 points or more
    if (rallyCount % 2 === 0
        || score.every(s => s >= 10)) {
      server = oppositePlayer(server)
    }
  }
}

/*
  A game shall be won by the player or pair first scoring 11 points unless both players score 10 points,
  when the game shall be won by the first player subsequently gaining a lead of 2 points.
 */
function maybeWinner([p1, p2]: number[]): Player | void {
  if (p1 >= 10 && p2 >= 10) {
    const lead = Math.abs(p1 - p2)

    if (lead >= 2) {
      return p1 > p2
        ? Player.ONE
        : Player.TWO
    }
  } else if (p1 > 10) {
    return Player.ONE
  } else if (p2 > 10) {
    return Player.TWO
  }
}
