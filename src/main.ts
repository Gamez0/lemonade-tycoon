import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { MainMenu as MainGame } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { DayScene } from "./scenes/day-scene";

import { Game, Types } from "phaser";

import WebFont from "webfontloader";

// Catch global errors and display them in an alert so users can report the issue.
window.onerror = function (message, source, lineno, colno, error) {
    console.error(error);
    // const errorString = `Received unhandled error. Open browser console and click OK to see details.\nError: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nStack: ${error.stack}`;
    //alert(errorString);
    // Avoids logging the error a second time.
    return true;
};

// Catch global promise rejections and display them in an alert so users can report the issue.
window.addEventListener("unhandledrejection", (event) => {
    // const errorString = `Received unhandled promise rejection. Open browser console and click OK to see details.\nReason: ${event.reason}`;
    console.error(event.reason);
    //alert(errorString);
});

WebFont.load({
    google: {
        families: ["Play"],
    },
});

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#18ae31",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainGame, GameOver, DayScene],
};

export default new Game(config);
