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
        score: 0,
    };

    let keysPressed = {};

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

        // Change the player's HP based on the difficulty chosen
        

        // the player's controls assisted by https://www.gavsblog.com/blog/detect-single-and-multiple-keypress-events-javascript
        window.addEventListener('keydown', event => {
            keysPressed[event.key] = true;
        });
        window.addEventListener('keyup', event => {
            delete keysPressed[event.key];
        });
        
        animate();
    }

    let animate = () => {
        requestAnimationFrame(animate);
        context.clearRect(0, 0, canvas.width, canvas.height);
        player.update(keysPressed);
        
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

