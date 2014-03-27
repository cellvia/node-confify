var findship = require('mothership');
var path = require('path');

function merge(a, b){
    for(var prop in b){
        a[prop] = b[prop];
    }
}

var browser = module.exports = function(srcObj){
	if(!process.browser && typeof srcObj === "string") srcObj = require(srcObj);
    merge(browser, srcObj);
};

var checkPack = function(pack){
    return !!pack.confify
}

var res = findship.sync(path.dirname(__dirname), checkPack) || findship.sync(__dirname, checkPack)

if( res && typeof res.pack.confify === "string"){                    
    config = require( path.join( path.dirname(res.path), res.pack.confify ) );
}else if(res && typeof res.pack.confify === "object"){
    config = res.pack.confify;                    
}
if(config) merge(browser, config);