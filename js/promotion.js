function checkPawnPromotion(square) {
    const piece = square.innerText;
    const rank = parseInt(square.id[1]);

    if ((piece === "♙" && rank === 8) || (piece === "♟" && rank === 1)) {
        showPromotionMenu(square, piece);
    }
}

function showPromotionMenu(square, piece) {
    const promotionMenu = document.createElement("div");
    promotionMenu.classList.add("promotion-menu");
    promotionMenu.innerHTML = `
        <button onclick="promotePawn('${square.id}', '${piece}', 'Q')">♕</button>
        <button onclick="promotePawn('${square.id}', '${piece}', 'R')">♖</button>
        <button onclick="promotePawn('${square.id}', '${piece}', 'B')">♗</button>
        <button onclick="promotePawn('${square.id}', '${piece}', 'N')">♘</button>
    `;

    document.body.appendChild(promotionMenu);
    promotionMenu.style.top = `${square.offsetTop}px`;
    promotionMenu.style.left = `${square.offsetLeft}px`;
}

function promotePawn(squareId, piece, choice) {
    const square = document.getElementById(squareId);
    const promotionChoices = { Q: "♕", R: "♖", B: "♗", N: "♘" };

    square.innerText = promotionChoices[choice] || "♕";
    document.querySelector(".promotion-menu").remove();
}
