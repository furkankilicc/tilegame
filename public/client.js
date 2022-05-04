var socket = io.connect("https://rocky-springs-75229.herokuapp.com/");
// var socket = io.connect("localhost:3000");
var mySocketID;
var myName;
var myRoom;
var canvas;
var tutulanSayi;
var ctx;
var gamePageData = {
  gpDrawResult: null,
  gpTurn: null,
  gpRoomName: null,
  gpRoomCreatorToken: null,
  gpRoomCreatorName: null,
  gpRoomGameTime: "00:00",
  gpRedPlayerToken: null,
  gpBluePlayerToken: null,
  gpRedPlayerTiles: null,
  gpBluePlayerTiles: null,
  gpGameState: null,
  gpRedPlayerName: null,
  gpBluePlayerName: null,
};

//#region --socketCodes
socket.on("connect", () => {
  mySocketID = socket.id;
});

socket.on("updateRooms", (data) => {
  updateRooms(data[(0, 0)], data[1], data[2]);
});

socket.on("allPlayersReady", (data) => {
  $("#readyBtn").fadeOut();
  gamePageData.gpGameState = data.gameState.state;
  gamePageData.gpRedPlayerTiles = data.gameState.redPlayerTiles;
  gamePageData.gpBluePlayerTiles = data.gameState.bluePlayerTiles;

  changeTileText("red", gamePageData.gpRedPlayerTiles);
  changeTileText("blue", gamePageData.gpBluePlayerTiles);
  changeGameStateText(gamePageData.gpGameState);
});

socket.on("gameTime", (data) => {
  gamePageData.gpRoomGameTime = data;
  var time = gamePageData.gpRoomGameTime;
  if (time < 60) {
    if (time < 10) {
      time = "00:0" + time;
    } else {
      time = "00:" + time;
    }
  } else if (time >= 60) {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    time = minutes + ":" + seconds;
  }
  changeGameTimeText(time);
});

socket.on("joinedRoom", (data) => {
  console.log("testJoinedRoom SocketON", data);
  gamePageData.gpRoomName = data.data[2];
  gamePageData.gpRoomCreatorToken = data.data[3].roomcreator;
  gamePageData.gpRoomCreatorName = data.data[4];
  gamePageData.gpRoomGameTime = data.data[3].gameState.gameTime;
  gamePageData.gpRedPlayerToken = data.data[3].players.red.playertoken;
  gamePageData.gpBluePlayerToken = data.data[3].players.blue.playertoken;
  gamePageData.gpRedPlayerTiles = data.data[3].gameState.redPlayerTiles;
  gamePageData.gpBluePlayerTiles = data.data[3].gameState.bluePlayerTiles;
  gamePageData.gpGameState = data.data[3].gameState.state;
  if (data.data[3].players.red.playertoken != null) {
    gamePageData.gpRedPlayerName = data.data[3].players.red.playername;
  }
  if (data.data[3].players.blue.playertoken != null) {
    gamePageData.gpBluePlayerName = data.data[3].players.blue.playername;
  }
  var gameState;
  switch (gamePageData.gpGameState) {
    case "players are not ready":
      gameState = "Oyuncular hazır değil";
      break;
  }

  updateGamePageParameters(gameState, data.data[5]);
});
//#region -readyToSeeRooms
socket.on("readyToSeeRooms", (data) => {
  console.log("readyToSeeRooms SocketON");

  if (data[0] == true && data[1] == mySocketID) {
    $(".row").fadeOut(500, function () {
      $(".row").remove();
      let htmlData = readHTMLFile("readyToSeeRooms.html");
      $(htmlData)
        .hide()
        .appendTo("body")
        .promise()
        .done(function () {
          $("#createRoomModal").css("display", "none");
          myRoom = "roomsPage";
          updateRooms(data[2], data[3], data[4]);
        });
    });
    $(".container.login").fadeOut(500, function () {
      $(".container.login").remove();
      let htmlData = readHTMLFile("readyToSeeRooms.html");
      $(htmlData)
        .hide()
        .appendTo("body")
        .promise()
        .done(function () {
          $("#createRoomModal").css("display", "none");
          myRoom = "roomsPage";
          updateRooms(data[2], data[3], data[4]);
        });
    });
  }
});

