var express = require ('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
app.set('view engine', 'ejs');
app.set('views' , path.join(__dirname ,'views'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:false}));

app.use(function(req,res,next){
	res.locals.errors = null;
	next();
});
app.use(expressValidator({
	errorFormatter:function(param,msg,value){
		var namespace = param.split('.')
		,root = namespace.shift()
		,formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param:formParam,
			msg:msg,
			value:value
		};
	}
}));

//set  static path

app.use(express.static(path.join(__dirname , 'public')));

app.get('/' , function(req,res){
		db.users.find(function (err, docs) {
			console.log(docs);
			res.render('index', {
			title:"Customers",
			users:docs
		});
	})
});


app.post('/users/add' ,function(req,res){

	req.checkBody('first_name','first name is required').notEmpty();
	req.checkBody('last_name','last name is required').notEmpty();
	req.checkBody('email','email is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index', {
		title:"Customers",
		users:users,
		errors:errors
	});

	}else{
			var newUser = {
					first_name:req.body.first_name,
					last_name:req.body.last_name,
					email:req.body.email
		}

		db.users.insert(newUser ,function(err,result){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});

	}

});

app.delete('/users/delete/:id' , function(req,res){
	db.users.remove({_id:ObjectId(req.params.id)}, function(err,result){
		if(err){
			console.log(err);
		}
		res.redirect('/');
	});
});


app.listen(3000 , function(){
	console.log('server started on port 3000');
});
