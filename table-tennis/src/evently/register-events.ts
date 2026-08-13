import {BaseEvent, EntityConstructor} from "../types.ts"
import {SendToEvently} from "./index.ts"



type EventConstructor<T extends BaseEvent = BaseEvent> = (new (...args: any[]) => T) & {
  name: string
  entityTypes: readonly EntityConstructor[]
}

export async function registerAllEvents(sender: SendToEvently, ...events: EventConstructor[]) {
  return Promise.all(events.map(event => registerEvent(sender, event)))
}

async function registerEvent(sender: SendToEvently, eventType: EventConstructor) {
  const body = {
    event: eventType.name,
    entities: eventType.entityTypes.map(type => type.name)
  }

  const response = await sender({
    path:   "/registry/register-event",
    method: "POST",
    body:   JSON.stringify(body)
  })

  const result = await response.body.text()

  if (response.statusCode !== 201) {
    console.info("Could not register Event type %j: %j", eventType, result)
  }
}
