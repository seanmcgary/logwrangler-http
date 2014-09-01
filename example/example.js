var logwrangler = require('logwrangler');
var logger = logwrangler.create();

var express = require('express');
var bodyParser = require('body-parser');
var server = express();

server.use(bodyParser());

server.post('/log', function(req, res){
	console.log(req.body);
	res.send(200);
});

server.listen(8000);

setTimeout(function(){
	var logwranglerHttp = require('../');

	logger.use(new logwranglerHttp({
		host: 'localhost',
		port: 8000
	}));

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

}, 1000);
