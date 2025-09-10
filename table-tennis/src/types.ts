
export abstract class BaseEntity {
  static readonly name: string

  protected constructor(readonly key: string) {
  }
}


export type EntityConstructor<T extends BaseEntity = BaseEntity> = new (key: string) => T

export abstract class BaseEvent {
  static readonly name: string
  static readonly entityTypes: EntityConstructor[]

  readonly #entities: BaseEntity[]

  public get entities(): BaseEntity[] {
    return this.#entities
  }

  protected constructor(...entities: BaseEntity[]) {
    this.#entities = entities
  }
}



export type AppendableEvent = {
  event:            string
  entities:         Record<string, string[]>
  meta?:            EventMeta
  data?:            EventData
  selector?:        Partial<SelectorQuery>
  idempotencyKey?:  string
}


export interface PersistedEvent {
  entities: Record<string, string[]>
  event:    string
  eventId:  string
  data:     object
}

export type EventMeta = {
  actor: string
  cause: string
}

export type EventData = string | number | boolean | { [k: string]: unknown } | unknown[]


export type JsonpathQuery = {
  query:  string
  vars: {
    [k: string]: any
  }
}

export type SelectorQuery = {
  entities: Record<string, string[]>
  events:   Record<string, JsonpathQuery>
  meta:     JsonpathQuery
  after:    string
  limit:    number
}
