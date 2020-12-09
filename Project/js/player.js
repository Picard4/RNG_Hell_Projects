'use strict';
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
const playerSide = 50;
const playerRadius = 10;

class Player {
    constructor() {
        // The player will always spawn in the center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.width = playerSide;
        this.height = playerSide
        this.radius = playerRadius;

        this.hp = 10;
        this.speed = 10;
    }

    draw() {
        // the player will be a square with a circle in the center. 
        // the circle changes colour based on HP, while the square changes colour based on their status
        context.save();
        context.translate(this.x, this.y); //translate the canvas to the player's position


        // The outer square
        context.fillStyle = "blue";
        // The square must be spawned with its core in the center
        context.fillRect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

        // The inner circle
        context.fillStyle = 'green';
        // spawn the circle in the center of the square
        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        
        context.restore();
    }

    update() {
        this.evaluateWallCollision();
        // movement will be handled in the arrow key event listener in main
        this.draw();
    }

    healOrDamage(valueToChangeHP) {
        this.hp += valueToChangeHP;
    }

    oneHitKnockout() {
        // this method is called when I feel like OHKOing the player :)
        this.hp = 0;
    }

    evaluateWallCollision() {
        // bug here based on which methods are last

        //Vertical checks
        let upWallCheck = this.y - this.height / 2 <= 0;
        if (upWallCheck) {
            this.y = this.height /2;
            return;
        }

        let downWallCheck = this.y + this.height / 2 >= canvas.height;
        if (downWallCheck) {
            this.y = canvas.height - this.height / 2;
            return;
        }

        // Horizontal checks
        let leftWallCheck = this.x - this.width / 2 <= 0;
        if (leftWallCheck) {
            this.x = this.width / 2;
            return;
        }

        let rightWallCheck = this.x + this.width / 2 >= canvas.width;
        if (rightWallCheck) {
            this.x = canvas.width - this.width / 2;
            return;
        }
    }
}

