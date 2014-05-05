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

## package.json

You may include a confify field in your package.json of either an object or path to be required.  What is exported by this path will be your default conf within all files in that package.

## Methods

### confify( path, [options] )
Path is either a filepath to be required, or an actual object.

### confify.resetGlobals()
(browserify only) In case you need to ensure all confify globals are reset to the package default, you may at any point declare confify.resetGlobals().  This helps avoid possible cross-contamination between packages being browserified or transformed under the same process (ex: testing)

## Options

### replace (default: true)
(browserify only) When you add properties / data to confify and replace option is set to false, the data added will not be transformed in the source code, but instead will be determined at runtime.

## Caveats
Dynamic assignment of paths into requires may not work, particularly if the option replace is set to false.  This is a limitation of browserify itself.

## Test

`npm test`

`testling -u`
