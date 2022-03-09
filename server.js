// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.sendFile('/index.html')
// res.sendFile('testing testing');
});

// Here is the actual HTTP server 
var http = require('http');
// We pass in the Express object
var httpServer = http.createServer(app);
// Listen on port 8004
httpServer.listen(8005);

// WebSocket Portion
// WebSockets work with the HTTP server
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

//var io = require('socket.io').listen(httpServer);

var serverCells = [
    [], //roll pattern
    [], //hho pattern
    [], //hh1 pattern
    [], //hh2 pattern
    [], //snare pattern
    [], //kick pattern
  ];
  
  let cellNum = 32;
  let trackNum = 6;
  
  for (let i=0; i<cellNum;i++){
    for(let j=0; j<trackNum; j++){
      serverCells[j][i]=false;
    }  
  }

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 

	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
        io.emit('updateCells', serverCells);

		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('message', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				//socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				io.emit('message', data);
			}
		);

        socket.on('cellClicked', function(data) {
			// Data comes in as whatever was sent, including objects
			//console.log("Received: 'otherevent' " + data);
            // data.socketid = socket.id;

            console.log(data.step);
            serverCells[data.track][data.step] = data.cell;
            socket.broadcast.emit('updateCells', serverCells);
		});

        //Roll Slider Moved
		socket.on('rollMoved', function(data){
			socket.broadcast.emit('rollMoved', data);
		});

        //Open HH Slider Moved
        socket.on('hhopenMoved', function(data){
			socket.broadcast.emit('hhopenMoved', data);
		});

		//HH1 Slider Moved
		socket.on('hh1Moved', function(data){
			socket.broadcast.emit('hh1Moved', data);
		});

        //Clap Slider Moved
        socket.on('clapMoved', function(data){
			socket.broadcast.emit('clapMoved', data);
		});

        //Snare Slider Moved
        socket.on('snareMoved', function(data){
			socket.broadcast.emit('snareMoved', data);
		});

        //Kick Slider Moved
        socket.on('kickOffset', function(data){
			socket.broadcast.emit('kickOffset', data);
		});

		socket.on("something", function(data){
			io.emit("cellToggleEvent", data)
		});

        socket.on('mouse', function(data) {
			// Data comes in as whatever was sent, including objects
			//console.log("Received: 'otherevent' " + data);
            data.socketid = socket.id;
            io.emit('mouse', data);
		});
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('otherevent', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'otherevent' " + data);

            io.emit('otherevent', data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}
);