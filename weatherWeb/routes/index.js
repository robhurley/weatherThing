var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    console.log(db);
    var collection = db.get('weatherreadings');
    console.log("Collection:");
    console.log(collection);
    res.locals.title = 'WeatherWeb';
    res.locals.pUnits = 'kPa';
    res.locals.tempUnits = 'C';
    collection.find({}, {}, function(e, docs){
        console.log(docs);
        res.render('index', { weatherData: docs[docs.length-1] });
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

module.exports = router;
