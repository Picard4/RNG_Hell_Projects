'use strict';

// Melee attack constants
const meleeAttackSide = 40;
const meleeAttackSpeed = 8;
const meleeAttackFrameDuration = 15;

class MeleeAttack {
    constructor(player, horizontal, positive) {
        // drawing attributes
        this.width = meleeAttackSide;
        this.height = meleeAttackSide;
        this.x = player.x;
        this.y = player.y;

        // movement attributes
        this.speed = meleeAttackSpeed;
        this.horizontal = horizontal;
        if (positive) {
            this.direction = 1;
        }
        else {
            this.direction = -1;
        }

        // gameplay attributes
        this.active = true;
        this.activeFrames = 0;
        this.maxActiveFrames = meleeAttackFrameDuration;

        // Play a sound since the player unleashed a melee attack
        // sound taken from https://www.youtube.com/watch?v=3fVfRPADqtE
        var meleeAttackSound = new Audio("../assets/sounds/Hitmarker.mp4");
        meleeAttackSound.play();
        meleeAttackSound.currentTime = 0;
    }

    // draw the Melee Attack
    draw() {
        // A melee attack will be a square without a circle, basically the inverse of an obstacle
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = "green";
        context.fillRect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
        context.restore();
    }

    // Update the melee attack each frame
    update(enemies, items, gameStatus) {
        if (this.horizontal) {
            this.x += this.direction * this.speed;
        }
        else {
            this.y += this.direction * this.speed;
        }
        this.evaluateWallCollision();
        this.evaluateItemCollision(items);
        this.evaluateEnemyCollision(enemies, gameStatus);
        this.checkActiveFrames();
        this.draw();
    }

    // increment the active frames and set up the melee attack for deletion if it has been active for its duration
    checkActiveFrames() {
        this.activeFrames++;
        if (this.activeFrames >= this.maxActiveFrames) {
            this.active = false;
        }
    }

    // Melee attacks disappear upon hitting walls, but they should be able to glide along them
    evaluateWallCollision() {
        //Vertical checks
        let upWallCheck = this.y - this.height / 2 < 0;
        let downWallCheck = this.y + this.height / 2 > canvas.height;

        // Horizontal checks
        let leftWallCheck = this.x - this.width / 2 < 0;
        let rightWallCheck = this.x + this.width / 2 > canvas.width;

        if (upWallCheck || downWallCheck || leftWallCheck || rightWallCheck) {
            this.active = false;
        }
    }

    // confirm collision with every item and destroy both the item and the melee attack if there is a collision
    evaluateItemCollision(items) {
        items.forEach(item => {
            let checkXIntersection = item.x - item.width / 2 <= this.x + this.width / 2 && item.x + item.width / 2 >= this.x - this.width / 2;
            let checkYIntersection = item.y - item.height / 2 <= this.y + this.height / 2 && item.y + item.height / 2 >= this.y - this.height / 2;
            if (checkXIntersection && checkYIntersection) {
                item.getRemoved();
                this.active = false;
            }
        });
    }

    // confirm collision with every enemy. If a collision occurs, delete the melee attack and only delete the enemy if the attack hit
    evaluateEnemyCollision(enemies, gameStatus) {
        enemies.forEach(enemy => {
            let checkXIntersection = enemy.x - enemy.width / 2 <= this.x + this.width / 2 && enemy.x + enemy.width / 2 >= this.x - this.width / 2;
            let checkYIntersection = enemy.y - enemy.height / 2 <= this.y + this.height / 2 && enemy.y + enemy.height / 2 >= this.y - this.height / 2;

            // calculate hit chance
            let luckyHitRange = 2;
            let luckyHit = Math.floor(Math.random() * luckyHitRange);

            if (checkXIntersection && checkYIntersection && luckyHit === 0) {
                // The enemy was hit. Get the enemy defeated and remove the melee attack
                enemy.getDefeated(gameStatus);
                this.active = false;
            }
            if (checkXIntersection && checkYIntersection && luckyHit !== 0) {
                // The attack missed. Remove the melee attack
                this.active = false;
            }
        });
    }
}

