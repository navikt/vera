var _ = require('underscore');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'b27isvl001.preprod.local',
    user: 'nagios',
    password : 'mysql'
});

var when = require('promised-io/promise');


exports.registerDeployment = function(){
    return function (req, res) {
        console.log(req.body);
        console.log(req.body.key);
        if (!validateProperties(req.body)){
            res.send(400);
            return;
        }

        var appname = req.body.application;
        var environment = req.body.environment;
        var version = req.body.version;
        var deployedBy = req.body.deployedBy;
        
        console.log("ok lets do stuff 2...");
        connection.query('use mats_prod_copy');



        function myAsyncShit(){
            var deferred = when.defer();

//            setTimeout(function(){
//                console.log("mjau");
//                deferred.resolve("gitt");
//            }, 500)

            deferred.reject("gitt");


            return deferred.promise;
        }

        myAsyncShit().then(function(val){
            console.log("ferdig " + val);
        }, function(val){
            console.log("dass");
        });
//
//
//        when(myPromise, function(){
//            console.log("fulfilled");
//        }, function (error){
//            console.log("error" + error);
//        })



//
//        if(!findApplication(connection, appname)) {
//            appid = createApplication(connection, appname, createEnEnv);
//        }
        //res.send('app ' + appid, 200);
        res.send(200);
    };
};


function createEnEnv() {

}

function createApplication(connection, appname, createEnvironment) {
    console.log('Creating application %s', appname);
    var appId;
    return connection.query('insert into t_application (app_name, ver_type, description, is_active) values(?,?,?,?)', [appname, 0, appname, 0], function(err, result) {
        if(err) throw  err;
        appId = result.insertId;
    });
    createEnvironment(appId);
}

function findApplication(connection, appname) {
    console.log( "Appname %s", appname);
    connection.query('select app_id from t_application where app_name = ?', [appname], function(err, rows) {
        if (err) throw  err;
        console.log(rows);

        if (rows.length === 0){ //no application found
            var appId = createApplication(connection, appname);
            console.log("created app with id %s", appId);
        } else if (rows.length === 1){
            console.log('Application exists ' + rows[0].app_id);
        } else {
            throw "something went wrong";
        }



    });
}

function validateProperties(jsonObj){
    var requiredKeys = ["application", "environment", "version", "deployedBy"];
    for (var idx in requiredKeys) {
        var key = requiredKeys[idx]
        console.log("Checking key " + key);
        if (!_.has(jsonObj,key)){
            console.log("missing required property, " + key) ;
            return false;
        }
    }
    return true;
}


