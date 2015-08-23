var io = require('socket.io')();
var _ = require('underscore');

var boardSize = 32;

//Create the board
function matrix(rows, cols) {
    var arr = [];
    //Creates all lines:
    for (var i = 0; i < rows; i++) {
        //Creates an empty line
        arr.push([]);
        //Adds cols to the empty line:
        arr[i].push(new Array(cols));
        for (var j = 0; j < cols; j++) {
            //Initial value
            arr[i][j] = 0;
        }
    }
    return arr;
}
var randNum = function() {
    return Math.floor(Math.random() * 2);
}

var board = matrix(boardSize, boardSize);
var next = matrix(boardSize, boardSize);
function updateBoard() {
    //Loop through every spot in our 2D array and check spots neighbors
    for (var x = 1; x < boardSize - 1; x++) {
        for (var y = 1; y < boardSize - 1; y++) {
            //Add up all the states in a 3 * 3 surrounding grid
            var neighbors = 0;
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    neighbors += board[x + i][y + j];
                }
            }
            neighbors -= board[x][y]; //Substract the current cell since it was added

            //Rules of Life
            if ((board[x][y] == 1) && (neighbors < 2)) next[x][y] = 0; //Loneliness
            else if ((board[x][y] == 1) && (neighbors > 3)) next[x][y] = 0; //Overpopulation
            else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1; //Reproduction
            else next[x][y] = board[x][y]; //Stasis
        }
    }
    var temp = board;
    board = next;
    next = temp;
}

function sendUpdate() {
  setTimeout(function() {
    //Do something here
    updateBoard();
    io.emit('board update', board);
    console.log('Doing a request');
    sendUpdate();
  }, 250);
}
sendUpdate(5000);

io.on('connection', function (socket) {
    console.log('connection');
    socket.on('recreate', function() {
        //Can be DRY'fyed
        board = matrix(boardSize, boardSize);
        next = matrix(boardSize, boardSize);
    });
    
    /*socket.on('step', function() {
        updateBoard();
        io.emit('board update', board);
    });*/
    
    socket.on('draw', function(data) {
        console.log(data);
        
        //Assume dimensions are correct
        var offset = Math.floor(data.pattern.length / 2);
        for (var x = 0; x < data.pattern.length; x++) {
            for (var y = 0; y < data.pattern[x].length; y++) {
                if (data.pattern[x][y] == 1) {
                    /*console.log('x: ' + x);
                    console.log('y: ' + y);
                    console.log('datax: ' + data.x);
                    console.log('datay: ' + data.y);*/
                    var coordX = parseInt(data.x) + x - offset;
                    var coordY = parseInt(data.y) + y - offset;
                    if ((coordX > 0) && (coordX < boardSize) && (coordY > 0) && (coordY < boardSize)) {
                        board[coordX][coordY] = 1;    
                    }
                    io.emit('board update', board);
                }
            }
        }
    });
});

module.exports = io;