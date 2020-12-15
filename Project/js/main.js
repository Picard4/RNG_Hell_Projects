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
        enemiesBeaten: 0,
        secondsPassed: 0,
    };

    // variables to tell the player about various circumstances
    let messages = {
        gameOver: [],
        lastAttack: "",
    }
    let player;
    let enemies;
    let obstacles;
    let items;

    const numberOfEnemies = 20;
    const numberOfStartingObstacles = 10;
    const numberOfItems = 3;
    let keysPressed = {};

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
        if (normalMode.checked) {
            gameStatus.easyMode = false;
        }
        else {
            gameStatus.easyMode = true;
        }

        // choose online mode or offline mode
        if (onlineMode.checked) {
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

        // reset the gameStatus
        gameStatus.score = 0;
        gameStatus.enemiesBeaten = 0;
        gameStatus.secondsPassed = 0;

        // the player's controls assisted by https://www.gavsblog.com/blog/detect-single-and-multiple-keypress-events-javascript
        window.addEventListener('keydown', event => {
            keysPressed[event.key] = true;
            if (event.key == "z"){
                player.warp();
                player.attemptToInstaKill(player.hp);
            }
        });
        window.addEventListener('keyup', event => {
            delete keysPressed[event.key];
        });
        fillCanvas();
    }

    let fillCanvas = () => {
        if (gameStatus.easyMode){
            // Easy mode starting stats
            player = new Player(20, 2);
        }
        else{
            // Normal mode starting stats
            player = new Player(10, 1);
        }

        enemies = [];
        obstacles = [];
        items = [];

        let nextEnemyX = playerRadius;
        let enemyXIncrement = 60;
        for (let i = 0; i < numberOfEnemies; i++) {
            enemies.push(new Enemy(nextEnemyX));
            nextEnemyX += enemyXIncrement
        }

        for (let i = 0; i < numberOfStartingObstacles; i++){
            obstacles.push(new Obstacle("darkred"));
        }

        for (let i = 0; i < numberOfItems; i++){
            items.push(new Item());
        }

        // start counting every second the game passes... and potentially remove some score if the player is unlucky
        // assisted by https://www.w3schools.com/jsref/met_win_setinterval.asp
        setInterval(() => { 
            gameStatus.secondsPassed++;
            // A luck stat of 1 or less will always lead to lost score
            let potentialScoreLoss = Math.floor((Math.random() * player.luck));
            if (potentialScoreLoss == 0){
                gameStatus.score--;
            }
         }, 1000);
        animate();
    }

    let animate = () => {
        let animationId = requestAnimationFrame(animate);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // update game elements
        player.update(keysPressed);
        enemies.forEach(enemy => {
            enemy.update();
        });
        obstacles.forEach(obstacle => {
            obstacle.update();
        })
        items.forEach(item => {
            item.update();
        })

        updateUI(player);

        // assisted by https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
        if (player.hp <= 0) {
            cancelAnimationFrame(animationId);
            clearInterval();
            // This sound was taken from https://www.youtube.com/watch?v=jEexefuB62c
            var gameOverSound = new Audio("../assets/ExplosionMeme.mp4");
            gameOverSound.play();
            endGame();
        }
    }

    let updateUI = player => {
        /* Game Stats */
        document.getElementById("score").innerHTML = gameStatus.score;
        document.getElementById("seconds-passed").innerHTML = gameStatus.secondsPassed;
        document.getElementById("enemies-beaten").innerHTML = gameStatus.enemiesBeaten;

        /* Player Stats */
        document.getElementById("hp").innerHTML = player.hp;
        document.getElementById("luck").innerHTML = player.luck;
        document.getElementById("last-attack").innerHTML = messages.lastAttack;
    }

    let endGame = () => {

    }
});

