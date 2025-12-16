"use strict";

/* ====== UI References ====== */
const elBoard = document.getElementById("board");
const elMoves = document.getElementById("moves");
const elTurnPill = document.getElementById("turnPill");
const elCheckPill = document.getElementById("checkPill");
const elEndPill = document.getElementById("endPill");
const elUndoBtn = document.getElementById("undoBtn");
const elResetBtn = document.getElementById("resetBtn");
const elFlipBtn = document.getElementById("flipBtn");
const elCapWhite = document.getElementById("capWhite");
const elCapBlack = document.getElementById("capBlack");

const elPromoModal = document.getElementById("promoModal");
const elPromoActions = document.getElementById("promoActions");

/* ====== Pieces ====== */
const PIECE_UNICODE = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
};
const FILES = "abcdefgh";

/* ====== Game State ====== */
let state = initialState();
let history = []; // stores deep clones of previous states
let selected = null; // {r,c}
let legalForSelected = []; // array of moves for selected
let flipped = false;
let pendingPromotion = null; // { move, color }

renderAll();

/* ====== Event Listeners ====== */
elBoard.addEventListener("click", (e) => {
  const sq = e.target.closest(".square");
  if (!sq) return;
  const uiR = Number(sq.dataset.r);
  const uiC = Number(sq.dataset.c);
  const { r, c } = uiToBoard(uiR, uiC);
  onSquareClick(r, c);
});

elUndoBtn.addEventListener("click", () => {
  if (pendingPromotion) return;
  if (history.length === 0) return;
  state = history.pop();
  selected = null;
  legalForSelected = [];
  renderAll();
});

elResetBtn.addEventListener("click", () => {
  pendingPromotion = null;
  elPromoModal.hidden = true;
  state = initialState();
  history = [];
  selected = null;
  legalForSelected = [];
  flipped = false;
  renderAll();
});

elFlipBtn.addEventListener("click", () => {
  flipped = !flipped;
  selected = null;
  legalForSelected = [];
  renderAll();
});

/* ====== Core Flow ====== */
function onSquareClick(r, c) {
  if (state.gameOver) return;
  if (pendingPromotion) return;

  const piece = state.board[r][c];
  const turn = state.turn;

  // If a piece is already selected:
  if (selected) {
    // If clicking own piece: change selection
    if (piece && piece[0] === turn) {
      selectSquare(r, c);
      return;
    }

    // If clicking a legal destination: execute move
    const move = legalForSelected.find(m => m.to.r === r && m.to.c === c);
    if (move) {
      makeMove(move);
      return;
    }

    // Otherwise clear selection
    selected = null;
    legalForSelected = [];
    renderBoard();
    return;
  }

  // No selection yet: select only if it is current player's piece
  if (piece && piece[0] === turn) {
    selectSquare(r, c);
  }
}

function selectSquare(r, c) {
  selected = { r, c };
  legalForSelected = legalMovesFromSquare(state, r, c);
  renderBoard();
}

function makeMove(move) {
  // Save for undo
  history.push(cloneState(state));

  // Handle promotion via modal
  if (move.needsPromotion) {
    pendingPromotion = { move, color: state.turn };
    openPromotionModal(state.turn, (choice) => {
      move.promotion = choice;
      pendingPromotion = null;
      elPromoModal.hidden = true;
      applyMove(state, move);
      postMoveUpdates(move);
    });
    return;
  }

  applyMove(state, move);
  postMoveUpdates(move);
}

function postMoveUpdates(lastMove) {
  selected = null;
  legalForSelected = [];

  // Check end states
  const opponent = state.turn; // turn has already switched in applyMove
  const inChk = inCheck(state, opponent);

  // Annotate last move with + / #
  let suffix = "";
  const oppMoves = allLegalMoves(state, opponent);
  if (oppMoves.length === 0) {
    state.gameOver = true;
    state.result = inChk ? (opponent === "w" ? "Black wins by checkmate" : "White wins by checkmate")
                         : "Draw by stalemate";
    suffix = inChk ? "#" : "";
  } else if (inChk) {
    suffix = "+";
  }

  // Update move list
  state.moveLog[state.moveLog.length - 1] += suffix;

  renderAll();
}

