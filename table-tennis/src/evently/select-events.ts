import env from "env-sanitize"
import {Readable} from "stream"

import {JsonpathQuery, SelectorQuery} from "../types.ts"
import {SelectorResponse} from "./evently-client.ts"
import {SendToEvently} from "./index.ts"


const eventlyOnline = env("EVENTLY_ONLINE", (x) => x.asBoolean(), false)

export function filterEvents(sender: SendToEvently, events: Record<string, JsonpathQuery>): Promise<SelectorResponse> {
  return selectEvents(sender, {events})
}

export function replayEvents(sender: SendToEvently, entities: Record<string, string[]>): Promise<SelectorResponse> {
  return selectEvents(sender, {entities})
}

async function selectEvents(sender: SendToEvently, selector: Partial<SelectorQuery>): Promise<SelectorResponse> {
  const response = await sender({
    path:     `/selectors`,
    method:   "POST",
    headers:  {
      Accept: "application/x-ndjson",
      Prefer: "return=representation"
    },
    body:     JSON.stringify(selector)
  })

  const responseStream = response.body ?? Readable.from([])
  const result: SelectorResponse = {
    selector,
    events:     []
  }

  let lineCount = 0
  for await (let data of jsonIterator(responseStream)) {
    lineCount++
    result.events.push(data)
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
