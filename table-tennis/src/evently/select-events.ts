import env from "env-sanitize"
import {Readable} from "stream"
import {BaseEntity} from "../types"
import {SelectorResponse} from "./evently-client"
import {SendToEvently} from "./index"

interface EntityEventBody {
  entity:   string
  key:      string
  event:    string
  eventId:  string
  data:     any
}

const eventlyOnline = env("EVENTLY_ONLINE", (x) => x.asBoolean(), false)

export function filterEvents(sender: SendToEvently, filter: object): Promise<SelectorResponse> {
  return selectEvents(sender, "filter", filter)
}

export function replayEvents(sender: SendToEvently, entity: BaseEntity): Promise<SelectorResponse> {
  const {name, key} = entity
  const data = {
    entity: name,
    keys:   [key]
  }
  return selectEvents(sender, "replay", data)
}


async function selectEvents(sender: SendToEvently, type: string, selector: object): Promise<SelectorResponse> {
  const response = await sender({
    path:     `/selectors/${type}`,
    method:   "POST",
    headers:  {
      Accept: "application/x-ndjson",
      Prefer: "return=representation"
    },
    body:     JSON.stringify(selector)
  })

  const responseStream = response.body ?? Readable.from([])
  const result: SelectorResponse = {
    selectorId: "",
    mark:       "",
    events:     []
  }

  let lineCount = 0
  for await (let data of jsonIterator(responseStream)) {
    lineCount++
    if (data.mark) {
      result.selectorId = data.selectorId
      result.mark = data.mark
    } else {
      const {entity: name, key, ...event}: EntityEventBody = data
      result.events.push({
        ...event,
        entity: {
          name,
          key
        }
      })
    }
  }
  if (eventlyOnline) {
    console.info("        selected %s events", lineCount)
  }

  return result
}


async function* jsonIterator(reader: Readable): AsyncGenerator<any> {
  reader.setEncoding("utf8")
  // Stream chunks are not broken along JSON lines, so use partial to store remainder text between chunks.
  let partial = ""
  for await (const chunk of reader) {
    const block = partial + chunk
    const lines = block.split("\n")
    // last line will be either a partial line or an empty string (for complete blocks)
    partial = lines.pop() ?? ""

    for (const line of lines) {
      yield parseJson(line)
    }
  }

  if (partial) {
    yield parseJson(partial)
  }
}


function parseJson(line: string): any {
  if (line) {
    return JSON.parse(line)
  }
}
