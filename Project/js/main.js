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
        enemiesRemoved: 0,
        secondsPassed: 0,
    };

    // variables to tell the player about various circumstances
    let messages = {
        gameOver: [],
        lastAttack: "",
    }

    // the variables for every object in the game and their starting numbers
    let player;
    let enemies;
    let obstacles;
    let items;

    const numberOfEnemies = 20;
    const numberOfStartingObstacles = 10;
    const numberOfItems = 3;

    // variables for functionality
    let keysPressed = {};
    let timer;

    const maxLag = 251;

    // Get the HTML elements for the menu
    let startButton = document.getElementById("start-button");
    let mainMenu = document.getElementById("main-menu");
    let gameOver = document.getElementById("game-over");
    let gameContainer = document.getElementById("game-container");

    // mode selection
    let normalMode = document.getElementById("normal-mode");
    let onlineMode = document.getElementById("online-mode");

    // Wait for the user to start the game
    startButton.addEventListener("click", event => {
        event.preventDefault();
        changeDifficulty();
        startGame();
    });

    // game over event listeners 
    document.getElementById("retry").addEventListener("click", () => {
        startGame();
    });
    document.getElementById("ragequit").addEventListener("click", () => {
        gameOver.style.display = "none";
        mainMenu.style.display = "inline-block";
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
        gameOver.style.display = "none";
        gameContainer.style.display = "block";

        // reset the gameStatus
        gameStatus.score = 0;
        gameStatus.enemiesRemoved = 0;
        gameStatus.secondsPassed = 0;

        // the player's controls assisted by https://www.gavsblog.com/blog/detect-single-and-multiple-keypress-events-javascript
        window.addEventListener('keydown', event => {
            keysPressed[event.key] = true;

            // controls other than moving
            if (event.key == "z") {
                player.warp();
                player.attemptToInstaKill(player.hp);
            }

            // assisted by https://stackoverflow.com/questions/3369593/how-to-detect-escape-key-press-with-pure-js-or-jquery
            if (event.key == "Escape") {
                player.hp = 0;
                messages.gameOver.push("You died early as requested. Are you happy?");
            }
        });
        window.addEventListener('keyup', event => {
            delete keysPressed[event.key];
        });
        fillCanvas();
    }

    let fillCanvas = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (gameStatus.easyMode) {
            // Easy mode starting stats
            player = new Player(20, 2);
        }
        else {
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

        for (let i = 0; i < numberOfStartingObstacles; i++) {
            obstacles.push(new Obstacle("darkred"));
        }

        for (let i = 0; i < numberOfItems; i++) {
            items.push(new Item());
        }

        // start counting every second the game passes... and potentially remove some score if the player is unlucky
        // assisted by https://www.w3schools.com/jsref/met_win_setinterval.asp
        timer = setInterval(() => {
            gameStatus.secondsPassed++;
            // A luck stat of 1 or less will always lead to lost score
            let potentialScoreLoss = Math.floor((Math.random() * player.luck));
            if (potentialScoreLoss == 0) {
                gameStatus.score--;
            }
        }, 1000);
        animate();
    }

    let decideLag = () =>{
        let lag;
        if (gameStatus.online){
            // decide how much to lag for this frame
            lag = Math.floor(Math.random() * maxLag);
            if (lag == 0){
                // No proper frame rates allowed in my onine mode! >:(
                // Kill the player for having good luck
                player.hp = 0;
                messages.gameOver.push("A communication error has occurred");
            }
        }
        else {
            // the player is offline. Do not add extra lag
            lag = 0;
        }
        return lag;
    }

    let animate = () => {
        let lag = decideLag();
        
        setTimeout(() => {
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
                // assisted by https://www.w3schools.com/jsref/met_win_clearinterval.asp
                clearInterval(timer);
                // This sound was taken from https://www.youtube.com/watch?v=jEexefuB62c
                var gameOverSound = new Audio("../assets/ExplosionMeme.mp4");
                gameOverSound.play();
                gameOverSound.currentTime = 0;
                endGame();
            }
        }, lag);
    }

    let updateUI = player => {
        /* Game Stats */
        document.getElementById("score").innerHTML = gameStatus.score;
        document.getElementById("seconds-passed").innerHTML = gameStatus.secondsPassed;
        document.getElementById("enemies-removed").innerHTML = gameStatus.enemiesRemoved;

        /* Player Stats */
        document.getElementById("hp").innerHTML = player.hp;
        document.getElementById("luck").innerHTML = player.luck;
        document.getElementById("last-attack").innerHTML = messages.lastAttack;
    }

    let endGame = () => {
        gameContainer.style.display = "none";
        gameOver.style.display = "block";

    }
});

