import env from "env-sanitize"
import {Dispatcher} from "undici"

import {EventSink, SinkProvider} from "../event-sink"
import {
  BallOut,
  BallReturned,
  BallServed,
  GameCompleted,
  GameStarted,
  MatchCompleted,
  MatchStarted, PlayerRegistered, TournamentCompleted, TournamentCreated
} from "../table-tennis/events"
import {BaseEntity, BaseEvent, JsonpathQuery} from "../types"
import {appendAtomicEvent} from "./append-event.js"
import {createEventlyConnection} from "./connect-evently.js"
import {EventlyClient, Result, SelectorResponse} from "./evently-client.js"
import {registerAllEvents} from "./register-events.js"
import {filterEvents, replayEvents} from "./select-events.js"


const online = env("EVENTLY_ONLINE", (x) => x.asBoolean(), false)


export async function sinkProvider(measure: any, tourneyCount: number): Promise<SinkProvider> {
  const evently = await eventlyClient(tourneyCount)
  return (shard) => initSink(measure, evently, shard)
}


async function initSink(measure: any, evently: EventlyClient, shard: string): Promise<EventSink> {
  const selectTag = `select(${shard})`
  const appendTag = `append(${shard})`


  return async (event, atomic) => {
    measure.start(selectTag)

    const replayPromise = atomic
      ? simulateFilterReplay(evently, event, atomic)
      : simulateEntitiesReplay(evently, event)

    const replayResult = await replayPromise
      .finally(() => measure.end(selectTag))

    measure.start(appendTag)

    const {status, message} = await handleAppendAtomicEvent(evently, event, replayResult)
      .finally(() => measure.end(appendTag))


    if (online && status === Result.SUCCESS) {
      console.info("Appended %s  ⤎ eventId: %s", event.constructor.name, message)
    }
  }
}


// simulate replay events for a write model. In a real CQRS app, these events
// would be folded into a data structure for the command to evaluate before appending.

async function simulateFilterReplay(evently: EventlyClient, event: BaseEvent, atomic: JsonpathQuery) {
  const query = {
    [event.constructor.name]: atomic
  }
  return evently.filterEvents(query)
}


async function simulateEntitiesReplay(evently: EventlyClient, event: BaseEvent) {
  const entities = entityArrayToRecord(event.entities)
  return evently.replayEvents(entities)
}


async function handleAppendAtomicEvent(evently: EventlyClient, evt: BaseEvent, replayResult: SelectorResponse) {
  const {events, selector: selectorIn} = replayResult
  const selector = {
    ...selectorIn,
    after: events.at(-1)?.eventId
  }
  const entities = entityArrayToRecord(evt.entities)
  const data = Object.getOwnPropertyNames(evt).reduce((acc, prop) => {
    // @ts-ignore
    acc[prop] = evt[prop]
    return acc
  }, {} as Record<string, unknown>)

  const event = {
    event: evt.constructor.name,
    entities,
    data,
    selector
  }

  return evently.appendEvent(event)
}

function entityArrayToRecord(entities: BaseEntity[]): Record<string, string[]> {
  return entities.reduce((acc, {constructor: {name}, key}) => ({
    ...acc,
    [name]: [...(acc[name] ?? []), key],
  }), {} as Record<string, string[]>)
}



let evently: EventlyClient
async function eventlyClient(poolSize: number): Promise<EventlyClient> {
  if (!evently) {
    evently = await initEvently(poolSize)
  }
  return evently
}


async function initEvently(poolSize: number): Promise<EventlyClient> {
  const sender = createEventlyConnection(poolSize)
  // this assumes the ledger has been created
  await maybeResetLedger(sender)

  await registerAllEvents(sender,
    PlayerRegistered,
    TournamentCreated,
    TournamentCompleted,
    MatchStarted,
    MatchCompleted,
    GameStarted,
    GameCompleted,
    BallServed,
    BallOut,
    BallReturned
  )

  return {
    replayEvents: (e) => replayEvents(sender, e),
    filterEvents: (d) => filterEvents(sender, d),
    appendEvent:  (e) => appendAtomicEvent(sender, e)
  }
}


export type SendToEvently = (request: Dispatcher.DispatchOptions) => Promise<Dispatcher.ResponseData>


function maybeResetLedger(sender: SendToEvently) {
  const shouldReset = env("EVENTLY_RESET_LEDGER", (x) => x.asBoolean(), false)
  if (shouldReset) {
    const ledgerId = env("EVENTLY_LEDGER_ID", "no-ledger_id-provided")
    return sender({
      path:   `/ledgers/${ledgerId}/reset`,
      method: "POST",
      body:   "{}"
    })
  }
}
