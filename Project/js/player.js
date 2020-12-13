'use strict';
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
const playerSide = 50;
const playerRadius = 10;

class Player {
    constructor() {
        /* Attributes for drawing */
        // The player will always spawn in the center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.width = playerSide;
        this.height = playerSide
        this.radius = playerRadius;
        this.innerCircleColor = "green";

        /* Attributes for gameplay */
        this.hp = 10;
        this.startingHP = this.hp;
        this.speed = 5;
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
        context.fillStyle = this.innerCircleColor;
        // spawn the circle in the center of the square
        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.restore();
    }

    update(keysPressed) {
        this.move(keysPressed);
        this.evaluateWallCollision();
        this.draw();
    }

    move(keysPressed){
        if (keysPressed.ArrowUp === true){
            this.y -= this.speed;
        }
        if (keysPressed.ArrowDown === true){
            this.y += this.speed;
        }
        if (keysPressed.ArrowLeft === true){
            this.x -= this.speed;
        }
        if (keysPressed.ArrowRight === true){
            this.x += this.speed;
        }
        if (keysPressed.z === true){
            this.warp();
        }
    }

    healOrDamage(valueToChangeHP) {
        this.hp += valueToChangeHP;

        /* Change the inner circle's colour to reflect the player's health */
        let thirdHp = this.startingHP / 3;
        let twoThirdHp = thirdHp * 2;
        if (this.hp < thirdHp) {
            this.innerCircleColor = "darkred";
        }
        else if (this.hp < twoThirdHp) {
            this.innerCircleColor = "yellow";
        }
        else {
            this.innerCircleColor = "green";
        }
    }

    oneHitKnockout() {
        // this method is called when I feel like OHKOing the player :)
        this.hp = 0;
    }

    warp(){
        this.x = (Math.random() * (canvas.width - this.width * 2)) + this.width;
        this.y = (Math.random() * (canvas.height - this.height * 2)) + this.height;
        this.hp--;
    }

    evaluateWallCollision() {
        //Vertical checks
        let upWallCheck = this.y - this.height / 2 <= 0;
        if (upWallCheck) {
            this.y = this.height / 2;
        }

        let downWallCheck = this.y + this.height / 2 >= canvas.height;
        if (downWallCheck) {
            this.y = canvas.height - this.height / 2;
        }

        // Horizontal checks
        let leftWallCheck = this.x - this.width / 2 <= 0;
        if (leftWallCheck) {
            this.x = this.width / 2;
        }

        let rightWallCheck = this.x + this.width / 2 >= canvas.width;
        if (rightWallCheck) {
            this.x = canvas.width - this.width / 2;
        }
    }
}

