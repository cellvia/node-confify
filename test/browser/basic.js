var test = require('tape');
var c = require('confify');

test('basic', function (t) {
    t.plan(1);
    require('./files/one.js')    
    t.equal(c.test1 + c.test2, '../object/test' + '../json/test')    
});
