'use strict';
const itemSide = 20;

class Item {
    constructor(y, player) {
        this.width = itemSide;
        this.height = itemSide;
        this.active = true;

        this.y = y;
        do {
            this.x = (Math.random() * (canvas.height - this.width * 2)) + this.width;
        }
        while (this.confirmPlayerCollision(player));
    }

    draw() {
        /* Code concerning the drawing of the item goes here. */
        // Code assisted by the Assignment 4 Exercise and https://www.w3schools.com/tags/canvas_lineto.asp
        context.save();
        context.translate(this.x, this.y);
        context.beginPath();
        context.fillStyle = "yellow";
        context.fillRect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
        context.closePath();
        context.beginPath();
        context.strokeStyle = "red";
        context.moveTo(-this.width / 2, 0);
        context.lineTo(this.width / 2, 0);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(0, -this.height / 2);
        context.lineTo(0, this.height / 2);
        context.stroke();
        context.closePath();
        context.restore();
    }

    // Update the item
    update(player) {
        if (this.confirmPlayerCollision(player)) {
            // The item has been collected
            this.changePlayerLuck(player);
            this.getRemoved();
        }
        this.draw();
    }

    // Confirm if the player is colliding with the item (square hitboxes)
    confirmPlayerCollision(player) {
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.width && player.x + player.width / 2 >= this.x - this.width;
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.height && player.y + player.height / 2 >= this.y - this.height;
        if (checkXIntersection && checkYIntersection) {
            return true;
        }
        return false;
    }

    // Either increase or decrease the player's luck
    changePlayerLuck(player) {
        let luckChangeRange = 3;
        let potentialLuckBuff = Math.floor(Math.random() * luckChangeRange);
        if (potentialLuckBuff == 0) {
            player.luck++;
        }
        else if (player.luck > 0) {
            player.luck--;
        }
    }

    getRemoved() {
        this.active = false;
        // Sound taken from https://www.youtube.com/watch?v=2ZIpFytCSVc
        var itemRemovedSound = new Audio("../assets/sounds/Bruh.mp4");
        itemRemovedSound.play();
        itemRemovedSound.currentTime = 0;
    }
}

