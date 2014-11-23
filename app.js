var map;
require(["dojo/parser", "dojo/ready", "dojo/_base/array", "esri/Color", "dojo/dom-style", "dojo/query", "esri/map", "esri/request", "esri/graphic", "esri/dijit/HomeButton", "esri/geometry/Extent", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/PictureMarkerSymbol", "esri/renderers/ClassBreaksRenderer", "esri/layers/GraphicsLayer", "esri/SpatialReference", "esri/dijit/PopupTemplate", "esri/geometry/Point", "esri/geometry/webMercatorUtils", "libs/ClusterLayer", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"], function(parser, ready, arrayUtils, Color, domStyle, query, Map, esriRequest, Graphic, HomeButton, Extent, SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer, GraphicsLayer, SpatialReference, PopupTemplate, Point, webMercatorUtils, ClusterLayer) {
	ready(function() {
		parser.parse();

		var clusterLayer;
		var popupOptions = {
			"markerSymbol" : new SimpleMarkerSymbol("circle", 20, null, new Color([0, 0, 0, 0.25])),
			"marginLeft" : "20",
			"marginTop" : "20"
		};
		map = new Map("map", {
			basemap : "oceans",
			center : [-98.892515625003, 38.23969291778385],
			zoom : 5
		});
		
		//enable popover window for hover and hide search content by default
		$('#collapse-title span.glyphicon').popover();
		
		map.on("load", function() {
			// get the dallas 2010-2011 season game match data
			var dallas_games_data = esriRequest({
				"url" : "data/nba-dallas-2010.json",
				"handleAs" : "json"
			});
			dallas_games_data.then(addData, error);
		});
		//add home button
		var home = new HomeButton({
	        map: map
	    }, "HomeButton");
	    home.startup();
      
      
		function addData(resp) {
			var gameInfo = {};
			var wgs = new SpatialReference({
				"wkid" : 4326
			});
			gameInfo.data = arrayUtils.map(resp, function(p) {
				var latlng = new Point(parseFloat(p.lng), parseFloat(p.lat), wgs);
				var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
				var attributes = {
					"Result" : p.result,
					"_result":p.result.substring(0,1),
					"Name" : p.name,
					"Date" : p.date,
					"Image" : p.image,
				};
				return {
					"x" : webMercator.x,
					"y" : webMercator.y,
					"attributes" : attributes
				};
			});

			// popupTemplate to work with attributes specific to this dataset
			var popupTemplate = new PopupTemplate({
				"title" : "Game",
				"fieldInfos" : [{
					"fieldName" : "Result",
					visible : true
				}, {
					"fieldName" : "Name",
					"label" : "Play",
					visible : true
				}],
				"mediaInfos" : [{
					"title" : "",
					"caption" : "",
					"type" : "image",
					"value" : {
						"sourceURL" : "{Image}"
					}
				}]
			});

			// cluster layer that uses OpenLayers style clustering
			clusterLayer = new ClusterLayer({
				"data" : gameInfo.data,
				"distance" : 100,
				"id" : "clusters",
				"labelColor" : "#fff",
				"labelOffset" : 10,
				"resolution" : map.extent.getWidth() / map.width,
				"singleColor" : "#888",
				"singleTemplate" : popupTemplate
			});
			var defaultSym = new SimpleMarkerSymbol().setSize(4);
			var renderer = new ClassBreaksRenderer(defaultSym, "winCount");

			var picBaseUrl = "http://static.arcgis.com/images/Symbols/Shapes/";
			var yellow = new PictureMarkerSymbol(picBaseUrl + "YellowPin1LargeB.png", 64, 64).setOffset(0, 15);
			var green = new PictureMarkerSymbol(picBaseUrl + "GreenPin1LargeB.png", 64, 64).setOffset(0, 15);
			var red = new PictureMarkerSymbol(picBaseUrl + "RedPin1LargeB.png", 64, 64).setOffset(0, 15);
			renderer.addBreak(-100, -1, red);
			renderer.addBreak(0, 0, yellow);
			renderer.addBreak(1, 100, green);

			clusterLayer.setRenderer(renderer);
			map.addLayer(clusterLayer);

			// close the info window when the map is clicked
			map.on("click", cleanUp);
			// close the info window when esc is pressed
			map.on("key-down", function(e) {
				if (e.keyCode === 27) {
					cleanUp();
				}
			});
		}

		function cleanUp() {
			map.infoWindow.hide();
			clusterLayer.clearSingles();
		}

		function error(err) {
			console.log("something failed: ", err);
		}

		//span glyphicon click, change icon style based on whether collapsed
		//collapse content to save space for usres to operate with actual map		
		$('#collapse-title span.glyphicon').on('click', function(e) {
		    e.preventDefault();
		    var $this = $(this);
		    if($('#collapse-title span.glyphicon').attr('class').indexOf('down') > -1){
		    	$('#collapse-title span.glyphicon').removeClass('glyphicon-chevron-down');
		    	$('#collapse-title span.glyphicon').addClass('glyphicon-chevron-right');
		    	$('#collapse-title span.glyphicon').popover('show');
		    }
		    else{
		    	$('#collapse-title span.glyphicon').removeClass('glyphicon-chevron-right');
		    	$('#collapse-title span.glyphicon').addClass('glyphicon-chevron-down');
		    	$('#collapse-title span.glyphicon').popover('destroy');
		    }
		    //toggle collapse content
		    $('.collapse-content').slideToggle('fast');
		});
	});
}); 