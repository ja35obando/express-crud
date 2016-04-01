'use strict';

var express = require('express');
var router = express.Router();
var storage = require('node-persist');
storage.initSync();

router.get('/', function(req, res, next) {

	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}
	var users = [{ 'name': 'Jose Obando', 'email': 'ja35obando@gmail.com' , 'id':1},{ 'name': 'Jorge Zavala', 'email': 'jm_neta@hotmail.com','id':2 }];
    storage.setItem('users',users);
    return res.json({'status': 'ok','users' : storage.getItem('users')});
});

router.get('/:id', function(req, res) {
	if ('application/json' !== req.headers['content-type']) {
		res.status(400);
		return res.json({'status' : 'Invalid content type, expected application/json'});
	}
    var user = storage.getItem('users').find(function(element) {
        return element.id == req.params.id;
    });
    return res.status(200).json({'status': (!user) ? 'not exist' : 'ok','user' : user});
});

module.exports = router;