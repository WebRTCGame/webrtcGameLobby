
//github test

/*
// reference the http module so we can create a webserver
var http = require("http");

// create a server
http.createServer(function(req, res) {
    // on every request, we'll output 'Hello world'
    res.end("Hello world from Cloud9!");
}).listen(process.env.PORT, process.env.IP);

// Note: when spawning a server on Cloud9 IDE, 
// listen on the process.env.PORT and process.env.IP environment variables

// Click the 'Run' button at the top to start your server,
// then click the URL that is emitted to the Output tab of the console
//Important: use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts!
*/
/*
    Keep a global list of currently connected clients
    -----------------------------------------------
*/
var User = function User(nick){
Object.call(this,nick);
this.nick = nick;
this.guid = this.generateGUID();
var _hosting = false;
Object.defineProperty(this, "hosting", {
    get: function() {
      return _hosting;
    },
    set: function(value) {
        console.log("hosting: " + value);
      this._hosting = value;
    },
    enumerable: true,
    configurable: true
  });
var _clientOf = false;
Object.defineProperty(this, "clientOf", {
    get: function() {
      return _clientOf;
    },
    set: function(value) {
        console.log("ClientOf: " + value);
      this._clientOf = value;
    },
    enumerable: true,
    configurable: true
  });
  
};

User.prototype = Object.create(Object.prototype);
User.prototype.generateGUID = function generateGUID(){
    
    var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

return guid();

};
User.prototype.host = function host(){
    if (!this.hosting){
        this.hosting = true;
    }
};
User.prototype.join = function join(clientGuid){
    if (!this.hosting){
        this.clientOf = clientGuid;
    }
};
User.prototype.endClient = function endClient(){};
User.prototype.generateClientURL = function generateClientURL(){
  return "?mode=client&guid=" + this.clientOf + "&username=" + this.nick;
};
User.prototype.generateHostURL = function generateHostURL(){
  return "?mode=host&guid=" + this.guid + "&username=" + this.nick;
};
User.prototype.regenerateGuid = function regnerateGuid(){
    this.guid = this.generateGUID();
};


//var clients = [];
var userlist = [];



/*
    Create an http server to serve the client.html file
    ---------------------------------------------------
*/
var http = require("http");
var connect = require('connect');
//var fs = require("fs");
//var handlebars = require("handlebars");
//var url = require('url');
/*
var httpServer = http.createServer(function(request, response) {
    fs.readFile(__dirname + "/index.html", "utf8", function(error, content) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.end(content);
    });
}).listen(process.env.PORT || 1337);
*/
var httpServer = connect.createServer(connect.static(__dirname)).listen(process.env.PORT);
/*
    Listen for and handle socket.io connections
    -------------------------------------------
*/
var io = require("socket.io").listen(httpServer);
io.sockets.on("connection", function(socket) {


    /*
        Handle requests to join the chat-room
        -------------------------------------
    */
    socket.on('join', function(nick, callback) {

        // If the nickname isn't in use, join the user
       // if (clients.indexOf(nick) < 0) {

            // Store the nickname, we'll use it when sending messages
            //socket.nick = nick;
            socket.user = new User(nick);
console.log(JSON.stringify(socket.user));
            // Add the nickname to the global list
            //clients.push(nick);
            userlist.push(socket.user);
            // Send a message to all clients that a new user has joined
            socket.broadcast.emit("user-joined", socket.user);

            // Callback to the user with a successful flag and the list of clients
            
            callback(true, userlist);
io.sockets.emit('updateusers',userlist);
        // If the nickname is already in use, reject the request to join
       // } else {
            //callback(false);
        //}
    });

    
    /*
        Handle chat messages
        --------------------
    */
    socket.on("chat", function(message) {
        // Check that the client has already joined successfully,
        // and that the message isn't just an empty string,
        // then foward the message to all clients
        if (socket.user.nick && message) {
            io.sockets.emit("chat", {sender: socket.user.nick, message: message});
        }
    });


    /*
        Handle client disconnection
        ---------------------------
    */
    socket.on("disconnect", function() {
        // Check that the user has already joined successfully
        if (socket.user.nick) {
            // Remove the client from the global list
            //clients.splice(clients.indexOf(socket.nick), 1);
            userlist.splice(userlist.indexOf(socket.user),1);
            
            // Let all the remaining clients know of the disconnect
            io.sockets.emit('updateusers',userlist);
            io.sockets.emit("user-left", socket.user);
        }
    });

});