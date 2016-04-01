'use strict';

var express = require('express');
var router = express.Router();
var storage = require('node-persist');
storage.initSync();
var students = storage.getItem('students') || [];
var notes = storage.getItem('notes') || [];

router.get('/', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}
    return res.status(200).json({'status': 'ok','students' : students});
});

router.post('/', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (!req.body.name ) {
		return res.status(422).json({'status' : 'Missing name'});
	}
	if (!req.body.age ) {
		return res.status(422).json({'status' : 'Missing age'});
	}
	if (isNaN(req.body.age)) {
		return res.status(422).json({'status' : 'Age must be a number' });
	}

	var student = students.find(function(element) {
        return element.name == req.body.name;
    });

	if (student) {
		return res.status(422).json({'status' : 'Already exist this student'}); 
	}

	var result = {'id': students.length+1 , 'name' : req.body.name, 'age' : req.body.age }
	students.push(result);
	storage.setItem('students', students);
	return res.status(201).json({'status' : 'ok' , 'student' : result}); 
});

router.put('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (!req.body.name ) {
		return res.status(422).json({'status' : 'Missing name'});
	}
	if (!req.body.age ) {
		return res.status(422).json({'status' : 'Missing age'});
	}

	if (isNaN(req.body.age)) {
		return res.status(422).json({'status' : 'Age must be a number' });
	}

	var student = students.find(function(element) {
        return element.id == req.params.id;
    });

    if (student) {

    	var sameName = students.find(function(element) {
        	return element.id != req.params.id  && element.name == req.body.name;
    	});

    	if (sameName) {
    		return res.status(422).json({'status' : 'Already exist a student with this name'}); 
    	}

    	var studentUpdated = {'id': req.params.id , 'name' : req.body.name, 'age' : req.body.age };
    	students[students.indexOf(student)] = studentUpdated;
    	storage.setItem('students', students);
    	return res.status(200).json({'status': 'updated' ,'student' : studentUpdated});
    }
    return res.status(404).json({'status': 'not exist'});
});

router.patch('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (req.body.name && req.body.age) {
		return res.status(404).json({'status' : 'Wrong url'});
	}

	if (!req.body.name) {
		return res.status(422).json({'status' : 'Missing name'});
	}

	var student = students.find(function(element) {
        return element.id == req.params.id;
    });

    if (student) {
    	var sameName = students.find(function(element) {
        	return element.id != req.params.id  && element.name == req.body.name;
    	});

    	if (sameName) {
    		return res.status(422).json({'status' : 'Already exist a student with this name'}); 
    	}
    	var studentUpdated = {'id': req.params.id , 'name' : req.body.name, 'age' : student.age };
    	students[students.indexOf(student)] = studentUpdated;
    	storage.setItem('students', students);
    	return res.status(200).json({'status': 'updated' ,'student' : studentUpdated});
    }
    return res.status(404).json({'status': 'not exist'});
});

router.delete('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	var student = students.find(function(element) {
        return element.id == req.params.id;
    });

    if (student) {
    	student 	= {'id': req.params.id , 'name' : req.body.name, 'age' : student.age };
    	students.splice(students.indexOf(student),1);
		storage.setItem('students', students);

		for (var i = 0; i < notes.length; i++) {
			if (notes[i].student_id == req.params.id) {
    			notes.splice(i,1);
			}
		}
    	storage.setItem('notes', notes);
    	return res.status(200).json({'status': 'deleted'});
    }
    return res.status(404).json({'status': notes});    
});

module.exports = router;
