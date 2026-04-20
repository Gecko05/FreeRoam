import type { Game, PlayerID } from 'boardgame.io';
import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core';

/** Spot index 0 is leftmost; values are actions granted for that spot. */
export const SPOT_ACTIONS = [2, 3, 4, 5] as const;

export type GameState = {
  scores: number[];
  /** Per player: chosen spot index, or null until picked. */
  picks: (number | null)[];
  spotClaimed: boolean[];
  /** Turn order in the play phase (PlayerID strings), set when the draft ends. */
  playOrder: PlayerID[];
  /** Remaining actions this game for each player (from chosen spot). */
  actions: number[];
};

function initialPlayOrder(numPlayers: number): PlayerID[] {
  return Array.from({ length: numPlayers }, (_, i) => String(i));
}

export const game: Game<GameState> = {
  setup: ({ ctx }) => ({
    scores: Array.from({ length: ctx.numPlayers }, () => 0),
    picks: Array.from({ length: ctx.numPlayers }, () => null),
    spotClaimed: [false, false, false, false],
    playOrder: initialPlayOrder(ctx.numPlayers),
    actions: Array.from({ length: ctx.numPlayers }, () => 0),
  }),
  phases: {
    draft: {
      start: true,
      next: 'play',
      moves: {
        selectSpot: ({ G, ctx, events, playerID }, spotIndex: number) => {
          if (spotIndex < 0 || spotIndex >= SPOT_ACTIONS.length) {
            return INVALID_MOVE;
          }
          if (playerID === undefined || playerID === null) {
            return INVALID_MOVE;
          }
          if (playerID !== ctx.currentPlayer) {
            return INVALID_MOVE;
          }
          if (G.spotClaimed[spotIndex]) {
            return INVALID_MOVE;
          }
          const playerIndex = Number.parseInt(playerID, 10);
          if (G.picks[playerIndex] !== null) {
            return INVALID_MOVE;
          }

          G.picks[playerIndex] = spotIndex;
          G.spotClaimed[spotIndex] = true;

          const allPicked = G.picks.every((p) => p !== null);
          if (allPicked) {
            for (let p = 0; p < ctx.numPlayers; p++) {
              const spot = G.picks[p] as number;
              G.actions[p] = SPOT_ACTIONS[spot];
            }

            const ordered = G.picks
              .map((spot, playerIdx) => ({
                playerIdx,
                spot: spot as number,
              }))
              .sort((a, b) => a.spot - b.spot || a.playerIdx - b.playerIdx);

            G.playOrder = ordered.map((o) => String(o.playerIdx));
            events.endPhase();
            return;
          }

          events.endTurn();
        },
      },
    },
    play: {
      turn: {
        order: TurnOrder.CUSTOM_FROM('playOrder'),
      },
      moves: {
        endTurnWithOptionalAction: ({ G, ctx, events }) => {
          const playerIndex = Number.parseInt(ctx.currentPlayer, 10);
          if (G.actions[playerIndex] > 0) {
            G.actions[playerIndex] -= 1;
            G.scores[playerIndex] += 1;
          }
          events.endTurn();
        },
      },
    },
  },
};
