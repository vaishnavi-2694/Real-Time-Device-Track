const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

console.log('Server started on port 3000');
console.log('Express app initialized');
console.log('Socket.io initialized');

app.set("view engine", "ejs");

// ✅ Ensure Express serves static files correctly
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
  console.log("A user connected:", socket.id);

  socket.on("send-location", function(data) {
    console.log(`Received location from ${socket.id}:`, data);
    io.emit("receive-location", { id: socket.id, ...data });
  });
  console.log("A user connected");
  socket.on("disconnect",function(){
    io.emit("user-disconnected",socket.id);
  })
  

});

  

app.get('/', (req, res) => {
  res.render('index');
});

// ✅ Add a callback to `listen()` for debugging
server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
