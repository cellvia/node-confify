# confify

Simplified [nconf](https://github.com/flatiron/nconf). Works in the browser.

[![browser support](http://ci.testling.com/cellvia/node-confify.png)](http://ci.testling.com/cellvia/node-confify)

[![build status](https://secure.travis-ci.org/cellvia/node-confify.png)](http://travis-ci.org/cellvia/node-confify)


## Example

```javascript
var c = require('confify');

c({test1: "/path/to/test1"});

require("test2.js");

console.log(c.test1)
console.log(c.test2)
console.log(c.test3)

//  /path/to/test1
//  /path/to/test2
//  /path/to/test3
```

test2.js:
```javascript
var c = require('confify');
c(__dirname + "./test2.json");
c(__dirname + "./test3.js")
```

test2.json:
```javascript
{test2: "/path/to/test2"}
```

test3.js:
```javascript
var example = "path/to/test3";
module.exports = {
	test3: example	
}
```

## Test

`npm test`

`testling -u`
