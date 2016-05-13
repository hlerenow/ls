var user_serverAllList=function(){
	this._list=[];
}

/*
  obj.role=initData.role||"";
  obj.username = initData.username || "";
  obj.nickname = initData.nickname || "";
  obj.socketId = initData.socketId || ""; //socket连接句柄的Id,用于刷新检验
  obj.serverId = initData.serverId || ''; //客服的id
  obj.type = initData.type || ""; //咨询用户类型（售前或者售后）
*/
user_serverAllList.prototype.add=function(obj){
	this._list.push(obj);
};

user_serverAllList.prototype.delSid=function(sid){
	for(var i =0;i<this._list.length;i++){
		if(this._list[i].socketId==sid){
			this._list[i].socketId="";
			break;
		}
	}
};

user_serverAllList.prototype.hasSid=function(sid){
	for(var i =0;i<this._list.length;i++){
		if(this._list[i].socketId==sid){
			return true;
		}
	}	
	return false;
};

user_serverAllList.prototype.sidEmpty=function(func){
	for(var i =0;i<this._list.length;i++){
		if(this._list[i].socketId==""){
			func();
		}
	}	
}

module.exports=user_serverAllList;