socket.on("roomData", (data) => {
  gamePageData.gpRoomName = data.data[0].roomname;
  gamePageData.gpRoomCreatorToken = data.data[0].roomcreator;
  gamePageData.gpRoomCreatorName = data.data[1];
  console.log(data.data[0]);
  console.log(data.data[1]);
  gamePageData.gpRoomGameTime = data.data[0].gameState.gameTime;
  gamePageData.gpRedPlayerToken = data.data[0].players.red.playertoken;
  gamePageData.gpBluePlayerToken = data.data[0].players.blue.playertoken;
  gamePageData.gpRedPlayerTiles = data.data[0].gameState.redPlayerTiles;
  gamePageData.gpBluePlayerTiles = data.data[0].gameState.bluePlayerTiles;
  gamePageData.gpGameState = data.data[0].gameState.state;
  if (data.data[0].players.red.playertoken != null) {
    gamePageData.gpRedPlayerName = data.data[0].players.red.playername;
  }
  if (data.data[0].players.blue.playertoken != null) {
    gamePageData.gpBluePlayerName = data.data[0].players.blue.playername;
  }
  var gameState;
  switch (gamePageData.gpGameState) {
    case "players are not ready":
      gameState = "Oyuncular hazır değil";
      break;
  }

  console.log(gamePageData);

  $("#createRoomModal").modal("hide");

  $("small").fadeOut(1000, function () {
    $("small").remove();
  });
  $(".d-flex.text-muted.pt-3").fadeOut(500, function () {
    $(".d-flex.text-muted.pt-3").remove();
  });
  $(".display-4.text-center.mt-4").fadeOut(500, function () {
    $(".display-4.text-center.mt-4").remove();
  });
  $(".border-bottom.pb-2.mb-0")
    .fadeOut(500, function () {
      $(".border-bottom.pb-2.mb-0").text("Oda " + gamePageData.gpRoomName);
    })
    .fadeIn();

  // `
  //#region game page html codes
  $(
    "<br />\n" +
      '<div class="row">\n' +
      '  <div class="" id="anan">\n' +
      "  </div>\n" +
      '  <div class="col">\n' +
      '    <!--            <h6 class="border-bottom pb-2 mb-0">Odalar</h6>-->\n' +
      '    <div class="row">\n' +
      '      <div class="col-sm-3">\n' +
      '        <i class="fa fa-user-crown"></i\n' +
      "        ><span\n" +
      '          style="font-size: 16px; box-sizing: border-box"\n' +
      '          data-bs-toggle="tooltip" id="roomCreator" \n' +
      '          data-bs-placement="right"\n' +
      '          title="Oyunun ekran görüntüsünü alın."\n' +
      "        >\n" +
      "          " +
      gamePageData.gpRoomCreatorName +
      "</span\n" +
      "        >\n" +
      "      </div>\n" +
      '      <div class="col-sm-6">\n' +
      '        <h4 class="text-center" id="gamePageRoomName">' +
      gamePageData.gpRoomName +
      "</h4>\n" +
      '        <p class="text-center text-muted" id="gameTime">' +
      gamePageData.gpRoomGameTime +
      "</p>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "\n" +
      '    <div class="row text-center">\n' +
      '      <div class="col col-md-6 mx-auto">\n' +
      "        <svg\n" +
      '          class="bd-placeholder-img flex-shrink-0 me-2 rounded-svg-rect" id="blueSVG"\n' +
      '          width="6rem"\n' +
      '          height="40"\n' +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          role="img"\n' +
      '          aria-label="Placeholder: 70x70"\n' +
      '          preserveAspectRatio="xMidYMid slice"\n' +
      '          focusable="false"\n' +
      "        >\n" +
      '          <rect width="100%" height="100%" fill="#007bff"></rect>\n' +
      "          <text\n" +
      '            style="text-shadow: rgba(0, 0, 0, 1) 0px 0px 9px"\n' +
      '            x="48%"\n' +
      '            y="50%"\n' +
      '            dominant-baseline="middle"\n' +
      '            text-anchor="middle" id="bluePlayerName"\n' +
      '            fill="white"\n' +
      '            font-size="1rem"\n' +
      "          >\n" +
      "            test12345\n" +
      "          </text>\n" +
      "        </svg>\n" +
      '        <div class="row">\n' +
      '          <div class="col">\n' +
      '            <h6 class="game-text-underline blue" id="blueTileCount">25 Kare</h6>\n' +
      "          </div>\n" +
      '          <div class="col">\n' +
      '            <hr class="vr" style="height: 4rem" />\n' +
      "          </div>\n" +
      '          <div class="col">\n' +
      '            <h6 class="game-text-underline red" id="redTileCount">25 Kare</h6>\n' +
      "          </div>\n" +
      "        </div>\n" +
      "        <svg\n" +
      '          class="bd-placeholder-img flex-shrink-0 me-2 rounded-svg-rect" id="redSVG"\n' +
      '          width="7rem"\n' +
      '          height="40"\n' +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          role="img"\n' +
      '          aria-label="Placeholder: 70x70"\n' +
      '          preserveAspectRatio="xMidYMid slice"\n' +
      '          focusable="false"\n' +
      "        >\n" +
      '          <rect width="100%" height="100%" fill="#ff0000"></rect>\n' +
      "          <text\n" +
      '            style="text-shadow: rgba(0, 0, 0, 1) 0px 0px 9px"\n' +
      '            x="48%"\n' +
      '            y="50%"\n' +
      '            dominant-baseline="middle"\n' +
      '            text-anchor="middle" id="redPlayerName"\n' +
      '            fill="white"\n' +
      '            font-size="1rem"\n' +
      "          >\n" +
      "            0123456789\n" +
      "          </text>\n" +
      "        </svg>\n" +
      "      </div>\n" +
      '      <hr style="width: 75%" class="mx-auto mt-3" />\n' +
      '      <ul class="font-weight-light" id="gameState">' +
      "</ul>\n" +
      "\n" +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  test12345 sayı tutuyor...-->\n" +
      "      <!--                </h5>-->\n" +
      '      <!--                <h5 class="font-weight-light mb-3">Oyuncular bekleniyor...</h5>-->\n' +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  test12345 10 kare kaybetti-->\n" +
      "      <!--                </h5>-->\n" +
      '      <!--                <h5 class="font-weight-light mb-3">test12345 10 kare tuttu</h5>-->\n' +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  Oyuncuların hazır olması bekleniyor...-->\n" +
      "      <!--                </h5>-->\n" +
      "    </div>\n" +
      '    <div class="d-block text-end" style="margin-top: 38%">\n' +
      "      <button\n" +
      '        type="button"\n' +
      '        class="btn btn-secondary"\n' +
      '        data-bs-toggle="tooltip"\n' +
      '        data-bs-placement="top"\n' +
      '        title="Oyunun ekran görüntüsünü alın."\n' +
      "      >\n" +
      "        <svg\n" +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          x="0px"\n' +
      '          y="0px"\n' +
      '          width="30"\n' +
      '          height="30"\n' +
      '          viewBox="0 0 172 172"\n' +
      '          style="fill: #000000"\n' +
      "        >\n" +
      "          <g\n" +
      '            fill="none"\n' +
      '            fill-rule="nonzero"\n' +
      '            stroke="none"\n' +
      '            stroke-width="1"\n' +
      '            stroke-linecap="butt"\n' +
      '            stroke-linejoin="miter"\n' +
      '            stroke-miterlimit="10"\n' +
      '            stroke-dasharray=""\n' +
      '            stroke-dashoffset="0"\n' +
      '            font-family="none"\n' +
      '            font-weight="none"\n' +
      '            font-size="none"\n' +
      '            text-anchor="none"\n' +
      '            style="mix-blend-mode: normal"\n' +
      "          >\n" +
      '            <path d="M0,172v-172h172v172z" fill="none"></path>\n' +
      '            <g fill="#ffffff">\n' +
      "              <path\n" +
      '                d="M17.2,13.76c-1.89978,0.00019 -3.43981,1.54022 -3.44,3.44v27.52c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-24.08h24.08c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM58.48,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM86,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM113.52,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h24.08v24.08c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-27.52c-0.00019,-1.89978 -1.54022,-3.43981 -3.44,-3.44zM17.14625,54.99297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,54.99297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM17.14625,82.51297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,82.51297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM17.14625,110.03297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v27.52c0.00019,1.89978 1.54022,3.43981 3.44,3.44h27.52c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058h-24.08v-24.08c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,110.03297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v24.08h-24.08c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h24.08v24.08c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-24.08h24.08c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058h-24.08v-24.08c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM58.48,137.6c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM86,137.6c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058z"\n' +
      "              ></path>\n" +
      "            </g>\n" +
      "          </g>\n" +
      "        </svg>\n" +
      "      </button>\n" +
      "    </div>\n" +
      '    <!--              <small class="d-block text-end mt-3 border-top">-->\n' +
      "    <!--                <a-->\n" +
      '    <!--                  role="button"-->\n' +
      '    <!--                  class="btn btn-success mt-2"-->\n' +
      '    <!--                  data-bs-toggle="modal"-->\n' +
      '    <!--                  data-bs-target="#createRoomModal"-->\n' +
      "    <!--                  >Oda Oluştur</a-->\n" +
      "    <!--                >-->\n" +
      "    <!--              </small>-->\n" +
      "  </div>\n" +
      "</div>\n" +
      "\n" +
      "<script>\n" +
      '  $("input").on("input propertychange paste", function (e) {\n' +
      "    var reg = /^0+/gi;\n" +
      "    if (this.value.match(reg)) {\n" +
      '      this.value = this.value.replace(reg, "1");\n' +
      "    }\n" +
      "    if (this.value < 0) {\n" +
      "      this.value = 1;\n" +
      "    }\n" +
      "  });\n" +
      "\n" +
      "  $(function () {\n" +
      "    $(\"[data-bs-toggle='tooltip']\").tooltip();\n" +
      "  });\n" +
      "</script>\n"
  ).appendTo(".my-3.p-3.bg-body.rounded.shadow-lg.w-100");
  //#endregion
  changeGameStateText(gameState);
  setPlayerNameTexts();
  createGrid(16, data.data[2]);

  $(".grid").click(function () {
    gridClicked($(this));
  });
});

