import {AtomicQuery, BaseEvent} from "./types"


/**
 * Provides a sharded event sink. Measure is the Measurement instance to track perf with.
 */
export type SinkProvider = (shard: string) => Promise<EventSink>

/**
 * Sends Events with the option to declare the event is unique to the entity, so only send event if the entity
 * does not already have the named event with the unique atomic query.
 */
export type EventSink = (event: BaseEvent, atomic?: AtomicQuery) => Promise<void>
