/**
 * Entry point of app: don't change this
 */
import GamePlay from './GamePlay';
// eslint-disable-next-line import/no-named-as-default, import/no-named-as-default-member
import GameController from './GameController';
import GameStateService from './GameStateService';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

// don't write your code here
