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
var User = function User(nick) {
    Object.call(this, nick);
    this.nick = nick;
    this.guid = this.generateGUID();

    this.hosting = false;

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
    var _exp = 0;
    Object.defineProperty(this, "exp", {
        get: function() {
            return _exp;
        },
        set: function(value) {
            console.log("exp: " + value);
            this._exp = value;
            this.level = this.generateLevel();
            console.log("Level " + this.level);
        },
        enumerable: true,
        configurable: true
    });
    this.exp = 400;
    this.level = this.generateLevel(this.exp);
};

User.prototype = Object.create(Object.prototype);
User.prototype.generateGUID = function generateGUID() {

    var s4 = function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    return guid();

};
User.prototype.generateLevel = function generateLevel(varexp) {
    var v1 = Math.sqrt(varexp) - 4;
    return Math.sqrt(v1) + 1;
};
User.prototype.host = function host() {
    if (!this.hosting) {
        this.hosting = true;
    }
};
User.prototype.join = function join(clientGuid) {
    if (!this.hosting) {
        this.clientOf = clientGuid;
    }
};
User.prototype.endClient = function endClient() {};
User.prototype.generateClientURL = function generateClientURL() {
    return "?mode=client&guid=" + this.clientOf + "&username=" + this.nick;
};
User.prototype.generateHostURL = function generateHostURL() {
    return "?mode=host&guid=" + this.guid + "&username=" + this.nick;
};
User.prototype.regenerateGuid = function regnerateGuid() {
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
        var avaliable = true;
        for (var i = 0; i < userlist.length; i++) {
            if (userlist[i].nick === nick) {
                avaliable = false;
            }
        }
        if (avaliable) {
            socket.user = new User(nick);
            //console.log(JSON.stringify(socket.user));
            userlist.push(socket.user);
            socket.broadcast.emit("user-joined", socket.user);
            socket.broadcast.emit('updateusers', userlist);
            callback(true, userlist);
        }
        else {
            callback(false);
        }

    });


    /*
        Handle chat messages
        --------------------
    */
    socket.on("chat", function(message) {
        if (socket.user.nick && message) {
            io.sockets.emit("chat", {
                sender: socket.user.nick,
                message: message
            });
        }
    });
    socket.on("userJoinedGame", function(message) {
        // socket.emit("userJoinedGame",{usernick:socket.user.nick,joinedTo:user.nick});
        console.log("********************************************");
        io.sockets.emit("userJoinGameReceived", message.usernick, message.joinedTo);
    });
    socket.on("hosting", function(usernick) {

        socket.user.hosting = true;

        io.sockets.emit("hosting", usernick);
    });

    /*
        Handle client disconnection
        ---------------------------
    */
    socket.on("disconnect", function() {
        // Check that the user has already joined successfully
        if (socket.user.nick) {

            for (var i in userlist) {
                if (userlist[i].nick === socket.user.nick) {
                    userlist.splice(i, 1);
                    break;
                }
            }

            // Remove the client from the global list
            //clients.splice(clients.indexOf(socket.nick), 1);
            //userlist.splice(userlist.indexOf(socket.user),1);

            // Let all the remaining clients know of the disconnect
            io.sockets.emit('updateusers', userlist);
            io.sockets.emit("user-left", socket.user);
        }
    });

});