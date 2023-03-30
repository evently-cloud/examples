import {BaseEntity, BaseEvent} from "../types.js"


// Player entity
export class PlayerEntity extends BaseEntity {
  constructor(key: string) {
    super("🤾", key)
  }
}

export class PlayerRegistered extends BaseEvent {
  constructor(          player:   PlayerEntity,
              readonly  name:     string,
              readonly  country:  string) {
    super("🤾-registered", player)
  }
}


// Tournament Entity
export class TournamentEntity extends BaseEntity {
  constructor(key: string) {
    super("🏅", key)
  }
}

export class TournamentCreated extends BaseEvent {
  constructor(          entity:     TournamentEntity,
              readonly  name:       string,
              readonly  playerKeys: string[]) {
    super("🏅-created", entity)
  }
}

export class TournamentCompleted extends BaseEvent {
  constructor(          entity:     TournamentEntity,
              readonly  winnerKey:  string) {
    super("🏅-completed", entity)
  }
}



// Match entity
export class MatchEntity extends BaseEntity {
  constructor(key: string) {
    super("match", key)
  }
}


export class MatchStarted extends BaseEvent {
  constructor(          entity:         MatchEntity,
              readonly  tournamentKey:  string,
              readonly  player1Key:     string,
              readonly  player2Key:     string) {
  super("match-started", entity)
  }
}

export class MatchCompleted extends BaseEvent {
  constructor(          entity:     MatchEntity,
              readonly  winnerKey:  string) {
  super("match-completed", entity)
  }
}


// Game entity
export class GameEntity extends BaseEntity {
  constructor(key: string) {
    super("game", key)
  }
}

export class GameStarted extends BaseEvent {
  constructor(          game:     GameEntity,
              readonly  matchKey: string) {
    super("game-started", game)
  }
}

export class GameCompleted extends BaseEvent {
  constructor(          game:   GameEntity,
              readonly  winner: string) {
    super("game-completed", game)
  }
}

export class BallServed extends BaseEvent {
  constructor(          game:   GameEntity,
              readonly  player: number) {
    super("🏓-served", game)
  }
}

export class BallOut extends BaseEvent {
  constructor(          game:   GameEntity,
              readonly  player: number) {
    super("🏓-out", game)
  }
}

export class BallReturned extends BaseEvent {
  constructor(          game:   GameEntity,
              readonly  player: number) {
    super("🏓-returned", game)
  }
}
