'use strict';
const enemySide = 30;
const enemyRadius = 6;
const fakeDespawnZone = 9001;

class Enemy {
    constructor(x, player, value) {
        /* Attributes for drawing */
        this.width = enemySide;
        this.height = enemySide
        this.radius = enemyRadius;
        this.damage = -1;
        this.active = true;
        this.value = value;

        // We need to know if the enemy is rolling back to try to avoid glitches
        this.rollingBack = false;

        // The enemy's Y axis will be random, but the X is hard coded to stop clusters of enemies from making the game easy
        this.x = x;
        do {
            this.y = (Math.random() * (canvas.height - this.height * 2)) + this.height;
        }
        while (this.confirmPlayerCollision(player));
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

    // update the enemy
    update(player, messages) {
        this.draw();
        if (this.confirmPlayerCollision(player)) {
            player.healOrDamage(this.damage);
            player.attemptToInstaKill(player.hp, messages);
            player.warp();
        }
    }

    // The function for when an enemy is considered defeated. Will it stay down, or will it roll back?
    defeat(gameStatus) {
        // Enemies cannot be double killed... just in case something happens
        if (this.active == true) {
            let rollbackRange = 2;
            let rollbackChance = Math.floor(Math.random() * rollbackRange);

            if (rollbackChance === 0 && gameStatus.online === true) {
                this.rollback(gameStatus);
            }
            else {
                this.active = false;
                gameStatus.score += this.value;
                gameStatus.enemiesRemoved++;
            }

            // Play defeat sound effect
            // Sound effect taken from https://www.youtube.com/watch?v=Wy_euU-zeSg
            var enemyDefeatedSound = new Audio("../assets/BassBoost.mp4");
            enemyDefeatedSound.play();
            enemyDefeatedSound.currentTime = 0;
        }
    }

    // Trick the player into thinking they beat an enemy and then bring it back after some time
    rollback(gameStatus) {
        // Send the enemy to the fake despawn zone and update the gameStatus to give the appearance that they're gone
        gameStatus.score += this.value;
        gameStatus.enemiesRemoved++;
        let oldY = this.y;
        this.y = fakeDespawnZone;
        this.rollingBack = true;

        setTimeout(() => {
            if (this.rollingBack === true) {
                // The enemy was not defeated, after all. Roll back! :)
                this.y = oldY;
                gameStatus.score -= this.value;
                gameStatus.enemiesRemoved--;
                this.rollingBack = false;
            }
        }, 3000)
    }

    // confirm if the player is colliding with this enemy (square hitboxes only)
    confirmPlayerCollision(player) {
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.width / 2 && player.x + player.width / 2 >= this.x - this.width / 2;
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.height / 2 && player.y + player.height / 2 >= this.y - this.height / 2;
        if (checkXIntersection && checkYIntersection) {
            return true;
        }
        return false;
    }
}

