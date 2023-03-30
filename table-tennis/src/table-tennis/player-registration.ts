import {EventSink} from "../event-sink"
import {PlayerEntity, PlayerRegistered} from "./events.js"
import {keyify} from "./table-tennis.js"


export async function registerPlayer(eventSink: EventSink, name: string, country: string): Promise<string> {
  const key = keyify(name)
  const entity = new PlayerEntity(key)

  await eventSink(new PlayerRegistered(entity, name, country), `$.name?(@=="${name}")`)

  return key
}
