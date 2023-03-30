import env from "env-sanitize"
import {Dispatcher} from "undici"

import {EventSink, SinkProvider} from "../event-sink"
import {BaseEntity} from "../types"
import {appendAtomicEvent, appendSerialEvent} from "./append-event.js"
import {createEventlyConnection} from "./connect-evently.js"
import {EventlyClient, Result, Selector} from "./evently-client.js"
import {registerAllEvents} from "./register-events.js"
import {filterEvents, replayEvents} from "./select-events.js"


const online = env("EVENTLY_ONLINE", (x) => x.asBoolean(), false)


export async function sinkProvider(measure: any, tourneyCount: number): Promise<SinkProvider> {
  const evently = await eventlyClient(tourneyCount)
  return (shard) => initSink(measure, evently, shard)
}

function entityCacheKey({name,key}: BaseEntity): string {
  return `${name}*${key}`
}

async function initSink(measure: any, evently: EventlyClient, shard: string): Promise<EventSink> {
  const previousEventIdMap = new Map<string, string>()
  const selectorMap = new Map<string, Selector>()
  const replayTag = `select(${shard})`
  const appendTag = `append(${shard})`

  return async (event, unique) => {
    const entityKey = entityCacheKey(event.entity)
    measure.start(replayTag)
    try {
      let selectorQuery;
      if (unique) {
        const {entity, event: eventName} = event
        selectorQuery = {
          data: {
            [entity.name]: {
             [eventName]: unique
            }
          }
        } as object
      } else {
        selectorQuery = event.entity
      }

      const {events, ...selector} = unique
        ? await evently.filterEvents(selectorQuery as object)
        : await evently.replayEvents(selectorQuery as BaseEntity)

      selectorMap.set(entityKey, selector)

      if (events.length) {
        const lastEventId = events[events.length - 1].eventId
        previousEventIdMap.set(entityKey, lastEventId)
      }
    } finally {
      measure.end(replayTag)
    }

    measure.start(appendTag)
    let result
    try {
      const previousEventId = previousEventIdMap.get(entityKey)
      if (previousEventId) {
        result = await evently.appendSerialEvent(event, previousEventId)
      } else {
        const selector = selectorMap.get(entityKey)
        if (selector) {
          result = await evently.appendSelectorEvent(event, selector)
        } else {
          throw new Error(`no selectorId for ${entityKey}`)
        }
      }
    } finally {
      measure.end(appendTag)
      if (online && result?.status === Result.SUCCESS) {
        console.info("Appended %s/%s  ⤎ eventId: %s", event.entity.name, event.event, result.message)
      }
    }
  }
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

  await registerAllEvents(sender)

  await maybeResetLedger(sender)

  return {
    replayEvents:        (e) => replayEvents(sender, e),
    filterEvents:        (d) => filterEvents(sender, d),
    appendSerialEvent:   (e, p) => appendSerialEvent(sender, e, p),
    appendSelectorEvent: (e, s) => appendAtomicEvent(sender, e, s)
  }
}


export type SendToEvently = (request: Dispatcher.DispatchOptions) => Promise<Dispatcher.ResponseData>


function maybeResetLedger(sender: SendToEvently) {
  const shouldReset = env("EVENTLY_RESET_LEDGER", (x) => x.asBoolean(), false)
  if (shouldReset) {
    return sender({
      path:   "/ledgers/reset",
      method: "POST",
      body:   "{}"
    })
  }
}
