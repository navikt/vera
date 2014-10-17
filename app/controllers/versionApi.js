var _ = require('underscore');
var mysql = require('mysql');
var config = require("../../config/config");
var Q = require('q');
var async = require('async');

var pool = mysql.createPool({
    host: config.dbUrl,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbSchema
});
var app = require('express')();

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

/*        if (isAbsent(envName) && isPresent(appName)) { 
            console.log("Enviroment name not provided.");
            getVersionByApplication(appName, function(listEnvsAndVersion) {

                var list = [];
                for (var key in listEnvsAndVersion) {
                    var envName = listEnvsAndVersion[key].env_name;
                    var version = listEnvsAndVersion[key].version;
                    var retObj = createReturnObject(appName, envName, version);
                    list.push(retObj);
                }

                res.write(JSON.stringify(list));
                res.send();    

            });
        } 
        else if (isAbsent(appName) && isPresent(envName)) {
            console.log("Application name not provided.");

            getVersionByEnvironment(envName).then(function(listAppsAndVersion) {

                var list = [];
                for (var key in listAppsAndVersion) {
                    var appName = listAppsAndVersion[key].app_name;
                    var version = listAppsAndVersion[key].version;
                    var retObj = createReturnObject(appName, envName, version);
                    list.push(retObj);
                }

                res.write(JSON.stringify(list));
                res.send();    

            });
        }

        else if (isPresent(appName) && isPresent(envName)) {

            console.log("appName: " + appName + ", envName: " + envName);  
            getVersionInfoByName(appName, envName, function(err, listAppsAndVersion) {
                if (err != null) {
                    console.log("Failed to get data. Returning an empty object.");
                    console.log(err); 
                    // Something went wrong, so lets return an empty object
                    var retObj = createReturnObject("", "", "");
                    res.write(JSON.stringify(retObj));
                    res.send();                        
                }
                else {
                    
                    var list = [];
                    for (var key in listAppsAndVersion) {

                        var appName = listAppsAndVersion[key].app_name;
                        var envName = listAppsAndVersion[key].env_name;
                        var version = listAppsAndVersion[key].version;
                        var retObj = createReturnObject(appName, envName, version);
                        list.push(retObj);
                        //console.log("Added " + appName + " in environment " + envName); 
                    }

                    res.write(JSON.stringify(list));
                    res.send();    
                }
            })

    } 
        else {

                getAllVersions(function(listAllVersion) {

                    var list = [];
                    for (var key in listAllVersion) {
                        var appName = listAllVersion[key].app_name;
                        var envName = listAllVersion[key].env_name;
                        var version = listAllVersion[key].version;
                        var retObj = createReturnObject(appName, envName, version);
                        list.push(retObj);
                    }

                    res.write(JSON.stringify(list));
                    res.send();    

                });

            }
        }
    }*/

    function getVersions(res, appName, envName) {

    console.log("appName: " + appName + ", envName: " + envName);  
            getVersionInfoByName(appName, envName, function(err, listAppsAndVersion) {
                if (err != null) {
                    console.log("Failed to get data. Returning an empty object.");
                    console.log(err); 
                    
                    // Something went wrong, so lets return an empty object
                    var retObj = createReturnObject("", "", "");
                    res.write(JSON.stringify([retObj]));  

                    res.send();                        
                }
                else {
                    
                    var list = [];
                    for (var key in listAppsAndVersion) {

                        var appName = listAppsAndVersion[key].app_name;
                        var envName = listAppsAndVersion[key].env_name;
                        var version = listAppsAndVersion[key].version;
                        var retObj = createReturnObject(appName, envName, version);
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
            appName = appName.replace("*", "%");
        }
        else {
            appName = "%"; 
        }
        if (envName != null) {
            envName = envName.replace("*", "%");  
        }
        else {
            envName = "%"; 
        }

        console.log("Looking up " + appName + " in env " + envName); 
        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query("select env_name,app_name,version from view_version where app_name like ? and env_name like ?", [appName, envName], function (err, rows) {
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

    function getAllVersions(callback) {
    //var sqlStatement = "select * from version where tom_date is null and ver_type in (0, 11) order by env_type, app_type;";
    var sqlStatement = "select * from view_version";
        //var sqlStatement = "select app_type,version from version where env_type = ? and tom_date is NULL order by ver_id DESC";
        console.log(sqlStatement);  

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(sqlStatement, function (err, row) {

                if (err) {  
                    console.log("Failed to get list of all applications");
                    throw err;
                }

                connection.release();
                callback(row);

            })
        });    
    }



    function isAbsent(parm) {
        if (parm == "" || parm == null) return true;
        return false;
    }

    function isPresent(parm) {
        if (parm == "" || parm == null) return false;
        return true;
    }

    function getAllEnvironments() {
        var deferred = Q.defer();

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query("select env_name from t_environment", function (err, rows) {
                if (err) {
                    deferred.reject(new Error(err));
                } else if (rows.length === 0) {
                    deferred.reject(new Error("The database returned zero environments."));
                } else if (rows.length > 0) {
                //ound these environments: ");
                //console.log(rows);
                deferred.resolve(rows);
            } else {
                throw new Error("Something went wrong when getting environments");
            }
        });

            connection.release();
        });

        return deferred.promise;
    }

    function getAllApplications(callback) {
        var sqlStatement = "select app_name from t_application;";
        //var sqlStatement = "select app_type,version from version where env_type = ? and tom_date is NULL order by ver_id DESC";
        console.log(sqlStatement);  

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(sqlStatement, function (err, row) {

                if (err) {  
                    console.log("Failed to get list of all applications");
                    throw err;
                }

                connection.release();
                callback(row);

            })
        });    
    }

    function getVersionByApplication(appName, callback) {
        Q.all([getApp(appName, false)]).then(function (results) {

            var appId = results[0];
            var sqlStatement = "select env_name,version from version join t_environment on version.env_type = t_environment.env_id where app_type = ? and tom_date is NULL order by ver_id DESC;";
            console.log(sqlStatement);  

            pool.getConnection(function (err, connection) {
                if (err) throw err;

                connection.query(sqlStatement, appId, function (err, row) {

                    if (err) {  
                        console.log("Failed to get version info for application");
                        throw err;
                    }

                    connection.release();
                    callback(row);

                });

            });
        }).catch(function (err) {
            console.log("Failed to get id for environment. Returning an empty object.");
            console.log(err); 
            // Something went wrong, so lets return an empty object
            var retObj = createReturnObject("", "", "");
            callback(retObj);
        }).done();    
    }



    function getVersionByEnvironment(envName, callback) {
        var deferred = Q.defer();

        Q.all([getEnv(envName, false)]).then(function (results) {

            var envId = results[0];
            var sqlStatement = "select app_name,version from version join t_application on version.app_type = t_application.app_id where env_type = ? and tom_date is NULL order by ver_id DESC";
        //var sqlStatement = "select app_type,version from version where env_type = ? and tom_date is NULL order by ver_id DESC";
        //console.log("Getting app_type,version info envname " + envName + " with envID " + envId); 
        console.log("select version from version where env_type = " + envId + " and tom_date is NULL");

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(sqlStatement, envId, function (err, row) {

                if (err) { 
                    console.log("Failed to get version info for application");
                    throw err;
                }

                //console.log("Row: " + row);  
                //var ret = row[0].version;
                //console.logq("Got version for application: ", row[0], " version ", ret);
                connection.release();
                //callback(row);
                deferred.resolve(row);

            });

        });
    }).catch(function (err) {
        console.log("Failed to get id for environment. Returning an empty object.");
        console.log(err); 
            // Something went wrong, so lets return an empty object
            var retObj = createReturnObject("", "", "");
            //callback(retObj);
            deferred.reject(retObj);
            //res.write(JSON.stringify(retObj));
            //res.send();
            //next(err); 

        }).done();    
    //console.log("Ferdig med promise.")
    return deferred.promise;

}

function createReturnObject(application, environment, version) {

    var objToJson = { };
    objToJson.application = application; 
    objToJson.environment = environment;
    objToJson.version = version;
    return objToJson;

}

function getVersionInfo(result, version, deployedBy, res, callback) {
    var appId = result[0];
    var envId = result[1];    

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

            callback(ret);

        });

        connection.release();
    });

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
