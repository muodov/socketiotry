var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var colors = ['red', 'blue', 'green', 'orange', 'black', 'magenta'];
var uid = 0; // TODO: make it thread-safe
var users = [];

app.listen(3000);

function handler(req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
};

var pickColor = function() {
  return colors[Math.floor(Math.random() * colors.length)];
};

io.on('connection', function (socket) {
  console.log('user connected: ' + socket.request.connection.remoteAddress);
  socket.uid = uid++;
  socket.color = pickColor();
  var user = {
    ip: socket.request.connection.remoteAddress,
    color: socket.color,
    uid: socket.uid,
    ua: socket.request.headers['user-agent']
  };
  users.push(user);

  socket.broadcast.emit('user_connected', user);
  socket.emit('init', {
    uid: socket.uid,
    color: socket.color,
    userlist: users
  });
  
  socket.on('draw', function (data) {
    console.log(data);
    io.emit('draw', {uid: socket.uid, color: socket.color, data: data});
  });

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.request.connection.remoteAddress);
    var idx = users.indexOf(user);
    if (idx > -1) {
      users.splice(idx, 1);
    }
    io.emit('user_disconnected', user);
  });
});