socket.on("drawResult", (data) => {
  gamePageData.gpDrawResult = data[1];
  changeGameStateText(null, data[1], data[2], data[4]);
});

socket.on("playerIsPlacingTiles", (data) => {
  gamePageData.gpGameState = data[4] + " is placing tiles";
  changeGameStateText(data[4] + " is placing tiles");
});

socket.on("changedTile", (data) => {
  gamePageData.gpRedPlayerTiles = data.roomGameState.redPlayerTiles;
  gamePageData.gpBluePlayerTiles = data.roomGameState.bluePlayerTiles;
  var element = $("#" + data.tile.row + "-" + data.tile.col);
  var clr;
  if (data.newTileColor == 1) clr = "red";
  else if (data.newTileColor == 2) clr = "blue";
  else if (data.newTileColor == 0) clr = "white";
  if (element.hasClass("whiteTile")) {
    element.removeClass("whiteTile");
    element.addClass(clr + "Tile");
  } else if (element.hasClass("redTile")) {
    element.removeClass("redTile");
    element.addClass(clr + "Tile");
  } else if (element.hasClass("blueTile")) {
    element.removeClass("blueTile");
    element.addClass(clr + "Tile");
  }
  changeTileText("red", gamePageData.gpRedPlayerTiles);
  changeTileText("blue", gamePageData.gpBluePlayerTiles);
});
function test() {
  var sayi = $("#inputTutulansayi").val();
  tutulanSayi = sayi;
  socket.emit("tutulanSayi", [
    tutulanSayi,
    gamePageData.gpRoomName,
    mySocketID,
  ]);
}
socket.on("tutulanSayiError", (data) => {
  alert("Hata! Tuttuğunuz sayı toplam kare sayınızdan fazla veya 0 olamaz!");
});

