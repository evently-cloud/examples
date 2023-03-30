export class BaseEntity {
  constructor(readonly  name: string,
              readonly  key:  string) {
  }
}

export class BaseEvent {
  constructor(readonly  event:  string,
              readonly  entity: BaseEntity) {
  }
}

export interface PersistedEvent {
  entity:   BaseEntity
  event:    string
  eventId:  string
  data:     object
}