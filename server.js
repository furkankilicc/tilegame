const express = require("express");
const socket = require("socket.io");

const app = express();
var port = process.env.PORT || 3000;
const server = app.listen("https://rocky-springs-75229.herokuapp.com/");

app.use(express.static("public"));

var io = socket(server);
var users = [];
var map = [];
/*
ROOM STRUCTURE

rooms
 room1
  players
    red
     playerID-red
     ready- true or not
    blue
     playerID-blue
     ready- true or not
    spectators
     playerID-spec
     playerID-spec
   game-state
     turn
     red player tiles
     blue player tiles
     tutulan sayi
     state
       started
         red sayi tutuyor
         blue sayi tutuyor
         red seçiyor
         blue seçiyor
       players are not ready
       finished
 */
var rooms = [];

io.on("connection", newConnection);

function roomNames() {
  const arr = Array.from(io.sockets.adapter.rooms);
  const filtered = arr.filter((room) => !room[1].has(room[0]));
  return filtered.map((i) => i[0]);
}

function roomPlayerCountDatas() {
  var playerCountDatasOfRooms = [];
  var i = 0;
  rooms.forEach(function () {
    var count = 0;
    if (rooms[i].players.red.playertoken != null) count++;
    if (rooms[i].players.blue.playertoken != null) count++;
    playerCountDatasOfRooms.push({
      roomName: rooms[i].roomname,
      playerCount: count,
    });
    i++;
  });
  return playerCountDatasOfRooms;
}

function roomIDDatas() {
  var roomIDs = [];
  var i = 0;
  rooms.forEach(function () {
    roomIDs.push({
      roomNamebyID: rooms[i].roomname,
      roomID: rooms[i].roomid,
    });
    i++;
  });
  return roomIDs;
}

function updateRooms(roomNames, countDatas, idDatas) {
  let roomDatas = [roomNames, countDatas, idDatas];
  io.sockets.in("roomsPage").emit("updateRooms", roomDatas);
}

