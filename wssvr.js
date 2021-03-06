var http = require("http");
var url = require("url");
var fs = require('fs');
var WebSocketServer = require('websocket').server;

var clients = [];

// function start(route, handlers) {
function start() {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        var query = url.parse(request.url).query;

        console.log("Request for " + pathname + " received.");

        // route(pathname, handlers, response, query);

        fs.readFile('wscli.html',function (err, data){
            response.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            response.write(data);
            response.end();
        });
    }

    var server = http.createServer(onRequest).listen(8080, function() {
        console.log("Server has started and is listening on port 8080.");
    });

    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    function onWsConnMessage(message) {
        if (message.type == 'utf8') {
            console.log('Received message: ' + message.utf8Data);
            clients.forEach(function(client){
                client.sendUTF(message.utf8Data);
            });
        } else if (message.type == 'binary') {
            console.log('Received binary data.');
        }
    }

    function onWsConnClose(reasonCode, description) {
        console.log(' Peer disconnected with reason: ' + reasonCode);
    }

    function onWsRequest(request) {
        var connection = request.accept('chat', request.origin);
        console.log("WebSocket connection accepted.");
        

        // Save clients (unlimited clients)
        clients.push(connection);

        console.log("clients:", clients);
        connection.on('message', onWsConnMessage);
        connection.on('close', onWsConnClose);
    }

    wsServer.on('request', onWsRequest);
}

start();
