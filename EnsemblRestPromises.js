var EnsemblRest = require("./EnsemblRest"),
    when = require("when");
var ensemblRest = new EnsemblRest();


module.exports = function(){
        
        var args = Array.prototype.slice.call(arguments);        
        var ensemblCall = args.shift();
        
        var rest = ensemblRest[ensemblCall];
        
        var deferred = when.defer();
        var callback = function(err,record,data){
            var results = {
                record: record,
                data: data
            }
            if (err){
                deferred.reject(err);
            }else{
                console.log("Resolving: " + record);
                deferred.resolve(results)
            }
        };
        args.push(callback);
        rest.apply(this,args);
        return deferred.promise;
}
