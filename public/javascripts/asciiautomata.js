$(document).ready(function () {
    'use strict';

    //TBD: Fully working sample, to be implemented when v1 is done

    //Real-time user interface
    var test_box,
        mouseTimer = null,
        socket = io.connect('http://localhost:8998'),
        patternSize = 9,
        pattern;

    /*$(document).ready(function() {
        console.log( "ready!" );
        test_box = $('#clear-btn').jBox('Tooltip', {
            target: $('#clear-btn'),
            content: 'TESSTETST'
        });
    });*/

    /*test_box = $('#clear-btn').jBox('Tooltip', {
        target: $('#clear-btn'),
        content: 'TESSTETST'
    });

    var updateMouse = true;
    var i = setInterval(function() {
        //console.log('test');

        var currentElement = $('#board-container td:hover')[0];
        //$('#board-container td[cx="3"][cy="3"]')[0]
        if (currentElement) {
            var selfPosition = {cx: currentElement.getAttribute('cx'), cy: currentElement.getAttribute('cy'), name: 'self', color: 'red'};
            test_box.target = $('#board-container td[cx="' + selfPosition.cx + '"][cy="' + selfPosition.cy + '"]');
            test_box.open();
            console.log(selfPosition);
        } else {
            test_box.close();
            console.log('no position');
        }

        if (!updateMouse) { clearInterval(i); }
    }, 500);*/

    $("#array-container").mousemove(function (event) {
        if (mouseTimer) {
            clearTimeout(mouseTimer); //Cancel the previous timer.
            mouseTimer = null;
        }
        mouseTimer = setTimeout(function () {

            var currentPosition = {cx: event.pageX, cy: event.pageY};

            /*$( ".user-info" ).animate({
                top: currentPosition.cy,
                left: currentPosition.cx - 200
            }, 500);*/

            socket.emit('position change', currentPosition);

            //console.log('mupdate');
        }, 250);
    });

    //Socket functions
    //var binaryMode = true; //TBD

    //Create the drawing pattern array
    function clearPatternArray() {
        var i, k;

        pattern = new Array(patternSize);

        for (i = 0; i < pattern.length; i++) {
            pattern[i] = new Array(patternSize);
            for (k = 0; k < pattern.length; k++) {
                pattern[i][k] = 0;
            }
        }
    }
    clearPatternArray();

    //On user connected
    socket.on('connect', function () {
        socket.on('stat-conn', function (data) {
            $('#stat-conn').html(data);
        });

        socket.on('room details', function (data) {
            var list = $('#user-list');
            list.html('');
            data.forEach(function (item) {
                list.append('<li>' + item + '</li>');
            });
        });

        socket.on('position details', function (data) {
            //console.log(data);
            data.forEach(function (item) {
                //var sticker = $(".user-info h4").filter(:contains('" + item.nickname + "')")).parent(); //Beware this does not matches the name exactly
                var sticker = $(".user-info h4").filter(function () {
                    return $(this).text() === item.nickname;
                }).parent();
                
                if (sticker.length != 0) {
                    sticker.animate({
                        top: item.cy,
                        left: item.cx - 200
                    }, 500);
                } else {
                    //FIXME: A way to remove users! Users are currently removed only when doing F5
                    $('#user-stickers').append($('<div class="user-info"/>').append($("<h4>" + item.nickname + "</h4>")));
                }
            });
        });

        //Update from server
        socket.on('board update', function (data) {

            /*var t0 = performance.now();*/

            var str = JSON.stringify(data).replace(/0/g, '□').replace(/1/g, '■').replace(/,/g, '').replace(/\]/g, '\n').replace(/\[/g, '');
            //$('body').html(str); //Not used yet, ENH: Make a JSON version
            $('#array-container').html(str); //Not used yet, ENH: Make a JSON version

            //The following code is too slow (about 600ms for setAttribute and 800ms for innerText)
            /*for (x = 0; x < data.length; x++) {
                for (y = 0; y < (data[x]).length; y++) {
                    //console.log(data[x][y]);
                    var item = ($($('#board-container tr')[x]).find('td')[y]);
                    if (data[x][y] >= 1) {
                        //Binary mode TBD
                        //if (binaryMode) {
                        //    item.innerText = '1';
                        //} else {
                            item.setAttribute('class', 'alive');
                        //}
                    } else {
                        //Binary mode TBD
                        //if (binaryMode) {
                        //    item.innerText = '0';
                        //} else {
                            item.removeAttribute('class');
                        //}
                    }
                }
            }*/

            /*var t1 = performance.now();
            console.log("Process took " + (t1 - t0) + " milliseconds.");*/
        });

        //Draw on the board
        $('#board-container td').click(function cellClick() {
            var el = $(this),
                coordinates = {x: el.attr('cx'), y: el.attr('cy'), cells: pattern};
            
            console.log("board: ", coordinates);
            socket.emit('draw', coordinates);
        });

        //Draw on cell editor
        $('#cell-editor td').click(function cellClick() {
            var el = $(this), x, y;

            $(el).toggleClass('alive');
            clearPatternArray();
            $('#cell-editor td.alive').each(function () {
                pattern[$(this).attr('cy')][$(this).attr('cx')] = ($(this).hasClass('alive') * 1);
            });
            //console.dir(pattern);
        });

        var nicknameTimer = null;
        $('#nickname').on('keyup', function () {
            if (nicknameTimer) {
                clearTimeout(nicknameTimer); //cancel the previous timer.
                nicknameTimer = null;
            }
            nicknameTimer = setTimeout(function () {
                socket.emit('nickname change', $('#nickname').val());
            }, 1000);
        });

        /*$( "#array-container" ).mousemove(function( event ) {
          var msg = "Handler for .mousemove() called at ";
          msg += event.pageX + ", " + event.pageY;
          console.log(msg);
        });*/

        $("#array-container").click(function (event) {
            /*var msg = "Handler for .mousemove() called at ";
            msg += event.pageX + ", " + event.pageY;
            console.log(msg);*/

            var coordX = Math.round((event.pageX - 260) / 15),
                coordY = Math.round((event.pageY - 60) / 15),
                drawInfo = {x: coordX, y: coordY, cells: pattern};
            
            console.log(drawInfo);
            socket.emit('draw', drawInfo);
        });

        //FIX: Change this for a method that reads a variable
        $('#cell-editor td[cx="4"][cy="4"]').addClass('alive');
        $('#cell-editor td[cx="4"][cy="3"]').addClass('alive');
        $('#cell-editor td[cx="4"][cy="5"]').addClass('alive');
        $('#cell-editor td[cx="3"][cy="4"]').addClass('alive');
        $('#cell-editor td[cx="5"][cy="4"]').addClass('alive');
        pattern[4][4] = 1;
        pattern[4][3] = 1;
        pattern[4][5] = 1;
        pattern[3][4] = 1;
        pattern[5][4] = 1;
    });
});