/* ====== Rendering ====== */
function renderAll() {
  renderBoard();
  renderSidebar();
  renderStatus();
  elUndoBtn.disabled = history.length === 0 || !!pendingPromotion;
}

function renderStatus() {
  elTurnPill.textContent = `Turn: ${state.turn === "w" ? "White" : "Black"}`;

  const inChk = inCheck(state, state.turn);
  elCheckPill.hidden = !inChk;
  elEndPill.hidden = !state.gameOver;

  if (state.gameOver) {
    elEndPill.textContent = state.result || "Game Over";
  } else {
    elEndPill.textContent = "";
  }
}

function renderSidebar() {
  // Moves
  const lines = [];
  for (let i = 0; i < state.moveLog.length; i += 2) {
    const num = (i / 2) + 1;
    const w = state.moveLog[i] || "";
    const b = state.moveLog[i + 1] || "";
    lines.push(`${num}. ${w}${b ? "  " + b : ""}`);
  }
  elMoves.textContent = lines.join("\n");

  // Captures
  elCapWhite.textContent = "";
  elCapBlack.textContent = "";
  for (const p of state.capturedByWhite) elCapWhite.appendChild(pieceSpan(p));
  for (const p of state.capturedByBlack) elCapBlack.appendChild(pieceSpan(p));
}

function pieceSpan(pieceCode) {
  const s = document.createElement("span");
  s.textContent = PIECE_UNICODE[pieceCode] || "";
  return s;
}

function renderBoard() {
  elBoard.innerHTML = "";

  const kingSquareToMark = (() => {
    if (!inCheck(state, state.turn)) return null;
    return findKing(state, state.turn);
  })();

  for (let uiR = 0; uiR < 8; uiR++) {
    for (let uiC = 0; uiC < 8; uiC++) {
      const { r, c } = uiToBoard(uiR, uiC);
      const isLight = (r + c) % 2 === 0;
      const sq = document.createElement("div");
      sq.className = `square ${isLight ? "light" : "dark"}`;
      sq.dataset.r = String(uiR);
      sq.dataset.c = String(uiC);

      const piece = state.board[r][c];
      sq.textContent = piece ? PIECE_UNICODE[piece] : "";

      // Coordinates on bottom-left edge (optional and subtle)
      if ((flipped && uiR === 7 && uiC === 7) || (!flipped && uiR === 7 && uiC === 0)) {
        // do nothing special
      }

      // Selected highlight
      if (selected && selected.r === r && selected.c === c) {
        sq.classList.add("selected");
      }

      // Legal move highlights
      if (selected) {
        const m = legalForSelected.find(mm => mm.to.r === r && mm.to.c === c);
        if (m) {
          const destPiece = state.board[r][c];
          if (destPiece || m.enPassant) sq.classList.add("capture");
          else sq.classList.add("legal");
        }
      }

      // Mark checked king square
      if (kingSquareToMark && kingSquareToMark.r === r && kingSquareToMark.c === c) {
        sq.classList.add("kingcheck");
      }

      // Small coordinate hint in corners (minimal)
      // Use UI coordinates so the hints follow board rotation correctly.
      const showFile = (!flipped && uiR === 7) || (flipped && uiR === 0);
      const showRank = (!flipped && uiC === 0) || (flipped && uiC === 7);
      if (showFile || showRank) {
        const coord = document.createElement("div");
        coord.className = "coord";
        const file = FILES[uiC];
        const rank = String(8 - uiR);
        coord.textContent = (showFile ? file : "") + (showRank ? rank : "");
        sq.appendChild(coord);
      }

      elBoard.appendChild(sq);
    }
  }
}

/* ====== Promotion Modal ====== */
function openPromotionModal(color, onPick) {
  elPromoActions.innerHTML = "";

  const options = ["Q", "R", "B", "N"];
  for (const opt of options) {
    const btn = document.createElement("button");
    btn.className = "promoBtn";
    btn.type = "button";
    btn.textContent = PIECE_UNICODE[color + opt] || opt;
    btn.addEventListener("click", () => onPick(opt), { once: true });
    elPromoActions.appendChild(btn);
  }

  elPromoModal.hidden = false;
}

