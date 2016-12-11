var express = require('express');
var router = express.Router();

var lastForcastObject;
var lastForcastTime;

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
   // console.log(db);
    var collection = db.get('weatherreadings');
    res.locals.title = 'WeatherWeb';
    res.locals.pUnits = 'kPa';
    res.locals.tempUnits = 'C';
    /* Get weather forcast */
    var key = process.env.WEATHERKEY;
    if(typeof key === 'undefined')
    {
        console.log('API Key not set');
        return;
    }
    console.log('Using key:' + key);
    var latitude = process.env.LATITUDE;
    var longitude = process.env.LONGITUDE;
    var requestURL = 'https://api.darksky.net/forecast/'+key+'/'+latitude+','+longitude+'?units=ca';
    var request = require('request');
    collection.find({}, {}, function(e, docs){
        var timeSinceLastForcast = new Date();
        timeSinceLastForcast -= lastForcastTime;
        // Update the forcast data if the time difference is greater than 20 minutes
        if(timeSinceLastForcast > 20*60*1000 || typeof lastForcastObject === 'undefined')
        {
            request(requestURL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                //console.log(body); // Show the JSON output
                    lastForcastObject = JSON.parse(body);
                    console.log("Gettings new forcast, last forcast was: "+lastForcastTime);
                    lastForcastTime = new Date();
                }
                else {
                    console.log('Failed to retrieve weather data: ' + error);
                    console.log('Response code: '+response.statusCode);
                }
                res.locals.forcast = lastForcastObject;
                res.render('index', { weatherData: docs[docs.length-1] });
            });
        }
        else
        {
            res.locals.forcast = lastForcastObject;
            res.render('index', { weatherData: docs[docs.length-1] });
        }
    });
});

/* POST a new weather reading, url formatted */
router.post('/addReading', function(req, res) {
   var db = req.db;
   var newReading = { intemp: req.query['inTemp'],
        outtemp: req.query['outTemp'],
        inhumidity: req.query['inHumidity'],
        outhumidity: req.query['outHumidity'],
        pressure: req.query['pressure'],
        rain: req.query['rain'],
        time: new Date()
   };
   var collection = db.get('weatherreadings');
   collection.insert(newReading, function(err, doc){
       if(err)
        console.log("Error adding to db");
   });
   res.send('201');
   console.log("Added a new weather reading");
   console.log(newReading);
});

/* Get weather forcast from request */
function GetForcast(latitude, longitude, key, forcast) {
    var request = require('request');
    console.log('Getting Weather Forcast...');
    var forcastRequestURL = 'https://api.darksky.net/forecast/'+key+'/'+latitude+','+longitude+'?units=ca';
    request(forcastRequestURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //console.log(body); // Show the JSON output
        forcast = JSON.parse(body);
    } else {
        console.log('Error retrieving forcast:' + error);
        console.log('Status code: '+response.statusCode);
    }});
}

module.exports = router;
