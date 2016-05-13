//一群客服
var serverModeList=function(){
  this._list=[];
};



serverModeList.prototype.add=function(obj){
  this._list.push(obj);
}
/*
根据用户名获取客服
*/
serverModeList.prototype.searchByU=function(username){
  var tempList=this._list;
  for(var i=0;i<tempList.length;i++){
    if(tempList[i].username==username){
      return i;
    };
  };
  return -1;
};


serverModeList.prototype.searchBySid=function(sid){
  var tempList = this._list;
  for (var i = 0; i < tempList.length; i++) {
    if (tempList[i].socketId == sid) {
      return i;
    };
  };
  return -1;
}



//根据索引值获取客服
serverModeList.prototype.getByI=function(index){
  return this._list[index];
}

//根据用户唯一用户名获取客服结构,如果没有返回null
serverModeList.prototype.getByU=function(username){
  var tempList = this._list;
  for (var i = 0; i < tempList.length; i++) {
    if (tempList[i].username == username) {
      return tempList[i];
    };
  };
  return null;
};

//根据索引值删除客服
serverModeList.prototype.delI=function(index){
  if(index>=0&&index<this._list.length){
    return this._list.splice(index,1);
  }
  else{
    return null;
  }
};

//根据Sid删除客服
serverModeList.prototype.delSid=function(sid){
  return this.delI(this.searchBySid(sid));
};


//根据用户唯一用户名删除用户结构,并返回删除的元素,若元素不存在则返回null
serverModeList.prototype.delU=function(username){
  return this.delI(this.searchByU(username));
};

serverModeList.prototype.len=function(){
  return this._list.length;
};

//查找可分配客服的id，相应的客服拥有的用户数量-1；
serverModeList.prototype.reduceUsers=function(username){
  console.log('呵呵',username);
  if(this.getByU(username)){
    this.getByU(username).nowUserNum--;
    console.log(this.getByU(username));
  }

};

serverModeList.prototype.getUByMinUsers=function(){

  var temp=9999;
  var resurltU=null;
  var tempItem;
  for(var i=0;i<this._list.length;i++){
    tempItem=this._list[i];
    if(tempItem.nowUserNum<temp&&tempItem.nowUserNum<tempItem._maxUserNum){
      temp=tempItem.nowUserNum;
      resurltU=tempItem;
    };
  };

  if(resurltU){
    resurltU.nowUserNum++;
  };
  return resurltU.username;
};

module.exports=exports=serverModeList;

