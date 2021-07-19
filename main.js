const prompt = require('prompt-sync')({sigint: true});

// game character definitions
const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

// class to create node objects
class FieldNode {
  constructor(row, column) {
    this.row = row;
    this.column = column;
  }

  // creates an array of neighboring node objects
  getNeighbors() {
    const neighbors = [];

    neighbors.push(new FieldNode(this.row + 1, this.column));
    neighbors.push(new FieldNode(this.row, this.column + 1));

    // row and column indices cannot be less than 0
    if (this.row > 0) {
      neighbors.push(new FieldNode(this.row - 1, this.column));
    }

    if (this.column > 0) {
      neighbors.push(new FieldNode(this.row, this.column - 1));
    }

    return neighbors;
  }

}

// Field class
class Field {

  constructor(fieldArray) {
    this.fieldArray = fieldArray;
  }

  print() {
    for (let row of this.fieldArray) {
      let rowString = '';
      for (let element of row) {
        rowString += element;
      }
      console.log(rowString);
    }
  }

  static validateField(field, rows, columns) {

    // copy field, we do not want to make alterations to the original array
    const fieldCopy = [];
    for (let i = 0; i < rows; i++) {
      fieldCopy.push(Array.from(field[i]));
    }

    // start the process where the player begins, [0][0]
    const availableNodes = [new FieldNode(0, 0)];

    // keep going as long as there are more unvisited, empty field tiles
    while (availableNodes.length > 0) {
      // take the first node out
      const currentNode = availableNodes.shift();

      // mark traversed nodes with the path character so that they cannot be retraced
      fieldCopy[currentNode.row][currentNode.column] = pathCharacter;

      // use the FieldNode method getNeighbors() to find 
      for (const node of currentNode.getNeighbors()) {
        // ignore indices that are out of upper bounds
        if (node.row >= rows - 1 || node.column >= columns - 1) {
          continue;
        }
        // if we find the hat, the puzzle is solvable
        if (fieldCopy[node.row][node.column] === hat) {
          return true;
        }
        // fieldCharacter nodes are traversable, add them to available nodes
        if (fieldCopy[node.row][node.column] === fieldCharacter) {
          availableNodes.push(node);
        }
      }
    }
    // if we run out of traversable nodes without finding the hat, the puzzle cannot be solved
    return false;
    
  }

  // method for field generation
  static generateField(rows, columns, holeChance) {
    const newField = Array(rows);
    let hatPlaced = false;

    for (let row = 0; row < rows; row++) {
      newField[row] = Array(columns);
      for (let column = 0; column < columns; column++) {
        // player begins in the upper lefthand corner
        if (row === 0 && column == 0) {
          newField[row][column] = pathCharacter;
        } else {
          // keep the hat from spawning in the first row/column or in the first quandrant. only one hat per map
          if (!hatPlaced && (row > rows/2 || column > columns/2) && (row !== 0 && column !== 0)) {
            // 1 in 7 chance to spawn hat given the above criteria
            const hatRoll = Math.floor(Math.random() * 7) === 0;
            if (hatRoll) {
              newField[row][column] = hat;
              hatPlaced = true;
              continue;
            }
          }
          
          // creates either a hole or field character, based on a randomly generated number relative to the chance of spawning a hole.
          const holeRoll = Math.floor(Math.random() * 100) < holeChance;
          if (holeRoll) {
            newField[row][column] = hole;
          } else {
            newField[row][column] = fieldCharacter;
          }
        }
      }
    }

    // if no hat has been place, place it in the bottom right corner
    if (!hatPlaced) {
      newField[rows - 1][columns - 1] = hat;
    }

    // validate the field; if it is solvable, return
    if (Field.validateField(newField, rows, columns)) {
      return newField;
    }

    // if the field does not validate, try again
    return Field.generateField(rows, columns, holeChance);

  }

  // PLAY BALL
  playGame() {
    let moveDirection, exitCode;
    let row = 0, column = 0;

    while (!exitCode) {

      this.print();

      // prompt user input, lowercase it
      moveDirection = prompt('Which way do you want to go? ').toLowerCase();
      
      // alter position based on user input
      switch (moveDirection) {
        case 'u':
          row--;
          break;
        case 'd':
          row++;
          break;
        case 'l':
          column--;
          break;
        case 'r':
          column++;
          break;
        default:
          console.log('Invalid input. Type U for UP, D for DOWN, L for LEFT, or R for RIGHT');
          break;
      }

      // determine if the game has ended

      // LEAVE THE FIELD - if the user exits the field, they forfeit the game
      if ((row < 0 || column < 0) || !this.fieldArray[row][column]) {
        exitCode = 1;
      }

      // HOLE - break a leg, literally
      else if (this.fieldArray[row][column] === hole) {
        exitCode = 2;
      }

      // WIN - yay
      else if (this.fieldArray[row][column] === hat) {
        exitCode = 3;
      }

      // the game is still going, mark the new position with the path character and start the loop over
      else {
        this.fieldArray[row][column] = pathCharacter;
      }

    } // end while

    // the game is over; give the player the result and return 
    switch (exitCode) {
      case 1:
        console.log('You have left the field. Come back and try again later.');
        return;
      case 2:
        console.log('You fell in a hole! You lose!');
        return;
      case 3:
        console.log('You won! You found the hat!');
        return;
      default:
        console.log('This should never happen');
        return;
    }
  } // playGame()

} // Field class

const myField = new Field(Field.generateField(10, 10, 45));

myField.playGame();
