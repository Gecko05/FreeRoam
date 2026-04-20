import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/react';
import { Debug } from 'boardgame.io/debug';
import { Local } from 'boardgame.io/multiplayer';
import { Board } from './Board';
import { game } from './game';
import './index.css';

/** Set to `2` (or more) for hotseat; uses `Local()` transport. Keep at `1` for a solo smoke test. */
const NUM_PLAYERS = 1;

const GameClient = Client({
  game,
  board: Board,
  numPlayers: NUM_PLAYERS,
  ...(NUM_PLAYERS > 1 ? { multiplayer: Local() } : {}),
  debug: { impl: Debug },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameClient />
  </StrictMode>,
);
