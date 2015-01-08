var _ = require('underscore');
var mysql = require('mysql');
var config = require("../../config/config");
var Q = require('q');
var mongoose = require('mongoose');
var Event = require('../models/event');

var pool = mysql.createPool({
    host: config.dbUrl,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbSchema
});

var app = require('express')();

exports.getEvents = function(){
    return function(req, res, next){

        var query = function(err, events){
            res.write(JSON.stringify(events));
            res.send();
        }

        Event.find().limit(10).sort([['timestamp', 'descending']]).exec(query);
    }
}

exports.registerDeployment = function () {
    return function (req, res, next) {
        validateProperties(req.body);

        var appName = req.body.application;
        var envName = req.body.environment;
        var version = req.body.version;
        var deployedBy = req.body.deployedBy;

        Q.all([getApp(appName, true), getEnv(envName, true)]).then(function (results) {
            registerVersion(results, version, deployedBy, res)
        }).catch(function (err) {
            next(err); 
        }).done();

    }
} 

exports.getVersion = function () {
    return function (req, res, next) {

        res.contentType("application/json");

        console.log("");
        var appName = req.query.application;
        var envName = req.query.environment;

        getVersions(res, appName, envName);
    }
}


function getVersions(res, appName, envName) {

    console.log("appName: " + appName + ", envName: " + envName);  
    getVersionInfoByName(appName, envName, function(err, listAppsAndVersion) {
        if (err != null) {
            console.log("Failed to get data. Returning an empty object.");
            console.log(err); 

                    // Something went wrong, so lets return an empty object
                    var retObj = createReturnObject("", "", "", "");
                    res.write(JSON.stringify([retObj]));  

                    res.send();                        
                }
                else {

                    var list = [];
                    for (var key in listAppsAndVersion) {

                        var appName = listAppsAndVersion[key].app_name;
                        var envName = listAppsAndVersion[key].env_name;
                        var version = listAppsAndVersion[key].version;
                        var deployer = listAppsAndVersion[key].deployer;
                        var retObj = createReturnObject(appName, envName, version, deployer);
                        list.push(retObj);
                        //console.log("Added " + appName + " in environment " + envName); 
                    }

                    res.write(JSON.stringify(list));
                    console.log("Sending this back to the client: " + JSON.stringify(list));  
                    res.send();    
                } 
            })

}

function getVersionInfoByName(appName, envName, callback) {

    if (appName != null) {
        appName = appName.replace(/\*/g, "%"); 
    }
    else {
        appName = "%";
    }
    if (envName != null) {
        envName = envName.replace(/\*/g, "%"); 
    }
    else {
        envName = "%"; 
    }

    console.log("Looking up " + appName + " in env " + envName); 
    pool.getConnection(function (err, connection) {
        if (err) throw err; 

        connection.query("select env_name,app_name,version,deployer from view_version where app_name like ? and env_name like ?", [appName, envName], function (err, rows) {
            if (err) {
                callback(err);
                return;
            } else if (rows.length === 0) {
                callback("zero results");
                return;
            } else if (rows.length > 0) {
                callback(null, rows);

            } else {
                throw new Error("Something went wrong when getting environments");
            }
        });

        connection.release();
    });

}

function createReturnObject(application, environment, version, deployer) {
    var objToJson = { };
    objToJson.application = application; 
    objToJson.environment = environment;
    objToJson.version = version;
    objToJson.deployer = deployer;
    return objToJson;
}


function registerVersion(result, version, deployedBy, res) {
    var appId = result[0];
    var envId = result[1];

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query("update version set tom_date = ? where app_type = ? and env_type = ? and tom_date is NULL", [new Date(), appId, envId], function (err, res) {
            if (err) throw err;
            console.log("Set tom_date on %s row(s)", res.affectedRows);
        });

        connection.query("insert into version set app_type = ?, env_type = ?, ver_type = ?, version = ?, fom_date = ?, deployer = ?, tom_date = NULL", [appId, envId, 0, version, new Date(), deployedBy], function (err, res) {
            if (err) throw err;
            console.log("Added new version with id " + res.insertId);
        });

        connection.release();
    });

    res.send(200);
} 

function createApp(appname) {
    var def = Q.defer();
    console.log('Creating app %s', appname);

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('insert into t_application (app_name, ver_type, description, is_active) values(?,?,?,?)', [appname, 0, appname, 0], function (err, result) {
            if (err) throw  err;
            def.resolve(result.insertId);
        });

        connection.release();
    });

    return def.promise;
}


function createEnv(envName) {
    var def = Q.defer();
    console.log('Creating environment %s', envName);

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('insert into t_environment (env_name, is_active) values(?,?)', [envName, 0], function (err, result) {
            if (err) throw  err;
            var envId = result.insertId;
            def.resolve(envId);
        });

        connection.release();
    });

    return def.promise;
}

function getApp(appname, createIfMissing) {
    var deferred = Q.defer();

    //console.log(config.dbUrl);
    //console.log("host: " + pool.get(host));
    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('select app_id from t_application where app_name = ?', [appname], function (err, rows) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (rows.length === 0) {
                if (createIfMissing) { 
                    console.log("No app found. Will create it now.");
                    createApp(appname).then(function (val) {
                        deferred.resolve(val);
                    });
                }
                else deferred.reject(new Error("Application does not exist."));
            } else if (rows.length === 1) {
                var applicationId = rows[0].app_id;
                console.log('Application exists with ID ' + applicationId);
                deferred.resolve(applicationId);
                //console.log("Set resolve value to %s", applicationId);
            } else {
                throw new Error("Something went wrong when getting app");
            }
        });

        connection.release();
    });

return deferred.promise;
}

function getEnv(envName, createIfMissing) {
    var deferred = Q.defer();

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query("select env_id from t_environment where env_name = ?", [envName], function (err, rows) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (rows.length === 0) {
                if (createIfMissing) {
                    console.log("No env found. Will create it now.");
                    createEnv(envName).then(function (val) {
                        deferred.resolve(val);
                    });
                }
                else {
                    deferred.reject(new Error("Environment does not exist."));
                }
            } else if (rows.length === 1) {
                var envId = rows[0].env_id;
                console.log('Environment exists with ID ' + envId);
                deferred.resolve(envId);
            } else {
                throw new Error("Something went wrong when getting env");
            }
        });

        connection.release();
    });

return deferred.promise;
}

function validateProperties(jsonObj) {
    var requiredKeys = ["application", "environment", "version", "deployedBy"];
    for (var idx in requiredKeys) {
        var key = requiredKeys[idx]
        if (!_.has(jsonObj, key)) {
            throw new Error("Unable to find required property " + key);
        }
    }
}
