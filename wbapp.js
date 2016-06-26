

var userMode = require('./socketChatMod/userMode');
var userModeList = require('./socketChatMod/userModeList');
var serverMode = require('./socketChatMod/serverMode');
var serverModeList = require('./socketChatMod/serverModeList');


var io = require('socket.io')();

// {
// 	"username":"",
// 	"socketId":"",
// 	"role":"",
// 	"serverId":""
// }
//所有用户信息的基本信息,包括客服
/*
当用户下线时需要及时更新用户的 @serverId 上线时也需要即时更新
用于保持用户的连接状态（刷新网页时）
设有定时器 ，检测
*/

var mySL=new serverModeList();//所有客服列表
var myUL=new userModeList();//所有的用户列表
var waiteUsers=[]//客服不在时的用户数组队列

io.on('connection', function(socket){

	/*
	data={
		"role":"",
		"username":"",
		"nickname":"",
		"type":""
	}
	*/
	socket.on("initU", function(data) {
		
		socket.join(data.username);
		socket.name = data.username;

		socket.role=1;

//        检验用户是否只是刷新
		var tempU=myUL.getByU(data.username);//索引值
		if (tempU) {
		
			clearTimeout(tempU.selfDestoryHandle);	
			console.log("取消销毁访客:",data.username);

			socket.emit("running", {
				serverId: tempU.serverId
			});

			socket.emit("sendHisroty",tempU.chatHistory);

		} else {
		//没有客服在线时 ，不将访客记录在内存
			var serverUserName = "";
			if (mySL.len()) { //有客服存在
				console.log("有客服在线");
				serverUserName = mySL.getUByMinUsers();

				if (serverUserName != null) { //分配客服

                    data.nickname="访客"+mySL.getByU(serverUserName).onlyName++;
                    mySL.onlyName++;

                    // socket.emit("nickNme",{nickName:data.nicekname});

					var temp = new userMode({
						"username": data.username,
						"nickname": data.nickname,
						"socketId": socket.id,
						'serverId': serverUserName,
						"type": data.type,
						"role": data.role//访客角色编码role 客服角色编码2
					});

					myUL.add(temp); //加入访客列表

					socket.emit("running", {
						serverId: serverUserName
					});
					//向客服发送加入通知
					socket.to(serverUserName).emit("addUser", {
						username:data.username,
						nicekname:data.nickname,
						type:data.type,
						role:data.role
					});					

				}
			} else {
				console.log('没有客服在线');
				socket.emit("noServer");
			}
		}

	

		console.log(myUL);
	});


//客服初始化
	socket.on("initS", function(data) {

		socket.join(data.username);
		socket.name = data.username;
		socket.role=2;
		var flagFresh=mySL.searchByU(data.username);
		if(flagFresh>=0){
			clearTimeout(mySL.getByI(flagFresh).selfDestoryHandle);
			mySL.socketId=socket.id;
			console.log("取消销毁客服:",data.username);

			//返回访客列表
			socket.emit("sendUserList",myUL.getAllUsersForServer(data.username));

		}else{
			mySL.add(new serverMode({
				"username": data.username,
				"nickname": data.nickname,
				"socketId": socket.id,
				"type": data.type,
				"role": data.role
			}));
			
		}
		console.log(mySL);
	});

//聊天信息传输
	socket.on("userChat", function(data) {
		console.log(data);
		if (data.to) {
			console.log("send");

			var chatHistoryUser;

			if (socket.role == 1) { //访客发送
				chatHistoryUser=socket.name;
			}else{//客服发送
				chatHistoryUser=data.to;
			}

			myUL.getByU(chatHistoryUser).chatHistory.push({
				"from": data.from,
				"to": data.to,
				"content": data.content,
				"dateTime": ""
			});
			io.to(data.to).emit("userChat", data);
		}

	});


//用户断线
	socket.on("disconnect",function(data){

		console.log("断开de 事件:",socket.name);
		var tempU
		if (socket.role == 2) {
			tempU = mySL.getByU(socket.name);

			if (tempU) {
				tempU.selfDestoryHandle = setTimeout(function(tempU) {
					console.log("客服离开页面",socket.name);

					tempU.selfDestory(io, myUL, mySL);
                    io.emit("removeUser",socket.name);
				}, 1000 * 10, tempU);

			}
		} else {
			tempU = myUL.getByU(socket.name);
			console.log(tempU);
			if (tempU) {
				tempU.selfDestoryHandle = setTimeout(function(tempU) {
					console.log("访客离开页面",socket.name);
					tempU.selfDestory(io, myUL, mySL);
                    io.emit("removeUser",socket.name);
                }, 1000 * 10, tempU);

			};
		};

	});
});

module.exports = io;