var test = require('tape');
var browserify = require('browserify');

var vm = require('vm');
var fs = require('fs');
var path = require('path');

test('transform - output', function (t) {
    t.plan(2);
    
    var b = browserify();
    b.add(__dirname + '/browser/files/one.js');    
    b.bundle(function (err, src) {
        if (err){ t.fail(err); t.fail(err); }
        var isTransformed = !(~src.indexOf("c.test.global") || ~src.indexOf("c.test2.data"))
        t.equal( isTransformed, true, "'c.test.global' and 'c.test2.data' must be transformed" );
        t.equal( !!~src.indexOf("console.log( \"../global/test\" + c.test1 + \"../json/test\" );"), true, "must be transformed properly" );
    });
    
});

test('transform - no replace', function (t) {
    t.plan(2)
    
    var b = browserify();
    b.add(__dirname + '/browser/files/one_no_replace.js');    
    b.bundle(function (err, src) {
        if (err) t.fail(err);
        t.equal( !!~src.indexOf("console.log( \"../global/test\" + c.test1 + c.test2.data );"), true, "proper transform" );
        vm.runInNewContext(src, { console: { log: log } });
    });
    
    function log (msg) {
        t.equal(msg, '../global/test' + '../object/test' + '../json/test', "basic equivalence");
    }
});
