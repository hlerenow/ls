var userModeList=function(){
  this._list=[];
};

userModeList.prototype.add=function(obj){
  this._list.push(obj);
}
/*
根据用户名获取元素
*/
userModeList.prototype.searchByU=function(username){
  var tempList=this._list;
  for(var i=0;i<tempList.length;i++){
    if(tempList[i].username==username){
      return i;
    };
  };
  return -1;
};
//根据socketID索引用户
userModeList.prototype.searchBySid=function(sid){
  var tempList = this._list;
  for (var i = 0; i < tempList.length; i++) {
    if (tempList[i].socketId == sid) {
      return i;
    };
  };
  return -1;
}
//根据索引值获取用户
userModeList.prototype.getByI=function(index){
  return this._list[index];
}

//根据用户唯一用户名获取用户结构,如果没有返回null
userModeList.prototype.getByU=function(username){
  var tempList = this._list;
  for (var i = 0; i < tempList.length; i++) {
    if (tempList[i].username == username) {
      return tempList[i];
    };
  };
  return null;
};

//根据索引值删除用户
userModeList.prototype.delI=function(index){
  if(index>=0&&index<this._list.length){
    return this._list.splice(index,1);
  }
  else{
    return null;
  }
}

//根据用户唯一用户名获取用户结构,如果没有返回null
userModeList.prototype.delU=function(username){

  return this.delI(this.searchByU(username));

};
userModeList.prototype.delSid=function(sid){
  return this.delI(this.searchBySid(sid));
}

userModeList.prototype.len=function(){
  return this._list.length;
}

//根据客服username获取客服所拥有的的访客
userModeList.prototype.getAllUsersForServer = function(sUername) { //更具客服名获取所有的用户
  var result = [];
  for (var i = 0; i < this._list.length; i++) {
    if(this._list[i].serverId==sUername){
      result.push(this._list[i]);
    };
  };

  return result;

}

module.exports=exports=userModeList;