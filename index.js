var express=require('express');
var app = express();
var server = require('http').Server(app);
var hostConf=reqiure("./conf/hsotConf");//主机配置
var bodyParser=require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend:true}));

var session = require('express-session');

var socketUsers={};//在线用户列表用户
var serverUsers=[];//在线客服列表
var noServerUserNum=0;

app.use(session({
  secret: 'hlserver',
  resave: false,
  saveUninitialized: true
}))

app.set('port', process.env.PORT ||hostConf.port|| 3000);
app.engine('html', require('ejs').renderFile);
app.set("view engine", "html");
app.use(express.static("public"));

//监听端口
server.listen(app.get("port"),function(){
  console.log('Express server listening on port ' + app.get('port'));	
});

var io = require('socket.io')(server);
// 数据库

var dbConfig=require("./conf/db");
var mysql = require('mysql');
var pool  = mysql.createPool(dbConfig);

app.get('/', function(req, res) {
	if(req.session.loginState&&req.session.loginState==1){
		console.log("已登录");
		if(req.session.isServer)
			res.redirect("chat_server");
		else
			res.redirect("chat_user");
	}else{

	res.render('index');
	}
});


app.all("/chat_user",function(req,res){
	if(req.session.loginState&&req.session.loginState==1){

		console.log("chat_user已登录");

		socketUsers[req.session.userName] = {
			name: req.session.userName,
			online: true
		};

		console.log("reWrite",req.session.userName);

		if(req.session.isServer){
			serverUsers.push({
				name: req.session.userName,
				online: true,
				havaUsers: 0,
				maxUsers: 100
			});

		}

		res.render("chat_user",{userName:req.session.userName,host:hostConf.host,port:hostConf.port});
		//console.log(socketUsers);
	}else{
		res.render("index");
	}
});

app.all("/chat_server",function(req,res){
	if(req.session.loginState&&req.session.loginState==1){


		socketUsers[req.session.userName] = {
			name: req.session.userName,
			online: true
		};
		
		if(req.session.isServer){
			serverUsers.push({
				name: req.session.userName,
				online: true,
				havaUsers: 0,
				maxUsers: 100
			});

		}

		res.render("chat_server",{userName:req.session.userName,host:hostConf.host,port:hostConf.port});
		//console.log(socketUsers);
	}else{
		res.render("index");
	}
});

app.all("/process/login", function(req, res) {
	//验证密码
	pool.query("select uid from huser where username= ? and password= ? ;", [req.body.username, req.body.password], function(err, results) {
		if (err) {
			console.log(err);
		}
		console.log(results);
		if (results.length != 0) {
			req.session.loginState = "1";
			//写入用户记录			
			socketUsers[req.body.username] = {
				name:req.body.username,
				online:true
			};
			req.session.userName=req.body.username;
			//console.log("用户列表:"+socketUsers);
			//写入客服在线记录
			pool.query("select * from hrole where rid =(select rid from user_role_related where uid=? ) ", [results[0].uid], function(err, results) {
				//console.log(results[0]);
				if (results[0]) {
					if (results[0].rId == 1 || results[0].rId == 2) {
						serverUsers.push({
							name: req.body.username,
							online: true,
							havaUsers:0,
							maxUsers:100
						});
						//console.log("客服列表:",serverUsers[req.body.username]);

						req.session.isServer=true;

						res.redirect("../chat_server");
					}
					else{
						res.redirect("../chat_user");
					};
				};
			});
			
			
		}else{
			res.redirect("../index");
		};
	});

});


app.all("/process/visitorLogin", function(req, res) {
	//验证密码

	if(req.body.nickname&&req.body.email){//用户提交数据不为空

		pool.query("insert into huser set nickname=?,email=?;select Last_Insert_ID() uid;", [req.body.nickname, req.body.email], function(err, results) {
			if(!err){
				var visitorId=results[1][0].uid;
				pool.query("update huser set userName=? where uid=?;",['visitor'+visitorId,visitorId],function(err,results){
					if(!err){
								req.session.loginState = "1";
								//写入用户记录			
								socketUsers['visitor'+visitorId] = {
									name:visitorId,
									online:true
								};

								req.session.userName='visitor'+visitorId;
								//console.log("用户列表:"+socketUsers);
								//写入客服在线记录
								res.redirect("../chat_user");						
					}

				});

			}
			else{
				console.log(err);
				res.redirect("../");
			}

		});
	}else{//用户提交数据为空
			res.redirect("../");		
	}


});




// socket 聊天部分
io.on('connection', function(socket) {
	console.log("用户链接");
	//验证用户是否登录
	socket.on("check_user",function(data){
		console.log("检查用户");
		socket.join(data.username);
		socket.name=data.username;
		var tempFlag;
		
		if(socketUsers[data.username]){//用户已登录
			for(var i in serverUsers){
				if(serverUsers[i].name==data.username)
					tempFlag=true;
			}

			if(tempFlag){//判断用户类型
					console.log("客服");
					socket.emit("connect-server", {
						serverId: data.username
					});

					if(noServerUserNum){
						socket.emit("serverOnline");
						noServerUserNum--;
					}
			}
			else{
				console.log("普通用户");
				//发送客服信息
				if(serverUsers.length<1){//没有客服在线
					console.log("没有客服在线");
					socket.emit("noServer");
					noServerUserNum++;

				}
				else{
					//发消息给用户
					console.log("选择客服");
					socket.emit("connect-server", {
						serverId: serverUsers[0].name
					});

					//addUser 发消息给客服
					socket.to(serverUsers[0].name).emit("addUser",{username:data.username})

				}

			}

		}
		else{//用户未登录
			socket.emit("noLogin");
			console.log("用户未登录,socket");
		}

	});


	socket.on("userChat", function(data) {
		console.log(data);

		if(data.to){

			pool.query("select uid from huser where userName=? ;select uid from huser where userName=? ;",[data.from,data.to],function(err,results){

				if(err){
					console.log(err);				
				};

				console.log(results);

				pool.query("insert into chathistory set `from`=?,`to`=?,content=?;",[results[0][0].uid,results[1][0].uid,data.content],function(err,reuslts){

					if (err) {
						console.log(err);
					} else {

						io.to(data.to).emit("userChat", data);
					}
				});

			});
		};

		//console.log(data.id+" "+data.content);
	});

	//用户断线 or 刷新
	socket.on("disconnect",function(){
		for(var i in serverUsers){
			if(serverUsers[i].name==socket.name){
				delete serverUsers[i];
			}

			if(socketUsers[socket.name]){
				delete socketUsers[socket.name];
			}
		}
		console.log("断线");
	});


});




