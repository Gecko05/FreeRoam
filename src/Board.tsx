import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from './game';
import { SPOT_ACTIONS } from './game';

export function Board({ G, ctx, moves, playerID }: BoardProps<GameState>) {
  const inDraft = ctx.phase === 'draft';
  const inPlay = ctx.phase === 'play';

  const canPickInDraft =
    inDraft &&
    playerID !== null &&
    playerID === ctx.currentPlayer &&
    G.picks[Number.parseInt(playerID, 10)] === null;

  const isPlayTurn =
    inPlay && (playerID === null || playerID === ctx.currentPlayer);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Board prototype</h1>
      <p style={{ color: '#4b5563', marginTop: 0 }}>
        Draft: players take turns choosing one of four spots (2 / 3 / 4 / 5
        actions). Spots are unique. Play order follows spots left to right,
        then player id as tiebreaker. In play, each turn you may spend one
        action for +1 score or pass if none remain.
      </p>

      {playerID !== null && (
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
          You are player <strong>{playerID}</strong> · Phase{' '}
          <strong>{ctx.phase}</strong>
        </p>
      )}

      {inDraft && (
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Draft — pick a spot</h2>
          <p style={{ marginTop: 0, color: '#4b5563', fontSize: '0.9rem' }}>
            It is player <strong>{ctx.currentPlayer}</strong>&apos;s turn to
            choose. Later turns follow chosen spots from left to right.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'stretch',
            }}
          >
            {SPOT_ACTIONS.map((actions, spotIndex) => {
              const taken = G.spotClaimed[spotIndex];
              return (
                <button
                  key={spotIndex}
                  type="button"
                  disabled={!canPickInDraft || taken}
                  onClick={() => moves.selectSpot(spotIndex)}
                  style={{
                    flex: '1 1 100px',
                    minHeight: 72,
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    background:
                      taken || !canPickInDraft ? '#f3f4f6' : '#111827',
                    color: taken || !canPickInDraft ? '#9ca3af' : '#fff',
                    cursor:
                      taken || !canPickInDraft ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Spot {spotIndex + 1}
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                    {actions} actions
                  </span>
                  {taken && (
                    <span style={{ fontSize: '0.7rem' }}>Unavailable</span>
                  )}
                </button>
              );
            })}
          </div>
          <ul style={{ margin: '1rem 0 0', paddingLeft: '1.25rem' }}>
            {G.picks.map((pick, index) => (
              <li key={index}>
                Player {index}:{' '}
                {pick === null ? 'not chosen' : `spot ${pick + 1}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {inPlay && (
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Play</h2>
          <p style={{ margin: '0 0 0.75rem' }}>
            Current player: <strong>{ctx.currentPlayer}</strong>
          </p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#4b5563' }}>
            Turn order: {G.playOrder.join(' → ')}
          </p>

          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
            {G.scores.map((score, index) => (
              <li key={index}>
                Player {index}: score {score}, actions left{' '}
                <strong>{G.actions[index]}</strong>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={!isPlayTurn}
            onClick={() => moves.endTurnWithOptionalAction()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: isPlayTurn ? '#111827' : '#e5e7eb',
              color: isPlayTurn ? '#fff' : '#9ca3af',
              cursor: isPlayTurn ? 'pointer' : 'not-allowed',
            }}
          >
            End turn (spend 1 action for +1 score if you have any left)
          </button>
        </section>
      )}
    </div>
  );
}
