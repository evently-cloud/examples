import {AppendableEvent, JsonpathQuery, PersistedEvent, SelectorQuery} from "../types.ts"

export interface AppendResult {
  status:   Result
  message:  string
}

export enum Result {
  SUCCESS,
  RACE,
  ERROR
}

export interface SelectorResponse {
  events:   PersistedEvent[]
  selector: Partial<SelectorQuery>
}

export interface EventlyClient {
  replayEvents(entities: Record<string, string[]>): Promise<SelectorResponse>
  filterEvents(filter: Record<string, JsonpathQuery>): Promise<SelectorResponse>
  appendEvent(event: AppendableEvent): Promise<AppendResult>
}
