var subIo=function(socket,io){
	console.log("hello");
	// socket.emit("ok");
	io.to(socket.id).emit("ok");
};

module.exports = subIo;