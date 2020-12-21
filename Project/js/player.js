'use strict';

// Constants for the canvas since this is the first script to be called
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');

// Player constants
const playerSide = 40;
const playerRadius = 8;
const playerSpeed = 5;
const playerRecoilDamage = -1;
const playerShieldFrameDuration = 100;

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
        this.speed = playerSpeed;
        this.recoilDamage = playerRecoilDamage;
        this.activeShieldFrames = 0;
        this.maxActiveShieldFrames = playerShieldFrameDuration;
        this.shield = false;
    }

    // draw the player
    draw() {
        // the player will be a square with a circle in the center. 
        // the circle changes colour based on HP and whether the shield is active or not
        context.save();
        context.translate(this.x, this.y); 


        // The outer square
        context.fillStyle = "blue";
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

    // Update the player each frame
    update(keysPressed) {
        this.move(keysPressed);
        this.evaluateWallCollision();
        if (this.shield){
            this.checkActiveShieldFrames();
        }
        this.draw();
    }

    // This moves the player
    move(keysPressed) {
        if (keysPressed.ArrowUp) {
            this.y -= this.speed;
        }
        if (keysPressed.ArrowDown) {
            this.y += this.speed;
        }
        if (keysPressed.ArrowLeft) {
            this.x -= this.speed;
        }
        if (keysPressed.ArrowRight) {
            this.x += this.speed;
        }
    }

    // This function damages the player based on the value sent
    // Even though you can't heal in game, I made the function capable of healing the player if a positive value is sent
    healOrDamage(valueToChangeHP) {
        this.hp += valueToChangeHP;

        if (!this.shield) {
            this.changeInnerCircleColour();
        }

        if (valueToChangeHP < 0) {
            // the player is getting damaged
            // sound effect taken from https://www.youtube.com/watch?v=17ahNDRc14w
            var playerHitSound = new Audio("../assets/sounds/AirHorn.mp4");
            playerHitSound.play();
            playerHitSound.currentTime = 0;
        }
    }

    /* Change the inner circle's colour to reflect the player's health if they lack a shield */
    changeInnerCircleColour() {
        let aThirdOfHp = this.startingHP / 3;
        let twoThirdsOfHp = aThirdOfHp * 2;
        if (this.hp < aThirdOfHp) {
            this.innerCircleColor = "darkred";
        }
        else if (this.hp < twoThirdsOfHp) {
            this.innerCircleColor = "yellow";
        }
        else {
            this.innerCircleColor = "green";
        }
    }

    // this method is called when I feel like trying to OHKO the player :)
    attemptToInstaKill(potentialInstaKillRange, messages) {
        // A higher luck stat could help to prevent an OHKO
        // assisted by https://www.w3schools.com/jsref/jsref_random.asp
        if (this.hp > 0) {
            let potentialInstaKill = Math.floor((Math.random() * (potentialInstaKillRange * this.luck)));
            if (potentialInstaKill === 0) {
                this.hp = 0;
                // add a message claiming the player was OHKOed for the game over screen
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

    // Give the player a shield and change their design to match their shield
    gainShield() {
        // sound effect taken from https://www.youtube.com/watch?v=rDfrfnZge2s
        var shieldGetSound = new Audio("../assets/sounds/Pingas.mp4");
        shieldGetSound.play();
        shieldGetSound.currentTime = 0;

        this.shield = true;
        this.innerCircleColor = "blue";
        // If the player gets a shield while they already have a shield, the active frame timer is reset
        this.activeShieldFrames = 0;
    }

    // Increment the active shield frames and deactivate the shield if its been active for a full duration
    checkActiveShieldFrames() {
        this.activeShieldFrames++;
        if (this.activeShieldFrames >= this.maxActiveShieldFrames){
            // Deactivate the shield
            this.shield = false;
            this.changeInnerCircleColour();
        }
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

