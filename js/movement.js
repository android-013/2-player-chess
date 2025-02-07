document.addEventListener("DOMContentLoaded", () => {
    let selectedSquare = null;
    let currentPlayer = "white";
    const chessboard = document.getElementById("chessboard");
    const turnIndicator = document.getElementById("turn-indicator");
    
    function updateTurnIndicator() {
        turnIndicator.textContent = `Turn: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
    }

    function isWhitePiece(piece) {
        return piece >= "♙" && piece <= "♔"; // Unicode range for white pieces
    }
    
    function isBlackPiece(piece) {
        return piece >= "♟" && piece <= "♚"; // Unicode range for black pieces
    }

    function handleSquareClick(event) {
        const clickedSquare = event.target;
        const piece = clickedSquare.textContent;
        
        if (selectedSquare) {
            if (selectedSquare !== clickedSquare) {
                clickedSquare.textContent = selectedSquare.textContent;
                selectedSquare.textContent = "";
                selectedSquare.classList.remove("selected");
                
                // Change turn after a valid move
                currentPlayer = currentPlayer === "white" ? "black" : "white";
                updateTurnIndicator();
            }
            selectedSquare = null;
        } else {
            if ((currentPlayer === "white" && isWhitePiece(piece)) || (currentPlayer === "black" && isBlackPiece(piece))) {
                selectedSquare = clickedSquare;
                selectedSquare.classList.add("selected");
            }
        }
    }

    function addClickListeners() {
        const squares = chessboard.children;
        for (const square of squares) {
            square.addEventListener("click", handleSquareClick);
        }
    }
    
    updateTurnIndicator();
    addClickListeners();
});
