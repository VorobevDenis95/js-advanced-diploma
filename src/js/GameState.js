import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameState {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.countCharacters = 2;
    this.survivors = null;
    this.attack = false;
    this.listTeamsPlayer = [Bowman, Swordsman, Magician];
    this.listTeamsComputer = [Vampire, Undead, Daemon];
    this.teamsPositions = [];
    this.teamsPositionIndex = [];
    this.teamsComputerPositions = [];
    this.possiblePositions = [];
    this.computerPosiblePosition = [];
    this.possibleAttack = [];
    this.computerPosibleAttack = [];
    this.teamsPlayer = [];
    this.teamsComputer = [];
    this.selectPositionIndex = null;
    this.computerMove = false;
  }

  static from(object) {
    console.log(object);
    // TODO: create object
    return null;
  }
}