socket.on("gameData", (data) => {
  if (data.gameData[0][0] == "playerName") {
    if (data.gameData[0][1] == "red") {
      console.log("test");
      $("#gameState").after(
        '<button type="button" id="readyBtn" onclick="imReady()" class="btn btn-outline-success btn-sm mx-auto w-auto" style=" width: auto; height: auto;">Hazırım</button>'
      );
      changeTextOfPlayerName("red", data.gameData[1]);
    } else if (data.gameData[0][1] == "blue") {
      console.log("testblue");
      $("#gameState").after(
        '<button type="button" id="readyBtn" onclick="imReady()" class="btn btn-outline-success btn-sm mx-auto w-auto" style=" width: auto; height: auto;">Hazırım</button>'
      );
      changeTextOfPlayerName("blue", data.gameData[1]);
    }
  } else if (data.gameData[0][0] == "turn") {
    if (data.gameData[1][0] == "red") {
      //add red-glow to player
      $("#redSVG").addClass("red-glow");
      $("#blueSVG").removeClass("blue-glow");
    } else if (data.gameData[1][0] == "blue") {
      //add blue-glow to player
      $("#blueSVG").addClass("blue-glow");
      $("#redSVG").removeClass("red-glow");
    }
    gamePageData.gpTurn = data.gameData[1][0];
    gamePageData.gpGameState = data.gameData[1][1];
    changeGameStateText(data.gameData[1][1]);
    tutulanSayi = "its not my turn";
    setTimeout(() => {
      if (data.gameData[1][2] == mySocketID && data.gameData[1][0] == "red") {
        $("#gameState").after(
          "<div\n" +
            '            class="row row-cols-sm-2 align-items-center justify-content-center"\n' +
            '            id="formTut"\n' +
            "          >\n" +
            '            <div class="col col-sm-5">\n' +
            '              <div class="input-group">\n' +
            '                <div class="input-group-text">Tuttuğun Sayı</div>\n' +
            "                <input\n" +
            '                  type="number"\n' +
            '                  value="1"\n' +
            '                  class="form-control"\n' +
            '                  id="inputTutulansayi"\n' +
            "                />\n" +
            "              </div>\n" +
            "            </div>\n" +
            "\n" +
            '            <div class="col col-sm-1">\n' +
            '              <button type="button" onclick="test()" class="btn btn-primary">\n' +
            "                Tut\n" +
            "              </button>\n" +
            "            </div>\n" +
            "          </div>"
        );
        if (tutulanSayi != "its not my turn") {
          console.log("geldiTUTULANSAYİ3", tutulanSayi);
        }
      } else if (
        data.gameData[1][3] == mySocketID &&
        data.gameData[1][0] == "blue"
      ) {
        $("#gameState").after(
          "<div\n" +
            '            class="row row-cols-sm-2 align-items-center justify-content-center"\n' +
            '            action="#"\n' +
            '            target="_self"\n' +
            '            id="formTut"\n' +
            "          >\n" +
            '            <div class="col col-sm-5">\n' +
            '              <div class="input-group">\n' +
            '                <div class="input-group-text">Tuttuğun Sayı</div>\n' +
            "                <input\n" +
            '                  type="number"\n' +
            '                  value="1"\n' +
            '                  class="form-control"\n' +
            '                  id="inputTutulansayi"\n' +
            "                />\n" +
            "              </div>\n" +
            "            </div>\n" +
            "\n" +
            '            <div class="col col-sm-1">\n' +
            '              <button type="button" onclick="test()" class="btn btn-primary">\n' +
            "                Tut\n" +
            "              </button>\n" +
            "            </div>\n" +
            "          </div>"
        );
        if (tutulanSayi != "its not my turn") {
          console.log("geldiTUTULANSAYİ", tutulanSayi);
          socket.emit("tutulanSayi", [
            tutulanSayi,
            gamePageData.gpRoomName,
            mySocketID,
          ]);
        }
      }
    }, 1500);
  } else if (data.gameData[0][0] == "redWin") {
    $("#redSVG").addClass("red-glow");
    $("#blueSVG").removeClass("blue-glow");

    changeGameStateText("redWin");
    changeGameStateText("goToHomePage");

    setTimeout(() => {
      socket.emit("goToRoomsPage", mySocketID);
    }, 3000);

    /*changeGameStateText("redirectingToHomePage");
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 3000);*/
  } else if (data.gameData[0][0] == "blueWin") {
    $("#blueSVG").addClass("blue-glow");
    $("#redSVG").removeClass("red-glow");

    changeGameStateText("blueWin");
    changeGameStateText("redWin");
    changeGameStateText("goToHomePage");

    setTimeout(() => {
      socket.emit("goToRoomsPage", mySocketID);
    }, 3000);
  }
});
//#endregion
//#endregion

//#region --functions

//#region readHTMLFile func
function readHTMLFile(file) {
  var rawFile = new XMLHttpRequest();
  var allText = "";
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
      }
    }
  };
  rawFile.send(null);
  return allText;
}
//#endregion
//#region sendForm and clearTextbox funcs
function sendForm() {
  let user = [$("#playerNameInput").val(), mySocketID];
  myName = $("#playerNameInput").val();
  $("#myName").text(myName);
  socket.emit("newPlayer", { user });
}

