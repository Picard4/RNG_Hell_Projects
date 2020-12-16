'use strict';
const obstacleRadius = 20;
const swapDirection = -1;

// This class reuses a lot of code from Assignment 4 Question 3
class Obstacle {
    constructor(opposingPlayer, player) {
        this.radius = obstacleRadius;
        this.horizontalDirection = this.randomizeDirectionToBePositiveOrNegative();
        this.verticalDirection = this.randomizeDirectionToBePositiveOrNegative();
        this.speed = 4;

        // Determines if the obstacle is trying to kill the player or the enemies
        this.opposingPlayer = opposingPlayer;
        
        if (opposingPlayer == true){
            this.colour = "darkred";
        }
        else {
            this.colour = "blue";
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

    draw() {
        /* Code concerning the drawing of the obstacle goes here. */
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        // assisted by https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        context.closePath();
        context.fillStyle = this.colour;
        context.fill();
        context.restore();
    }

    update(player, messages) {
        this.x += this.horizontalDirection * this.speed;
        this.y += this.verticalDirection * this.speed;
        this.evaluateWallCollision();
        if (this.confirmPlayerCollision(player)) {
            player.attemptToInstaKill(player.hp, messages);
            player.healOrDamage(this.damage);
            player.warp();
        }
        this.draw();
    }

    randomizeDirectionToBePositiveOrNegative() {
        let randomDirection = Math.floor((Math.random() * 2));
        if (randomDirection == 1) {
            return 1;
        }
        else {
            return -1;
        }
    }

    // This function confirms if the obstacle spawned in the player's square
    // Hit detection normally works based on the player's circle for obstacles, but I wanted to be a bit more fair (for once)
    confirmPlayerCollisionWhenSpawning(player) {
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.radius && player.x + player.width / 2 >= this.x - this.radius
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.radius && player.y + player.height / 2 >= this.y - this.radius
        if (checkXIntersection && checkYIntersection) {
            return true;
        }
        return false;
    }

    // This is the normal player collision check. Intersections only count if they collide with the player's circle
    confirmPlayerCollision(player) {
        let checkXIntersection = player.x - player.radius <= this.x + this.radius && player.x + player.radius >= this.x - this.radius
        let checkYIntersection = player.y - player.radius <= this.y + this.radius && player.y + player.radius >= this.y - this.radius
        
        // Only red (opposing) obstacles should be able to harm the player
        if (checkXIntersection && checkYIntersection && this.opposingPlayer === true) {
            return true;
        }
        return false;
    }

    changeAllegiance(){
        if (this.opposingPlayer == true){
            this.opposingPlayer = false;
            this.colour = "green";
        }
        else {
            this.opposingPlayer = true;
            this.colour = "darkred"
        }
    }

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

