'use strict';

class Enemy {
    constructor(x, y) {
        
    }

    draw() {
        
    }

    update() {
        this.evaluateWallCollision();
        this.draw();
    }



    evaluateWallCollision() {
        // Horizontal checks
        let leftWallCheck = this.x <= 0;
        if (leftWallCheck) {
            this.x = canvas.width;
            return;
        }

        let rightWallCheck = this.x >= canvas.width;
        if (rightWallCheck) {
            this.x = 0;
            return;
        }

        //Vertical checks
        let upWallCheck = this.y <= 0;
        if (upWallCheck) {
            this.y = canvas.height;
            return;
        }

        let downWallCheck = this.y >= canvas.height;
        if (downWallCheck) {
            this.y = 0;
            return;
        }

    }
}