function clearTextbox() {
  $("input[id=inputRoomName]").val("");
}
//#endregion
//#region updateRooms func
function updateRooms(roomNames, roomPlayerCounts, roomIDs) {
  $(".d-flex.text-muted.pt-3").fadeOut(500, function () {
    $(".d-flex.text-muted.pt-3").remove();
  });
  var i = 0;

  roomNames.forEach(function () {
    currRoomName = roomNames[i];
    if (currRoomName != "roomsPage" && myRoom == "roomsPage") {
      if ($(".display-4.text-center.mt-4").length == 1) {
        $(".display-4.text-center.mt-4").fadeOut(500, function () {
          $(".display-4.text-center.mt-4").remove();
        });
      }
      let pCountResult = roomPlayerCounts.find((obj) => {
        return obj.roomName === currRoomName;
      });
      let roomIDResult = roomIDs.find((obj) => {
        return obj.roomNamebyID === currRoomName;
      });

      var playerCount = pCountResult.playerCount;
      var roomID = roomIDResult.roomID;
      $("h6.border-bottom.pb-2.mb-0")
        .after(
          '<div class="d-flex text-muted pt-3" style="display: none;" id="' +
            i +
            '">\n' +
            '                    <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="70" height="70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 70x70" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#007bff"/><text x="48%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="1.4rem">' +
            playerCount +
            "/2</text></svg>\n" +
            "\n" +
            '                    <div class="pb-3 mb-0 small lh-sm w-100">\n' +
            '                        <div class="d-flex justify-content-between">\n' +
            '                            <h3 class="text-gray-dark m-2">Oda ' +
            currRoomName +
            "</h3>\n" +
            '                            <div class="row">\n' +
            '                                <div class="col col-lg-6">\n' +
            '                                    <a role="button" class="btn btn-secondary p-1 spec-button">Seyirci Olarak Katıl</a>\n' +
            "                                </div>\n" +
            '                                <div class="col col-lg-4">\n' +
            '                                    <a role="button" id=\'' +
            roomID +
            "' onclick='joinToRoom(this.id)' class=\"btn btn-primary join-button\">Katıl</a>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            '                        <div class="d-flex">\n' +
            '                            <span class="d-block spec font-weight-light">İzleyici Sayısı: 0</span>\n' +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>"
        )
        .children(":last")
        .hide()
        .fadeIn(250);
      // room update ok i think
      $(".container").fadeIn();
    } else if (roomNames.length == 1 && roomNames[0] == "roomsPage") {
      $("h6.pb-2.mb-0").after(
        '<h1 class="display-4 text-center mt-4 ">Henüz bir oda oluşturulmamış!</h1>'
      );
      $(".display-4.text-center.mt-4").hide().fadeIn(500);
      $(".container").fadeIn();
    }
    i++;
  });
}
//#endregion
//#region joinToRoom func
function imReady() {
  socket.emit("imReady", {
    roomName: currRoomName,
    userToken: mySocketID,
  });
}
function joinToRoom(clickedRoomID) {
  console.log(clickedRoomID);
  // join to room when user clickes "katıl" button
  let data = [clickedRoomID, mySocketID, myName];
  socket.emit("joinToRoom", { data });
}
//#endregion
//#region changeGameTimeText
function changeGameTimeText(time) {
  $("#gameTime").text(time);
}
//#endregion
//#region changeTileText
function changeTileText(color, count) {
  if (color == "blue") {
    $("#blueTileCount").text(count + " Kare");
  } else if (color == "red") {
    $("#redTileCount").text(count + " Kare");
  }
}
//#endregion
//#region change gameState text
function changeGameStateText(
  gameState = null,
  drawResult = null,
  drawnNumber = null,
  drawnColor = null
) {
  const log = (text, effect = null) => {
    const parent = document.querySelector("#gameState");
    const el = document.createElement("li");
    if (effect) {
      el.classList.add(effect);
    }
    el.innerHTML = text;

    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
  };
  if (drawResult == null && drawnNumber == null) {
    switch (gameState) {
      case "goToHomePage":
        log("10 saniye içinde ana sayfaya yönlendirileceksiniz...");
        break;
      case "red is placing tiles":
        log("Kırmızı kareleri yerleştiriyor...");
        break;
      case "blue is placing tiles":
        log("Mavi kareleri yerleştiriyor...");
        break;
      case "blue is choosing number":
        log("Mavi sayı tutuyor...");
        break;
      case "red is choosing number":
        log("Kırmızı sayı tutuyor...");
        break;
      case "players are not ready":
        log("Oyuncular hazır değil!");
        break;
      case "waiting":
        log("Oyun bekleniyor...");
        break;
      case "playing":
        log("Oyun başladı!");
        break;
      case "blueWin":
        log("Mavi kazandı!", "blue-winner");
        break;
      case "redWin":
        log("Kırmızı kazandı!", "red-winner");
        break;
      case "finished":
        log("Oyun bitti!");
        break;
      default:
        log("Oyun bekleniyor...");
        break;
    }
  } else if (drawnColor == "red" && drawnNumber != null) {
    $("#formTut").fadeOut(300);
    $("#formTut").remove();
    var text;
    if (drawResult == "plus") {
      text = "kazandı!";
    } else if (drawResult == "minus") {
      text = "kaybetti!";
    }
    log("Kırmızı  " + drawnNumber + " kare " + text);
  } else if (drawnColor == "blue" && drawnNumber != null) {
    $("#formTut").fadeOut(300);
    $("#formTut").remove();
    var text;
    if (drawResult == "plus") {
      text = "kazandı!";
    } else if (drawResult == "minus") {
      text = "kaybetti!";
    }
    log("Mavi  " + drawnNumber + " kare " + text);
  }
}
//#endregion
//#region changePlayerName function
function changeTextOfPlayerName(playerColor, playerName) {
  var svgID;
  var svgPlayerNameID;

  if (playerColor == "red") {
    svgPlayerNameID = "#redPlayerName";
    svgID = "#redSVG";
  } else if (playerColor == "blue") {
    svgPlayerNameID = "#bluePlayerName";
    svgID = "#blueSVG";
  }

  $(svgPlayerNameID).text(playerName);
  let calcLenghtOfText = $(svgPlayerNameID).text().length;
  var calculatedLenght = 2;
  switch (true) {
    case calcLenghtOfText <= 6:
      calculatedLenght = 4;
      break;
    case calcLenghtOfText == 7:
    case calcLenghtOfText == 8:
      calculatedLenght = 6;
      break;
    case calcLenghtOfText == 9:
    case calcLenghtOfText == 10:
      calculatedLenght = 8;
      break;
    case calcLenghtOfText == 11:
    case calcLenghtOfText == 12:
      calculatedLenght = 9;
      break;
    case calcLenghtOfText == 13:
    case calcLenghtOfText == 14:
      calculatedLenght = 10;
      break;
    case calcLenghtOfText == 15:
    case calcLenghtOfText == 16:
      calculatedLenght = 10;
      break;
    case calcLenghtOfText == 17:
    case calcLenghtOfText == 18:
      calculatedLenght = 11;
      break;
    case calcLenghtOfText == 19:
    case calcLenghtOfText == 20:
      calculatedLenght = 11;
      break;
    case calcLenghtOfText == 21:
    case calcLenghtOfText == 22:
      calculatedLenght = 12;
      break;
    case calcLenghtOfText == 23:
    case calcLenghtOfText == 24:
      calculatedLenght = 12;
      break;
    case calcLenghtOfText == 25:
    case calcLenghtOfText == 26:
      calculatedLenght = 13;
      break;
    case calcLenghtOfText == 27:
    case calcLenghtOfText == 28:
      calculatedLenght = 13;
      break;
    case calcLenghtOfText == 29:
    case calcLenghtOfText == 30:
      calculatedLenght = 14;
      break;
    case calcLenghtOfText == 31:
    case calcLenghtOfText == 32:
      calculatedLenght = 14;
      break;
    case calcLenghtOfText > 32:
      console.log("asd");
      if (calcLenghtOfText % 2 == 0) {
        calculatedLenght = calcLenghtOfText / 2;
      } else {
        var newLenght = calcLenghtOfText - 1;
        if (newLenght % 2 == 0) {
          calculatedLenght = newLenght / 2;
        }
      }
      break;
  }
  $(svgID).attr("width", calculatedLenght + "rem");
}

