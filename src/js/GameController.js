import themes from './themes';
import PositionCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

import redrawPositions from './GamePlay';
import GameState from './GameState';
import { characterGenerator, generateMessage, generatePositionComputer, generatePositionPlayer, generateTeam } from './generators';



export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState();
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.generateTeams();
    this.generatePlayersonBoard();
    // this.gameState.teamsPlayer = generateTeam(this.gameState.listTeamsPlayer, this.gameState.level, 2);
    // this.gameState.teamsComputer = generateTeam(this.gameState.listTeamsComputer, this.gameState.level, 2); 
    
    // for (const el of this.gameState.teamsPlayer.teams) {
    //   this.gameState.teamsPlayerPositions.push(new PositionCharacter(el, generatePositionPlayer(this.gamePlay.position)));
    // }
    // for (const item of this.gameState.teamsComputer.teams) {
    //   this.gameState.teamsPlayerPositions.push(new PositionCharacter(item, generatePositionComputer(this.gamePlay.position)));
    // }
    this.gamePlay.redrawPositions(this.gameState.teamsPlayerPositions);

    // const character = characterGenerator(this.gameState.listTeamsPlayer, this.gameState.level).next().value;
    // const team = [];
    // const positionCharacter = new PositionCharacter(character, generatePositionPlayer(this.gamePlay.position));
    // const positionCharacter2 = new PositionCharacter(character, generatePositionPlayer(this.gamePlay.position));
    // team.push(positionCharacter, positionCharacter2);
    // this.gamePlay.redrawPositions(team);
    // console.log(this.gameState);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }
  
  generateTeams() {
    this.gameState.teamsPlayer = generateTeam(this.gameState.listTeamsPlayer, this.gameState.level, 2);
    this.gameState.teamsComputer = generateTeam(this.gameState.listTeamsComputer, this.gameState.level, 2);
  }


  generatePlayersonBoard() {
    for (const el of this.gameState.teamsPlayer.teams) {
      this.gameState.teamsPlayerPositions.push(new PositionCharacter(el, generatePositionPlayer(this.gamePlay.position)));
    }
    for (const item of this.gameState.teamsComputer.teams) {
      this.gameState.teamsPlayerPositions.push(new PositionCharacter(item, generatePositionComputer(this.gamePlay.position)));
    }
    this.gameState.teamsPositionIndex = this.gameState.teamsPlayerPositions.map((el) => el.position);
    // const position = this.gameState.teamsPlayerPositions.filter(((element) => element.position));
    // position.map(item, () => {
    //   if ()
    // })
  }

  onCellClick(index) {
  
    // TODO: react to click
  }

  onCellEnter(index) {
    // console.log(this.gameState.teamsPositionIndex);
    if (this.gameState.teamsPositionIndex.includes(index)) {
      this.gamePlay.showCellTooltip(generateMessage(this.gameState.teamsPlayerPositions[0].character), this.gameState.teamsPositionIndex[0]);
    }
   
    
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
