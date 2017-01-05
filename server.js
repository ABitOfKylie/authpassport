var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');  
var morgan = require('morgan');  
var passport = require('passport'); 

// db id/name and secret stored in config/main
var config = require('./config/main'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');  

app = express();

// use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev')); 

app.use (passport.initialize()); 

// connect to db
mongoose.connect(config.database);

// Bring in passport strategy
require('./config/passport')(passport);

// API routes
 apiRoutes.post ('./register', function(req,res){
 	if(!req.body.email || !req.body.password){
 		res.json({success:false, message: "Please enter an email and password to register."});
	} else {
		var newUser = newUser({
			email: req.body.email,
			password: req.body.password
		});
	}

// attempt to save new user / .save is mongoose method
	newUser.save (function(err){
		if (err) {
 		res.json({success:false, message: "That email already exists."});
		}
 		res.json({success:true, message: "Successfully created new user!"});
 	});

});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
apiRoutes.post('/authenticate', function(req, res) {  
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {  
  res.send('It worked! User id is: ' + req.user._id + '.');
});

// Set url for API group routes
app.use('/api', apiRoutes);  
// Home route. 
app.get('/', function(req, res) {  
  res.send('Relax. We will put the home page here later.');
});

var port = 3000;
app.listen(port);
console.log("Ta dah! Your server is now running on port " + port + ".");