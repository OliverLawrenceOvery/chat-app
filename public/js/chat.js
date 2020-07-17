
$(function(){
	
	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// connect to the socket
	var socket = io();
	
	var name = "",
		email = "",
		img = "",
		online = [];
		
	var toggle = false;

	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		body = $("body");
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople"),
		banner = $(".banner");
		chat1 = $(".chat1");
		signUp = $(".signup");

	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		signupForm = $(".signupForm");
		imageUpload = $("#imageUpload");
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		utilityForm = $("#utilityForm");
		label = $("label");
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats"),
		$window = $(window);

	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	socket.on('connect', function(){
		socket.emit('load', id);
	});

	socket.on('img', function(data){
		img = data;
	});

	socket.on('peopleinchat', function(data){
		if(data.number === 0){
			showMessage("connected");
			loginForm.on('submit', function(e){
				e.preventDefault();
				name = $.trim(yourName.val());
				email = yourEmail.val();
				
				socket.emit('check', {
					inputUser: name,
					inputEmail: email
				}); 
			});
		}
		else if(data.number > 0) {
			showMessage("personinchat",data);
			loginForm.on('submit', function(e){
				e.preventDefault();
				name = $.trim(hisName.val());
				email = hisEmail.val();
				
				socket.emit('check', {
					inputUser: name,
					inputEmail: email
				}); 
				
				/* if(!isValid(email)){
					alert("Wrong e-mail format!");
				} */
			});
		}
		else {
			showMessage("tooManyPeople");
		}
	});
	
	socket.on('checked', function(data){			
		if(!data.boolean) {
			alert('Invalid Login Details');		
		} else {
			socket.emit('login', {user: data.name, avatar: data.email, id: id});
		}
	});
	
	socket.on('startChat', function(data){
		var str ='<ul>';
		data.usernameList.forEach(function(username) {
			str += '<li>' + '• ' + username + '</li>';
		});
		str += '</ul>';
		document.getElementById("usernameList").innerHTML = str;
		
		if(data.boolean && data.id == id) {
			if(name === data.user[0]) {
				left.fadeOut(1200, function() {
					banner.fadeOut(50);
					footer.fadeIn(1200);
					});
			noMessagesImage.attr("src",data.avatar[1]);
			}
			else {
				banner.fadeOut(50);
				personInside.fadeOut(1200,function(){
					footer.fadeIn(1200);
				});
			noMessagesImage.attr("src",data.avatar[0]);
			}
		}
		showMessage("chatStarted");
	});
	
	socket.on('arrive/leave', function(data) {
		var str ='<ul>';
		data.usernameList.forEach(function(username) {
			str += '<li>' + '• ' + username + '</li>';
		});
		str += '</ul>';
		document.getElementById("usernameList").innerHTML = str;
		
		if(data.boolean && id==data.room){
			createChatMessage(data.user + data.msg, data.user, data.avatar, moment());
			scrollToBottom()
		}
	});

	socket.on('tooMany', function(data){
		if(data.boolean && name.length === 0) {
			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){
		showMessage('chatStarted');
		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
	});
	
	socket.on('imageUpload', image);
	
	
	$("#signUp").click(function(){   
		showMessage("userSignup");
	});
	
	$("#return").click(function(){   
		document.getElementById('inputName').value = "";
		document.getElementById('inputEmail').value = "";
		showMessage("connected");
	});
	
	signupForm.on('submit', function(e){
		var inputName = document.getElementById('inputName').value;
		var inputEmail = document.getElementById('inputEmail').value;
		e.preventDefault();
		socket.emit('querySQL', {
			name: inputName,
			email: inputEmail 
		});
		socket.on('SQLqueried', function(data){
			if(!data.boolean){
				section.children().css('display','none');
				onConnect.fadeIn(1200);
			} else{
				alert('Username/Email already taken.');
			}
		});
	});
	
	
	$(window).keydown(event => {
		if(!(event.ctrlkey || event.metaKey || event.altKey)){
			textarea.focus();
		}
	});
	
	textarea.keypress(function(e){
		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}
	});
	
	chatForm.on('submit', function(e){
		e.preventDefault();
		showMessage("chatStarted");
		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});
		}
		textarea.val("");
	});

	setInterval(function(){
		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});
	},60000);
	 
	$("#imageFile").bind('change', function(e){
		var data = e.originalEvent.target.files[0];
		var reader = new FileReader();
		reader.onload = function(evt){
			image(name, evt.target.result);
			socket.emit('imageUpload', evt.target.result);
		};
		reader.readAsDataURL(data);
	});
	
	$("#toggleMode").click(function(e){
		e.preventDefault();
		if(!toggle){
			body.css("background-color", "#2c2e33");
			chat1.css("background-color", "#656c7d");
			chatForm.css("background-color", "#2c2e33");
			chat1.css("color", "white");
			textarea.css("background-color", "#2c2e33");
			textarea.css("color", "white");
			toggle = true;
		} else{
			body.css("background-color", "#f0f1f3");
			chat1.css("background-color", "white");
			chatForm.css("background-color", "#f0f1f3");
			chat1.css("color", "black");
			textarea.css("background-color", "white");
			textarea.css("color", "black");
			toggle = false;
		}
	});
	
	
	function image (from, base64Image) {
		chats.append($('<p>').append($('<b>').text(from), '<img src="' + base64Image + '"/>'));
		scrollToBottom();
	}
	
	function createChatMessage(msg, user, imgg, now){
		var who = '';
		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);
		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ 
			scrollTop: $(document).height()-$(window).height() }
		,1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){
			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "personinchat"){
			onConnect.css("display", "none");
			personInside.fadeIn(1200);
			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "chatStarted"){
			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "tooManyPeople"){
			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
		else if(status === "userSignup"){
			section.children().css('display','none');
			signUp.fadeIn(1200);
		}
	}

});
