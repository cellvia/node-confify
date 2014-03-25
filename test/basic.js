var test = require('tape');
var browserify = require('browserify');

var vm = require('vm');
var fs = require('fs');
var path = require('path');

test('basic', function (t) {
    t.plan(1);
    
    var b = browserify();
    b.add(__dirname + '/files/one.js');    
    b.bundle(function (err, src) {
        if (err) t.fail(err);
        vm.runInNewContext(src, { console: { log: log } });
    });
    
    function log (msg) {
        t.equal(msg, '../object/test' + '../json/test');
    }
});
