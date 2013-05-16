var EnsemblRest = require("../EnsemblRest");
var _ = require("underscore");


exports.SingleRegion = function(test){
    var ensemblRest = new EnsemblRest(0);
    var region = "1:100000-200000";
    var callback = function(err,record,data){        
        test.equal(data.length,9);
        test.done();
    }
    ensemblRest.fetchGenesFromRegion("human",region,callback);
}


exports.MultipleRegions = function(test){
    var ensemblRest = new EnsemblRest(100);
    var win = 500000;
    var stop = 5000000;
    var count=0;
    var callback = function(err,record,data){
        console.log("resolving " + record);
        if (err){
            console.log("ERROR propogated: " + err);;
            // throw(err);            
        }else{
            count++;            
            if (count===10){
                test.ok(10);                
                test.done();            
            }            
        }
    }

    for (var i=1; i<= stop; i+= win ){
        var st = i;
        var ed = i + win -1;
        var region = "1:" + st + "-" + ed;
        ensemblRest.fetchGenesFromRegion("human",region,callback);                    
    }
}

