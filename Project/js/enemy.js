'use strict';
const enemySide = 30;
const enemyRadius = 6;


class Enemy {
    constructor(x, player) {
        /* Attributes for drawing */
        this.width = enemySide;
        this.height = enemySide
        this.radius = enemyRadius;
        this.damage = -1;

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

    confirmPlayerCollision(player){
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.width && player.x + player.width / 2 >= this.x - this.width;
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.height && player.y + player.height / 2 >= this.y - this.height;
        if (checkXIntersection && checkYIntersection){
            return true;
        }
        return false;
    }

    update(player, messages) {
        this.draw();
        if (this.confirmPlayerCollision(player)){
            player.attemptToInstaKill(player.hp, messages);
            player.healOrDamage(this.damage);
            player.warp();
        }
    }
}

