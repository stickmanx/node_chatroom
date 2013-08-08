var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

// Helper Functions
// 1. Send 404 errors when file requested doesn't exist
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

// 2. Writes appropriate HTTP header and sends content of file
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

// 3. Checks if file is cached, if so serve it
//    if not, read from disk and server it
//    if not, HTTP 404 error is returned
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}
// End Helper Functions

// Create HTTP Server
//   1. determine HTML file to be served
//   2. translate to relative file path
//   3. server the static file
var server = http.createServer(function(request, response) {
	var filePath = false;
	
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

// Start HTTP Server with port 3000
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

