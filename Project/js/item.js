'use strict';
const itemSide = 30;

class Item {
    constructor(y, player) {
        this.width = itemSide;
        this.height = itemSide;

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

    update() {
        this.draw();
    }

    confirmPlayerCollision(player){
        let checkXIntersection = player.x - player.width / 2 <= this.x + this.width && player.x + player.width / 2 >= this.x - this.width;
        let checkYIntersection = player.y - player.height / 2 <= this.y + this.height && player.y + player.height / 2 >= this.y - this.height;
        if (checkXIntersection && checkYIntersection){
            return true;
        }
        return false;
    }
}

