var _ = require('underscore');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'b27isvl001.preprod.local',
    user: 'nagios',
    password: 'mysql'
    //,debug: ['ComQueryPacket', 'RowDataPacket']
});
connection.query('use mats_prod_copy');


var when = require('promised-io/promise');


exports.registerDeployment = function () {
    return function (req, res, next) {
        console.log("mjau");
        console.log("req %s", req);
//        console.log(req);
        console.log("req.body %s", req.body);
        validateProperties(req.body, next);
        console.log("voff")

        var appname = req.body.application;
        var envName = req.body.environment;
        var version = req.body.version;
        var deployedBy = req.body.deployedBy;


        when.all(getEnv(envName), getApp(appname)).then(function (results) {
            registerVersion(results, version, deployedBy)
        });

        res.send(200);
    }
}

function registerVersion(result, version, deployedBy) {
    var envId = result[0];
    var appId = result[1];
    console.log("Got envId %s and appId %s", envId, appId);

    connection.query("update version set tom_date = ? where app_type = ? and env_type = ? and tom_date is NULL", [new Date(), appId, envId], function (err, res) {
        if (err) throw err;
        console.log("Set tom_date on %s row(s)", res.affectedRows);
    });

    connection.query("insert into version set app_type = ?, env_type = ?, ver_type = ?, version = ?, fom_date = ?, deployer = ?, tom_date = NULL", [appId, envId, 0, version, new Date(), deployedBy], function (err, res) {
        if (err) throw err;
        console.log("Added new version with id " + res.insertId);
    })

}

function createApp(appname) {
    var def = when.defer();
    console.log('Creating app');
    connection.query('insert into t_application (app_name, ver_type, description, is_active) values(?,?,?,?)', [appname, 0, appname, 0], function (err, result) {
        if (err) throw  err;
        def.resolve(result.insertId);
    });
    return def.promise;
}


function createEnv(envName) {
    var def = when.defer();
    console.log('Creating environment %s', envName);
    connection.query('insert into t_environment (env_name, is_active) values(?,?)', [envName, 0], function (err, result) {
        if (err) throw  err;
        var envId = result.insertId;
        def.resolve(envId);
    });
    return def.promise;
}

function getApp(appname) {
    var def = when.defer();
    console.log("Finding appname %s", appname);
    connection.query('select app_id from t_application where app_name = ?', [appname], function (err, rows) {
        if (err) throw  err;
        console.log(rows);

        if (rows.length === 0) {
            console.log("No app");
            createApp(appname).then(function (val) {
                def.resolve(val);
            });
        } else if (rows.length === 1) {
            console.log('Application exists ' + rows[0].app_id);
            def.resolve(rows[0].app_id);
        } else {
            throw "something went wrong";
        }
    });
    return def.promise;
}

function getEnv(envName) {
    var def = when.defer();
    connection.query("select env_id from t_environment where env_name = ?", [envName], function (err, rows) {
        if (err) throw  err;
        console.log(rows);

        if (rows.length === 0) {
            console.log("No env found");
            createEnv(envName).then(function (val) {
                def.resolve(val);
            });
        } else if (rows.length === 1) {
            var envId = rows[0].env_id;
            console.log('Environment exists ' + envId);
            def.resolve(envId);
        } else {
            throw "something went wrong";
        }
    });
    return def.promise;
}

function validateProperties(jsonObj, next) {
    console.log("json obj " + jsonObj);
    var requiredKeys = ["application", "environment", "version", "deployedBy"];
    for (var idx in requiredKeys) {
        var key = requiredKeys[idx]
        if (!_.has(jsonObj, key)) {
            next(new Error("Unable to find required property "+ key));
        }
    }
}

