// Importing necessary modules for routing
var express = require('express');
var router = express.Router();

// This is a middleware component that enforces the logic of:
// when a request is made without a specific page (i.e. http://website/) ->
// render the index page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CLTW ORIS' });
});

module.exports = router;
