import {EventSink} from "../event-sink.ts"
import {PlayerEntity, PlayerRegistered} from "./events.ts"
import {keyify} from "./table-tennis.ts"


export async function registerPlayer(eventSink: EventSink, name: string, country: string): Promise<PlayerEntity> {
  const key = keyify(name)
  const entity = new PlayerEntity(key)

  await eventSink(new PlayerRegistered(name, country, entity), {query: "$.name?(@==$name)", vars: {name}})

  return entity
}
