# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Frontend app built with Vite + React 19 + Redux Toolkit
- Linting uses ESLint 9 (flat config) with react, react-hooks, and react-refresh plugins
- Styles use SCSS modules; a global theme is injected into every SCSS file via Vite
- GitHub Pages deployment (gh-pages) with base path configured for production

Common commands (pwsh)
- Install dependencies: npm install
- Start dev server: npm run dev
- Build for production: npm run build
- Preview production build locally: npm run preview
- Lint entire project: npm run lint
- Lint a single file: npx eslint src/path/to/File.jsx
- Deploy to GitHub Pages: npm run deploy (runs build, then publishes dist/ via gh-pages)
- Tests: no test runner is configured in this repo

Architecture and code structure (big picture)
Entry and app shell
- src/main.jsx mounts the app and wraps it with a Redux Provider using the configured store (src/data/store.js)
- src/App.jsx renders one of several “pages” based on Redux state (no React Router). Page changes trigger a fade-like transition: a transition component is shown, the target page is swapped in after TRANSITION_HALF_LIFE, and then the transition component is removed
- PageName and transition timing constants live in src/global/utils.js

State management (Redux Toolkit)
- Store: src/data/store.js combines two slices: menu and game
- Menu slice: src/data/menuSlice.js
  - page: current page and an updateValue counter used to force re-renders on repeated selections
  - settings persisted in localStorage: difficulty and showIndicators
  - actions: switchPage, setDifficulty, setShowIndicators
- Game slice: src/data/gameSlice.js
  - Core state: gridSize (8 or 10 based on difficulty), pieces (id->piece), player (position, type, cooldown), movingPieces, captureCells, occupiedCellsMatrix (2D grid of false or an id/"ThePlayer"), queuedForDeletion, counters (turnNumber, xp, gems), game over and totals, playerPieceType
  - Initialization: generateGrid(gridSize) creates a clean board and places the player at center
  - Primary reducers/actions:
    - startGame(difficulty) resets state based on difficulty and re-centers the player
    - movePlayer({ targetPos, isCapturing, difficulty }): validates move/capture against chess rules, increments turn, applies passive XP/gems, updates cooldown, performs capture if applicable, and updates the occupiedCellsMatrix
    - processPieces({ difficulty }): spawns enemies based on weighted odds, advances enemy state, and if any enemy can capture the player, moves it onto the player square and ends the game
    - updateCaptureTiles(): recomputes all enemy capture tiles for threat display; also ends the game if the player stands on a threatened cell
    - resetState, upgradePlayerPiece, addPiece, endGame, restartGame
  - A rich set of selectors is exported (selectAllPieces, selectOccupiedCellsMatrix, selectCaptureCells, selectPlayerPosition, etc.)

Game mechanics modules (pure logic)
- src/features/game/logic/grid.js
  - isValidCell({x,y}, gridSize) bounds-checks positions
  - generateGrid(size, initial=false) returns size×size 2D grid
- src/features/game/logic/piece.js
  - Encodes chess-like movement and capture rules per piece type
  - PieceMovementFunc and PieceCaptureFunc map a type to a function that returns valid moves/captures given piece position, player position, and currently occupied cells
  - PieceCooldown defines per-type cooldowns for non-player pieces; player variants (Black*) have null cooldown
- src/features/game/logic/score.js
  - Computes passive and per-second XP based on difficulty and turn milestones; awards gems for survival and captures
- src/features/game/logic/spawning.js
  - Weighted spawn probabilities per difficulty
  - Spawns occur on grid edges; pawns’ facing direction is derived from the edge

Game UI and interaction
- src/features/game/GamePage.jsx orchestrates runtime behavior:
  - On an interval, grants XP over time based on difficulty
  - Derives potential moves for the currently selected player piece and renders them as hints
  - On grid cell click: dispatches movePlayer, then (after a short delay) processPieces and updateCaptureTiles; may dispatch endGame based on current state
  - Renders: a CSS grid of GridCell components, a pieces layer (Piece components for player and enemies), and a UI overlay for counters and status
- Components for rendering reside under src/features/game/components:
  - grid-cell (cell rendering and click targets)
  - piece (Piece wrapper and SVGs for types, including player “Black*” variants)
  - ui (game HUD and controls)
- Menu pages live under src/features/menu (MainPage, OptionsPage, HowToPlayPage, PageTransition). MainPage dispatches page switches and game starts

Globals and utilities
- src/global/utils.js centralizes:
  - Enums: PieceType, BlackPieceType, PageName, Difficulty
  - Vector helpers: arrayHasVector, removeVectorInArray, getDistance, getVectorSum
  - extractOccupiedCells(matrix, gridSize) -> array of occupied {x,y}
  - sleep(ms) promise and TRANSITION_HALF_LIFE constant

Styling and theming
- CSS modules with SCSS are used throughout (e.g., *.module.scss)
- Vite injects a global SCSS theme into all SCSS files via css.preprocessorOptions.additionalData; the theme is located at /src/global/theme.scss

Build and deploy details
- Vite base is set to /the-last-pawn in vite.config.js to support GitHub Pages under that path
- package.json homepage points to https://gabrieledradan.github.io/the-last-pawn/
- npm run deploy publishes the contents of dist/ via the gh-pages CLI

