import Chance from "chance"
import {PlayerEntity} from "./events"
export const chance = Chance()


export enum Player {
  ONE, TWO
}

export interface Tournament {
  matches: Match[]
}

export interface Match {
  players: [PlayerEntity, PlayerEntity]
  winner?: string
}

export interface Game {
  winner: Player
}

export interface Rally {
  receiver: Player
  winner:   Player
}

export function keyify(value: string) {
  return value.replace(/[\s-]/g, "_")
}

export function oppositePlayer(player: Player): Player {
  return Player.ONE === player
    ? Player.TWO
    : Player.ONE
}
