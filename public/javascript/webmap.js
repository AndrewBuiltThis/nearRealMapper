// Title: CLTW Monitoring Tool
// Version: 1.0.0
// Update History: []
// Description: This tool allows for near-real time visualization of field staff
// Author: Andrew Valenski
// Date: 8/10/2018

/* This is the main 'execution' script that does the work
for the application. It executes as a node.js file using the 
Esri JS API 4 (), Jquery () and the DataTable JQuery Plugin().
*/

// The 'require' statement imports the modules this application uses
require([
  "esri/renderers/UniqueValueRenderer",
  "esri/renderers/SimpleRenderer",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/Search",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Home",
  "dojo/domReady!"
  ], 

  // This is the parent JS function (in Node, this would be known
  // as the process) that executes the code to 'do' things.
  function(UniqueValueRenderer, SimpleRenderer, Map, MapView, 
  FeatureLayer, Point, Expand, Legend, Search,  BasemapToggle, Home) {
	  
	// This is a jquery function to load the DataTable with the id of 
	// 'staffTable.' It makes an AJAX request to the /dataSource endpoint
	// to parse the JS array output by the Oracle Query in the router file.
	// Additonally, this styles the table dynamically by value.
    $(document).ready(function () {
      var table = $('#stafftable').DataTable({
        "searching": false,
        "lengthChange": false,
		"scrollX": true,
		"scrollY": 250,
        ajax: {
          'url' : '/dataSource',
          'dataSrc' : ''
        },
        columns: [
          {'data' : 'TechnicianName'},
          {'data' : 'OrderNumber'},
          {'data' : 'JobCode'},
          {'data' : 'State'},
          {'data' : 'StateStart'},
          {'data' : 'StateDuration'},
          {'data' : 'StateDurationSeconds'},
          {'data' : 'AverageStateDuration'},
          {'data' : 'Flag'},
          {'data' : 'Latitude'},
          {'data' : 'Longitude'}		  
        ],
      'rowCallback': function(row, data, dataIndex){
         var rowFlag = data.Flag;
         if ( rowFlag == "RED" ) {
           $('td', row).css('background-color', '#F5C6CB');
         }
         else if (rowFlag == "YELLOW") {
           $('td', row).css('background-color', '#FFEEBA');
         }
       },
       "aaSorting" : [8, 'desc']
      });
	  
	  // This callback to the table variable hides the columns we don't 
	  // care about. They must be loaded, however, to be used.
      table.columns( [6,7,8] ).visible( false );
	  
	  // This is a custom Jquery function to link the table to the web map 
	  // and style the table appropriately given the selection. This is done
	  // by adding classes to the selected row (tr) and parsing the values of
	  // the table to pull the X & Y coordinates and use a Point constructor
	  // to set the zoom-extent of the Web Map.
      $('#stafftable tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          }
        else {
	      table.$('tr.selected').css("font-weight","normal");
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
		  $(this).css("font-weight","bold");
          techLat = table.cell('.selected',9).data();
          techLong = table.cell('.selected',10).data();
		  var techCoord = new Point({
		    latitude: techLat,
			longitude: techLong
		  });
			
		  view.goTo({
		    target: techCoord,
			zoom: 15
				});
        }
      });
	  
	  // This function invokes the AJAX method to reload the table 
	  // every 60 seconds (60000 milliseconds).
      setInterval(function () {
      table.ajax.reload( null, false );
      }, 60000 );
      });
	  
	  // This is a custom JQuery function to associate an action with
	  // the onClick events of the buttons in the Navigation Bar by 
	  // adding and removing styling classes to the DOM elements.
/*      $("#mapToggle").click(function(){
        if($(this).html() == "Hide Map"){
          $(this).html("Restore Map");
          }   
        else{
          $(this).html("Hide Map");
        }
        $("#topDiv").slideToggle();
      });
      $("#tableToggle").click(function(){
        if($(this).html() == "Hide Table"){
          $(this).html("Restore Table");
        }
        else{
          $(this).html("Hide Table");
        }
        $("#bottomDiv").slideToggle();
      });
*/
	  
	  // These are global variables that are defined for subsequent functions
	  // to populate.
      var techLocLayer;
      var url = "dataSource";
      var features = [];

	  // Here we're defining the data schema of the input JSON array so we can 
	  // construct the graphicLayer in a consistent manner.
      var fields = [
        {
          name: "TechnicianID",
		  alias: "ObjectID",
          type: "oid"
        }, {
          name: "TechnicianName",
          alias: "TechnicianName",
          type: "string"
        }, {
          name: "OrderNumber",
          alias: "OrderNumber",
          type: "string"
        }, {
          name: "JobCode",
          alias: "JobCode",
          type: "string"
        }, {
          name: "State",
          alias: "State",
          type: "string"
        }, {
          name: "StateStart",
          alias: "StateStart",
          type: "date"
        }, {
          name: "StateDuration",
          alias: "StateDuration",
          type: "string"
        }, {
          name: "StateDurationSeconds",
          alias: "StateDurationSeconds",
          type: "double"
        }, {
          name: "AverageStateDuration",
          alias: "AverageStateDuration",
          type: "double"
        }, {
          name: "Latitude",
          alias: "Latitude",
          type: "double"
        }, {
          name: "Longitude",
          alias: "Longitude",
          type: "double"
        },{
          name: "Flag",
          alias: "Alert Flag",
          type: "string"
        }
	  ];

	  // Here we're defining the Popup Template within the Web Map element. 
	  // This allows us to only render the relevant information from our JSON.
      var popupTemplate = {
        title: "{TechnicianName}",
        content:[{
          type: "fields",
			fieldInfos: [
			  {
				fieldName: "TechnicianID",
				label: "Tech ID",
				visible: true
			  },{
				fieldName: "TechnicianName",
				label: "Technician Name",
				visible: true
			  },{
				fieldName: "OrderNumber",
				label: "Order Number",
				visible: true
			  },{
				fieldName: "JobCode",
				label: "Job Code",
				visible: true
			  },{
				fieldName: "State",
				label: "State",
				visible: true
			  },{
				fieldName: "StateDuration",
				label: "Time in State",
				visible: true
			  }
            ]
		}]
      };
	  
	  // Here we're defining the rendering properties of the underlying
	  // service areas as the default rendering properties are noisy. 
	  // NOTE: Labeling against this data type is not supported until 
	  // Fall of 2018 at which point the labeling info will be set here.
      var serviceAreaRenderer = {
        type: "simple",
        symbol: {
          type: "simple-line",
          color: "#BDF7FC",
          width: 1,
          style: "solid",
        }
      };
		
	  // Here we're defining our connection to the Service Area web service that is maintained
	  // by Charlotte Water. 
      var serviceArea = new FeatureLayer({
        url: "http://h16gisapp03:6080/arcgis/rest/services/CLTW_RouteSequenceTool/MapServer/3",
        renderer: serviceAreaRenderer,
        title: "Service Areas"
        });

	  // Here we're creating a Map element that uses the 'dark-gray' basemap and the serviceArea
      var map = new Map({
      basemap: "dark-gray",
	  layers: serviceArea
      });

	  // After our map is defined, we need to define our MapView. A MapView is essentially
	  // a mechanism to view the Map that was just defined. More information on this can be 
	  // found on the Esri JS API 4 website.
      var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-80.843, 35.227],
        zoom: 10,
	    popup: {
		  dockEnabled: true,
		  dockOptions: {
		    breakpoint: false
		  }
	    }
      });

	  // Here we're defining the unique-rendering rules for the field-staff features. In
	  // other words: setting the symbology-logic that looks at the 'Flag' field of each feature
	  // and dynamically render the feature based on that value.
      var uniqueRenderer = {
        type: "unique-value",
        field: "Flag",
        uniqueValueInfos: [
		  {
            value: "RED",
            label: "Exceeded Normal Worktime Threshold",
			symbol: {
			  type: "simple-marker",
			  size: 10,
			  color: "#FF4000",
			  outline: {
			    color: [255, 64, 0, 0.4],
				width: 7
			  }
			}
		  },{
			  value: "YELLOW",
			  label: "Approaching Worktime Threshold",
			  symbol: {
				type: "simple-marker",
				size: 10,
				color: "#ffee00",
				outline: {
				  color: [255, 238, 0, 0.4],
				  width: 7
				}
			  }
		  },{
			  value: null,
			  label: "Under Work Threshold",
			  symbol: {
				type: "simple-marker",
				size: 10,
				color: "#00bfff",
				outline: {
				  color: [0, 191, 255, 0.4],
				  width: 7
				}
			  }
		  }
		]
      };
	  
	  // This is an event-driven action. This function instructs the
	  // application to execute the createArray function when the view
	  // resolves. The createArray function also has a callback within it 
	  // to execute the updateLayer function when it completes.
      view.when(function(){
          createArray(updateLayer)
      });  
	  
	  // To keep the data in the map 'fresh' we need to also repeat the
	  // createArray function on an interval. The below function instructs
	  // the application to execute the function every sixty seconds.
      setInterval(function(){
        createArray(updateLayer);
      },60000);

	  // This is a custom JQuery function that does the following:
		// 1. Fires an AJAX request to the URL variable and reads the 
		//   result as JSON
		// 2. Empties the features global variable so that the results
		//    aren't appended to existing data, but replace existing data
		// 3. Loops through all of the objects within the array to define their
		//    schema and populate their data into a JS variable called 'feature.'
		// 4. Appends each created feature to the array variable called 'features.'
		// 5. Converts the features variable to string for subsequent consumption
		// 6. Execute callback to begin execution of the updateLayer function.
      function createArray(callback) {
        $.getJSON(url, function(json) {
          features = [];
          for (var i = 0, len = json.length; i < len; i++) {
            var feature = {
			  geometry: {
			    type: "point",
				x: null,
			    y: null
			  },
			  attributes: {
				TechnicianID: null,
				TechnicianName: null,
				OrderNumber: null,
				JobCode: null,
				State: null,
				StateStart: null,
				StateDuration: null,
				StateDurationSeconds: null,
				AverageStateDuration: null,
				Latitude: null,
				Longitude: null,
				Flag: null
			  }
		    };
			feature.geometry.x = json[i].Longitude;
			feature.geometry.y = json[i].Latitude;
			feature.attributes.TechnicianID = json[i].TechnicianID;
			feature.attributes.TechnicianName = json[i].TechnicianName;
			feature.attributes.OrderNumber = json[i].OrderNumber;
			feature.attributes.JobCode = json[i].JobCode;
			feature.attributes.State = json[i].State;
			feature.attributes.StateStart = json[i].StateStart;
			feature.attributes.StateDuration = json[i].StateDuration;
			feature.attributes.StateDurationSeconds = json[i].StateDurationSeconds;
			feature.attributes.AverageStateDuration = json[i].AverageStateDuration;
			feature.attributes.Latitude = json[i].Latitude;
			feature.attributes.Longitude = json[i].Longitude;
			feature.attributes.Flag = json[i].Flag;
			features.push(feature);
		  }
		  
		  stringFeatures = JSON.stringify(features);
		  callback();
        });
      };

	  // This function uses the updated feature array (features) above to create
	  // a new layer and remove the existing layer from the map.
      var updateLayer = function (constructLegend) {
        map.remove(techLocLayer);
        techLocLayer = new FeatureLayer({
          title: "Technician Locations",
          source: features,
          fields: fields,
          objectIdField: "TechnicianID",
          renderer: uniqueRenderer,
		  spatialReference: {
		    wkid: 4326
          },
		  geometryType: "point",
          popupTemplate: popupTemplate
        });
		
        map.add(techLocLayer);
        return techLocLayer;
      };

	  // This variables uses the Legend Constructor to create a map-legend with 
	  // an associated DOM element for placement purposes.
      var legend = new Legend({
        container: document.createElement("div"),
        view: view,
	    layerInfos: {layer: features}
      });
	  
	  // This variable uses the Legend element to make an 'Expand' Button.
	  var legendExpand = new Expand({
	    view:view,
		content: legend
	  });
	  
	  // This adds the legendExpand icon to the top-left of the view.
      view.ui.add(legendExpand, "top-left");
	  
	  // This variable uses the Search Constructor to make a Search Bar.
      var searchWidget = new Search({
        view: view
      });
	  
	  // This adds the searchWidget to the top-left of the view and forces top-most dominance.
      view.ui.add(searchWidget, {
        position: "top-left",
        index: 0
      });
	  
	  // This variable uses the BasemapToggle Constructor to make a Basemap Toggle button.
      var toggle = new BasemapToggle({
        view: view, 
        nextBasemap: "hybrid" 
      });
	  
      // This adds the Basemap Toggler to the bottom-right of the view.
      view.ui.add(toggle, "bottom-right");
	  
	  // This variables uses the Home Constructor to make a Home (restore extent) button.
	  var homeBtn = new Home({
      view: view
      });
	  
	  // This adds the Home Button to the top left of the view
      view.ui.add(homeBtn, "top-left");
      });
	  