function updateGamePageParameters(gameState, map) {
  console.log("updateGamePageParameters");

  $(".d-flex.text-muted.pt-3").fadeOut(500, function () {
    $(".d-flex.text-muted.pt-3").remove();
  });

  $(".border-bottom.pb-2.mb-0")
    .fadeOut(500, function () {
      $(".border-bottom.pb-2.mb-0").text("Oda " + gamePageData.gpRoomName);
    })
    .fadeIn();

  $(".d-block.text-end.mt-3.border-top").fadeOut(500, function () {
    $(".d-block.text-end.mt-3.border-top").remove();
  });
  //#region html
  $(
    "<br />\n" +
      '<div class="row">\n' +
      '  <div class="" id="anan">\n' +
      "  </div>\n" +
      '  <div class="col">\n' +
      '    <!--            <h6 class="border-bottom pb-2 mb-0">Odalar</h6>-->\n' +
      '    <div class="row">\n' +
      '      <div class="col-sm-3">\n' +
      '        <i class="fa fa-user-crown"></i\n' +
      "        ><span\n" +
      '          style="font-size: 16px; box-sizing: border-box"\n' +
      '          data-bs-toggle="tooltip" id="roomCreator" \n' +
      '          data-bs-placement="right"\n' +
      '          title="Oyunun ekran görüntüsünü alın."\n' +
      "        >\n" +
      "          " +
      gamePageData.gpRoomCreatorName +
      "</span\n" +
      "        >\n" +
      "      </div>\n" +
      '      <div class="col-sm-6">\n' +
      '        <h4 class="text-center" id="gamePageRoomName">' +
      gamePageData.gpRoomName +
      "</h4>\n" +
      '        <p class="text-center text-muted" id="gameTime">' +
      gamePageData.gpRoomGameTime +
      "</p>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "\n" +
      '    <div class="row text-center">\n' +
      '      <div class="col col-md-6 mx-auto">\n' +
      "        <svg\n" +
      '          class="bd-placeholder-img flex-shrink-0 me-2 rounded-svg-rect" id="blueSVG"\n' +
      '          width="6rem"\n' +
      '          height="40"\n' +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          role="img"\n' +
      '          aria-label="Placeholder: 70x70"\n' +
      '          preserveAspectRatio="xMidYMid slice"\n' +
      '          focusable="false"\n' +
      "        >\n" +
      '          <rect width="100%" height="100%" fill="#007bff"></rect>\n' +
      "          <text\n" +
      '            style="text-shadow: rgba(0, 0, 0, 1) 0px 0px 9px"\n' +
      '            x="48%"\n' +
      '            y="50%"\n' +
      '            dominant-baseline="middle"\n' +
      '            text-anchor="middle" id="bluePlayerName"\n' +
      '            fill="white"\n' +
      '            font-size="1rem"\n' +
      "          >\n" +
      "            test12345\n" +
      "          </text>\n" +
      "        </svg>\n" +
      '        <div class="row">\n' +
      '          <div class="col">\n' +
      '            <h6 class="game-text-underline blue" id="blueTileCount">25 Kare</h6>\n' +
      "          </div>\n" +
      '          <div class="col">\n' +
      '            <hr class="vr" style="height: 4rem" />\n' +
      "          </div>\n" +
      '          <div class="col">\n' +
      '            <h6 class="game-text-underline red" id="redTileCount">25 Kare</h6>\n' +
      "          </div>\n" +
      "        </div>\n" +
      "        <svg\n" +
      '          class="bd-placeholder-img flex-shrink-0 me-2 rounded-svg-rect" id="redSVG"\n' +
      '          width="7rem"\n' +
      '          height="40"\n' +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          role="img"\n' +
      '          aria-label="Placeholder: 70x70"\n' +
      '          preserveAspectRatio="xMidYMid slice"\n' +
      '          focusable="false"\n' +
      "        >\n" +
      '          <rect width="100%" height="100%" fill="#ff0000"></rect>\n' +
      "          <text\n" +
      '            style="text-shadow: rgba(0, 0, 0, 1) 0px 0px 9px"\n' +
      '            x="48%"\n' +
      '            y="50%"\n' +
      '            dominant-baseline="middle"\n' +
      '            text-anchor="middle" id="redPlayerName"\n' +
      '            fill="white"\n' +
      '            font-size="1rem"\n' +
      "          >\n" +
      "            0123456789\n" +
      "          </text>\n" +
      "        </svg>\n" +
      "      </div>\n" +
      '      <hr style="width: 75%" class="mx-auto mt-3" />\n' +
      '      <ul class="font-weight-light" id="gameState">' +
      "</ul>\n" +
      "\n" +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  test12345 sayı tutuyor...-->\n" +
      "      <!--                </h5>-->\n" +
      '      <!--                <h5 class="font-weight-light mb-3">Oyuncular bekleniyor...</h5>-->\n' +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  test12345 10 kare kaybetti-->\n" +
      "      <!--                </h5>-->\n" +
      '      <!--                <h5 class="font-weight-light mb-3">test12345 10 kare tuttu</h5>-->\n' +
      '      <!--                <h5 class="font-weight-light mb-3">-->\n' +
      "      <!--                  Oyuncuların hazır olması bekleniyor...-->\n" +
      "      <!--                </h5>-->\n" +
      "    </div>\n" +
      '    <div class="d-block text-end" style="margin-top: 38%">\n' +
      "      <button\n" +
      '        type="button"\n' +
      '        class="btn btn-secondary"\n' +
      '        data-bs-toggle="tooltip"\n' +
      '        data-bs-placement="top"\n' +
      '        title="Oyunun ekran görüntüsünü alın."\n' +
      "      >\n" +
      "        <svg\n" +
      '          xmlns="http://www.w3.org/2000/svg"\n' +
      '          x="0px"\n' +
      '          y="0px"\n' +
      '          width="30"\n' +
      '          height="30"\n' +
      '          viewBox="0 0 172 172"\n' +
      '          style="fill: #000000"\n' +
      "        >\n" +
      "          <g\n" +
      '            fill="none"\n' +
      '            fill-rule="nonzero"\n' +
      '            stroke="none"\n' +
      '            stroke-width="1"\n' +
      '            stroke-linecap="butt"\n' +
      '            stroke-linejoin="miter"\n' +
      '            stroke-miterlimit="10"\n' +
      '            stroke-dasharray=""\n' +
      '            stroke-dashoffset="0"\n' +
      '            font-family="none"\n' +
      '            font-weight="none"\n' +
      '            font-size="none"\n' +
      '            text-anchor="none"\n' +
      '            style="mix-blend-mode: normal"\n' +
      "          >\n" +
      '            <path d="M0,172v-172h172v172z" fill="none"></path>\n' +
      '            <g fill="#ffffff">\n' +
      "              <path\n" +
      '                d="M17.2,13.76c-1.89978,0.00019 -3.43981,1.54022 -3.44,3.44v27.52c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-24.08h24.08c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM58.48,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM86,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM113.52,13.76c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h24.08v24.08c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-27.52c-0.00019,-1.89978 -1.54022,-3.43981 -3.44,-3.44zM17.14625,54.99297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,54.99297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM17.14625,82.51297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,82.51297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v13.76c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-13.76c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM17.14625,110.03297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v27.52c0.00019,1.89978 1.54022,3.43981 3.44,3.44h27.52c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058h-24.08v-24.08c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM140.98625,110.03297c-1.89722,0.02966 -3.41223,1.58976 -3.38625,3.48703v24.08h-24.08c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h24.08v24.08c-0.01754,1.24059 0.63425,2.39452 1.7058,3.01993c1.07155,0.62541 2.39684,0.62541 3.46839,0c1.07155,-0.62541 1.72335,-1.77935 1.7058,-3.01993v-24.08h24.08c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058h-24.08v-24.08c0.01273,-0.92983 -0.35149,-1.82522 -1.00967,-2.48214c-0.65819,-0.65692 -1.55427,-1.01942 -2.48408,-1.00489zM58.48,137.6c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM86,137.6c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h13.76c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058z"\n' +
      "              ></path>\n" +
      "            </g>\n" +
      "          </g>\n" +
      "        </svg>\n" +
      "      </button>\n" +
      "    </div>\n" +
      '    <!--              <small class="d-block text-end mt-3 border-top">-->\n' +
      "    <!--                <a-->\n" +
      '    <!--                  role="button"-->\n' +
      '    <!--                  class="btn btn-success mt-2"-->\n' +
      '    <!--                  data-bs-toggle="modal"-->\n' +
      '    <!--                  data-bs-target="#createRoomModal"-->\n' +
      "    <!--                  >Oda Oluştur</a-->\n" +
      "    <!--                >-->\n" +
      "    <!--              </small>-->\n" +
      "  </div>\n" +
      "</div>\n" +
      "\n" +
      "<script>\n" +
      '  $("input").on("input propertychange paste", function (e) {\n' +
      "    var reg = /^0+/gi;\n" +
      "    if (this.value.match(reg)) {\n" +
      '      this.value = this.value.replace(reg, "1");\n' +
      "    }\n" +
      "    if (this.value < 0) {\n" +
      "      this.value = 1;\n" +
      "    }\n" +
      "  });\n" +
      "\n" +
      '  $("#formTut").submit(function (e) {\n' +
      "    alert('test');\n" +
      "    e.preventDefault();\n" +
      "  });\n" +
      "  $(function () {\n" +
      "    $(\"[data-bs-toggle='tooltip']\").tooltip();\n" +
      "  });\n" +
      "</script>\n"
  ).appendTo(".my-3.p-3.bg-body.rounded.shadow-lg.w-100");
  //#endregion
  changeGameStateText(gameState);
  setPlayerNameTexts();

  createGrid(16, map);

  $(".grid").click(function () {
    gridClicked($(this));
  });

  $("#gameState").after(
    '<button type="button" id="readyBtn" onclick="imReady()" class="btn btn-outline-success btn-sm mx-auto w-auto" style=" width: auto; height: auto;">Hazırım</button>'
  );
}
//#endregion

