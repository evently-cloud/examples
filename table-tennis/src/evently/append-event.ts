import {createId} from "@paralleldrive/cuid2"
import {BaseEvent} from "../types"
import {AppendResult, Result, Selector} from "./evently-client.js"
import {SendToEvently} from "./index"


interface EventlyEvent {
  entity:   string
  key:      string
  event:    string
  meta: {
    actor:  string
    cause:  string
  }
  data:     object
}


export function appendAtomicEvent(sender:   SendToEvently,
                                  evt:      BaseEvent,
                                  selector: Selector): Promise<AppendResult> {
  const {
    entity: {
      name: entity,
      key
    },
    event,
    ...data
  } = evt

  const eventToSend = {
    entity,
    key,
    event,
    data,
    selector
  } as unknown as EventlyEvent

  return appendEvent(sender, eventToSend, "atomic")
}


export function appendSerialEvent(sender:           SendToEvently,
                                  evt:              BaseEvent,
                                  previousEventId:  string): Promise<AppendResult> {
  const {
    entity: {
      name: entity,
      key
    },
    event,
    ...data
  } = evt

  const eventToSend = {
    entity,
    key,
    event,
    data,
    previousEventId
  } as unknown as EventlyEvent

  return appendEvent(sender, eventToSend, "serial")
}


async function appendEvent(sender:      SendToEvently,
                           evt:         EventlyEvent,
                           appendType:  string): Promise<AppendResult> {
  const eventToSend = {
    ...evt,
    meta: {
      cause:  createId(),
      actor:  "example"
    }
  }
  const path = `/append/${appendType}`

  const response = await sender({
    path,
    method: "POST",
    body:   JSON.stringify(eventToSend)
  })

  const {statusCode, body} = response

  const eventlyResponse = await body.json()

  if (statusCode == 201) {
    return {
      status:  Result.SUCCESS,
      message: eventlyResponse.eventId
    }
  }

  console.warn(`${statusCode}: ${JSON.stringify(body)} for ${path}`)

  if (statusCode == 409) {
    return {
      status:   Result.RACE,
      message: eventlyResponse
    }
  }

  return {
    status:   Result.ERROR,
    message: `append-event http status: ${statusCode}, result: ${JSON.stringify(eventlyResponse)}`
  }
}
