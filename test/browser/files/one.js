var c = require('confify');
c(__dirname + "/two.json");
require("./two.js");

console.log( c.test.global + c.test1 + c.test2.data );