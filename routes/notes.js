var express = require('express');
var router = express.Router();
var storage = require('node-persist');
storage.initSync();
var notes = storage.getItem('notes') || [];
var students = storage.getItem('students') || [];

router.get('/', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}
    return res.status(200).json({'status': 'ok','notes' : notes});
});

router.post('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (!req.body.course ) {
		return res.status(422).json({'status' : 'Missing course'});
	}
	if (!req.body.note ) {
		return res.status(422).json({'status' : 'Missing note'});
	}
	if (isNaN(req.body.note) || req.body.note > 100 || req.body.note < 1 ) {
		return res.status(422).json({'status' : 'note must be a number between 1-100' });
	}

	var student = students.find(function(element) {
        return element.id == req.params.id;
    });

    if (student) {
    	var note = notes.find(function(element) {
        	return (element.course == req.body.course  && req.params.id == element.student_id);
    	});

    	if (note) {
    		return res.status(422).json({'status': 'Already exist an note for the student '+ student.name + ' in the course ' + req.body.course });
    	}
    	var result = {'id': notes.length+1 , 'course' : req.body.course, 'note' : req.body.note , 'student_id' : student.id , 'student_name' : student.name};
		notes.push(result);
		storage.setItem('notes', notes);
		return res.status(201).json({'status': 'created','note' : result});	
    }
    return res.status(422).json({'status': 'not exist a student with this id' });
});

router.get('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	var student = students.find(function(element) {
        return element.id == req.params.id;
    });

    if (!student) {
    	return res.status(422).json({'status': 'not exist a student with this id' });
    }

    var result = [];
	var note = notes.find(function(element) {
		if (element.student_id == req.params.id) {
			result.push(element);
		}
    });

    return res.status(400).json({'status': 'ok' , 'notes' : (result.length > 0) ? result : 'doesnt exist notes for this student' });
});

router.put('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (!req.body.course ) {
		return res.status(422).json({'status' : 'Missing course'});
	}
	if (!req.body.note ) {
		return res.status(422).json({'status' : 'Missing note'});
	}
	if (isNaN(req.body.note) || req.body.note > 100 || req.body.note < 1 ) {
		return res.status(422).json({'status' : 'note must be a number between 1-100' });
	}
	
	var noteExist = notes.find(function(element) {
        return element.id == req.params.id;
    });

    if (!noteExist) {
    	return res.status(404).json({'status' : 'not exist note with this id' });
    }
  	
	var note = notes.find(function(element) {
    	return element.course == req.body.course  && element.id != req.params.id ;
	});

	if (note) {
		return res.status(422).json({'status': 'Already exist an note for the student '+ note.student_name + ' in the course ' + req.body.course });
	}
    var noteUpdated = {'id': req.params.id , 'course' : req.body.course, 'note' : req.body.note,'student_id' : noteExist.student_id , 'student_name' : noteExist.student_name };
	notes[notes.indexOf(noteExist)] = noteUpdated;
	storage.setItem('notes', notes);
	return res.status(200).json({'status': 'updated' ,'note' : noteUpdated});
});

router.patch('/:id', function(req, res, next) {

  	if ('application/json' !== req.headers['content-type'] ) {
		return res.status(400).json({'status' : 'Invalid content type, expected application/json'});
	}

	if (req.body.course && req.body.note) {
		return res.status(404).json({'status' : 'Wrong url'});
	}

	if (!req.body.course ) {
		return res.status(422).json({'status' : 'Missing course'});
	}
	
	var noteExist = notes.find(function(element) {
        return element.id == req.params.id;
    });

    if (!noteExist) {
    	return res.status(404).json({'status' : 'not exist note with this id' });
    }
  	
	var note = notes.find(function(element) {
    	return element.course == req.body.course  && element.id != req.params.id ;
	});

	if (note) {
		return res.status(422).json({'status': 'Already exist an note for the student '+ note.student_name + ' in the course ' + req.body.course });
	}
    var noteUpdated = {'id': req.params.id , 'course' : req.body.course, 'note' : noteExist.note,'student_id' : noteExist.student_id , 'student_name' : noteExist.student_name };
	notes[notes.indexOf(noteExist)] = noteUpdated;
	storage.setItem('notes', notes);
	return res.status(200).json({'status': 'updated' ,'note' : noteUpdated});

});

/*

Endpoints for Notes
Get /notes must return the notes for all students
Get /notes/:student must return the note for a specific student
Post /notes/:student must add a new note for a student
Put and Patch /notes/:student must update a note for a student
Endpoint to get all the information about the API
Get / must return all the API information including endpoints allowed and Payloads
*/


module.exports = router;
