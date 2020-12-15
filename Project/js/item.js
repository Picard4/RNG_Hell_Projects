'use strict';

class Item {
    constructor() {
        this.x = 50
        this.y = 50;
    }

    draw() {
        /* Code concerning the drawing of the item goes here. */
        // Code assisted by the Assignment 4 Exercise
        context.save();
        context.translate(this.x, this.y); 
        context.beginPath();
        context.moveTo(25, 0);
        context.lineTo(50, 25);
        context.lineTo(50, 0)
        context.closePath();
        context.fillStyle = "yellow";
        context.fill();
        context.restore();
    }

    update() {
        this.draw();
    }
}

