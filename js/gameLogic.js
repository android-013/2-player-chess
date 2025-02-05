let selectedPiece = null;
let selectedSquare = null;
let turn = "white";
let moveHistory = [];

function handleMove(square) {
    if (!selectedPiece) {
        if (square.innerText !== "" && isCorrectTurn(square.innerText)) {
            selectedPiece = square.innerText;
            selectedSquare = square;
            highlightMoves(square);
        }
    } else {
        if (isSameColor(selectedPiece, square.innerText)) {
            clearHighlights();
            selectedPiece = null;
            selectedSquare = null;
            return;
        }

        if (isValidMove(selectedSquare, square)) {
            moveHistory.push({ from: selectedSquare.id, to: square.id, captured: square.innerText });

            square.innerText = selectedPiece;
            selectedSquare.innerText = "";
            clearHighlights();
            
            checkPawnPromotion(square);

            turn = turn === "white" ? "black" : "white";
            turnIndicator.innerText = turn === "white" ? "White's Turn" : "Black's Turn";

            selectedPiece = null;
            selectedSquare = null;
        } else {
            alert("Invalid move!");
            clearHighlights();
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
        turnIndicator.innerText = turn === "white" ? "White's Turn" : "Black's Turn";
    }
}

function resetGame() {
    location.reload();
}
