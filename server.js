const express = require('express')
const socket = require('socket.io')

const app = express()
const server = app.listen(3000)

app.use(express.static('public'))

var io = socket(server)
var users = [];
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

io.on('connection', newConnection);

function roomNames() {
 const arr = Array.from(io.sockets.adapter.rooms);
 const filtered = arr.filter(room => !room[1].has(room[0]));
 return filtered.map(i => i[0]);
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
   playerCount: count
  });
  i++;
 });
 return playerCountDatasOfRooms;
}
function updateRooms (roomNames, countDatas) {
 let roomDatas = [roomNames, countDatas];
 io.sockets.in('roomsPage').emit('updateRooms', roomDatas);
}

function newConnection(socket) {
 console.log("new connection: " + socket.id);
 socket.on('newPlayer', function(data) {

  var userToken = data.user[1];
  var userName = data.user[0];
  var userID = users.length + 1;
  users.push({usertoken:userToken,username:userName,userid:userID});
  socket.join("roomsPage");

  let readyData = [true, userToken, roomNames(), roomPlayerCountDatas()];
  io.to(userToken).emit('readyToSeeRooms', readyData);

 });

 socket.on('createRoom', function (data) {
  let roomName = data.data[0];
  socket.join(roomName);
  let roomCreator = data.data[1];
  const random = Math.floor(Math.random() * 2) + 1;
  if (random == 1) {
   // Red
   rooms.push({
    roomname: roomName,
    roomid: rooms.length + 1,
    roomcreator: roomCreator,
    players: {
     red: {
      playertoken: roomCreator,
      playername: users[users.findIndex(user => user.usertoken == roomCreator)].username,
      playerid: users[users.findIndex(user => user.usertoken == roomCreator)].userid,
      ready: false
     },
     blue: {
      playertoken: null,
      playername: null,
      playerid: null,
      ready: null
     }, spectators: {

     }
    }, gameState: {
     turn: null,
     redPlayerTiles: null,
     bluePlayerTiles: null,
     drawnNumber: null,
     state: 'players are not ready' // red sayi tutuyor - blue sayi tutuyor - red seciyor - blue seciyor - finished
   }
   });
  } else if (random == 2) {
   // Blue
   rooms.push({
    roomname: roomName,
    roomid: rooms.length + 1,
    roomcreator: roomCreator,
    players: {
     red: {
      playertoken: null,
      playername: null,
      playerid: null,
      ready: null
     },
     blue: {
      playertoken: roomCreator,
      playername: users[users.findIndex(user => user.usertoken == roomCreator)].username,
      playerid: users[users.findIndex(user => user.usertoken == roomCreator)].userid,
      ready: false
     }, spectators: {

     }
    }
   });
  }
  updateRooms(roomNames(), roomPlayerCountDatas());
 });

}
