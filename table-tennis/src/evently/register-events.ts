import {EntityEventType} from "./evently-client"
import {SendToEvently} from "./index"


export function registerAllEvents(sender: SendToEvently) {
  return Promise.all([
    registerEvents(sender,"🤾", "🤾-registered"),
    registerEvents(sender, "🏅", "🏅-created", "🏅-completed"),
    registerEvents(sender, "match", "match-started", "match-completed"),
    registerEvents(sender, "game",
      "game-started",
      "🏓-served",
      "🏓-out",
      "🏓-returned",
      "game-completed")])
}

function registerEvents(sender: SendToEvently, entity: string, ...events: string[]) {
  return Promise.all(events.map((event) => registerEventType(sender, {entity, event})))
}

async function registerEventType(sender: SendToEvently, entityEventType: EntityEventType) {
  const response = await sender({
    path:   "/registry/register-event",
    method: "POST",
    body:   JSON.stringify(entityEventType)
  })

  const result = await response.body.text()

  if (response.statusCode !== 201) {
    console.info("Could not register Event type %j: %j", entityEventType, result)
  }
}
