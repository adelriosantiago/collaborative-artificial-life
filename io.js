/*
    Alejandro del Río Santiago
    Twitter: @adelriosantiago

    Tag meaning:
    BUG: An important bug
    ENHANCEMENT: Enhancement
    EASY PICK: Easy pick, changes that can be easily done
    TO BE DONE: To be done
*/

var io = require('socket.io')();
var _ = require('underscore');
var slug = require('slug');

var boardSize = 128;
var upNames = true,
    upPositions = true;

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

    
    var start = new Date();

    var neighbors = 0, x, y, i, j, temp;

    //EP: Change x, y for v and h this naming is a mess
    //Loop through every spot in our 2D array and check spots neighbors
    for (x = 1; x < boardSize - 1; x += 1) {
        for (y = 1; y < boardSize - 1; y += 1) {
            //Add up all the states in a 3 * 3 surrounding grid
            neighbors = 0;
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
    
    
    var finish = new Date();
    console.log("Operation took " + (finish.getTime() - start.getTime()) + " ms"); 
}

function sendUpdate() {
    'use strict';

    setTimeout(function () {
        //Do something here
        updateBoard();
        io.emit('board update', board);
        console.log('Doing a request');
        sendUpdate();

        if (upNames) { updateRoomNames(); }
        if (upPositions) { updatePositions(); }

    }, 500);
}
sendUpdate(5000);

function updateRoomNames() {
    upNames = false;

    var attending = _.map(connectedUsers, function (item) {
        //FIXME: Dryfy with other functions
        if (item.nickname == null) {
            item.nickname = 'user' + Math.round(Math.random() * 999);
        }
        return item.nickname;
    });
    io.emit('room details', attending);
}
//updateRoomNames();

function updatePositions() {
    upPositions = false;

    var positions = _.map(connectedUsers, function (item) {
        //FIXME: Dryfy with other functions
        if (item.nickname == null) {
            item.nickname = 'user' + Math.round(Math.random() * 999);
        }
        return {nickname: item.nickname, cx: item.cx, cy: item.cy};
    });

    //console.log('emmmiting position details', positions);
    io.emit('position details', positions);
}

var connectedUsers = [];

io.on('connection', function (socket) {
    'use strict';

    socket.on('disconnect', function () {
        var i = connectedUsers.indexOf(socket);
        connectedUsers.splice(i, 1);
        io.emit('stat-conn', connectedUsers.length);

        //updateRoomNames();
        upNames = true;
    });

    connectedUsers.push(socket);
    io.emit('stat-conn', connectedUsers.length);

    //Debug only
    /*socket.on('recreate', function () {
        //Can be DRY'fyed
        board = matrix(boardSize, boardSize);
        next = matrix(boardSize, boardSize);
    });*/
    
    //Debug only
    /*socket.on('step', function() {
        updateBoard();
        io.emit('board update', board);
    });*/

    socket.on('nickname change', function (data) {
        //BUG: Implement feature to avoid WS flooding!
        //FIXME: Dryfy with other functions
        if (data.length === 0) {
            data = 'user' + Math.round(Math.random() * 999);
        }
        data = slug(data.substring(0, 10));
        socket.nickname = data;
        //updateRoomNames();
        upNames = true;
    });

    socket.on('position change', function (data) {
        //BUG: Implement feature to avoid WS flooding!

        //console.log('position change', data);
        if (data != null) {
            socket.cx = data.cx;
            socket.cy = data.cy;
        }
        //updatePositions();
        upPositions = true;
    });

    socket.on('draw', function (data) {
        var x, y, offset, coordX, coordY;

        //console.log(data);
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
