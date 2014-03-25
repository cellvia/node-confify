var fs = require('fs');
var path = require('path');

var through = require('through');
var falafel = require('falafel');
var unparse = require('escodegen').generate;
var util = require('util');

module.exports = function (file) {
    if (/\.json$/.test(file)) return through();
    var data = '';
    var confNames = {};
    var vars = [ '__filename', '__dirname' ];
    var dirname = path.dirname(file);
    var pending = 0;
    
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
        try { var output = parse() }
        catch (err) {
            this.emit('error', new Error(
                err.toString().replace('Error: ', '') + ' (' + file + ')')
            );
        }
        
        if (pending === 0) finish(output);
    }
    
    function finish (output) {
        tr.queue(String(output));
        tr.queue(null);
    }
    
    function parse () {
        var output = falafel(data, function (node) {

            var args = node.arguments;

            if (isRequire(node)  && args[0].value === 'configify'
            && node.parent.type === 'VariableDeclarator'
            && node.parent.id.type === 'Identifier') {
                confNames[node.parent.id.name] = true;
            }

            if (isRequire(node)  && args[0].value === 'configify'
            && node.parent.type === 'AssignmentExpression'
            && node.parent.left.type === 'Identifier') {
                confNames[node.parent.left.name] = true;
            }
            
            if (node.type === 'CallExpression' && isConf(node.callee)){
                if(!args || !args.length || containsUndefinedVariable(args[0])) return;
                if(args[0].type === "Literal" || args[0].type === "BinaryExpression" ){
                    var t = 'return ' + unparse(args[0]);
                    var fpath = Function(vars, t)(file, dirname);
                    var fillFrom = require(fpath);
                    if(typeof fillFrom !== "object") return tr.emit('error', "Configify: argument must be a valid filepath that evaluates to an object");
                    node.update(node.callee.name+"("+JSON.stringify(fillFrom)+")");
                }else if(args[0].type !== "ObjectExpression"){
                    return tr.emit('error', 'Configify: invalid argument type '+args[0].type);
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
