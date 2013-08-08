// Process chat commands, send messages, request room and nickname changes
var Chat = function(socket) {
	this.socket = socket;
};

// sendMessage
//   Send Messages
Chat.prototype.sendMessage = function(room, text) {
	var message = {
		room: room,
		text: text
	};
	this.socket.emit('message', message);
};

// changeRoom
//   Change Rooms
Chat.prototype.changeRoom = function(room) {
	this.socket.emit('join', {
		newRoom: room
	});
};

//  processCommand
//    Process Chat Commands
Chat.prototype.processCommand = function(command) {
	var words = command.split(' ');
	var command = words[0].substring(1, words[0].length).toLowerCase();
	var message = false;
	
	switch(command) {
		case 'join':
			words.shift();
			var room = words.join(' ');
			
			this.changeRoom(room);
			break;
			
		case 'nick':
			words.shift();
			var name = words.join(' ');
			
			this.socket.emit('nameAttempt', name);
			break;
			
		default:
			message = 'Unrecognized command.';
			break;
	}
	
	return message;
};