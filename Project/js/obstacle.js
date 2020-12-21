'use strict';

// Obstacle constants
const obstacleRadius = 20;
const swapDirection = -1;
const obstacleSpeedRange = 8;

// This class reuses a lot of code from Assignment 4 Question 3
class Obstacle {
    constructor(opposingPlayer, player) {
        this.radius = obstacleRadius;

        // movement attributes
        this.horizontalDirection = this.randomizeDirectionToBePositiveOrNegative();
        this.verticalDirection = this.randomizeDirectionToBePositiveOrNegative();

        // give the obstacles a random speed to reduce the odds of them sticking together
        this.speed = (Math.floor(Math.random() * obstacleSpeedRange) + 1);

        // Determines if the obstacle is trying to kill the player or the enemies
        this.opposingPlayer = opposingPlayer;
        if (opposingPlayer) {
            this.colour = "darkred";
        }
        else {
            this.colour = "blue";
            
            // Play a sound effect if the obstacle is a range attack from the player
            // sound taken from https://www.youtube.com/watch?v=qZC5gtOw3DU
            var rangeAttackSound = new Audio("../assets/sounds/Ding.mp4");
            rangeAttackSound.play();
            rangeAttackSound.currentTime = 0;
        }
        
        this.damage = -1;

        // Do not let an obstacle spawn on the player
        // assisted by https://www.w3schools.com/jsref/jsref_dowhile.asp
        do {
            this.x = Math.floor((Math.random() * (canvas.width - this.radius * 2)) + this.radius);
            this.y = Math.floor((Math.random() * (canvas.height - this.radius * 2)) + this.radius);
        }
        while (this.confirmPlayerCollisionWhenSpawning(player));
    }

    // draw the obstacle
    draw() {
        // obstacles will look like bubbles from Assignment 4 question 3, but with less complex colour changing
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        // assisted by https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        context.closePath();
        context.fillStyle = this.colour;
        context.fill();
        context.restore();
    }

    // update the obstacle
    update(obstacles, player, enemies, gameStatus, messages) {
        this.x += this.horizontalDirection * this.speed;
        this.y += this.verticalDirection * this.speed;
        this.evaluateWallCollision();

        // Only red (opposing) obstacles should be able to harm the player
        if (this.confirmPlayerCollision(player) && this.opposingPlayer) {
            player.healOrDamage(this.damage);
            player.attemptToInstaKill(player.hp, messages);
            player.warp();
        }

        // Only blue (supporting) obstacles should be able to harm enemies and swap allegiances
        if (!this.opposingPlayer) {
            this.evaluateOpposingObstacleCollision(obstacles);
            this.evaluateEnemyCollision(enemies, gameStatus);
        }
        this.draw();
    }

    // Only meant to be used when spawning to have varying directions
    randomizeDirectionToBePositiveOrNegative() {
        let randomDirectionRange = 2;
        let randomDirection = Math.floor((Math.random() * randomDirectionRange));
        if (randomDirection === 1) {
            return 1;
        }
        else {
            return -1;
        }
    }

    // This function confirms if the obstacle spawned in the player's square
    // Hit detection normally works based on the player's circle for obstacles, but I wanted to be a bit more fair (for once)
    confirmPlayerCollisionWhenSpawning(player) {
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.radius && player.x + player.width / 2 >= this.x - this.radius;
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.radius && player.y + player.height / 2 >= this.y - this.radius;
        if (checkXIntersection && checkYIntersection) {
            return true;
        }
        return false;
    }

    // This is the normal player collision check. Intersections only count if the obstacle collides with the player's circle
    confirmPlayerCollision(player) {
        let checkXIntersection = player.x - player.radius <= this.x + this.radius && player.x + player.radius >= this.x - this.radius;
        let checkYIntersection = player.y - player.radius <= this.y + this.radius && player.y + player.radius >= this.y - this.radius;

        // If the player has their shield active, they cannot be hit by obstacles
        if (checkXIntersection && checkYIntersection && !player.shield) {
            return true;
        }
        return false;
    }

    // Check if any obstacles that support the player hit an enemy's circle
    evaluateEnemyCollision(enemies, gameStatus) {
        enemies.forEach(enemy => {
            let checkXIntersection = enemy.x - enemy.radius <= this.x + this.radius && enemy.x + enemy.radius >= this.x - this.radius;
            let checkYIntersection = enemy.y - enemy.radius <= this.y + this.radius && enemy.y + enemy.radius >= this.y - this.radius;
            
            // calculate hit chance
            let luckyHitRange = 2;
            let luckyHit = Math.floor(Math.random() * luckyHitRange);

            if (checkXIntersection && checkYIntersection && luckyHit === 0){
                // The enemy was hit. They are defeated
                enemy.getDefeated(gameStatus);
            }
            if (checkXIntersection && checkYIntersection && luckyHit !== 0){
                // The attack missed, so it shall be corrupted into an enemy obstacle
                this.changeAllegiance();
            }
        });
    }

    // If an obstacle is colliding with an opposing obstacle, it should change allegiance
    // In the game, this is used to corrupt the player's obstacles into enemy obstacles but it can work both ways
    evaluateOpposingObstacleCollision(obstacles) {
        obstacles.forEach(obstacle => {
            let checkXIntersection = obstacle.x - obstacle.radius <= this.x + this.radius && obstacle.x + obstacle.radius >= this.x - this.radius;
            let checkYIntersection = obstacle.y - obstacle.radius <= this.y + this.radius && obstacle.y + obstacle.radius >= this.y - this.radius;
            let checkOpposition = this.opposingPlayer !== obstacle.opposingPlayer;
            if (checkXIntersection && checkYIntersection && checkOpposition) {
                this.changeAllegiance();
            }
        });
    }

    // Change the obstacle's allegiance and design
    changeAllegiance() {
        if (this.opposingPlayer) {
            this.opposingPlayer = false;
            this.colour = "blue";
        }
        else {
            this.opposingPlayer = true;
            this.colour = "darkred"
        }
    }

    // Obstacles bounce off of walls just like bubbles in assignment 4 question 3
    evaluateWallCollision() {
        //Horizontal checks
        let leftWallCheck = this.x <= this.radius && this.horizontalDirection < 0;
        let rightWallCheck = this.x >= canvas.width - this.radius && this.horizontalDirection > 0;

        if (leftWallCheck || rightWallCheck) {
            this.horizontalDirection *= swapDirection;
        }

        //Vertical checks
        let upWallCheck = this.y <= this.radius && this.verticalDirection < 0;
        let downWallCheck = this.y >= canvas.height - this.radius && this.verticalDirection > 0;

        if (upWallCheck || downWallCheck) {
            this.verticalDirection *= swapDirection;
        }

    }
}