/* ====== Initial Setup ====== */
function initialState() {
  const empty = () => Array.from({ length: 8 }, () => Array(8).fill(null));

  const b = empty();

  // Black
  b[0] = ["bR","bN","bB","bQ","bK","bB","bN","bR"];
  b[1] = Array(8).fill("bP");

  // White
  b[6] = Array(8).fill("wP");
  b[7] = ["wR","wN","wB","wQ","wK","wB","wN","wR"];

  return {
    board: b,
    turn: "w",
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null, // {r,c} target square
    moveLog: [],
    capturedByWhite: [],
    capturedByBlack: [],
    gameOver: false,
    result: ""
  };
}

function cloneState(s) {
  return {
    board: s.board.map(row => row.slice()),
    turn: s.turn,
    castling: { ...s.castling },
    enPassant: s.enPassant ? { ...s.enPassant } : null,
    moveLog: s.moveLog.slice(),
    capturedByWhite: s.capturedByWhite.slice(),
    capturedByBlack: s.capturedByBlack.slice(),
    gameOver: s.gameOver,
    result: s.result
  };
}

/* ====== Board Orientation Helpers ====== */
function uiToBoard(uiR, uiC) {
  if (!flipped) return { r: uiR, c: uiC };
  return { r: 7 - uiR, c: 7 - uiC };
}

/* ====== Move Generation (Legal) ====== */
function legalMovesFromSquare(s, r, c) {
  const piece = s.board[r][c];
  if (!piece) return [];
  if (piece[0] !== s.turn) return [];
  const color = piece[0];
  const pseudo = pseudoMovesForPiece(s, r, c);

  // Filter out moves that leave own king in check
  const legal = [];
  for (const m of pseudo) {
    const test = cloneState(s);
    applyMove(test, m, { silentLog: true });
    if (!inCheck(test, color)) legal.push(m);
  }
  return legal;
}

function allLegalMoves(s, color) {
  const savedTurn = s.turn;
  s.turn = color;
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = s.board[r][c];
      if (p && p[0] === color) moves.push(...legalMovesFromSquare(s, r, c));
    }
  }
  s.turn = savedTurn;
  return moves;
}

