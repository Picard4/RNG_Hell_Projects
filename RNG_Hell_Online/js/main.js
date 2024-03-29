'use strict';
document.addEventListener("DOMContentLoaded", () => {

    // set the height and width of the canvas to work with the game's systems
    canvas.height = 700;
    canvas.width = 1200;

    // variables pertaining to the game itself
    let gameStatus = {
        running: false,
        easyMode: false,
        online: false,
        score: 0,
        displayScore: true,
        enemiesRemoved: 0,
        secondsPassed: 0,
        chungusActive: false,
    };

    // variables to tell the player about various circumstances
    let messages = {
        gameOver: [],
        lastAttack: "",
    }

    // the variables for every main object in the game
    let player;
    let enemies;
    let obstacles;
    let items;
    let meleeAttacks;

    // constants for spawning and scoring
    const numberOfEnemies = 20;
    const numberOfStartingObstacles = 10;
    const numberOfItems = 3;
    const enemyValue = 100;

    // Normal mode starting stats
    const normalHP = 15;
    const normalLuck = 1;

    // Normal - Easy conversion constants
    const normalToEasyHPConversion = 2;
    const normalToEasyLuckConversion = 3;

    // Easy mode starting stats
    const easyHP = normalHP * normalToEasyHPConversion;
    const easyLuck = normalLuck * normalToEasyLuckConversion;

    // variables for functionality
    let keysPressed = {};
    let timer;
    const maxLag = 301;

    // Get the HTML elements for the menus
    let startButton = document.getElementById("start-button");
    let mainMenu = document.getElementById("main-menu");
    let gameOverScreen = document.getElementById("game-over");
    let gameContainer = document.getElementById("game-container");
    let instructions = document.getElementById("instructions");
    let gameOverTitle = document.getElementById("game-over-title");

    // mode selection elements
    let normalMode = document.getElementById("normal-mode");
    let onlineMode = document.getElementById("online-mode");

    // the player's controls assisted by https://www.gavsblog.com/blog/detect-single-and-multiple-keypress-events-javascript
    window.addEventListener('keydown', event => {
        // Movement can work without confirming the gameStatus since it only works when updating the player
        // Action controls work without updating the player, so they must only work when the game is running
        keysPressed[event.key] = true;
        if (gameStatus.running) {

            // controls other than moving
            if (event.key === " " || event.key === "z" || event.key === "Z") {
                player.warp();
                player.attemptToInstaKill(player.hp, messages);
            }
            if (event.key === "w" || event.key === "W") {
                // Up attack
                attack(false, false);
            }
            if (event.key === "a" || event.key === "A") {
                // Left attack
                attack(true, false);
            }
            if (event.key === "s" || event.key === "S") {
                // Down attack
                attack(false, true);
            }
            if (event.key === "d" || event.key === "D") {
                // Right attack
                attack(true, true);
            }

            // assisted by https://stackoverflow.com/questions/3369593/how-to-detect-escape-key-press-with-pure-js-or-jquery
            if (event.key === "Escape") {
                if (player.hp !== 0) {
                    messages.gameOver.push("You died early as requested. Are you happy?");
                    // Do not display the player's score since they gave up
                    gameStatus.displayScore = false;
                    player.hp = 0;
                }
            }
        }
    });

    // additional event listener to help with diagonal movement
    window.addEventListener('keyup', event => {
        delete keysPressed[event.key];
    });

    // Add an event listener for the instructions since they take up the whole page
    document.getElementById("instruction-button").addEventListener("click", () => {
        // assisted by https://stackoverflow.com/questions/18324507/not-able-to-change-div-display-property-using-javascript
        if (instructions.style.display !== "block") {
            instructions.style.display = "block";
        }
        else {
            instructions.style.display = "none";
        }
    });

    // Wait for the user to start the game
    startButton.addEventListener("click", event => {
        instructions.style.display = "none";
        event.preventDefault();
        changeDifficulty();
        startGame();
    });

    // game over event listeners 
    document.getElementById("retry").addEventListener("click", () => {
        // block the retry if bigChungusHecc is active. There can be no escape
        if (!gameStatus.chungusActive) {
            // prepare to unleash bigChungusHecc instead of staring the game
            let bigChungusHeccRange = 100;
            let bigChungusHeccChance = Math.floor((Math.random() * bigChungusHeccRange));
            if (bigChungusHeccChance === 0) {
                prepareBigChungusHecc();
            }
            else {
                // restart the game
                gameOverScreen.removeChild(document.getElementById("game-over-message-container"));
                startGame();
            }
        }
    });

    document.getElementById("ragequit").addEventListener("click", () => {
        // block the ragequit if bigChungusHecc is active. There can be no escape
        if (!gameStatus.chungusActive) {
            // prepare to unleash bigChungusHecc instead of going to the main menu
            let bigChungusHeccRange = 100;
            let bigChungusHeccChance = Math.floor((Math.random() * bigChungusHeccRange));
            if (bigChungusHeccChance === 0) {
                prepareBigChungusHecc();
            }
            else {
                // load the main menu
                gameOverScreen.removeChild(document.getElementById("game-over-message-container"));
                gameOverScreen.style.display = "none";
                mainMenu.style.display = "flex";
            }
        }
    });

    // changes the difficulty based on the user's selection
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

    // prepare to start a new game
    let startGame = () => {
        // Display the canvas + UI and hide the main menu
        mainMenu.style.display = "none";
        gameOverScreen.style.display = "none";
        gameContainer.style.display = "block";

        // reset the gameStatus and messages
        gameStatus.score = 0;
        gameStatus.enemiesRemoved = 0;
        gameStatus.secondsPassed = 0;
        gameStatus.displayScore = true;
        messages.gameOver = [];
        messages.lastAttack = "";

        fillCanvas();
    }

    // fill the canvas for a new game
    let fillCanvas = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (gameStatus.easyMode) {
            player = new Player(easyHP, easyLuck);
        }
        else {
            player = new Player(normalHP, normalLuck);
        }

        // Try to Insta kill the player the before the game even starts
        // The player's own insta kill method should not be called here since a different message is used if the player dies here
        let rangeOfStartingGameInstaKill = 4;
        let potentialStartingGameInstaKill = Math.floor((Math.random() * (rangeOfStartingGameInstaKill * player.luck)));
        if (potentialStartingGameInstaKill === 0) {
            player.hp = 0;
            messages.gameOver.push("I can't believe you lost before the game even started.");
            // Do not display the player's score since the game never started
            gameStatus.displayScore = false;
        }

        // turn the enemies, obstacles, items and melee attack variables into empty arrays
        enemies = [];
        obstacles = [];
        items = [];
        meleeAttacks = [];

        // spawn enemies
        let nextEnemyX = 40;
        let enemyXIncrement = 60;
        for (let i = 0; i < numberOfEnemies; i++) {
            enemies.push(new Enemy(nextEnemyX, player, enemyValue));
            nextEnemyX += enemyXIncrement
        }

        // spawn the first opposing obstacles
        for (let i = 0; i < numberOfStartingObstacles; i++) {
            obstacles.push(new Obstacle(true, player));
        }

        // spawn items
        let nextItemY = 50;
        let itemYIncrement = 300;
        for (let i = 0; i < numberOfItems; i++) {
            items.push(new Item(nextItemY, player));
            nextItemY += itemYIncrement;
        }

        // start counting every second the game passes... and potentially remove some score if the player is unlucky
        // assisted by https://www.w3schools.com/jsref/met_win_setinterval.asp
        timer = setInterval(() => {
            gameStatus.secondsPassed++;
            // A luck stat of 1 or less will always lead to lost score each second. Bad luck is cringe
            let potentialScoreLoss = Math.floor((Math.random() * player.luck));
            if (potentialScoreLoss === 0) {
                gameStatus.score--;
            }

            // Try to OHKO the player each second : )
            let rangeOfInstaKillEverySecond = 100;
            player.attemptToInstaKill(rangeOfInstaKillEverySecond, messages);
        }, 1000);

        // the game is ready to begin running
        gameStatus.running = true;
        animate();
    }

    // this function is used to change the game's lag every frame if the game is online
    let decideLag = () => {
        let lag;
        if (gameStatus.online) {
            // decide how much to lag for this frame
            lag = Math.floor(Math.random() * maxLag);
            if (lag === 0) {
                // No proper frame rates allowed in my onine mode! >:(
                // Kill the player for having good luck
                player.hp = 0;
                messages.gameOver.push("A communication error has occurred");

                // Do not display the player's score since they "disconnected". Delete it instead :)
                gameStatus.score = 0;
                gameStatus.enemiesRemoved = 0;
                gameStatus.displayScore = false;
            }
        }
        else {
            // the player is offline. Do not add extra lag
            lag = 0;
        }
        return lag;
    }

    // the main function to run each frame
    let animate = () => {
        // lag the game if it's online. No fun allowed!
        let lag = decideLag();
        setTimeout(() => {
            // proper animation starts here
            let animationId = requestAnimationFrame(animate);
            context.clearRect(0, 0, canvas.width, canvas.height);

            // update game elements
            // Since melee attacks start where the player is, they are drawn first
            meleeAttacks.forEach(meleeAttack => {
                meleeAttack.update(enemies, items, gameStatus);
            });
            player.update(keysPressed);
            items.forEach(item => {
                item.update(player);
            })
            enemies.forEach(enemy => {
                enemy.update(player, messages);
            });
            obstacles.forEach(obstacle => {
                obstacle.update(obstacles, player, enemies, gameStatus, messages);
            });

            updateUI(player);

            // Filter inactive game elements
            // Assisted by https://www.w3schools.com/jsref/jsref_filter.asp
            items = items.filter(item => {
                return item.active;
            });
            enemies = enemies.filter(enemy => {
                return enemy.active;
            });
            meleeAttacks = meleeAttacks.filter(meleeAttack => {
                return meleeAttack.active;
            });

            // Patch code in case the "rollback netcode" glitches and unfairly docks points for an enemy that was legitimately deleted
            while (gameStatus.enemiesRemoved < (numberOfEnemies - enemies.length)) {
                gameStatus.enemiesRemoved++;
                gameStatus.score += enemyValue;
            }

            // Game ending conditions
            // The enemy array must be empty for a win to count. 
            // The count of enemies defeated can't determine a win due to the rollback system
            if (player.hp <= 0 || enemies.length === 0) {
                // assisted by https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
                cancelAnimationFrame(animationId);
                // assisted by https://www.w3schools.com/jsref/met_win_clearinterval.asp
                clearInterval(timer);
                endGame();
            }
        }, lag);
    }

    // This function is called whenever the player chooses to attack
    let attack = (horizontal, positive) => {
        let attackSelectionRange = 50;
        let maxValueForMelee = 25;
        let maxValueForRange = 40;
        let maxValueForShield = 45;

        // random number from 1-50 inclusive
        let randomAttackSelection = Math.floor(Math.random() * attackSelectionRange) + 1;

        if (randomAttackSelection <= maxValueForMelee) {
            // 50% chance. The typical attack
            messages.lastAttack = "Melee";
            meleeAttacks.push(new MeleeAttack(player, horizontal, positive));
        }
        else if (randomAttackSelection <= maxValueForRange) {
            // 30% chance. Unpredictable attack that will kill the player is spammed
            messages.lastAttack = "Range";
            obstacles.push(new Obstacle(false, player));
        }
        else if (randomAttackSelection <= maxValueForShield) {
            // 10% chance. The player briefly gets a shield to survive opposing obstacles
            messages.lastAttack = "Shield";
            player.gainShield();
        }
        else {
            // 10% chance. The player loses 1 HP like a scrub
            messages.lastAttack = "rekt";
            player.healOrDamage(player.recoilDamage);
        }
    }

    // updates the UI with new information each frame
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

    // Stop the game and show the game over screen
    let endGame = () => {
        gameContainer.style.display = "none";
        gameOverScreen.style.display = "flex";
        gameStatus.running = false;

        if (gameStatus.displayScore) {
            // Attempt to delete the player's score
            let scoreDeletionRange = 2;
            let potentialScoreDeletion = Math.floor((Math.random() * (scoreDeletionRange * player.luck)));
            if (potentialScoreDeletion === 0) {
                // delete the player's score. It technically only needs to be hidden, but I feel like going the extra mile :)
                gameStatus.score = 0;
                gameStatus.enemiesRemoved = 0;
                messages.gameOver.push("Your score was randomly deleted, GGs.");
                gameStatus.displayScore = false;
            }
        }

        buildGameOverScreen();
    }

    // set up the game over screen based on events that occurred in the game
    let buildGameOverScreen = () => {
        let playerVictory = false;

        // determine the player's final results

        // determine if the player won or not
        if (enemies.length === 0 && gameStatus.displayScore && player.hp > 0) {
            // the player won somehow

            // This sound was taken from https://www.youtube.com/watch?v=rgysEK_EBHM
            var victorySound = new Audio("../assets/sounds/Stonks.mp4");
            victorySound.play();
            victorySound.currentTime = 0;

            playerVictory = true;
            gameOverTitle.innerHTML = "YOU WON!?";

            // raise the player's score based on how much HP they had left
            let oldScore = gameStatus.score;
            let extraScore;
            if (gameStatus.easyMode) {
                // easy mode starts with twice the HP, so they get half the bonus points
                extraScore = enemyValue * (player.hp / normalToEasyHPConversion);
            }
            else {
                extraScore = enemyValue * player.hp;
            }
            gameStatus.score += extraScore;
            messages.gameOver.push("You ended the game with " + oldScore + " points, but you got " + extraScore + " extra points for having " + player.hp + " HP left over.");
        }
        else {
            // the player lost like a scrub

            // This sound was taken from https://www.youtube.com/watch?v=jEexefuB62c
            var gameOverSound = new Audio("../assets/sounds/ExplosionMeme.mp4");
            gameOverSound.play();
            gameOverSound.currentTime = 0;
            gameOverTitle.innerHTML = "GAME OVER!";
        }

        // Add some messages explaining how the game went if the player kept their score
        if (gameStatus.displayScore) {
            // Display the score
            if (gameStatus.enemiesRemoved === 1){
                messages.gameOver.push("Your score is " + gameStatus.score + " and you defeated " + gameStatus.enemiesRemoved + " enemy.");
            }
            else {
                messages.gameOver.push("Your score is " + gameStatus.score + " and you defeated " + gameStatus.enemiesRemoved + " enemies.");
            }

            // Victory messages
            if (playerVictory) {
                if (gameStatus.easyMode) {
                    // easy mode victory message (online and offline)
                    messages.gameOver.push("You won, but you were on easy mode. Git gud and play on Normal next time.");
                }
                else if (gameStatus.online) {
                    // normal mode offline victory message
                    messages.gameOver.push("You were lucky enough to survive normal? Try taking your skills online for the ultimate experience...");
                }
                else {
                    // normal mode online victory message (the hardest mode in the game)
                    messages.gameOver.push("How in the RNG Hell did you survive online mode on normal!? You're either really lucky, or you're a tryhard that uses ethernet.");
                }
            }

            // losing message if you beat every enemy but died while some were rollbacking
            if (!playerVictory && gameStatus.enemiesRemoved >= numberOfEnemies && gameStatus.online){
                messages.gameOver.push("It appears as though you died while the last enemies were rollbacking. Go fix your Wi-Fi and try again.");
            }
            
            

            // messages to mock the player for having a negative score
            if (gameStatus.score < 0) {
                if (playerVictory) {
                    messages.gameOver.push("You somehow managed to win with a negative score!? You've truly reached an unprecedented level of cringe.");
                }
                else {
                    messages.gameOver.push("You got a negative score? That's pretty cringe.");
                }
            }
        }

        // last message
        messages.gameOver.push("Please select one of the below options or throw your computer out a window.");

        // create the game over message container
        // game over message container setup assisted by https://www.codegrepper.com/code-examples/html/add+and+remove+field+in+html+elements+dynamically+with+javascript and https://www.w3schools.com/jsref/met_node_insertadjacenthtml.asp
        let gameOverMessageContainer = document.createElement("div");
        gameOverTitle.insertAdjacentElement("afterend", gameOverMessageContainer);
        gameOverMessageContainer.id = "game-over-message-container";

        // add all messages collected to the game over screen
        messages.gameOver.forEach(gameOverMessageText => {
            let gameOverMessage = document.createElement("p");
            gameOverMessage.innerHTML = gameOverMessageText;
            document.getElementById("game-over-message-container").appendChild(gameOverMessage);
        });
    }

    // this function prepares to unleash Big Chungus upon RNG HELL Online
    let prepareBigChungusHecc = () => {
        // Prepare to unleash the Chungus
        gameStatus.chungusActive = true;
        gameOverTitle.innerHTML = "WHOLESOME 100";

        // assisted by https://www.w3schools.com/jsref/prop_style_background.asp
        // Chungus received from https://www.pinterest.ca/pin/767863805194651696/
        setTimeout(() => {
            // begin to unleash the Chungus
            document.body.style.background = "url('../assets/images/BigChungus.jpg')";
            let chungusObserver = new IntersectionObserver(bigChungusHecc);
            chungusObserver.observe(gameOverTitle);
            chungusObserver.observe(gameOverScreen);
        }, 1069);
    }

    // A loving recreation of the best Bash command
    let bigChungusHecc = victims => {
        setTimeout(() => {
            let funniNumber = 42069;
            victims.forEach(victim => {
                if (victim.isIntersecting) {
                    for (let chungusCount = 0; chungusCount < funniNumber; chungusCount++) {
                        let bigChungus = document.createElement("img");
                        bigChungus.src = "../assets/images/BigChungus.jpg";

                        // decide randomly whether to prepend or append the next Big Chungus
                        // assisted by https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/prepend
                        let chungusDirectionRange = 2;
                        let chungusDirection = Math.floor((Math.random() * chungusDirectionRange));
                        if (chungusDirection === 0){
                            victim.target.prepend(bigChungus);
                        }
                        else {
                            victim.target.append(bigChungus);
                        }
                    }
                    // There is no unobserving. You cannot escape the Chungus.
                }
            });
        }, 1069);
    }
});

