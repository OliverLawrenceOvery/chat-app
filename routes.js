
var mysql = require('mysql');
var gravatar = require('gravatar');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var usernames = [];

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : ''
});

module.exports = function(app,io){

	app.get('/', function(req, res){
		res.render('home');
	});

	app.get('/create', function(req,res){
		var id = Math.round((Math.random() * 1000000));
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){
		res.render('chat');
	});
	
	var chat = io.on('connection', function (socket) {
		socket.on('load', function(id){
			var room = findClientsSocket(io, id);
			
			if(room.length === 0 ) {
				socket.emit('peopleinchat', {
					number: 0
				});
			}
			else if(room.length < 3) {
				socket.emit('peopleinchat', {
					number: room.length,
					user: room[0].username,
					avatar: room[0].avatar,
					id: id,
					usernameList: usernames
				});
			}
			else if(room.length >= 3) {
				chat.emit('tooMany', {boolean: true});
			}
		});

		socket.on('querySQL', function(data){
			var userQuery = data.name;
			var emailQuery = data.email;
			if(userQuery && emailQuery){
				connection.query('SELECT * FROM accounts WHERE username = ? AND email = ?', [userQuery, emailQuery], function(error, results, fields) {
				if(results.length > 0) {
					socket.emit('SQLqueried',{
						boolean: true
					});
				} else {
					var query = 'INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)';
					connection.query(query, [userQuery, userQuery, emailQuery], function(err, results){
					});
					socket.emit('SQLqueried',{
						boolean: false
					});
					}
				});
			} 
		});
		
		socket.on('check', function(data){
			var inputUser = data.inputUser;
			var inputEmail = data.inputEmail;  
					
			if(usernames.indexOf(inputUser) > -1) {
			} else if (inputUser && inputEmail) {
				connection.query('SELECT * FROM accounts WHERE username = ? AND email = ?', [inputUser, inputEmail], function(error, results, fields) {
				if (results.length > 0) {
					usernames.push(inputUser);
					socket.emit('checked',{
						boolean: true,
						name: inputUser,
						email: inputEmail
					});
				} else {
					socket.emit('checked',{
						boolean: false,
						name: inputUser,
						email: inputEmail
					});
					}
				}); 
			} 
		});
		
		socket.on('login', function(data) {
			var room = findClientsSocket(io, data.id);
			
			if (room.length < 3) {
				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
				socket.emit('img', socket.avatar);
				socket.join(data.id);
			
				socket.broadcast.to(this.room).emit('arrive/leave', {
					boolean: true,
					room: this.room,
					user: socket.username,
					avatar: socket.avatar,
					msg: ' has joined.',
					usernameList: usernames
					});
				
				chat.in(data.id).emit('startChat', {
					boolean: true,
					id: data.id,
					user: socket.username,
					avatar: socket.avatar,
					usernameList: usernames
					});		
					//console.log(chat.connected.rooms);
			}	
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		socket.on('disconnect', function() {
			var room = findClientsSocket(io, room);
			
			const index = usernames.indexOf(this.username);	
			if(index > -1) {
				usernames.splice(index, 1);
			}

			socket.broadcast.to(this.room).emit('arrive/leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar,
				msg: ' has left.',
				usernameList: usernames
				});
				
			socket.leave(socket.room);
		});

		socket.on('msg', function(data){
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	
		socket.on('imageUpload', function(data){
			socket.broadcast.to(socket.room).emit('imageUpload', socket.username, data);
		});
		
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"
	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId);
				//console.log(ns.connected[id].username);
				
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}