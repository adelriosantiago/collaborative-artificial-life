/*
    Alejandro del Río Santiago
    @adelriosantiago

    Tag meaning:
    BUG: An important bug
    ENH: Enhancement
    EP: Easy pick, changes that can be easily done
    TBD: To be done
*/

var express = require('express');
var ip2country = require('ip2country');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var country = ip2country(req.connection.remoteAddress);
    //console.log('Log from: ' + country);
    res.render('index', { country: country });
});

module.exports = router;
