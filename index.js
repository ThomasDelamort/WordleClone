let tiles;
let currentRow = 0;
let currentCol = 0;
let gameStarted = false;
let isAnimating = false;

const WORDS = ["apple", "grape", "brick", "stone", "plant", "crane", "flame", "sugar"];
const word = WORDS[Math.floor(Math.random() * WORDS.length)];


$(document).ready(function () {
    tiles = $(".tile");

    injectExtraCSS();

    
    $(document).on("keydown", handleKeyPress);

    
    $(".key").on("click", function () {
        let key = $(this).data("key") || $(this).text();
        handleKeyPress({ key: key });
    });
});


function startGame() {
    $(".pop-up").css("visibility", "hidden");
    gameStarted = true;
}


function handleKeyPress(e) {
    if (!gameStarted || isAnimating) return;

    let key = e.key.toLowerCase();

    if (/^[a-z]$/.test(key)) addLetter(key);
    else if (key === "backspace") removeLetter();
    else if (key === "enter") submitGuess();
}


function addLetter(letter) {
    if (currentCol < 5) {
        let index = currentRow * 5 + currentCol;
        let tile = $(tiles[index]);

        
        tile.val(letter.toUpperCase());

        
        tile.addClass("pop");
        setTimeout(() => tile.removeClass("pop"), 100);

        currentCol++;
    }
}


function removeLetter() {
    if (currentCol > 0) {
        currentCol--;
        let index = currentRow * 5 + currentCol;
        $(tiles[index]).val("");
    }
}


function submitGuess() {
    if (currentCol < 5) return;

    let guess = "";

    for (let i = 0; i < 5; i++) {
        guess += $(tiles[currentRow * 5 + i]).val().toLowerCase();
    }

    if (!WORDS.includes(guess)) {
        shakeRow();
        return;
    }

    checkGuess(guess);
}


function checkGuess(guess) {
    isAnimating = true;

    let rowStart = currentRow * 5;

    for (let i = 0; i < 5; i++) {
        let tile = $(tiles[rowStart + i]);

        setTimeout(() => {
            tile.removeClass("flip").addClass("flip");

            setTimeout(() => {
                if (guess[i] === word[i]) {
                    tile.addClass("correct");
                    updateKeyColor(guess[i], "correct");

                } else if (word.includes(guess[i])) {
                    tile.addClass("present");
                    updateKeyColor(guess[i], "present");

                } else {
                    tile.addClass("absent");
                    updateKeyColor(guess[i], "absent");
                }
            }, 300);

        }, i * 300);
    }

    
    setTimeout(() => {
        isAnimating = false;

        if (guess === word) {
            
            showResultPopup("You Win!");
            gameStarted = false;
            return;
        }

        currentRow++;
        currentCol = 0;

        if (currentRow === 6) {
            
            showResultPopup("Game Over! Word was: " + word.toUpperCase());
            gameStarted = false;
        }

    }, 1800);
}


function updateKeyColor(letter, status) {
    let key = $(".key").filter(function () {
        return $(this).text().toLowerCase() === letter;
    });

    let currentColor = key.css("background-color");

    
    if (currentColor === "rgb(106, 170, 100)") return; // green
    if (currentColor === "rgb(201, 180, 88)" && status === "absent") return;

    if (status === "correct") {
        key.css("background-color", "#6AAA64");
    } else if (status === "present") {
        key.css("background-color", "#C9B458");
    } else {
        key.css("background-color", "#787C7E");
    }
}


function shakeRow() {
    let rowTiles = tiles.slice(currentRow * 5, currentRow * 5 + 5);

    rowTiles.addClass("shake");

    setTimeout(() => {
        rowTiles.removeClass("shake");
    }, 400);
}


function injectExtraCSS() {
    $("head").append(`
        <style>
        .shake { animation: shake 0.3s; }

        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }

        .pop {
            transform: scale(1.15);
            transition: transform 0.1s;
        }
        </style>
    `);
}

function showResultPopup(message) {
    let popup = $(".pop-up");

    popup.html(`
        <br>
        <h2>${message}</h2><br><br>
        <button class="start restart">Play Again</button>
    `);

    popup.css("visibility", "visible");

    $(".restart").on("click", function () {
        location.reload();
    });
}

        