function gridClicked(grid) {
  var allowedToClick = true;
  var myColor;
  if (gamePageData.gpRedPlayerToken == mySocketID) myColor = "red";
  else if (gamePageData.gpBluePlayerToken == mySocketID) myColor = "blue";

  if (
    gamePageData.gpGameState != null ||
    gamePageData.gpGameState != "waiting"
  ) {
    if (
      gamePageData.gpTurn == myColor &&
      gamePageData.gpGameState == myColor + " is choosing number"
    ) {
      allowedToClick = false;
      alert("Kare yerleştirmeden önce sayı tutmalısınız!");
    }
    if (gamePageData.gpTurn != myColor) {
      allowedToClick = false;
      alert("Sıra sende değil!");
    }
    if (allowedToClick == true) {
      //send to server
      var gridNumber = grid.attr("id");
      socket.emit("gridClicked", {
        gridID: gridNumber,
        roomName: gamePageData.gpRoomName,
        clickedUserToken: mySocketID,
        result: gamePageData.gpDrawResult,
      });
    }
  }
}

function createGrid(x, map) {
  for (var rows = 0; rows < x; rows++) {
    for (var columns = 0; columns < x; columns++) {
      var colorData = "white";
      switch (map[rows][columns]) {
        case 1:
          colorData = "red";
          break;
        case 2:
          colorData = "blue";
          break;
      }
      $("#anan").append(
        "<div class='grid " +
          colorData +
          "Tile' id='" +
          rows +
          "-" +
          columns +
          "'></div>"
      );
    }
  }
  $(".grid").width(480 / x);
  $(".grid").height(480 / x);
}

