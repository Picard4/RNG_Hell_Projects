'use strict';
document.addEventListener("DOMContentLoaded", () => {
    // constants for the Canvas
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');

    canvas.height = 700;
    canvas.width = 1200;

    let gameStatus = {
        easyMode: false,
        online: false
    };

    // Get important HTML elements for the game
    let startButton = document.getElementById("start-button");
    let mainMenu = document.getElementById("main-menu");

    // Wait for the user to start the game
    startButton.addEventListener("click", event => {
        event.preventDefault();

        mainMenu.style.display = "none";
        canvas.style.display = "block";
    });
});

