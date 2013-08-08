function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

// processUserInput
//   process raw user input
//   if start with slash, treat as command
//   else, treat as message
function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;
	
	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	
	$('#send-message').val('');
}

var socket = io.connect();

// Socket.io Event handling
$(document).ready(function() {
	var chatApp = new Chat(socket);
	
	// Display results of name change attempt
	socket.on('nameResult', function(result) {
		var message;
		
		if (result.success) {
			message = 'You are now known as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});
	
	// Display the results of a room change
	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changes.'));
	});
	
	// Display received messages
	socket.on('message', function (message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});
	
	// Display list of rooms available
	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		
		for(var room in rooms) {
			room = room.substring(1, room.length);
			if(room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		
		// Allow the click of a room name ot change to that room
		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	
	// Request list of rooms availabe intermittantly
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);
	
	$('#send-message').focus();
	
	// Allow clicking the send button to send a chat message
	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});
