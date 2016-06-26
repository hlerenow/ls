var express = require('express');
var router = express.Router();

var conf=require("../conf/hostConf");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { wsPort: conf.wsPort,host:conf.host });
});

router.get('/serve',function(req,res,next){
	res.render('serve',{ wsPort: conf.wsPort,host:conf.host });
});

router.get('/serve1',function(req,res,next){
    res.render('chat_server',{ wsPort: conf.wsPort,host:conf.host });
});
module.exports = router;