function joinRoom(
  socket,
  team,
  joiningRoomID,
  joiningUserID,
  joiningRoomName,
  joiningRoomCreatorName,
  roomData
) {
  console.log("joinroomFuncgeldi");
  map = map = {
    0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    4: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    11: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
    12: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
    13: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
    14: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    15: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  let data = [
    team,
    joiningRoomID,
    joiningRoomName,
    roomData,
    joiningRoomCreatorName,
    map,
  ];
  switch (team) {
    case "blue":
      socket.join(joiningRoomName);
      console.log("JOINING:" + joiningUserID);
      io.to(joiningUserID).emit("joinedRoom", { data });

      if (roomData.players.blue.playertoken != null) {
        let gameData = [
          ["playerName", "blue"],
          roomData.players.blue.playername,
        ];
        io.to(roomData.players.red.playertoken).emit("gameData", { gameData });
      }
      break;
    case "red":
      socket.join(joiningRoomName);
      console.log("JOINING:" + joiningUserID);
      io.to(joiningUserID).emit("joinedRoom", { data });

      if (roomData.players.red.playertoken != null) {
        let gameData = [["playerName", "red"], roomData.players.red.playername];
        io.to(roomData.players.blue.playertoken).emit("gameData", { gameData });
      }
      break;
    case "spectator":
      break;
  }
}

function sendGameData(dataType, dataForSent) {
  if (dataType == "creatingRoom") {
    var roomNameTemp = dataForSent.dataForSent[0];
    var roomIDTemp = dataForSent.dataForSent[1];
    map = {
      0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      2: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      3: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      4: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      11: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
      12: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
      13: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
      14: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      15: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    var roomDatasForSent =
      rooms[rooms.findIndex((room) => room.roomid == roomIDTemp)];
    var roomCreatorName =
      users[
        users.findIndex(
          (user) => user.usertoken == roomDatasForSent.roomcreator
        )
      ].username;
    let data = [roomDatasForSent, roomCreatorName, map];
    io.sockets.in(roomNameTemp).emit("roomData", { data });
  }
}

function newConnection(socket) {
  console.log("new connection: " + socket.id);
  socket.on("newPlayer", function (data) {
    var userToken = data.user[1];
    var userName = data.user[0];
    var userID = users.length + 1;
    users.push({ usertoken: userToken, username: userName, userid: userID });
    socket.join("roomsPage");

    let readyData = [
      true,
      userToken,
      roomNames(),
      roomPlayerCountDatas(),
      roomIDDatas(),
    ];
    io.to(userToken).emit("readyToSeeRooms", readyData);
  });

  function randomTurn() {
    var randomTurn = Math.floor(Math.random() * 2);
    if (randomTurn == 0) {
      return "blue";
    } else {
      return "red";
    }
  }

  function stateChange(changedState, roomID) {
    let roomData = rooms[rooms.findIndex((room) => room.roomid == roomID)];

    if (changedState == "drawTurn") {
      var turn = randomTurn();
      roomData.gameState.state = turn + " is choosing number";
      roomData.gameState.turn = turn;
      let gameData = [
        ["turn"],
        [
          turn,
          roomData.gameState.state,
          roomData.players.red.playertoken,
          roomData.players.blue.playertoken,
        ],
      ];
      io.sockets.in(roomData.roomname).emit("gameData", { gameData });
    } else if (changedState == "anotherTurn") {
      var turn = roomData.gameState.turn;
      if (turn == "blue") {
        turn = "red";
      } else if (turn == "red") {
        turn = "blue";
      }
      roomData.gameState.state = turn + " is choosing number";
      roomData.gameState.turn = turn;
      let gameData = [
        ["turn"],
        [
          turn,
          roomData.gameState.state,
          roomData.players.red.playertoken,
          roomData.players.blue.playertoken,
        ],
      ];
      io.sockets.in(roomData.roomname).emit("gameData", { gameData });
    } else if (changedState == "blueWin") {
      roomData.gameState.state = "blueWin";
      let gameData = [
        ["blueWin"],
        [roomData.roomname, roomData.gameState.state],
      ];
      io.sockets.in(roomData.roomname).emit("gameData", { gameData });
    } else if (changedState == "redWin") {
      roomData.gameState.state = "redWin";
      let gameData = [
        ["redWin"],
        [roomData.roomname, roomData.gameState.state],
      ];
      io.sockets.in(roomData.roomname).emit("gameData", { gameData });
    }
  }

  socket.on("goToRoomsPage", function (data) {
    console.log("goToRoomsPage");
    let userData = users[users.findIndex((user) => user.usertoken == data)];
    socket.join("roomsPage");
    let readyData = [
      true,
      data,
      roomNames(),
      roomPlayerCountDatas(),
      roomIDDatas(),
    ];
    io.to(data).emit("readyToSeeRooms", readyData);
  });

  socket.on("imReady", function (data) {
    console.log("imready");
    var userToken = data.userToken;
    var roomName = data.roomName;

    let roomData = rooms.find((obj) => {
      return obj.roomname == roomName;
    });

    if (roomData.players.red.playertoken == userToken) {
      console.log("redReady");
      roomData.players.red.ready = true;
    } else if (roomData.players.blue.playertoken == userToken) {
      console.log("blueReady");
      roomData.players.blue.ready = true;
    }

    if (
      roomData.players.red.ready == true &&
      roomData.players.blue.ready == true
    ) {
      console.log("allReady");
      roomData.gameState.state = "playing";
      roomData.gameState.redPlayerTiles = 9;
      roomData.gameState.bluePlayerTiles = 9;

      const random = Math.floor(Math.random() * 2) + 1;
      if (random == 1) {
        roomData.gameState.turn = "red";
      } else {
        roomData.gameState.turn = "blue";
      }

      io.sockets.in(roomName).emit("allPlayersReady", roomData);

      roomData.gameState.gameTime = 0;
      roomData.gameState.gameTimeInterval = setInterval(() => {
        if (
          roomData.gameState.state != "redWin" ||
          roomData.gameState.state != "blueWin" ||
          roomData.gameState.state != "finished"
        ) {
          roomData.gameState.gameTime++;
          io.sockets.in(roomName).emit("gameTime", roomData.gameState.gameTime);
          if (roomData.gameState.gameTime === 4)
            stateChange("drawTurn", roomData.roomid);
        }
      }, 990);
    }
  });

  socket.on("gridClicked", function (data) {
    var seperatedGridData = data.gridID.split("-");
    var row = seperatedGridData[0];
    var col = seperatedGridData[1];
    var clickedTilesColor = map[row][col];
    var roomName = data.roomName;
    var color;
    let roomData = rooms.find((obj) => {
      return obj.roomname == roomName;
    });
    console.log("girdclicked");
    if (roomData.players.red.playertoken == data.clickedUserToken) color = 1;
    else if (roomData.players.blue.playertoken == data.clickedUserToken)
      color = 2;
    if (roomData.gameState.drawnNumber > 0) {
      console.log(clickedTilesColor + " // " + color);
      if (clickedTilesColor != color) {
        console.log("clickedTilesColor");
        if (data.result == "plus") {
          if (clickedTilesColor == 0) {
            if (color == 1) roomData.gameState.redPlayerTiles++;
            else if (color == 2) roomData.gameState.bluePlayerTiles++;
            roomData.gameState.drawnNumber--;
            map[row][col] = color;
            io.sockets.in(roomName).emit("changedTile", {
              roomName: roomName,
              roomGameState: {
                redPlayerTiles: roomData.gameState.redPlayerTiles,
                bluePlayerTiles: roomData.gameState.bluePlayerTiles,
              },
              tile: {
                row: row,
                col: col,
              },
              newTileColor: color,
              clickedUserToken: data.clickedUserToken,
            });
          } else if (clickedTilesColor == 1) {
            roomData.gameState.redPlayerTiles--;
            roomData.gameState.bluePlayerTiles++;
            roomData.gameState.drawnNumber--;
            map[row][col] = color;
            io.sockets.in(roomName).emit("changedTile", {
              roomName: roomName,
              roomGameState: {
                redPlayerTiles: roomData.gameState.redPlayerTiles,
                bluePlayerTiles: roomData.gameState.bluePlayerTiles,
              },
              tile: {
                row: row,
                col: col,
              },
              newTileColor: color,
              clickedUserToken: data.clickedUserToken,
            });
          } else if (clickedTilesColor == 2) {
            roomData.gameState.bluePlayerTiles--;
            roomData.gameState.redPlayerTiles++;
            roomData.gameState.drawnNumber--;
            map[row][col] = color;
            io.sockets.in(roomName).emit("changedTile", {
              roomName: roomName,
              roomGameState: {
                redPlayerTiles: roomData.gameState.redPlayerTiles,
                bluePlayerTiles: roomData.gameState.bluePlayerTiles,
              },
              tile: {
                row: row,
                col: col,
              },
              newTileColor: color,
              clickedUserToken: data.clickedUserToken,
            });
          }
        }
      } else if (clickedTilesColor == color && data.result == "minus") {
        console.log("minüs");
        if (clickedTilesColor == 1) {
          roomData.gameState.redPlayerTiles--;
          roomData.gameState.drawnNumber--;
          map[row][col] = 0;
          io.sockets.in(roomName).emit("changedTile", {
            roomName: roomName,
            roomGameState: {
              redPlayerTiles: roomData.gameState.redPlayerTiles,
              bluePlayerTiles: roomData.gameState.bluePlayerTiles,
            },
            tile: {
              row: row,
              col: col,
            },
            newTileColor: 0,
            clickedUserToken: data.clickedUserToken,
          });
        } else if (clickedTilesColor == 2) {
          roomData.gameState.bluePlayerTiles--;
          roomData.gameState.drawnNumber--;
          map[row][col] = 0;
          io.sockets.in(roomName).emit("changedTile", {
            roomName: roomName,
            roomGameState: {
              redPlayerTiles: roomData.gameState.redPlayerTiles,
              bluePlayerTiles: roomData.gameState.bluePlayerTiles,
            },
            tile: {
              row: row,
              col: col,
            },
            newTileColor: 0,
            clickedUserToken: data.clickedUserToken,
          });
        }
      }
    }

    console.log(
      roomData.gameState.redPlayerTiles +
        " :red : " +
        roomData.gameState.bluePlayerTiles +
        " :blue"
    );
    if (roomData.gameState.redPlayerTiles == 0) {
      stateChange("blueWin", roomData.roomid);
    } else if (roomData.gameState.bluePlayerTiles == 0) {
      stateChange("redWin", roomData.roomid);
    } else {
      if (roomData.gameState.drawnNumber == 0) {
        stateChange("anotherTurn", roomData.roomid);
      }
    }
    /*if (color == 2) {
      if (roomData.gameState.redPlayerTiles == 0) {
        stateChange("blueWin", roomData.roomid);
      }
    } else if (color == 1) {
      if (roomData.gameState.bluePlayerTiles == 0) {
        stateChange("redWin", roomData.roomid);
      }
    }*/
  });

  socket.on("tutulanSayi", function (data) {
    let roomData = rooms.find((obj) => {
      return obj.roomname == data[1];
    });
    var color;
    if (roomData.players.red.playertoken == data[2]) color = "red";
    else if (roomData.players.blue.playertoken == data[2]) color = "blue";
    //convert data[0] to number
    var tutulanSayiInt = parseInt(data[0]);
    if (tutulanSayiInt > roomData.gameState.redPlayerTiles) {
      io.to(data[2]).emit("tutulanSayiError", [
        roomData.gameState.state,
        roomData.players.red.playertoken,
        roomData.players.blue.playertoken,
      ]);
    } else {
      roomData.gameState.drawnNumber = data[0];
      var random = Math.floor(Math.random() * 2) + 1;
      if (random == 1) {
        // +
        io.sockets
          .in(roomData.roomname)
          .emit("drawResult", [data[1], "plus", data[0], data[2], color]);
        setTimeout(() => {
          roomData.gameState.state = color + " is placing tiles";
          io.sockets
            .in(roomData.roomname)
            .emit("playerIsPlacingTiles", [
              data[1],
              "plus",
              data[0],
              data[2],
              color,
            ]);
        }, 1000);
      } else if (random == 2) {
        // -
        io.sockets
          .in(roomData.roomname)
          .emit("drawResult", [data[1], "minus", data[0], data[2], color]);
        setTimeout(() => {
          roomData.gameState.state = color + " is placing tiles";
          io.sockets
            .in(roomData.roomname)
            .emit("playerIsPlacingTiles", [
              data[1],
              "minus",
              data[0],
              data[2],
              color,
            ]);
        }, 3000);
      }
    }
  });

  socket.on("joinToRoom", function (data) {
    console.log("joinToRoomsocket geldi knk");
    let joiningRoomID = data.data[0];
    let userToken = data.data[1];
    let joiningRoomName;
    let joiningUserName = data.data[2];

    let roomData = rooms.find((obj) => {
      return obj.roomid == joiningRoomID;
    });
    console.log(roomData);
    joiningRoomName = roomData.roomname;
    // check empty slots
    var redPlayerIsEmpty;
    var bluePlayerIsEmpty;

    if (roomData.players.red.playertoken == null) {
      redPlayerIsEmpty = true;
    } else if (roomData.players.red.playertoken != null) {
      redPlayerIsEmpty = false;
    }
    if (roomData.players.blue.playertoken == null) {
      bluePlayerIsEmpty = true;
    } else if (roomData.players.blue.playertoken != null) {
      bluePlayerIsEmpty = false;
    }
    if (redPlayerIsEmpty == null) {
      console.log("kırmızı null");
    }
    if (bluePlayerIsEmpty == null) {
      console.log("blue null");
    }
    if (redPlayerIsEmpty == true && bluePlayerIsEmpty == false) {
      console.log("kırmızıya giriyo");
      // kırmızıya giriyo
      roomData.players.red.playertoken = userToken;
      roomData.players.red.playername =
        users[users.findIndex((user) => user.usertoken == userToken)].username;
      roomData.players.red.playerid =
        users[users.findIndex((user) => user.usertoken == userToken)].userid;
      roomData.players.red.ready = false;
      let joiningRoomCreatorName =
        users[users.findIndex((user) => user.usertoken == roomData.roomcreator)]
          .username;
      joinRoom(
        socket,
        "red",
        joiningRoomID,
        userToken,
        joiningRoomName,
        joiningRoomCreatorName,
        roomData
      );
    } else if (redPlayerIsEmpty == false && bluePlayerIsEmpty == true) {
      console.log("maviye giriyo");
      // maviye giriyo
      roomData.players.blue.playertoken = userToken;
      roomData.players.blue.playername =
        users[users.findIndex((user) => user.usertoken == userToken)].username;
      roomData.players.blue.playerid =
        users[users.findIndex((user) => user.usertoken == userToken)].userid;
      roomData.players.blue.ready = false;
      let joiningRoomCreatorName =
        users[users.findIndex((user) => user.usertoken == roomData.roomcreator)]
          .username;
      joinRoom(
        socket,
        "blue",
        joiningRoomID,
        userToken,
        joiningRoomName,
        joiningRoomCreatorName,
        roomData
      );
    } else if (redplayerIsEmpty == true && bluePlayerIsEmpty == true) {
      console.log("full bos");
      // full boş
    } else if (redplayerIsEmpty == false && bluePlayerIsEmpty == false) {
      console.log("dolu knk");
      // dolu knk
    }
  });

  socket.on("createRoom", function (data) {
    let roomName = data.data[0];
    socket.join(roomName);
    let roomCreator = data.data[1];
    const random = Math.floor(Math.random() * 2) + 1;
    console.log(random);
    let roomId = rooms.length + 1;
    if (random == 1) {
      // Red
      rooms.push({
        roomname: roomName,
        roomid: roomId,
        roomcreator: roomCreator,
        players: {
          red: {
            playertoken: roomCreator,
            playername:
              users[users.findIndex((user) => user.usertoken == roomCreator)]
                .username,
            playerid:
              users[users.findIndex((user) => user.usertoken == roomCreator)]
                .userid,
            ready: false,
          },
          blue: {
            playertoken: null,
            playername: null,
            playerid: null,
            ready: null,
          },
          spectators: {},
        },
        gameState: {
          turn: null,
          redPlayerTiles: null,
          bluePlayerTiles: null,
          drawnNumber: null,
          gameTime: "00:00",
          state: "players are not ready", // red sayi tutuyor - blue sayi tutuyor - red seciyor - blue seciyor - finished
        },
      });
    } else if (random == 2) {
      // Blue
      rooms.push({
        roomname: roomName,
        roomid: roomId,
        roomcreator: roomCreator,
        players: {
          red: {
            playertoken: null,
            playername: null,
            playerid: null,
            ready: null,
          },
          blue: {
            playertoken: roomCreator,
            playername:
              users[users.findIndex((user) => user.usertoken == roomCreator)]
                .username,
            playerid:
              users[users.findIndex((user) => user.usertoken == roomCreator)]
                .userid,
            ready: false,
          },
          spectators: {},
        },
        gameState: {
          turn: null,
          redPlayerTiles: null,
          bluePlayerTiles: null,
          drawnNumber: null,
          gameTime: "00:00",
          state: "players are not ready", // red sayi tutuyor - blue sayi tutuyor - red seciyor - blue seciyor - finished
        },
      });
    }
    let dataForSent = [roomName, roomId];
    sendGameData("creatingRoom", { dataForSent });

    updateRooms(roomNames(), roomPlayerCountDatas(), roomIDDatas());
  });
}
