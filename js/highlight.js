// highlight shit

function highlightMoves(square) {
    clearHighlights();
    if (!square.innerText || !isCorrectTurn(square.innerText)) return;

    let moves = getValidMoves(square);
    moves.forEach(({ target, isCapture }) => {
        target.style.backgroundColor = isCapture ? "#0055aa" : "#66aaff";
    });
}

function clearHighlights() {
    document.querySelectorAll(".square").forEach(sq => {
        sq.style.backgroundColor = "";
        sq.style.border = "";
    });

    if (lastMoveFrom && lastMoveTo) {
        lastMoveFrom.style.border = "3px solid blue";
        lastMoveTo.style.border = "3px solid blue";
    }
}
