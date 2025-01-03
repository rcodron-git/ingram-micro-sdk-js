require('dotenv').config();
var express = require('express');
var router = express.Router();
var XiSdkResellers = require('xi_sdk_resellers');
var session = require('express-session');

// Use session middleware
router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
  res.json({ title: 'Express' });
});



module.exports = router;
