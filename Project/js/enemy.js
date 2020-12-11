'use strict';
const enemySide = 50;
const enemyRadius = 10;


class Enemy {
    constructor() {
        /* Attributes for drawing */
        // The enemy's starting location will be random
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.width = enemySide;
        this.height = enemySide
        this.radius = enemyRadius;
    }

    draw() {
        // the enemy will look just like the player, but they will be coloured differently
        context.save();
        context.translate(this.x, this.y); //translate the canvas to the enemy's position


        // The outer square
        context.fillStyle = "purple";
        // The square must be spawned with its core in the center
        context.fillRect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

        // The inner circle
        context.fillStyle = "darkred";
        // spawn the circle in the center of the square
        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.restore();
    }

    update() {
        this.draw();
    }
}

