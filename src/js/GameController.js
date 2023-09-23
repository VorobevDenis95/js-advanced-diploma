import themes from './themes';
import PositionCharacter from './PositionedCharacter';

import GameState from './GameState';
import {
  generateMessage, generatePositionComputer, generatePositionPlayer, generateRandomKey, generateTeam,
} from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';
import { calcCoordinateCharacter, filterPosition } from './utils';

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
    this.gamePlay.redrawPositions(this.gameState.teamsPositions);
  }

  generateTeams() {
    this.gameState.teamsPlayer = generateTeam(this.gameState.listTeamsPlayer, this.gameState.level, 2);
    this.gameState.teamsComputer = generateTeam(this.gameState.listTeamsComputer, this.gameState.level, 2);
  }

  generatePlayersonBoard() {
    for (const el of this.gameState.teamsPlayer.teams) {
      let position = generatePositionPlayer(this.gamePlay.position);
      while (position === this.gamePlay.randomPosition) {
        position = generatePositionPlayer(this.gamePlay.position);
      }
      this.gamePlay.randomPosition = position;
      this.gameState.teamsPositions.push(new PositionCharacter(el, this.gamePlay.randomPosition));
    }
    for (const item of this.gameState.teamsComputer.teams) {
      let positionComp = generatePositionComputer(this.gamePlay.position);
      while (positionComp === this.gamePlay.randomPosition) {
        positionComp = generatePositionComputer(this.gamePlay.position);
      }
      this.gamePlay.randomPosition = positionComp;
      this.gameState.teamsPositions.push(new PositionCharacter(item, this.gamePlay.randomPosition));
    }
    this.filterTeamsPosition();
  }

  checkDeath(character, index) {
    if (character.health <= 0) {
      const key = this.gameState.teamsPositions.findIndex((el) => el.position === index);
      let arr;
      if (this.gameState.teamsPlayer.teams.includes(character)) {
        arr = this.gameState.teamsPlayer.teams;
      } else {
        arr = this.gameState.teamsComputer.teams;
      }
      const keyTeams = arr.findIndex((el) => el.health <= 0);
      this.gameState.teamsPositions.splice(key, 1);
      arr.splice(keyTeams, 1);
      this.filterTeamsPosition();
      this.gamePlay.deselectCell(index);
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  async attack(attacker, target, index) {
    const damage = Math.floor(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
    // eslint-disable-next-line no-param-reassign
    target.health -= damage;
    await this.gamePlay.showDamage(index, damage);
    this.checkDeath(target, index);
    this.gamePlay.redrawPositions(this.gameState.teamsPositions);
  }

  filterTeamsPosition() {
    this.gameState.teamsPositionIndex = this.gameState.teamsPositions.map((el) => el.position);
  }

  onCellClick(index) {
    if (this.gameState.teamsPositionIndex.includes(index)
     && this.gameState.teamsPlayer.teams.includes(this.searchHero(index))) {
      if (this.gameState.selectPositionIndex) {
        this.gamePlay.deselectCell(this.gameState.selectPositionIndex);
      }
      this.gamePlay.selectCell(index);
      this.gameState.selectPositionIndex = index;
      this.showPossibleTransition(index, this.searchHero(index).range);
      this.showOpportunityAttack(index, this.searchHero(index).rangeAttack);

      console.log(this.gameState.possiblePositions);
      console.log(this.gameState.possibleAttack);
    }
    if (this.gameState.teamsPositionIndex.includes(index)
    && !this.gameState.teamsPlayer.teams.includes(this.searchHero(index))
    && !this.gameState.selectPositionIndex) {
      GamePlay.showError('Это не персонаж игрока!');
    }

    if (this.gameState.selectPositionIndex === index) {
      this.gamePlay.setCursor(cursors.auto);
    }

    // character move

    if (this.gameState.possiblePositions.includes(index)) {
      this.transitionHeroPosition(index, this.gameState.selectPositionIndex);
      this.filterTeamsPosition();
      this.gamePlay.deselectCell(this.gameState.selectPositionIndex);
      this.gamePlay.deselectCell(index);
      this.gamePlay.selectCell(index);
      this.gameState.selectPositionIndex = index;
      this.showPossibleTransition(index, this.searchHero(index).range);
      this.showOpportunityAttack(index, this.searchHero(index).rangeAttack);
      this.gamePlay.redrawPositions(this.gameState.teamsPositions);
      this.riseOftheMonsters();
    }

    // character attack

    if (this.gameState.possibleAttack.includes(index)) {
      if (!this.gameState.possiblePositions.includes(index)) {
        this.attack(
          this.searchHero(this.gameState.selectPositionIndex),
          this.searchHero(index),
          index,
        );
      }
    }

    // TODO: react to click
  }

  onCellEnter(index) {
    // Chracter information on hover
    console.log(index);

    if (this.gameState.teamsPositionIndex.includes(index)) {
      this.gamePlay.showCellTooltip(generateMessage(this.searchHero(index)), index);
      if (this.gameState.teamsPlayer.teams.includes(this.searchHero(index))) {
        this.gamePlay.setCursor(cursors.pointer);
      }
      if (this.gameState.teamsComputer.teams.includes(this.searchHero(index))) {
        if (this.gameState.possibleAttack.includes(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
    if (this.gameState.possiblePositions.includes(index) && this.gameState.selectPositionIndex) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    }
    if ((this.gameState.selectPositionIndex === index)) {
      this.gamePlay.setCursor(cursors.auto);
    }
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    if (!this.gameState.teamsPositionIndex.includes(index)) {
      this.gamePlay.hideCellTooltip(index);
      this.gamePlay.setCursor(cursors.auto);
      this.gamePlay.deselectCell(index);
    }

    if (this.gameState.teamsPositionIndex.includes(index)
    && this.gameState.teamsComputer.teams.includes(this.searchHero(index))) {
      this.gamePlay.deselectCell(index);
    }

    // TODO: react to mouse leave
  }

  searchHero(index) {
    const key = this.gameState.teamsPositions.findIndex((item) => item.position === index);
    return this.gameState.teamsPositions[key].character;
  }

  transitionHeroPosition(index, selectCell) {
    const key = this.gameState.teamsPositions.findIndex((item) => item.position === selectCell);
    this.gameState.teamsPositions[key].position = index;
  }

  showPossibleTransition(index, range, boardSize = 8) {
    this.gameState.possiblePositions = [];

    // left
    let countLeft, countTop, countRight, countBottom, countLeftTop, countRightTop, countLeftBottom, countRightBottom;

    (index % boardSize > range) ? countLeft = range : countLeft = index % boardSize;

    for (let i = 1; i <= countLeft; i += 1) {
      const indexTransition = index - i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // right

    (index % boardSize + range <= boardSize - 1) ? countRight = range : countRight = boardSize - (index % boardSize);

    for (let i = 1; i <= countRight; i += 1) {
      const indexTransition = index + i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // top

    (Math.floor(index / boardSize) - range >= 0 ) ? countTop = range : countTop = Math.floor(index / boardSize);

    for (let i = 1; i <= countTop; i += 1) {
      const indexTransition = index - boardSize * i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    // bottom
    (Math.floor(index / boardSize) + range <= boardSize - 1) ? countBottom = range : countBottom = (boardSize - 1) - (Math.floor(index / boardSize));

    for (let i = 1; i <= countBottom; i += 1) {
      const indexTransition = index + boardSize * i;
      this.gameState.possiblePositions.push(indexTransition);
    }

    // top-left diagonal
    let minLeftTop = null;
    Math.floor(index / boardSize) <=  index % boardSize ? minLeftTop = Math.floor(index / boardSize) : minLeftTop = index % boardSize;
    (Math.floor(index / boardSize) - range >= 0 && index % boardSize > range) ? countLeftTop = range : countLeftTop = minLeftTop;

    for (let i = 1; i <= countLeftTop; i += 1) {
      const indexTransition = index - (boardSize * i) - i;
      this.gameState.possiblePositions.push(indexTransition);
    }

    // top-right diagonal
    let minRightTop = null;
    Math.floor(index / boardSize) <= boardSize - index % boardSize ? minRightTop =  Math.floor(index / boardSize) : minRightTop = boardSize - index % boardSize;
    Math.floor(index / boardSize) - range >= 0 && (index % boardSize + range <= boardSize - 1) ? countRightTop = range : countRightTop = minRightTop;

    for (let i = 1; i <= countRightTop; i += 1) {
      const indexTransition = index - (boardSize * i) + i;
      this.gameState.possiblePositions.push(indexTransition);
    }

    // bottom-left diagonal
    let minLeftBottom = null;
    boardSize - 1 - Math.floor(index / boardSize) <=  index % boardSize ? minLeftBottom = boardSize - Math.floor(index / boardSize) : minLeftBottom = index % boardSize;
    (Math.floor(index / boardSize) + range <= boardSize - 1 && index % boardSize > range) ? countLeftBottom = range : countLeftBottom = minLeftBottom;

    for (let i = 1; i <= countLeftBottom; i += 1) {
      const indexTransition = index + (boardSize * i) - i;
      this.gameState.possiblePositions.push(indexTransition);
    }

    // bottom-right diagonal
    let minRigthBottom = null;
    boardSize - 1 - index % boardSize <= boardSize - 1 - Math.floor(index/boardSize) ? minRigthBottom = boardSize - 1 - index % boardSize : minRigthBottom = boardSize - Math.floor(index/boardSize);
    index % boardSize + range <= boardSize - 1 && Math.floor(index / boardSize) + range <= boardSize - 1 ? countRightBottom = range : countRightBottom = minRigthBottom;

    for (let i = 1; i <= countRightBottom; i += 1) {
      const indexTransition = index + (boardSize * i) + i;
      this.gameState.possiblePositions.push(indexTransition);
    }
    this.gameState.possiblePositions = this.gameState.possiblePositions.filter((el) => !this.gameState.teamsPositionIndex.includes(el));
  }

  showOpportunityAttack(index, rangeAttack, boardSize = 8) {
    this.gameState.possibleAttack = [];

    let countLeft, countTop, countRight, countBottom;
    (index % boardSize + rangeAttack <= boardSize - 1) ? countRight = rangeAttack : countRight = boardSize - (index % boardSize);
    (index % boardSize > rangeAttack) ? countLeft = rangeAttack : countLeft = index % boardSize;
    (Math.floor(index / boardSize) - rangeAttack >= 0 ) ? countTop = rangeAttack : countTop = Math.floor(index / boardSize);
    (Math.floor(index / boardSize) + rangeAttack <= boardSize - 1) ? countBottom = rangeAttack : countBottom = (boardSize - 1) - (Math.floor(index / boardSize));
    const start = index - countLeft - countTop * boardSize;
    const endRow = index + countRight - countTop * boardSize;
    const end = index + countBottom * boardSize;
    const count = Math.floor(end / boardSize) - Math.floor(start / boardSize);

    for (let j = start; j <= endRow; j += 1) {
      for (let i = 0; i <= count; i += 1) {
        let ind = j + i * boardSize;
        if (ind === index) {
          continue;
        }
        this.gameState.possibleAttack.push(ind);
      }
    }
  }

  

  riseOftheMonsters() {
    // create array computer and player team
 
    const { teamsPlayer, teamsComputer, teamsPositions } = this.gameState;
    
    // const playerTeam = teamsPositions.splice(teamsPlayer.length, teamsPositions.length - 1);
    
    const playerTeamCharacter = teamsPositions.map(el => el.character).splice(0, teamsPlayer.teams.length);
    const playerTeamPosition = teamsPositions.map(el => el.position).splice(0, teamsPlayer.teams.length);

    // const playerTeamPosition = filterPosition(playerTeam);

    const computerTeamCharacter = teamsPositions.map(el => el.character).splice(teamsPlayer.teams.length, teamsPlayer.teams.length);
    const computerTeamPosition = teamsPositions.map(el => el.position).splice(teamsPlayer.teams.length, teamsPlayer.teams.length);
    let positionAttack = null;

    console.log(playerTeamCharacter);
    console.log(computerTeamCharacter);
    const compKey = generateRandomKey(computerTeamCharacter);
    const selectPositionIndex = computerTeamPosition[compKey];
    // attack and movement positions


    // const run = (() => {
    //   this.showPossibleTransition(computerTeamPosition[compKey], computerTeamCharacter[compKey].range);
    //   const keyComp = generateRandomKey(this.gameState.possiblePositions);
    //   this.transitionHeroPosition(this.gameState.possiblePositions[keyComp], computerTeamPosition[compKey]);
    //   this.filterTeamsPosition();
    //   console.log(this.gameState);
    // })
    // run();
    
    // this.showOpportunityAttack(this.gameState.selectPositionIndex, computerTeam[compKey].character.rangeAttack);

    // // we go through the player’s positions for the possibility of attack
    // for (let item of playerTeamPosition) {
    //   if (this.gameState.possibleAttack.includes(item)) {
    //     positionAttack = item;
    //     break;
    //   }
    // }

    // positionAttack ? this.attack(computerTeam[compKey].character, this.searchHero(positionAttack), positionAttack) : run()
  }
}
