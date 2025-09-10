import {createId} from "@paralleldrive/cuid2"
import {AppendableEvent} from "../types"
import {AppendResult, Result} from "./evently-client.js"
import {SendToEvently} from "./index"


export async function appendAtomicEvent(sender:   SendToEvently,
                                        event:    AppendableEvent): Promise<AppendResult> {
  const eventToSend = {
    ...event,
    meta: {
      ...event.meta,
      cause:  createId(),
      actor:  "example"
    }
  }

  const response = await sender({
    path:   "/append",
    method: "POST",
    body:   JSON.stringify(eventToSend)
  })

  const {statusCode, body} = response

  const eventlyResponse = await body.json()

  if (statusCode == 201) {
    return {
      status:  Result.SUCCESS,
      // @ts-ignore
      message: eventlyResponse.eventId
    }
  }

  console.warn(`${statusCode}: ${JSON.stringify(body)}`)

  if (statusCode == 409) {
    return {
      status:   Result.RACE,
      message: eventlyResponse as string
    }
  }

  return {
    status:   Result.ERROR,
    message: `append event http status: ${statusCode}, result: ${JSON.stringify(eventlyResponse)}`
  }
}
