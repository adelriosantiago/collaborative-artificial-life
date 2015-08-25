/*
    Alejandro del Río Santiago
    Twitter: @adelriosantiago

    Tag meaning:
    BUG: An important bug
    ENH: Enhancement
    EP: Easy pick, changes that can be easily done
    TBD: To be done
*/

var io = require('socket.io')();
var _ = require('underscore');

var boardSize = 32;

//Create the board
function matrix(rows, cols) {
    'use strict';

    var arr = [], i, j;

    //var i, j;
    //Creates all lines:
    for (i = 0; i < rows; i += 1) {
        //Creates an empty line
        arr.push([]);
        //Adds cols to the empty line:
        arr[i].push(new Array(cols));
        for (j = 0; j < cols; j += 1) {
            //Initial value
            arr[i][j] = 0;
        }
    }
    return arr;
}
var randNum = function () {
    'use strict';

    return Math.floor(Math.random() * 2);
};

var board = matrix(boardSize, boardSize);
var next = matrix(boardSize, boardSize);
function updateBoard() {
    'use strict';

    var neighbors = 0, x, y, i, j, temp;

    //EP: Change x, y for v and h this naming is a mess
    //Loop through every spot in our 2D array and check spots neighbors
    for (x = 1; x < boardSize - 1; x += 1) {
        for (y = 1; y < boardSize - 1; y += 1) {
            //Add up all the states in a 3 * 3 surrounding grid
            neighbors = 0
            for (i = -1; i <= 1; i += 1) {
                for (j = -1; j <= 1; j += 1) {
                    neighbors += board[x + i][y + j];
                }
            }
            neighbors -= board[x][y]; //Substract the current cell since it was added

            //Rules of Life
            if ((board[x][y] === 1) && (neighbors < 2)) {
                next[x][y] = 0; //Loneliness
            } else if ((board[x][y] === 1) && (neighbors > 3)) {
                next[x][y] = 0; //Overpopulation
            } else if ((board[x][y] === 0) && (neighbors === 3)) {
                next[x][y] = 1; //Reproduction
            } else {
                next[x][y] = board[x][y]; //Stasis
            }
        }
    }
    temp = board;
    board = next;
    next = temp;
}

function sendUpdate() {
    'use strict';

    setTimeout(function () {
        //Do something here
        updateBoard();
        io.emit('board update', board);
        console.log('Doing a request');
        sendUpdate();
    }, 500);
}
sendUpdate(5000);

io.on('connection', function (socket) {
    'use strict';

    console.log('connection');
    socket.on('recreate', function () {
        //Can be DRY'fyed
        board = matrix(boardSize, boardSize);
        next = matrix(boardSize, boardSize);
    });
    
    /*socket.on('step', function() {
        updateBoard();
        io.emit('board update', board);
    });*/
    
    socket.on('draw', function (data) {
        var x, y, offset, coordX, coordY;

        console.log(data);
        
        //Assume dimensions are correct
        offset = Math.floor(data.cells.length / 2);
        for (y = 0; y < data.cells.length; y++) {
            for (x = 0; x < data.cells[y].length; x++) {
                if (data.cells[y][x] === 1) {
                    coordX = parseInt(data.x, 10) + x - offset;
                    coordY = parseInt(data.y, 10) + y - offset;
                    if ((coordX > 0) && (coordX < boardSize) && (coordY > 0) && (coordY < boardSize)) {
                        board[coordY][coordX] = 1;
                    }
                }
            }
        }
        io.emit('board update', board);
    });
});

module.exports = io;
