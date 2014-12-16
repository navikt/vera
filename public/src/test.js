var _ = require('lodash');
var http = require('http');

http.get("http://b27isvl001.preprod.local:9080/version", function(res) {

    var columns = ['Application', 't1', 't2', 't3', 't4', 'q1', 'q2', 'q3', 'q4', 'p']

    var data = [
        ['Aareg', '1.2.3', '', '', '', '3.2.1', '4.5.6', '6.9', '', ''],
        ['Bbreg', '', '', '1.2.3-alphpa01-bata4-SNAPSHOT', '', '3.2.1', '', '6.9', '', '4.5.6'],
        ['Ccreg', '4', '', '', '5.0', '6.1', '7.1', '', '8.5', ''],
        ['Ddreg', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0', '12.4.5.6.7.0'],
        ['Eereg', '9.1', '', '10', '', '11.4', '11.6', '', '56.3', '3000']
    ]

    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
        var response = JSON.parse(body)
        var environments = _.chain(response).pluck('environment').uniq(true, function(element) {
            return element.toLowerCase();
        }).reverse();
        console.log(environments);

        var gb = _.chain(response).groupBy(function(element) {
            return element['environment'].toLowerCase()

        }).value()//.sortBy(function(elem){
        //    console.log(elem)
        //    return elem['environment'].toLowerCase();
        //}).reverse();

        console.log("=============")

        console.log(gb)

        //_.forEach(gb, function(element) {
        //    _.forEach(element, function(subelement) {
        //        console.log("** " + subelement);
        //    })
        //})

    });

}).on('error', function(e) {
    console.log("Got error: ", e);
});
