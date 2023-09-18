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
import GamePlay from './GamePlay';
import cursors from './cursors';



export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState();
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
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
    this.gamePlay.redrawPositions(this.gameState.teamsPositions);

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
      this.gameState.teamsPositions.push(new PositionCharacter(el, generatePositionPlayer(this.gamePlay.position)));
    }
    for (const item of this.gameState.teamsComputer.teams) {
      this.gameState.teamsPositions.push(new PositionCharacter(item, generatePositionComputer(this.gamePlay.position)));
    }
    this.gameState.teamsPositionIndex = this.gameState.teamsPositions.map((el) => el.position);
    // const position = this.gameState.teamsPlayerPositions.filter(((element) => element.position));
    // position.map(item, () => {
    //   if ()
    // })
  }

  onCellClick(index) {
    if (this.gameState.teamsPositionIndex.includes(index) && this.gameState.teamsPlayer.teams.includes(this.searchHero(index))) {
     if (this.gameState.selectPositionIndex) {
      this.gamePlay.deselectCell(this.gameState.selectPositionIndex);
    }
      this.gamePlay.selectCell(index);
      this.gameState.selectPositionIndex = index;
      this.showPossibleTransition(index, this.searchHero(index).range);
      console.log(this.gameState.possiblePositions);
    } 
    if (this.gameState.teamsPositionIndex.includes(index)
    && !this.gameState.teamsPlayer.teams.includes(this.searchHero(index))
    && !this.gameState.selectPositionIndex) {
      GamePlay.showError('Это не персонаж игрока!');
    }

    if (this.gameState.selectPositionIndex === index) {
      this.gamePlay.setCursor(cursors.auto);
    }
    // TODO: react to click
  }

  onCellEnter(index) {
    // console.log(this.gameState.teamsPositionIndex);
    // Chracter information on hover
    console.log(index);

    if (this.gameState.teamsPositionIndex.includes(index)) {
      this.gamePlay.showCellTooltip(generateMessage(this.searchHero(index)), index);
      if (this.gameState.teamsPlayer.teams.includes(this.searchHero(index))) {
        this.gamePlay.setCursor(cursors.pointer);
      }
    }

    

    // cursor selected
    // if (!this.gameState.teamsPositions.includes(index)) {
    //   this.gamePlay.setCursor(cursors.auto);
    // }
    // if (this.gameState.selectPositionIndex === index) {
    //   this.gamePlay.setCursor(cursors.auto);
    // }
    if ((this.gameState.selectPositionIndex === index)) {
      this.gamePlay.setCursor(cursors.auto);
      
    }
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    if (!this.gameState.teamsPositionIndex.includes(index)) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor(cursors.auto);
    }

    // TODO: react to mouse leave
  }

  searchHero(index) {
    const key = this.gameState.teamsPositions.findIndex((item) => item.position === index);
    return this.gameState.teamsPositions[key].character;
  }

  showPossibleTransition(index, range, boardSize = 8) {
    this.gameState.possiblePositions = [];
    // left
    let countLeft, countTop, countright, countBottom;
 
    (index % boardSize > range) ? countLeft = range : countLeft = index % boardSize;
    
    for (let i = 1; i <= countLeft; i += 1) {
      const indexTransition = index - i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // right
    
    for (let i = 1; i <= range; i += 1) {
      const indexTransition = index + i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // top
    if (index < ((boardSize * range) - 1)) {
      console.log('top'); 
      
    } 
    for (let i = 1; i <= range; i += 1) {
      const indexTransition = index - boardSize * i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // bottom
    if (index > ((boardSize ** 2 - 1) - (boardSize * range))) {console.log('bottom')}

    for (let i = 1; i <= range; i += 1) {
      const indexTransition = index + boardSize * i;
      this.gameState.possiblePositions.push(indexTransition);
    }
  }
}
