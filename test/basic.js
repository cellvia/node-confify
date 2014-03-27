var test = require('tape');
var c = require('../');

test('basic', function (t) {
    t.plan(1);
    require('./files/one.js');
    t.equal(c.test1 + c.test2.data, '../object/test' + '../json/test')    
});
