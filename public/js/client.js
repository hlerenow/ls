/**
 * Created by Mark on 2016/6/26.
 */
window.onload = function() {

    var chatTempLate={
        uchat:function(content){
            return '<li class="aWord uSelf">'+
                '<div class="wordCotent">'+
                '<div class="word">'+content+'</div>'+
                '</div>'+
                '</li>';
        },
        schat:function(from,content){
            return '<li class="aWord Sothers">'+
                '<span class="username">'+from+'</span>'+
                '<div class="wordCotent">'+
                '<div class="word">'+content+'</div>'+
                '</div>'+
                '</li>';
        },
        tip:function(str){
            return '<li class="aWord tipNews" style="color:red;">'+
                '<span class="username">系统提示:</span>'+
                '<span class="word">'+str+'</span>'+
                '</li>';
        }
    };

    //从cookie获取用户id
    //end
    var myId= $.cookie("my-id")||new GUID().newGUID();//+prompt("请输入你的用户名(不能为空，为空会出错):")
    $.cookie("my-id",myId);

    var socket = io.connect(ioUrl);
    var serverId='';

    socket.emit("initU",{
        "role":1,
        "username":myId
    });

    socket.on('running',function(data){
        serverId=data.serverId;
    });

    socket.on("noServer",function(data){
        //console.log("noServer");
        $(".showContent ul").append(chatTempLate.tip("暂无客服在线！！请稍后再试"));

        if($(".container ul").height()>$(".container").height()){
            $(".container").scrollTop($(".container ul").height());
        }
    });

    //发送消息
    $("#sendNews").on("click", function() {
        var content = $("#word").val();
        $("#word").val("");

        $(".showContent ul").append(chatTempLate.uchat(content));
        if($(".container ul").height()>$(".container").height()){
            $(".container").scrollTop($(".container ul").height());
        }

        if(serverId!=''){
            socket.emit("userChat", {
                from: myId,
                content: content,
                to: serverId
            });


        }else{
            $(".showContent ul").append(chatTempLate.tip("暂无客服在线！！请稍后再试"));
            if($(".container ul").height()>$(".container").height()){
                $(".container").scrollTop($(".container ul").height());
            }
        }
    });


    //接受消息

    socket.on("userChat", function(data) {
        //console.log("ok");

        $(".showContent ul").append(chatTempLate.schat(data.from,data.content));

        if($(".container ul").height()>$(".container").height()){
            $(".container").scrollTop($(".container ul").height());
        }

    });

    socket.on("sendHisroty",function(data){
        var tempStr="";
        for(var i=0;i<data.length;i++){
            if(data[i].from==myId){
                tempStr+=chatTempLate.uchat(data[i].content);

            }else{
                tempStr+=chatTempLate.schat(data[i].from,data[i].content);
            }
        }
        $(".showContent ul").append(tempStr);
        if($(".container ul").height()>$(".container").height()){
            $(".container").scrollTop($(".container ul").height());
        }

    });

    socket.on("serverOffLine",function(data){
        //console.log("下线客服",data);
    });

}


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
        $("#sendNews").trigger("click");
        return false;
    }
}
