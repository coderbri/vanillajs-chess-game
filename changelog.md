# Chess Game - Changelog

## v0.1.0 - Initial Setup (Step 1)
- Created project structure with four files: 
  - `index.html` (markup and script linking)
  - `styles.css` (styling for board and pieces, currently empty)
  - `app.js` (game logic, currently empty)
  - `pieces.js` (piece definitions, currently empty)
- Added HTML skeleton for:
  - Gameboard container (`#gameboard`)
  - Player turn display (`#player`)
  - Info display for messages (`#info-display`)
- Linked `styles.css` and JavaScript files (`pieces.js`, `app.js`).

---

## v0.2.0 - Piece Constants and Selectors (Step 2)
- Defined constants in `pieces.js` for all chess pieces (king, queen, rook, bishop, knight, pawn).
  - Each constant stores SVG markup for rendering.
  - Keeps pieces modular and reusable across the board.
- Added DOM selectors in `app.js`:
  - `#gameboard` → chessboard container.
  - `#player` → current player display.
  - `#info-display` → game info messages.
- Defined `width = 8` to represent the chessboard dimensions.
- Established data flow:  
  - `pieces.js` provides piece data.  
  - `app.js` reads these constants (via `<script>` order in `index.html`).  
  - Document selectors give `app.js` control over HTML elements for rendering and game updates.