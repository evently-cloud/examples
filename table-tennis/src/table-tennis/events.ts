import {BaseEntity, BaseEvent} from "../types.js"


export class PlayerEntity extends BaseEntity {
  static readonly name = "🤾"

  constructor(key: string) {
    super(key)
  }
}

export class PlayerRegistered extends BaseEvent {
  static readonly name = "🤾-registered"
  static readonly entityTypes = [PlayerEntity]

  constructor(readonly name:     string,
              readonly country:  string,
                       player:   PlayerEntity) {
    super(player)
  }
}


export class TournamentEntity extends BaseEntity {
  static readonly name = "🏅"

  constructor(key: string) {
    super(key)
  }
}

export class TournamentCreated extends BaseEvent {
  static readonly name = "🏅-created"
  static readonly entityTypes = [TournamentEntity, PlayerEntity]

  constructor(readonly  name:       string,
                        tournament: TournamentEntity,
                        players:    PlayerEntity[]) {
    super(tournament, ...players)
  }
}

export class TournamentCompleted extends BaseEvent {
  static readonly name = "🏅-completed"
  static readonly entityTypes = [TournamentEntity, PlayerEntity]

  constructor(tournament: TournamentEntity,
              winner:     PlayerEntity) {
    super(tournament, winner)
  }
}



export class MatchEntity extends BaseEntity {
  static readonly name = "match"

  constructor(key: string) {
    super(key)
  }
}


export class MatchStarted extends BaseEvent {
  static readonly name = "match-started"
  static readonly entityTypes = [MatchEntity, TournamentEntity, PlayerEntity]

  // in this case, specify the player 1 and player 2 keys as match play
  // will refer to them as player 1 or 2.
  constructor(readonly  player1Key: string,
              readonly  player2Key: string,
                        match:      MatchEntity,
                        tournament: TournamentEntity,
                        players:    PlayerEntity[]) {
  super(match, tournament, ...players)
  }
}

export class MatchCompleted extends BaseEvent {
  static readonly name = "match-completed"
  static readonly entityTypes = [MatchEntity, PlayerEntity]

  constructor(match:   MatchEntity,
              winner:  PlayerEntity,) {
  super(match, winner)
  }
}


// Game entity
export class GameEntity extends BaseEntity {
  static readonly name = "game"

  constructor(key: string) {
    super(key)
  }
}

export class GameStarted extends BaseEvent {
  static readonly name = "game-started"
  static readonly entityTypes = [GameEntity, PlayerEntity]

  constructor(game:  GameEntity,
              match: MatchEntity) {
    super(game, match)
  }
}

export class GameCompleted extends BaseEvent {
  static readonly name = "game-completed"
  static readonly entityTypes = [GameEntity, PlayerEntity]

  constructor(game:   GameEntity,
              winner: PlayerEntity) {
    super(game, winner)
  }
}

export class BallServed extends BaseEvent {
  static readonly name = "🏓-served"
  static readonly entityTypes = [GameEntity]

  constructor(readonly  player: number,
                        game:   GameEntity) {
    super(game)
  }
}

export class BallOut extends BaseEvent {
  static readonly name = "🏓-out"
  static readonly entityTypes = [GameEntity]

  constructor(readonly  player: number,
              game:     GameEntity) {
    super(game)
  }
}

export class BallReturned extends BaseEvent {
  static readonly name = "🏓-returned"
  static readonly entityTypes = [GameEntity]

  constructor(readonly  player: number,
                        game:   GameEntity) {
    super(game)
  }
}
