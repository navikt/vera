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

exports.registerDeployment = function () {
    return function (req, res, next) {
        validateProperties(req.body);

        var appName = req.body.application;
        var envName = req.body.environment;
        var version = req.body.version;
        var deployedBy = req.body.deployedBy;

        Q.all([getApp(appName), getEnv(envName)]).then(function (results) {
            registerVersion(results, version, deployedBy, res)
        }).catch(function (err) {
            next(err);
        }).done();

    }
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

function getApp(appname) {
    var deferred = Q.defer();

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('select app_id from t_application where app_name = ?', [appname], function (err, rows) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (rows.length === 0) {
                createApp(appname).then(function (val) {
                    deferred.resolve(val);
                });
            } else if (rows.length === 1) {
                var applicationId = rows[0].app_id;
                console.log('Application exists ' + applicationId);
                deferred.resolve(applicationId);
                console.log("Set resolve value to %s", applicationId);
            } else {
                throw new Error("Something went wrong when getting app");
            }
        });

        connection.release();
    });

    return deferred.promise;
}

function getEnv(envName) {
    var deferred = Q.defer();

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query("select env_id from t_environment where env_name = ?", [envName], function (err, rows) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (rows.length === 0) {
                console.log("No env found");
                createEnv(envName).then(function (val) {
                    deferred.resolve(val);
                });
            } else if (rows.length === 1) {
                var envId = rows[0].env_id;
                console.log('Environment exists ' + envId);
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

