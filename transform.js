var fs = require('fs');
var path = require('path');

var through = require('through');
var falafel = require('falafel');
var unparse = require('escodegen').generate;
var findship = require('mothership');

module.exports = function (file) {
    var globalConf = {};
    var searched = [];
    if (/\.json$/.test(file)) return through();
    var data = '';
    var confNames = {};
    var vars = [ '__filename', '__dirname' ];
    var dirname = path.dirname(file);
    
    var tr = through(write, end);
    return tr;

    function containsUndefinedVariable (node) {
        if (node.type === 'Identifier') {
            if (vars.indexOf(node.name) === -1) {
                return true;
            }
        }
        else if (node.type === 'BinaryExpression') {
            return containsUndefinedVariable(node.left)
                || containsUndefinedVariable(node.right)
            ;
        }
        else {
            return false;
        }
    };
    
    function write (buf) { data += buf }
    function end () {
        findship(dirname, function(pack){
            return !!pack.confify
        }, function(err, res){
            if(!err && !~searched.indexOf(res.path)){
                searched.push(res.path);
                var config = {};
                if(typeof res.pack.confify === "string"){
                    config = require( path.join( path.dirname(res.path), res.pack.confify ) );
                }else if(typeof res.pack.confify === "object"){
                    config = res.pack.confify;                    
                }
                merge(globalConf, config);
            }
            try { var output = parse() }
            catch (err) {
                tr.emit('error', new Error(
                    err.toString().replace('Error: ', '') + ' (' + file + ')')
                );
            }
            
            finish(output);
        });
    }
    
    function finish (output) {
        tr.queue(String(output));
        tr.queue(null);
    }
    
    function parse () {
        var output = falafel(data, function (node) {

            var args = node.arguments;
            var thisOpts;

            if (isRequire(node)  && args[0].value === 'confify'
            && node.parent.type === 'VariableDeclarator'
            && node.parent.id.type === 'Identifier') {
                confNames[node.parent.id.name] = true;
            }

            if (isRequire(node)  && args[0].value === 'confify'
            && node.parent.type === 'AssignmentExpression'
            && node.parent.left.type === 'Identifier') {
                confNames[node.parent.left.name] = true;
            }
            
            if (node.type === 'CallExpression' && isConf(node.callee)){
                if(!args || !args.length || containsUndefinedVariable(args[0])) return;
                thisOpts = args[1] ? eval("(" + unparse(args[1]) + ")") : {};
                if(args[0].type === "Literal" || args[0].type === "BinaryExpression" ){
                    var t = 'return ' + unparse(args[0]);
                    var fpath = Function(vars, t)(file, dirname);
                    var fillFrom = require(fpath);
                    if(typeof fillFrom !== "object") return tr.emit('error', "Configify: argument must be a valid filepath that evaluates to an object");
                    if( thisOpts.replace !== false )
                        fillFrom = merge(globalConf, fillFrom);
                    node.update(node.callee.name+"("+JSON.stringify( merge(fillFrom, globalConf) )+")");                    
                }else if(args[0].type === "ObjectExpression"){
                    if( thisOpts.replace !== false ){
                        merge(globalConf, eval( "("+unparse(args[0])+")" ) );
                    }
                }else{
                    return tr.emit('error', 'Configify: invalid argument type '+args[0].type);
                } 
            }
            else if(node.type === 'MemberExpression' && isConf(node.object) && globalConf[node.property.name]){

                var objPaths = [];
                function recurs(thisnode){
                    if(thisnode.name) objPaths.push(thisnode.name);
                    if(thisnode.property) objPaths.push(thisnode.property.name);
                    if(thisnode.parent && thisnode.parent.type === 'MemberExpression') recurs( thisnode.parent );
                }
                recurs(node)
                var next, last = globalConf;
                if(last){
                    while( next = objPaths.shift() )
                        last = last[next];
                    if(node.parent.type === "MemberExpression") node.parent.update("");
                    if(node.type === "MemberExpression") node.update("");
                    node.object.update(JSON.stringify(last));
                }
            }
            
        });
        return output;
    }
    
    function isConf (p) {
        if (!p) return false;
        return (
            p.type === 'Identifier'
            && confNames[p.name]
        );
    }
};

function isRequire (node) {
    var c = node.callee;
    return c
        && node.type === 'CallExpression'
        && c.type === 'Identifier'
        && c.name === 'require';
    
    ;
}

function merge(a, b){
    for(var prop in b){
        a[prop] = b[prop];
    }
    return a;
}