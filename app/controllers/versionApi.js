var _ = require('underscore');
var mysql = require('mysql');
var config = require("../../config/config");
var Q = require('q');
var pool = mysql.createPool({
    host: config.dbUrl,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbSchema
});
var app = require('express')();

/*var resultObject = {
    environment: "",
    application: "",
    version: "",
    deployedBy: "",
};
*/

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

exports.getVersionByNameAndEnv = function () {
    return function (req, res, next) {

        res.contentType("application/json");

        console.log("");
        var appName = req.query.application;
        var envName = req.query.environment;

        if (envName == "" || envName == null) {
            console.log("Enviroment name not provided.");
        }
        if (appName == "" || appName == null) {
            console.log("Application name not provided.");
        }


        //res.send(appName);
        console.log("Name " + appName);
        //getExistingApplicationIdByName(appName);
        Q.all([getApp(appName, false), getEnv(envName, false)]).then(function (results) {
            var ver = getVersionInfo(results, appName, envName, res);

            
            console.log("aaa");
            console.log("Version: " + ver);
/*            var ret = {
                environment: envName,
                application: appName,
                version: ver
            }*/
            //res.send(ret);
            //res.sent(200);
 
            //registerVersion(results, version, deployedBy, res)

        }).catch(function (err) {
            console.log("Failed to get id for application or environment. Returning empty list");
            res.send("{}");
            //next(err);
        
        }).done();

    }
 
}


function getVersionInfo(result, version, deployedBy, res) {
    var appId = result[0];
    var envId = result[1];
    //var ret;

    console.log("Getting version info for appID " + appId + " in envID " + envId);
    console.log("select version from version where app_type = " + appId + " and env_type = " + envId + " and tom_date is NULL");

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query("select version from version where app_type = ? and env_type = ? and tom_date is NULL order by ver_id DESC", [appId, envId], function (err, row) {
            if (err) { 
                console.log("Failed to get version info for application");
                throw err;
            }
            
            var ret = row[0].version;
            console.log("Got version for application: ", row[0], " version ", ret);

            //res.send(resultObject)
            //res.send(row[0]);
             
        });

        connection.release();
    });

    console.log("### Returning version ", ret);
    //return ret;
    // Empty list if not found
    res.send(200);
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

    console.log(config.dbUrl);
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
                console.log("eee");
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

