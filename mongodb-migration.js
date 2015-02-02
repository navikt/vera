print("bytter ut nullverdier")
db.events.find({replaced_timestamp: "NULL"}).forEach(function (e) {
    e.replaced_timestamp = "";
    db.events.save(e);
})
db.events.find({deployer: "NULL"}).forEach(function (e) {
    e.deployer = "n/a";
    db.events.save(e);
})

print("la alle timestamps vÃ¦re pÃ¥ isodate formatet")
db.events.find().forEach(function (a) {
    a.deployed_timestamp = ISODate(a.deployed_timestamp);
    db.events.save(a)
});
db.events.find({replaced_timestamp: {$ne: ""}}).forEach(function (a) {
    a.replaced_timestamp = ISODate(a.replaced_timestamp);
    db.events.save(a)
});

print("lowercase env og app")
db.events.find().forEach(function (e) {
    e.application = e.application.toLowerCase();
    e.environment = e.environment.toLowerCase();
    db.events.save(e);
})

print("fjern ubrukte miljÃ¸er");
db.events.find({$or: [{environment: 'k3'}, {environment: 'k7'}, {environment: 'o1'}, {environment: 'o2'}]}).forEach(function (e) {
    db.events.remove(e)
})

print("fjern alle ubrukelige versjoner");
db.events.find({$or: [{version: '-'}, {version: 'n.p'}, {version: 'No MF-vn.'}]}).forEach(function (e) {
    db.events.remove(e)
})

print("fjerner miljøer events for tomme miljøer")
db.events.find({environment: ''}).forEach(function (e) {
    db.events.remove(e);
})

print("prøver å utlede miljøklasse")
db.events.find().forEach(function (e) {
    e.environmentClass = e.environment.charAt(0);
    db.events.save(e);
})

print("done");
