document.addEventListener("DOMContentLoaded", () => {
    function isValidMove(startSquare, targetSquare) {
        const startPiece = startSquare.textContent;
        const targetPiece = targetSquare.textContent;

        if (!startPiece) return false; // No piece to move

        const isWhite = "♙♖♘♗♕♔".includes(startPiece);
        const isBlack = "♟♜♞♝♛♚".includes(startPiece);

        const targetIsWhite = "♙♖♘♗♕♔".includes(targetPiece);
        const targetIsBlack = "♟♜♞♝♛♚".includes(targetPiece);

        // Prevent capturing own pieces
        if ((isWhite && targetIsWhite) || (isBlack && targetIsBlack)) {
            return false;
        }

        return true; // Basic rule: different color pieces can be captured
    }

    // Example usage (to be connected with move logic later)
    document.querySelectorAll(".square").forEach(square => {
        square.addEventListener("click", () => {
            console.log("Clicked square: ", square.textContent);
        });
    });
});
