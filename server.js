var express = require('express'),
	path = require('path'),
	app = express(),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	Sequelize = require('sequelize'),
	sequelize = new Sequelize('mysql', 'root', '123456', {logging: console.log});

var User = sequelize.define('Users',{
	userID: Sequelize.STRING,
	password: Sequelize.STRING,
	notepad: Sequelize.STRING
});//control DBMS without using SQL

app.use(express.static('client'));
app.use(bodyParser.urlencoded({ extended: true }));;
app.use(session({
	key: 'sid',
	secret: 'secret',
	cookie: {
		maxAge: 1000 * 60 * 60
	}
}));

app.get('/', function(req, res) {
	if(req.session.logined == true)
		res.redirect('/note');
	else
		res.redirect('/login');
});

app.get('/login', function (req, res) {
	if(req.session.logined == true)
		res.redirect('/note');
	else
		res.sendFile(path.join(__dirname, 'client/login.html'));
});

app.post('/login', function (req, res) {
	var loginUser; 
	User.findOne({ // 로그인 정보 검색
		where: {
			userID : req.body.id,
			password: req.body.pw
		} 
	}).then(function(user){
		if(user != null){ //로그인 정보가 일치하는 것이 있음
			req.session.regenerate(function() {
			req.session.logined = true;
			req.session.user_id = req.body.id;

			res.redirect('/note');
			});
		}
		else
			res.redirect('/login');
	}); //findOne: promise객체(할수 있는 것들을 알려줌)를 return 함
});

app.post('/logout', function(req, res) {
	if(req.session.logined == true) {
		req.session.destroy();
		res.clearCookie('sid');
	}
	res.redirect('/login');
});

app.get('/note', function (req, res) {
	if(req.session.logined == true)
		res.sendFile(path.join(__dirname, 'client/index.html'));
	else
		res.redirect("/login");
});

app.get('/load', function (req, res) {
	fs.readFile("note" + req.session.user_id + ".txt", 'utf8', function(err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	});
});

app.post('/save', function (req, res) {
	var content = req.body.content;
	
	fs.writeFile("note" + req.session.user_id + ".txt", content, 'utf-8', function(err) {
		if (err)
			res.send(err);
	});//이부분을 database에 저장하는 것으로 바꾸면 됨!
});

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */

sequelize.sync().then(function() {
	/*User.create({
		userID: '1',
		password: '1',
		notepad: ''
	});
	User.create({
		userID: '2',
		password: '2',
		notepad: ''
	});
	User.create({
		userID: '3',
		password: '3',
		notepad: ''
	}) // 이 내용을 사용하면 서버를 켤 때마다 메모장이 생김
*/
	

	User.findAll().then(function(users){
		console.log(users);
	});

	var server = app.listen(8080, function () {
	console.log('Server started!');
	});
}, function(err){ console.log(err);});