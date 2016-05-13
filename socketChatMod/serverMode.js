var serverMode= function(initData) { //客服模型
  this.role=initData.role||"";
  this.username = initData.username||"";
  this.nickname = initData.nickname||"";
  this.socketId = initData.socketId||""; //socket连接句柄的Id,用于刷新检验
  this.type = initData.type||''; //用户类型
  this._maxUserNum=10;
  this.nowUserNum=0;
  this.selfDestoryHandle=null;
};

//
serverMode.prototype.selfDestory=function(io,UL,SL){

	var tempUsers=UL.getAllUsersForServer(this.username);//客服的所有访客列表
  var newS={
    username:this.username,
    nickname:this.nickname,
    type:this.type,
    role:this.role
  };

	SL.delU(this.username);

  for(var i=0;i<tempUsers.length;i++){
    tempUsers[i].serverId="";
    io.to(tempUsers[i].username).emit("serverOffLine",newS);
  };  
};

module.exports=serverMode;




