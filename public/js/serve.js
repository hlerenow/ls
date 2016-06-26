/**
 * Created by Mark on 2016/6/14.
 */
$(document).ready(function() {
//        var ui=new hUI(".q123");
//
//        ui.addUser(11,"sd");
//        ui.getNews(11,"sss",123);
//        setTimeout(function(){
//            ui.delUser(11);
//            //ui.showMessage(1235,"222","asdasdasdsadsasad");
//
//        },3000);

    var myId="S"+navigator.appName+parseInt(navigator.appVersion)+744;

    // var socket = io.connect('http://115.159.197.251:3000');
    //var socket = io.connect('http://localhost:3000');

    var ui=new hUI(".q123");//实例化UI

    var socket = io.connect(ioUrl);



    var chatUserList=new hPerosonList();

    socket.emit("initS",{
        "role":"2",
        "username":myId,
        "nickname":"JK",
        "type":"3"
    });



    //发送消息
    //回车键
    document.onkeydown=function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && e.keyCode==27){ // 按 Esc
            //要做的事情
        }
        if(e && e.keyCode==113){ // 按 F2
            //要做的事情
        }
        if(e && e.keyCode==13){ // enter 键
            //要做的事情

            console.log("消息发送");
            var content = $("#word").val();
            var toId=$("#nowUsername").attr("uid");
            $("#word").val("");

            chatUserList.search(toId).chatHtmlText+=ui.schat(content);

            $(".showContent ul").append(ui.schat(content));

            if($(".container ul").height()>$(".container").height()){
                $(".container").scrollTop($(".container ul").height());
            }

            socket.emit("userChat", {
                from: myId,
                content: content,
                to: ui.nowWindowUserId
            });
            return false;
        }
    }


    //接受消息

    socket.on("userChat", function(data) {
        console.log("接受消息");
        var indexPerson=chatUserList.search(data.from);
        var nowPerson;

        if(indexPerson<0){
            nowPerson=new hPerson();
            nowPerson.username=data.from;
            chatUserList.push(nowPerson);

            ui.addUser(data.from,data.nicekname);

        }
        else{
            nowPerson=chatUserList.get(indexPerson);
        }


        nowPerson.chatHtmlText+=ui.uchat(data.content);

        //未读条数+1
        nowPerson.unReadCount++;
        ui.getNews(data.from,data.content,nowPerson.unReadCount);

    });
    //用户请求
    socket.on("addUser",function(data){
        console.log("用户连接");

        var indexPerson=chatUserList.search(data.username);

        if(indexPerson<0){
            var temp=new hPerson();
            temp.username=data.username;
            chatUserList.push(temp);

            //UI动作
            ui.addUser(data.username,data.nicekname);
        };


    });
    //用户下线
    socket.on("removeUser",function(data){
        ui.delUser(data);

    });

    socket.on("sendUserList", function(data) {
        console.log("重连获取用户列表",data);

        for (var i = 0; i < data.length; i++) {
            console.log(data[i]);
            var indexPerson = chatUserList.search(data[i].username);
            var tempItem;
            if (indexPerson < 0) {
                tempItem = new hPerson();
                tempItem.username = data[i].username;
                chatUserList.push(tempItem);
                console.log(chatUserList);
                ui.addUser(data[i].username,data[i].nickname);

            }else{
                tempItem=chatUserList.get(indexPerson);
            };

            var tempHis = "";
            for (var t = 0; t < data[i].chatHistory.length; t++) {
                if (data[i].chatHistory[t].from == myId) {
                    tempHis +=ui.schat(data[i].chatHistory[t].content);
                } else {
                    tempHis +=ui.uchat(data[i].chatHistory[t].content);

                }
            }
            tempItem.chatHtmlText = tempHis;

        };
    });


    //绑定点击选择用户列表事件
    $("#userList").on("click","li.iteUser",function(){
        var nickname=$(this).children('.iteUserName').html();
        var username=$(this).attr("uid");
        console.log(chatUserList.get(chatUserList.search(username)));
        ui.showMessage(username,nickname,chatUserList.get(chatUserList.search(username)).chatHtmlText);

        //修改未读记录
        chatUserList.get(chatUserList.search(username)).count=0;

    });


    socket.on("userOffLine",function(data){
        console.log("下线用户",data);
    });
});

/*UI逻辑*/
/**UI类
 * @contructs
 */
var hUI=function(str){
    this.initHTML="<div id=\"usersListCon\"><h3 class=\"listTitle\">用户列表<\/h3><ul id=\"userList\"><\/ul><\/div><div class=\"chatWindow\"><div class=\"userNews\">正在与<span id=\"nowUsername\" uId=\"\">自己<\/span>对话<\/div><div class=\"showContent\"><div class=\"container\"><ul><\/ul><\/div><\/div><div class=\"inputWord\"><textarea id=\"word\"><\/textarea><\/div><\/div>";
    if(str[0]==="#"){
        this.pCon=$(str);
    }else{
        this.pCon=$(str)[0];
    }
    $(this.pCon).html(this.initHTML);
    this.nowWindowUserId="";//正在聊天的客户id
}

/**
 * 访客消息html模版
 * @param content - 消息内容
 * @returns {string}
 */
