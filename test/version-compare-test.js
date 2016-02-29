var test = require('tape');
var compare = require('../backend/modules/version-compare');

test('Version comparison', assert =>  {
    assert.equal(compare("1.2.3", "1.2.4"), -1)
    assert.equal(compare("1.2.3", "1.2.3.1"), -1)
    assert.equal(compare("1.2.3", "1.2.3-SNAPSHOT"), 1)
    assert.equal(compare("1.2.3-SNAPSHOT", "1.2.3"), -1)
    assert.equal(compare("1.2.3", "1.2"), 1)
    assert.equal(compare("1.2.3", "12.30"), -1)
    assert.equal(compare("1.2.3.4.5", "1.2.3"), 1)
    assert.equal(compare("1.2.3.69", "1.2.3-SNAPSHOT"), 1)
    assert.equal(compare("1.2.3", "1.2.3"), 0)
    assert.equal(compare("BANAN", "1.2.3"), null)
    assert.equal(compare("BANAN", "BANAN"), 0)
    assert.equal(compare("1.2.3", "TESST.Q69"), null)
    assert.equal(compare("1.2.3", "1.2.3-HOTSHOT"), null)
    assert.equal(compare("69", "69"), 0)
    assert.equal(compare("1.2.3", "1.2"), 1)
    assert.equal(compare("1.2.0.0", "1.2"), 0)
    assert.end()
})