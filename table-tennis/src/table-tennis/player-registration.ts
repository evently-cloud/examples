import {EventSink} from "../event-sink"
import {PlayerEntity, PlayerRegistered} from "./events.js"
import {keyify} from "./table-tennis.js"


export async function registerPlayer(eventSink: EventSink, name: string, country: string): Promise<PlayerEntity> {
  const key = keyify(name)
  const entity = new PlayerEntity(key)

  await eventSink(new PlayerRegistered(name, country, entity), {query: "$.name?(@==$name)", vars: {name}})

  return entity
}
