var c = require('confify');
c(__dirname + "/two.json", {replace: false});
require("./two_no_replace.js");

console.log( c.test.global + c.test1 + c.test2.data );