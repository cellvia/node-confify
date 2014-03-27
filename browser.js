function merge(a, b){
    for(var prop in b){
        a[prop] = b[prop];
    }
}

module.exports = function browser(srcObj){
	if(!process.browser && typeof srcObj === "string") srcObj = require(srcObj);
    merge(browser, srcObj);
};