hUI.prototype.schat=function(content){
    return '<li class="aWord uSelf">'+
        '<div class="wordCotent">'+
        '<div class="word">'+content+'</div>'+
        '</div>'+
        '</li>';
};

/**
 * 客服回复html模版
 * @param content - 回复内容
 * @returns {string} -html模版
 */
hUI.prototype.uchat=function(content){
    return '<li class="aWord Sothers">'+
        '<div class="wordContent">'+
        '<div class="word">'+content+'</div>'+
        '</div>'+
        '</li>';
};
/**
 *提示语
 * @param str
 * @returns {string}
 */
hUI.prototype.tip=function(str){
    return '<li class="aWord tipNews" style="color:red;">'+
        '<span class="username">系统提示:</span>'+
        '<span class="word">'+str+'</span>'+
        '</li>';
};
/**
 *列表项模版
 * @param uId
 * @param uNickName
 * @returns {string}
 */
hUI.prototype.uItemHander=function(uId,uNickName){
    return '<li class="iteUser" uid="'+uId+'">'+
        '<span class="iteUserName">'+uNickName+'</span>'+
        '<span class="unReadNews"></span>'+
        '</li>';
}
/**
 *
 * @param uId -访客唯一标识
 * @param uNickName -访客昵称
 */
hUI.prototype.addUser=function(uId,uNickName){
    $("#userList").append(this.uItemHander(uId,uNickName));
}
/**
 * 根据唯一标识移除对应UI
 * @param uId
 */
hUI.prototype.delUser=function(uId){
    if(this.nowWindowUserId===uId){
        $(this.pCon).children(".chatWindow ul").html("");
        $(this.pCon).children(".userNews #nowUsername").html("自己");
        //$(this.pCon).children(".userNews #nowUsername").attr("uId","0");
    }
    $("#userList .iteUser[uid="+uId+"]").remove();
}
/**
 *接收到消息时的UI动作
 * @param uId - 访客唯一id
 * @param message - 访客发的消息
 * @param unRead - 未读消息数
 */
hUI.prototype.getNews=function(uId,message,unRead){
    console.log("getnews");
    if(this.nowWindowUserId===uId){
        $(this.pCon).find(".chatWindow ul").append(this.uchat(message));
    }else{
        $(this.pCon).find("#usersListCon .iteUser[uid="+uId+"] .unReadNews").html(unRead);
        $(this.pCon).find("#usersListCon .iteUser[uid="+uId+"] .unReadNews").css("display","block");
    }
}

hUI.prototype.showMessage=function(uId,nickName,content){
    if(this.nowWindowUserId!==uId){
        this.nowWindowUserId=uId;
        $(this.pCon).find(".userNews #nowUsername").html(nickName);
        $(this.pCon).find(".chatWindow ul").html(content);
        console.log("gggg");
        $(this.pCon).find("#usersListCon .iteUser[uid="+uId+"] .unReadNews").html("0");
        $(this.pCon).find("#usersListCon .iteUser[uid="+uId+"] .unReadNews").css("display","none");
    }

}



//   begin---------------------------------
/**定义一些数据结构**/

/**
 * 一个用户对象
 * @constructs
 */
var hPerson=function(){
    this.username="";//用户名
    this.chatHtmlText="";//用户当前聊天记录
    this.unReadChatId=[];//当前聊天记录id列表
    this.unReadCount=0;//未读消息数
    this.nickname="匿名用户";//用户昵称

};

/**
 * 用户对列表
 * @constructs
 */
var hPerosonList=function(){
    this._hPerosonList=[];
};

/**
 * 添加用户
 * @param obj - a hPerson object
 */
hPerosonList.prototype.push=function(obj){
    this._hPerosonList.push(obj);

};

/**
 *根据用户的用户名删除用户数据结构
 * @param {string} nameStr
 * @returns {hPerson} - return a hPerson Object
 */
hPerosonList.prototype.cut=function(nameStr){
    var i=0;
    for(;i<this._hPerosonList.length;i=i+1){
        if( this._hPerosonList[i].username&&this._hPerosonList[i].username==nameStr){
            var temp=this._hPerosonList[i];
            delete this._hPerosonList[i];
            return temp;
        }
    }
};
/**
 * 搜索用户
 * @param nameStr
 * @returns {number} -返回被搜索用户的脚标，若用户不存在返回-1
 */
hPerosonList.prototype.search=function(nameStr){
    var i=0;
    if(this._hPerosonList.length){
        for(;i< this._hPerosonList.length;i=i+1){
            if( this._hPerosonList[i].username===nameStr){
                return i;
            }
        }
    }
    return -1;
};

/**
 *
 * @returns {number} - 用户个数
 */
hPerosonList.prototype.len=function(){
    var count=this._hPerosonList.length;
    if(count){
        count=0;
        for(var i in this._hPerosonList){
            if(this._hPerosonList[i]!=undefined){
                count++;
            }
        };
    }
    return count;
};

/**
 *根据索引值获取用户
 * @param index - 用户的索引值
 * @returns {*} - 用户对象
 */
hPerosonList.prototype.get=function(index){
    return this._hPerosonList[index];
};



//-----------------------end



