import {BaseEntity, BaseEvent, PersistedEvent} from "../types"

export interface AppendResult {
  status:   Result
  message:  string
}

export enum Result {
  SUCCESS,
  RACE,
  ERROR
}

export interface EntityEventType {
  entity: string
  event:  string
}

export interface Selector {
  selectorId: string
  mark:       string
}

export interface SelectorResponse extends Selector {
  events:     PersistedEvent[]
}

export interface EventlyClient {
  replayEvents(entity: BaseEntity): Promise<SelectorResponse>
  filterEvents(filter: object): Promise<SelectorResponse>
  appendSerialEvent(evt: BaseEvent, previous: string): Promise<AppendResult>
  appendSelectorEvent(evt: BaseEvent, selector: Selector): Promise<AppendResult>
}
