var _ = require('underscore');

exports.registerDeployment = function(){
    return function (req, res) {
        console.log(req.body);
        console.log(req.body.key);
        if (!validateProperties(req.body)){
            res.send(400);
            return;
        } 
        
        console.log("ok lets do stuff 2...");
        res.send(200);
    };
};

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


