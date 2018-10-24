// Title: Operational Real-time In-field Status Application
// Purpose: To provide a near-real time status monitoring 
//          application for field staff
// Author: Andrew Valenski, Spatial Intelligence Developer
// Organization: City of Charlotte, NC
// Date: 8/20/2018

// Declaring the dotenv process constant
const dotenv = require('dotenv').config({path : 'prod.env'}); 

// Declaring necessary modules to the index.js.
 var express = require('express'),
     path = require('path'),
	 dataTables = require('datatables.net'),
	 cluster = require('cluster'),
	 numCPUs = require('os').cpus().length;

// Declaring routes for express to use.
var routes = require('./routes/index'),
    dataSource = require('./routes/dataSource');

// Defining the app to be initiated and defined by Express.	 
var app = express();

// Setting the view-engine (templating engine) for page rendering.
app.set('view engine','pug');

// Defining the static content directory for pages to access.
app.use(express.static(path.join(__dirname, '/public')));

// Instruct Express to use the declared routes when the below endpoints are hit.
app.use('/', routes);
app.use('/dataSource', dataSource);

// Instruct Express to run (listen for requests) on port 3000.
app.listen(5000,function(){
console.log("Live at Port 5000")});

// Export Express as a module so its accessable to other components.
module.exports = app;

    
	 