function pseudoMovesForPiece(s, r, c) {
  const piece = s.board[r][c];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const pushMove = (toR, toC, extra = {}) => {
    moves.push({
      from: { r, c },
      to: { r: toR, c: toC },
      piece,
      ...extra
    });
  };

  const inBounds = (rr, cc) => rr >= 0 && rr < 8 && cc >= 0 && cc < 8;
  const enemy = (rr, cc) => {
    const p = s.board[rr][cc];
    return p && p[0] !== color;
  };
  const empty = (rr, cc) => !s.board[rr][cc];

  if (type === "P") {
    const dir = (color === "w") ? -1 : 1;
    const startRow = (color === "w") ? 6 : 1;
    const promoteRow = (color === "w") ? 0 : 7;

    // forward 1
    const f1r = r + dir;
    if (inBounds(f1r, c) && empty(f1r, c)) {
      const needsPromotion = (f1r === promoteRow);
      pushMove(f1r, c, { needsPromotion });

      // forward 2
      const f2r = r + 2 * dir;
      if (r === startRow && inBounds(f2r, c) && empty(f2r, c)) {
        pushMove(f2r, c, { pawnTwo: true });
      }
    }

    // captures
    for (const dc of [-1, 1]) {
      const cr = r + dir;
      const cc = c + dc;
      if (!inBounds(cr, cc)) continue;

      // normal capture
      if (enemy(cr, cc)) {
        const needsPromotion = (cr === promoteRow);
        pushMove(cr, cc, { capture: s.board[cr][cc], needsPromotion });
      }

      // en passant
      if (s.enPassant && s.enPassant.r === cr && s.enPassant.c === cc) {
        pushMove(cr, cc, { enPassant: true });
      }
    }

  } else if (type === "N") {
    const deltas = [
      [-2,-1],[-2, 1],[-1,-2],[-1, 2],
      [ 1,-2],[ 1, 2],[ 2,-1],[ 2, 1]
    ];
    for (const [dr, dc] of deltas) {
      const rr = r + dr, cc = c + dc;
      if (!inBounds(rr, cc)) continue;
      if (empty(rr, cc)) pushMove(rr, cc);
      else if (enemy(rr, cc)) pushMove(rr, cc, { capture: s.board[rr][cc] });
    }

  } else if (type === "B" || type === "R" || type === "Q") {
    const dirs = [];
    if (type === "B" || type === "Q") dirs.push([-1,-1],[-1, 1],[1,-1],[1, 1]);
    if (type === "R" || type === "Q") dirs.push([-1, 0],[ 1, 0],[0,-1],[0, 1]);

    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc;
      while (inBounds(rr, cc)) {
        if (empty(rr, cc)) {
          pushMove(rr, cc);
        } else {
          if (enemy(rr, cc)) pushMove(rr, cc, { capture: s.board[rr][cc] });
          break;
        }
        rr += dr; cc += dc;
      }
    }

  } else if (type === "K") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (!inBounds(rr, cc)) continue;
        if (empty(rr, cc)) pushMove(rr, cc);
        else if (enemy(rr, cc)) pushMove(rr, cc, { capture: s.board[rr][cc] });
      }
    }

    // Castling (pseudo conditions, still filtered by legal check)
    const opp = (color === "w") ? "b" : "w";
    const kingHome = (color === "w") ? { r: 7, c: 4 } : { r: 0, c: 4 };
    if (r === kingHome.r && c === kingHome.c && !inCheck(s, color)) {
      // King-side
      const canK = (color === "w") ? s.castling.wK : s.castling.bK;
      if (canK) {
        const rookC = 7;
        if (s.board[r][rookC] === (color + "R") &&
            empty(r, 5) && empty(r, 6) &&
            !isSquareAttacked(s, r, 5, opp) &&
            !isSquareAttacked(s, r, 6, opp)) {
          pushMove(r, 6, { castle: "K" });
        }
      }
      // Queen-side
      const canQ = (color === "w") ? s.castling.wQ : s.castling.bQ;
      if (canQ) {
        const rookC = 0;
        if (s.board[r][rookC] === (color + "R") &&
            empty(r, 3) && empty(r, 2) && empty(r, 1) &&
            !isSquareAttacked(s, r, 3, opp) &&
            !isSquareAttacked(s, r, 2, opp)) {
          pushMove(r, 2, { castle: "Q" });
        }
      }
    }
  }

  return moves;
}

/* ====== Apply Move ====== */
function applyMove(s, move, opts = {}) {
  const silentLog = !!opts.silentLog;
  const { from, to } = move;
  const piece = move.piece;
  const color = piece[0];
  const opp = (color === "w") ? "b" : "w";

  // Reset en passant unless set again by a pawn two-step
  s.enPassant = null;

  // Capture handling
  let capturedPiece = null;

  // En passant capture removes pawn behind target square
  if (move.enPassant) {
    const dir = (color === "w") ? 1 : -1;
    const capR = to.r + dir;
    const capC = to.c;
    capturedPiece = s.board[capR][capC];
    s.board[capR][capC] = null;
  } else if (move.capture) {
    capturedPiece = s.board[to.r][to.c];
  }

  // Move piece
  s.board[from.r][from.c] = null;

  // Castling moves rook too
  if (move.castle) {
    if (move.castle === "K") {
      // rook: h-file to f-file
      s.board[to.r][5] = color + "R";
      s.board[to.r][7] = null;
    } else {
      // rook: a-file to d-file
      s.board[to.r][3] = color + "R";
      s.board[to.r][0] = null;
    }
  }

  // Promotion
  if (move.promotion) {
    s.board[to.r][to.c] = color + move.promotion;
  } else {
    s.board[to.r][to.c] = piece;
  }

  // Update captured lists
  if (capturedPiece) {
    if (color === "w") s.capturedByWhite.push(capturedPiece);
    else s.capturedByBlack.push(capturedPiece);

    // If a rook is captured on its home square, remove castling right
    if (capturedPiece[1] === "R") {
      if (to.r === 7 && to.c === 0) s.castling.wQ = false;
      if (to.r === 7 && to.c === 7) s.castling.wK = false;
      if (to.r === 0 && to.c === 0) s.castling.bQ = false;
      if (to.r === 0 && to.c === 7) s.castling.bK = false;
    }
  }

  // Pawn two-step sets en passant target
  if (piece[1] === "P" && move.pawnTwo) {
    const dir = (color === "w") ? -1 : 1;
    s.enPassant = { r: from.r + dir, c: from.c };
  }

  // Update castling rights when king or rook moves
  if (piece[1] === "K") {
    if (color === "w") { s.castling.wK = false; s.castling.wQ = false; }
    else { s.castling.bK = false; s.castling.bQ = false; }
  }
  if (piece[1] === "R") {
    if (from.r === 7 && from.c === 0) s.castling.wQ = false;
    if (from.r === 7 && from.c === 7) s.castling.wK = false;
    if (from.r === 0 && from.c === 0) s.castling.bQ = false;
    if (from.r === 0 && from.c === 7) s.castling.bK = false;
  }

  // Create human-readable move notation
  if (!silentLog) {
    const notation = formatMove(s, move, capturedPiece);
    s.moveLog.push(notation);
  }

  // Switch turn
  s.turn = opp;
}