function setPlayerNameTexts() {
  if (
    gamePageData.gpRedPlayerToken == null &&
    gamePageData.gpBluePlayerToken != null
  ) {
    changeTextOfPlayerName("blue", gamePageData.gpBluePlayerName);
    changeTextOfPlayerName("red", "Oyuncular Bekleniyor...");
  } else if (
    gamePageData.gpBluePlayerToken == null &&
    gamePageData.gpRedPlayerToken != null
  ) {
    changeTextOfPlayerName("red", gamePageData.gpRedPlayerName);
    changeTextOfPlayerName("blue", "Oyuncular Bekleniyor...");
  } else if (
    gamePageData.gpRedPlayerToken == null &&
    gamePageData.gpBluePlayerToken == null
  ) {
    changeTextOfPlayerName("red", "Oyuncular Bekleniyor...");
    changeTextOfPlayerName("blue", "Oyuncular Bekleniyor...");
  } else {
    changeTextOfPlayerName("red", gamePageData.gpRedPlayerName);
    changeTextOfPlayerName("blue", gamePageData.gpBluePlayerName);
  }
}
//#region createRoom func
function createRoom() {
  if ($("#createRoomModal").data("bs.modal")?._isShown == undefined) {
    var roomName = $("input[id=inputRoomName]").val();
    myRoom = roomName;
    let data = [roomName, mySocketID];

    socket.emit("createRoom", { data });
  } else {
    $("#createRoomModal").modal("show");
  }
}
//#endregion
//#endregion
