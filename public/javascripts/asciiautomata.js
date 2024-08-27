/*
    Alejandro del Río Santiago
    Twitter: @adelriosantiago

    Tag meaning:
    TODO: To be done
    EASYPICK: Changes that can be easily done
    NOTE: Reminders
    FIXME: An important bug to be fixed
    FUTURE: Enhancements
*/

$(document).ready(function () {
  "use strict"

  //Real-time user interface
  var test_box,
    mouseTimer = null,
    //socket = io.connect('http://alife.adelriosantiago.com'), //Test on the real server with reverse proxy
    //socket = io.connect('adelriosantiago.com:7000'), //Test on the real server via the port number
    socket = io.connect("localhost:7000"), //Test on localhost
    patternSize = 9,
    pattern

  $("#array-container").mousemove(function (event) {
    if (mouseTimer) {
      clearTimeout(mouseTimer) //Cancel the previous timer
      mouseTimer = null
    }
    mouseTimer = setTimeout(function () {
      var currentPosition = { cx: event.pageX, cy: event.pageY }
      socket.emit("position change", currentPosition)
    }, 5)
  })

  //Create the drawing pattern array
  function clearPatternArray() {
    var i, k

    pattern = new Array(patternSize)

    for (i = 0; i < pattern.length; i++) {
      pattern[i] = new Array(patternSize)
      for (k = 0; k < pattern.length; k++) {
        pattern[i][k] = 0
      }
    }
  }
  clearPatternArray()

  //On user connected
  socket.on("connect", function () {
    var hScrollFix = window.chrome,
      hFactor = 16,
      nicknameTimer = null

    if (hScrollFix) {
      hFactor = 15
    }

    socket.on("stat-conn", function (data) {
      $("#stat-conn").html(data)
    })

    socket.on("room details", function (data) {
      var list = $("#user-list")
      list.html("")
      data.forEach(function (item) {
        list.append("<li>" + item + "</li>")
      })
    })

    socket.on("position details", function (data) {
      data.forEach(function (item) {
        //var sticker = $(".user-info h4").filter(:contains('" + item.nickname + "')")).parent(); //Beware this does not matches the name exactly
        var sticker = $(".user-info h4")
          .filter(function () {
            return $(this).text() === item.nickname
          })
          .parent()

        if (sticker.length != 0) {
          sticker.animate(
            {
              top: item.cy,
              left: item.cx - 200,
            },
            50
          )
        } else {
          //FIX: A way to remove users! Users are currently removed only when doing F5
          $("#user-stickers").append($('<div class="user-info"/>').append($("<h4>" + item.nickname + "</h4>")))
        }
      })
    })

    //Update from server
    socket.on("board update", function (data) {
      var str = JSON.stringify(data).replace(/0/g, "□").replace(/1/g, "■").replace(/,/g, "").replace(/\]/g, "\n").replace(/\[/g, "")
      $("#array-container").html(str)

      //The following code works but is too slow
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
    })

    //Draw on the board
    $("#board-container td").click(function cellClick() {
      var el = $(this),
        coordinates = { x: el.attr("cx"), y: el.attr("cy"), cells: pattern }

      console.log("board: ", coordinates)
      socket.emit("draw", coordinates)
    })

    //Draw on cell editor
    $("#cell-editor td").click(function cellClick() {
      var el = $(this),
        x,
        y

      $(el).toggleClass("alive")
      clearPatternArray()
      $("#cell-editor td.alive").each(function () {
        pattern[$(this).attr("cy")][$(this).attr("cx")] = $(this).hasClass("alive") * 1
      })
    })

    nicknameTimer = null
    $("#nickname").on("keyup", function () {
      if (nicknameTimer) {
        clearTimeout(nicknameTimer) //cancel the previous timer.
        nicknameTimer = null
      }
      nicknameTimer = setTimeout(function () {
        socket.emit("nickname change", $("#nickname").val())
      }, 100)
    })

    $("#array-container").click(function (event) {
      event = event || window.event
      event = jQuery.event.fix(event)

      var coordX = Math.ceil((event.pageX - 320) / hFactor), //FIX: Must be 15 only on Chrome
        coordY = Math.ceil((event.pageY - 60) / 15),
        drawInfo = { x: coordX, y: coordY, cells: pattern }

      console.log(drawInfo)
      socket.emit("draw", drawInfo)
    })

    //FUTURE: Change this for a method that reads a variable
    $('#cell-editor td[cx="4"][cy="4"]').addClass("alive")
    $('#cell-editor td[cx="4"][cy="3"]').addClass("alive")
    $('#cell-editor td[cx="4"][cy="5"]').addClass("alive")
    $('#cell-editor td[cx="3"][cy="4"]').addClass("alive")
    $('#cell-editor td[cx="5"][cy="4"]').addClass("alive")
    pattern[4][4] = 1
    pattern[4][3] = 1
    pattern[4][5] = 1
    pattern[3][4] = 1
    pattern[5][4] = 1
  })
})
