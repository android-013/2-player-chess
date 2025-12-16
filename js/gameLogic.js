let selectedPiece = null;
let selectedSquare = null;
let turn = "white";
let moveHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    const chessboard = document.getElementById("chessboard");
    const turnIndicator = document.getElementById("turn-indicator");
    const undoBtn = document.getElementById("undo");
    const restartBtn = document.getElementById("restart");

    function isCorrectTurn(piece) {
        const whitePieces = "\u2659\u2656\u2658\u2657\u2655\u2654";
        const blackPieces = "\u265f\u265c\u265e\u265d\u265b\u265a";
        if (turn === "white") return whitePieces.includes(piece);
        return blackPieces.includes(piece);
    }

    function isSameColor(piece1, piece2) {
        if (!piece1 || !piece2) return false;
        const whitePieces = "\u2659\u2656\u2658\u2657\u2655\u2654";
        const blackPieces = "\u265f\u265c\u265e\u265d\u265b\u265a";
        return (whitePieces.includes(piece1) && whitePieces.includes(piece2)) ||
               (blackPieces.includes(piece1) && blackPieces.includes(piece2));
    }

    function handleMove(square) {
        if (!selectedPiece) {
            if (square.innerText !== "" && isCorrectTurn(square.innerText)) {
                selectedPiece = square.innerText;
                selectedSquare = square;
                if (typeof highlightMoves === 'function') highlightMoves(square);
            }
        } else {
            if (isSameColor(selectedPiece, square.innerText)) {
                if (typeof clearHighlights === 'function') clearHighlights();
                selectedPiece = null;
                selectedSquare = null;
                return;
            }
            if (typeof isValidMove === 'function' ? isValidMove(selectedSquare, square) : true) {
                moveHistory.push({ from: selectedSquare.id, to: square.id, captured: square.innerText });
                square.innerText = selectedPiece;
                selectedSquare.innerText = "";
                if (typeof clearHighlights === 'function') clearHighlights();
                if (typeof checkPawnPromotion === 'function') checkPawnPromotion(square);
                turn = turn === "white" ? "black" : "white";
                if (turnIndicator) turnIndicator.innerText = turn === "white" ? "White's Turn" : "Black's Turn";
                selectedPiece = null;
                selectedSquare = null;
            } else {
                alert("Invalid move!");
                if (typeof clearHighlights === 'function') clearHighlights();
                selectedPiece = null;
                selectedSquare = null;
            }
        }
    }

    function undoMove() {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            const fromSquare = document.getElementById(lastMove.from);
            const toSquare = document.getElementById(lastMove.to);
            fromSquare.innerText = toSquare.innerText;
            toSquare.innerText = lastMove.captured;
            turn = turn === "white" ? "black" : "white";
            if (turnIndicator) turnIndicator.innerText = turn === "white" ? "White's Turn" : "Black's Turn";
        }
    }

    function resetGame() {
        location.reload();
    }

    // Attach event listeners to all squares
    function attachSquareListeners() {
        document.querySelectorAll(".square").forEach(square => {
            square.onclick = () => handleMove(square);
        });
    }
    attachSquareListeners();

    if (undoBtn) undoBtn.onclick = undoMove;
    if (restartBtn) restartBtn.onclick = resetGame;
});
