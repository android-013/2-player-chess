document.addEventListener("DOMContentLoaded", () => {
    const chessboard = document.getElementById("chessboard");
    
    function createBoard() {
        chessboard.style.display = "grid";
        chessboard.style.gridTemplateColumns = "repeat(8, 1fr)";
        chessboard.style.gridTemplateRows = "repeat(8, 1fr)";
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");
                
                // Alternate colors for chessboard pattern
                if ((row + col) % 2 === 0) {
                    square.style.backgroundColor = "#eeeed2"; // Light square
                } else {
                    square.style.backgroundColor = "#769656"; // Dark square
                }
                
                chessboard.appendChild(square);
            }
        }
    }
    
    createBoard();
});
