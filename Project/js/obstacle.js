'use strict';
const obstacleRadius = 20;
const swapDirection = -1;

// This class reuses a lot of code from Assignment 4 Question 3
class Obstacle {
    constructor(colour) {
        this.radius = obstacleRadius;
        this.horizontalDirection = this.randomizeDirectionToBePositiveOrNegative();
        this.verticalDirection = this.randomizeDirectionToBePositiveOrNegative();
        this.speed = 5;
        this.colour = colour;
        this.x = Math.floor((Math.random() * (canvas.width - this.radius * 2)) + this.radius);
        this.y = Math.floor((Math.random() * (canvas.width - this.radius * 2)) + this.radius);
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

    update() {
        this.x += this.horizontalDirection * this.speed;
        this.y += this.verticalDirection * this.speed;
        this.evaluateWallCollision();
        this.draw();
    }

    randomizeDirectionToBePositiveOrNegative(){
        let randomDirection = Math.floor((Math.random() * 2));
        if (randomDirection == 1){
            return 1;
        }
        else {
            return -1;
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

