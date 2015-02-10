print("replacing null values")
db.events.find({replaced_timestamp: "NULL"}).forEach(function (e) {
    e.replaced_timestamp = null;
    db.events.save(e);
})
db.events.find({deployer: "NULL"}).forEach(function (e) {
    e.deployer = "n/a";
    db.events.save(e);
})

print("Add ISO formatting on timestamp")
db.events.find().forEach(function (a) {
    a.deployed_timestamp = ISODate(a.deployed_timestamp);
    db.events.save(a)
});

db.events.find({replaced_timestamp: {$ne: null}}).forEach(function (a) {
    a.replaced_timestamp = ISODate(a.replaced_timestamp);
    db.events.save(a)
});

print("lowercase envname and appname")
db.events.find().forEach(function (e) {
    e.application = e.application.toLowerCase();
    e.environment = e.environment.toLowerCase();
    db.events.save(e);
})

print("Remove environments nobody cares about any more");
db.events.find({$or: [{environment: 'k3'}, {environment: 'k7'}, {environment: 'o1'}, {environment: 'o2'}]}).forEach(function (e) {
    db.events.remove(e)
})

print("Remove empty versions that have no value to us");
db.events.find({$or: [{version: '-'}, {version: 'n.p'}, {version: 'No MF-vn.'}]}).forEach(function (e) {
    db.events.remove(e)
})

print("Remove environments where envname is empty")
db.events.find({environment: ''}).forEach(function (e) {
    db.events.remove(e);
})

print("Trying to resolve envClass from envname")
db.events.find().forEach(function (e) {
    e.environmentClass = e.environment.charAt(0);
    db.events.save(e);
})

print("done");
