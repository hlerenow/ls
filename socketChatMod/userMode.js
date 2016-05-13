
//用户模型
//{"username":"hl","nickname":"帅哥","socketId":"123","selfId":"456","serverId":"789","type":"er"}
var userMode = function(initData) { //用户模型
  this.role=initData.role||"";
  this.username = initData.username || "";
  this.nickname = initData.nickname || "";
  this.socketId = initData.socketId || ""; //socket连接句柄的Id,用于刷新检验
  this.serverId = initData.serverId || ''; //客服的id
  this.type = initData.type || ""; //咨询用户类型（售前或者售后）
  this.selfDestoryHandle=null;//自杀句柄

  /*
    {
      "from": "",
      "to": '',
      "content": "",
      "dateTime": ""
    }  
  */
  this.chatHistory = []//保存聊天记录;
};


userMode.prototype.selfDestory=function(io,UL,SL){
  var  sId=this.serverId;

  var newS={
    username:this.username,
    nickname:this.nickname,
    type:this.type,
    role:this.role
  };

  SL.reduceUsers(sId);
  UL.delU(this.username);
  //向客服发送下线事件，并且附带下线用户的信息
  io.to(sId).emit("userOffLine",newS);
}



module.exports=exports=userMode;