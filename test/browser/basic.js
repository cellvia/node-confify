var test = require('tape');
var c = require('confify');

test('basic', function (t) {
    t.plan(1);
    require('./files/one.js');
    t.equal(c.test.global + c.test1 + c.test2.data, '../global/test' + '../object/test' + '../json/test')    
});
