var ensemblRestPromises = require("../EnsemblRestPromises"),
    _ = require("underscore"),
    when = require("when");


exports.SingleRegion = function(test){
    
    var region = "1:100000-200000";
    ensemblRestPromises("fetchGenesFromRegion","homo_sapiens",region).then(
        function next(results){
            // console.log(data);
            test.equal(results.data.length,9);
            test.done();            
        },
        function error(err){
            throw(err)
        }
    )
}


exports.MultipleRegions = function(test){
    var win = 500000;
    var stop = 5000000;
    var count=0;
    var callback = function(results){
        count++;            
        if (count===10){
            test.ok(10);                
            test.done();            
        }
    }

    for (var i=1; i<= stop; i+= win ){
        var st = i;
        var ed = i + win -1;
        var region = "1:" + st + "-" + ed;
        ensemblRestPromises("fetchGenesFromRegion","human",region).then(
            callback,
            function err(err){
                throw(err);
            }
        );                    
    }
}

