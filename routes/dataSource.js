// Import necessary modules for both routing and Oracle connection
var express = require('express'),
     oracledb = require('oracledb'),
     dbConfig = require('../data/dbconfig.js'),
     router = express.Router();

// This is the 'master function' of the router that does the following:
	// 1. Establishes a connection to the Oracle Database defined in the 
	//    dbConfig.js file and execute an immediate callback to see if the
	//    if the connection is valid.
	// 2. Execute an Oracle query against the connected database using the SQL
	//    statement defined and check for errors.
	// 3. Loops through the results of the Oracle query by row and constucts an 
	//    element called 'tech' for each record. Then it pushes the element into 
	//    the fieldStaff array
	// 4. Converts the fieldStaff array to a JSON element.
	// 5. Sends the JSON result to the dataSource page.
	// 6. Terminates the Oracle Connection to prevent memory leaks and/or DB latency.
router.use(function(req,res,next){
	oracledb.getConnection(
       {
         user          : dbConfig.user,
         password      : dbConfig.password,
         connectString : dbConfig.connectString
       },
    function(err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(

          'SELECT TECH_ID, TECH_NAME, ORDER_NUMBER, JOB_CODE, STATE, STATE_START, DURATION_ON_STATE, STATE_TIME_SECS, AVG_TIME_SECS, LD_LATITUDE, LD_LONGITUDE, ALERT_FLAG FROM ums_code.field_tech_monitor',
          function(err, results, fields) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
			console.log('Database Connection Established');
			var fieldStaff = []
			var fieldStaffJSON
			
			results.rows.forEach(function(row) {
				var tech = {}
				
				tech.TechnicianID = row[0];
				tech.TechnicianName = row[1];
				tech.OrderNumber = row[2];
				tech.JobCode = row[3];
				tech.State = row[4];
				tech.StateStart = row[5];
				tech.StateDuration = row[6];
				tech.StateDurationSeconds = row[7];
				tech.AverageStateDuration = row[8];
				tech.Latitude = row[9];
				tech.Longitude = row[10];
				tech.Flag = row[11];
				
				fieldStaff.push(tech);
			}); 
			fieldStaffJSON = JSON.stringify(fieldStaff);
			
			res.status(200).send(fieldStaffJSON);
	next();
          });
    });

    function doRelease(connection) {
      connection.close(
        function(err) {
          if (err) {
            console.error(err.message);
          }
          console.log('Database Connection Released');
        });
    }
});

module.exports = router;