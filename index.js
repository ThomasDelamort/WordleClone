
/*
=========================================
WORDLE GAME (FULL VERSION + GIVE UP)
=========================================
*/

let tiles;
let currentRow = 0;
let currentCol = 0;
let gameStarted = false;
let isAnimating = false;
let gameOver = false;


let WORDS = [];
let word = "";


let stats = {
    wins: parseInt(localStorage.getItem("wins")) || 0,
    losses: parseInt(localStorage.getItem("losses")) || 0
};


function loadWords() {
    return fetch("words.txt")
        .then(res => res.text())
        .then(text => {
            WORDS = text
                .split("\n")
                .map(w => w.trim().toLowerCase())
                .filter(w => w.length === 5);

            WORDS = [...new Set(WORDS)];

            word = getRandomWord();

            console.log("Words loaded:", WORDS.length);
            console.log("Word:", word);
        });
}


$(document).ready(function () {

    tiles = $(".tile");

    injectExtraCSS();
    loadStatsUI();

    loadWords().then(() => {
        console.log("Game ready");
    });

    $(document).on("keydown", handleKeyPress);

    $(".key").on("click", function () {
        if (!gameStarted || isAnimating || gameOver) return;

        let key = $(this).data("key") || $(this).text();
        handleKeyPress({ key: key });
    });

    $(".start").on("click", startGame);

    
    $("#giveUp").on("click", giveUp);
});


function startGame() {
    resetGame();
    $(".pop-up").css("visibility", "hidden");

    gameStarted = true;
    gameOver = false;
}


function resetGame() {

    currentRow = 0;
    currentCol = 0;
    isAnimating = false;
    gameOver = false;

    word = getRandomWord();

    tiles.val("").removeClass("correct present absent flip pop");
    $(".key").css("background-color", "");

    console.log("New word:", word);
}


function handleKeyPress(e) {

    if (!gameStarted || isAnimating || gameOver) return;

    let key = e.key.toLowerCase();

    if (/^[a-z]$/.test(key)) addLetter(key);
    else if (key === "backspace") removeLetter();
    else if (key === "enter") submitGuess();
}


function addLetter(letter) {

    if (currentCol >= 5) return;

    let index = currentRow * 5 + currentCol;
    let tile = $(tiles[index]);

    tile.val(letter.toUpperCase());

    tile.addClass("pop");
    setTimeout(() => tile.removeClass("pop"), 100);

    currentCol++;
}


function removeLetter() {

    if (currentCol <= 0) return;

    currentCol--;

    let index = currentRow * 5 + currentCol;
    $(tiles[index]).val("");
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

            tile.addClass("flip");

            setTimeout(() => {

                let letter = guess[i];

                if (letter === word[i]) {
                    tile.addClass("correct");
                    updateKeyColor(letter, "correct");

                } else if (word.includes(letter)) {
                    tile.addClass("present");
                    updateKeyColor(letter, "present");

                } else {
                    tile.addClass("absent");
                    updateKeyColor(letter, "absent");
                }

            }, 250);

        }, i * 300);
    }

    setTimeout(() => {

        isAnimating = false;

        if (guess === word) {
            win();
            return;
        }

        currentRow++;
        currentCol = 0;

        if (currentRow === 6) lose();

    }, 1800);
}


function win() {

    gameOver = true;

    stats.wins++;
    localStorage.setItem("wins", stats.wins);

    showPopup("🎉 You Win!");
    updateStatsUI();
}

function lose() {

    gameOver = true;

    stats.losses++;
    localStorage.setItem("losses", stats.losses);

    showPopup(`💀 You Lose.<br>The word was <b>${word.toUpperCase()}</b>`);

    updateStatsUI();
}


function giveUp() {

    if (!gameStarted || gameOver) return;

    gameOver = true;

    stats.losses++;
    localStorage.setItem("losses", stats.losses);

    showPopup(`💀 You Lose.<br>The word was <b>${word.toUpperCase()}</b>`);

    updateStatsUI();
}


function updateKeyColor(letter, status) {

    let key = $(".key").filter(function () {
        return $(this).text().toLowerCase() === letter;
    });

    let currentColor = key.css("background-color");

    if (currentColor === "rgb(106, 170, 100)") return;

    if (status === "correct") {
        key.css("background-color", "#6AAA64");
    }
    else if (status === "present") {
        key.css("background-color", "#C9B458");
    }
    else {
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


function showPopup(message) {

    let popup = $(".pop-up");

    popup.html(`
        <h2>${message}</h2>
        <button class="start restart">Play Again</button>
    `);

    popup.css("visibility", "visible");

    $(".restart").on("click", startGame);
}


function loadStatsUI() {

    if ($(".stats").length === 0) {
        $("body").append(`
            <div class="stats">
                Wins: <span id="wins">0</span> |
                Losses: <span id="losses">0</span>
            </div>
        `);
    }

    updateStatsUI();
}

function updateStatsUI() {
    $("#wins").text(stats.wins);
    $("#losses").text(stats.losses);
}


function getRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
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

        .stats {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
        }

        </style>
    `);
}