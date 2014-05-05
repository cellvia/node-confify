function merge(a, b){
    for(var prop in b){
        a[prop] = b[prop];
    }
}

module.exports = function browser(srcObj){
    merge(browser, srcObj);
};
