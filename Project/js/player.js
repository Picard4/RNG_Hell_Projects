'use strict';

// Constants related to the entire game
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
const despawnZone = 9001;

 // Player constants
const playerSide = 40;
const playerRadius = 8;

class Player {
    constructor(hp, luck) {
        /* Attributes for drawing */
        // The player will always spawn in the center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.width = playerSide;
        this.height = playerSide
        this.radius = playerRadius;
        this.innerCircleColor = "green";

        /* Attributes for gameplay */
        this.hp = hp;
        this.luck = luck;
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

    // This moves the player and increases the amount of spaces they moved
    move(keysPressed) {
        if (keysPressed.ArrowUp === true) {
            this.y -= this.speed;
        }
        if (keysPressed.ArrowDown === true) {
            this.y += this.speed;
        }
        if (keysPressed.ArrowLeft === true) {
            this.x -= this.speed;
        }
        if (keysPressed.ArrowRight === true) {
            this.x += this.speed;
        }
    }

    // This function damages the player based on the value sent
    // Even though you can't heal in game, I made the function capable of healing the player
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

        if (valueToChangeHP < 0) {
            // the player is getting damaged
            // sound effect taken from https://www.youtube.com/watch?v=17ahNDRc14w
            var playerHitSound = new Audio("../assets/AirHorn.mp4");
            playerHitSound.play();
            playerHitSound.currentTime = 0;
        }
    }

    // this method is called when I feel like trying to OHKO the player :)
    attemptToInstaKill(chanceOfInstaKill, messages) {
        // A higher luck stat could help to prevent an OHKO
        // assisted by https://www.w3schools.com/jsref/jsref_random.asp
        if (this.hp > 0) {
            let potentialInstaKill = Math.floor((Math.random() * (chanceOfInstaKill * this.luck)));
            if (potentialInstaKill == 0) {
                this.hp = 0;
                messages.gameOver.push("Congratulations you were somehow OHKOed n00b");
            }
        }
    }

    // the player can warp whenever they want or when they're hit
    // Warping intentionally has no collision checking to allow for the player to get comboed
    warp() {
        this.x = (Math.random() * (canvas.width - this.width * 2)) + this.width;
        this.y = (Math.random() * (canvas.height - this.height * 2)) + this.height;
    }

    // the player can't go through walls
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

