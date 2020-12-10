'use strict';
document.addEventListener("DOMContentLoaded", () => {
    // constants for the Canvas
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');

    canvas.height = 700; 
    canvas.width = 1200; 

    // variables pertaining to the game itself
    let gameStatus = {
        easyMode: false,
        online: false,
        score: 0
    };

    let player = new Player();

    // Get the HTML elements for the menu
    let startButton = document.getElementById("start-button");
    let mainMenu = document.getElementById("main-menu");

    // mode selection
    let normalMode = document.getElementById("normal-mode");
    let onlineMode = document.getElementById("online-mode");

    // Wait for the user to start the game
    startButton.addEventListener("click", event => {
        event.preventDefault();
        changeDifficulty();
        startGame();
    });

    let changeDifficulty = () => {
        // choose easy mode or normal mode
        if (normalMode.checked){
            gameStatus.easyMode = false;
        }
        else {
            gameStatus.easyMode = true;
        }

        // choose online mode or offline mode
        if (onlineMode.checked){
            gameStatus.online = true;
        }
        else {
            gameStatus.online = false;
        }
    }

    let startGame = () => {
        // Display the canvas + UI and hide the main menu
        mainMenu.style.display = "none";
        document.getElementById("game-container").style.display = "block";

        // the player's controls
        window.addEventListener('keydown', event => {
            if (event.key === "ArrowLeft") {
                player.x -= player.speed;
            }
            else if (event.key === "ArrowRight") {
                player.x += player.speed;
            }
            if (event.key === "ArrowUp") {
                player.y -= player.speed;
            }
            else if (event.key === "ArrowDown") {
                player.y += player.speed;
            }
        });
        animate();
    }

    let animate = () => {
        requestAnimationFrame(animate);
        context.clearRect(0, 0, canvas.width, canvas.height);
        player.update();

        updateUI(player);
    }

    let updateUI = player => {
        /* Game Stats */
        document.getElementById("score").innerHTML = gameStatus.score;
        gameStatus.score--;

        /* Player Stats */
        document.getElementById("hp").innerHTML = player.hp;
    }

    let endGame = () => {

    }
});

