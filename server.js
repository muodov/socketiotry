var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var colors = ['red', 'blue', 'green', 'orange', 'black', 'magenta'];
var uid = 0; // TODO: make it thread-safe

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
  console.log('user connected: ' + socket.handshake.address);
  socket.uid = uid++;
  socket.color = pickColor();
  socket.broadcast.emit('user_connected', {
    ip: socket.handshake.address,
    color: socket.color,
    uid: socket.uid
  });
  socket.emit('init', {uid: socket.uid, color: socket.color});
  
  socket.on('draw', function (data) {
    console.log(data);
    io.emit('draw', {uid: socket.uid, color: socket.color, data: data});
  });

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.handshake.address);
    io.emit('user_disconnected', { ip: socket.handshake.address });
  });
});