function formatMove(sAfterMove, move, capturedPiece) {
  const from = squareToAlg(move.from.r, move.from.c);
  const to = squareToAlg(move.to.r, move.to.c);

  if (move.castle === "K") return "O-O";
  if (move.castle === "Q") return "O-O-O";

  const isCapture = !!capturedPiece || !!move.enPassant;
  let core = `${from}${isCapture ? "x" : "-"}${to}`;

  if (move.promotion) core += `=${move.promotion}`;
  if (move.enPassant) core += " e.p.";

  return core;
}

function squareToAlg(r, c) {
  return FILES[c] + String(8 - r);
}

/* ====== Check Detection ====== */
function findKing(s, color) {
  const target = color + "K";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (s.board[r][c] === target) return { r, c };
    }
  }
  return null;
}

function inCheck(s, color) {
  const king = findKing(s, color);
  if (!king) return false; // should not happen in normal play
  const opp = (color === "w") ? "b" : "w";
  return isSquareAttacked(s, king.r, king.c, opp);
}

function isSquareAttacked(s, r, c, byColor) {
  const inBounds = (rr, cc) => rr >= 0 && rr < 8 && cc >= 0 && cc < 8;

  // Pawns
  if (byColor === "w") {
    for (const dc of [-1, 1]) {
      const rr = r + 1, cc = c + dc;
      if (inBounds(rr, cc) && s.board[rr][cc] === "wP") return true;
    }
  } else {
    for (const dc of [-1, 1]) {
      const rr = r - 1, cc = c + dc;
      if (inBounds(rr, cc) && s.board[rr][cc] === "bP") return true;
    }
  }

  // Knights
  const kDeltas = [
    [-2,-1],[-2, 1],[-1,-2],[-1, 2],
    [ 1,-2],[ 1, 2],[ 2,-1],[ 2, 1]
  ];
  for (const [dr, dc] of kDeltas) {
    const rr = r + dr, cc = c + dc;
    if (!inBounds(rr, cc)) continue;
    if (s.board[rr][cc] === byColor + "N") return true;
  }

  // Bishops / Queens (diagonals)
  const diagDirs = [[-1,-1],[-1, 1],[1,-1],[1, 1]];
  for (const [dr, dc] of diagDirs) {
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr, cc)) {
      const p = s.board[rr][cc];
      if (p) {
        if (p[0] === byColor && (p[1] === "B" || p[1] === "Q")) return true;
        break;
      }
      rr += dr; cc += dc;
    }
  }

  // Rooks / Queens (orthogonals)
  const ortDirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of ortDirs) {
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr, cc)) {
      const p = s.board[rr][cc];
      if (p) {
        if (p[0] === byColor && (p[1] === "R" || p[1] === "Q")) return true;
        break;
      }
      rr += dr; cc += dc;
    }
  }

  // King adjacent
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (inBounds(rr, cc) && s.board[rr][cc] === byColor + "K") return true;
    }
  }

  return false;
}
