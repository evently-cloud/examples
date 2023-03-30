import {EventSink} from "../event-sink"
import {BallOut, BallReturned, BallServed, GameEntity} from "./events.js"
import {chance, oppositePlayer, Player, Rally} from "./table-tennis.js"


export async function playRally(eventSink:  EventSink,
                                game:       GameEntity,
                                server:     Player): Promise<Rally> {

  const serveEvent = serveBall(game, server)
  await eventSink(serveEvent)

  const receiver = oppositePlayer(server)
  const rally = {winner: receiver, receiver}
  return serveEvent instanceof BallOut
    ? rally
    : rallyReturn(eventSink, game, rally)
}

async function rallyReturn(eventSink: EventSink,
                           game:      GameEntity,
                           rally:     Rally): Promise<Rally> {
  const rallyEvent = returnBall(game, rally.receiver)
  await eventSink(rallyEvent)

  const nextReceiver = oppositePlayer(rally.receiver)
  const nextRally = {winner: nextReceiver, receiver: nextReceiver}
  return (rallyEvent instanceof BallOut)
    ? nextRally
    : rallyReturn(eventSink, game, nextRally)
}

function serveBall(game:    GameEntity,
                   server:  Player): BallServed | BallOut {
  return chance.bool({likelihood: 60})
    ? new BallServed(game, server)
    : new BallOut(game, server)
}

function returnBall(game:   GameEntity,
                    player: Player): BallReturned | BallOut {
  return chance.bool({likelihood: 50})
    ? new BallReturned(game, player)
    : new BallOut(game, player)
}

