var http = require("http"),
    when = require("when");

var waitTime;
var verbose=0;

var runningRequests=0;
var queuedRequests = [];

module.exports = function(waitTimeArg,verb){
    var defaultWaitTime = 334; 
    verbose = verb || 0;

    if (typeof waitTimeArg === "undefined"){
        waitTime = defaultWaitTime;        
    } else{
        waitTime = waitTimeArg;
    }
    var that = this;
    this.getEnsemblAPI = function(resource,record,parameters,callback){
        runningRequests++;
        if (runningRequests<3){
            ensemblGet.apply(this,arguments);
        }
        else{
            if (verbose) console.log("Queueing");
            queuedRequests.push(arguments);
        }
    }
    
    this.fetchRegionInfo = function (species,region,callback){
        that.getEnsemblAPI("/assembly/info/"+ species+ "/",region,null,callback);
    }
    
    this.fetchAssemblyInfo = function(species,callback){
        that.getEnsemblAPI("/assembly/info/",species,null,callback);
    }
    
    //TODO: There needs to be a check here. The Ensembl API does not accept request for regions > 5Mb
    //      We just need to split up regions into 5Mb windows. 
    this.fetchGenesFromRegion = function(species,region,callback){
        that.getEnsemblAPI("/feature/region/"+ species+ "/",region,{"feature":"gene"},callback);
    }
    
    this.fetchXrefByGeneId = function(geneId,params,callback){
        that.getEnsemblAPI("/xrefs/id/", geneId,params,callback);
    }
    
    this.fetchAllSpecies = function(callback){
        that.getEnsemblAPI("/info/","species",{},callback);
    }
   
    this.fetchGeneById = function(geneId,callback){
        that.getEnsemblAPI("/feature/id/",geneId,{"feature":"gene"},callback);
    }
   
}


var ensemblGet = function (resource,record,parameters,callback){

    var err;
    var fetchedData = '';

    // For example for this resource: feature/region/:species/:region,
    // The GET function takes the following parameters:
    // Resource: "/feature/region/human/"  
    // Record: "1:1-1000000"
    // Parameters: {"feature":"gene"}
    // next: callbackFunction
    var getArgs = arguments;
    if (verbose > 0){        
        console.log("Making query " + resource  + record);
    }
    console.log("Query: " + resource + record);
    
    var paramList=[];
    if (parameters != null && typeof parameters==="object"){
        Object.keys(parameters).forEach(function(key){
            paramList.push(key+"="+parameters[key]);
        })            
    }else if (parameters != null) {
        err = new Error("get function parameters expects an object");
        console.log(err);
        callback (err,record,fetchedData);
    }

    var path = resource + record;
    if (paramList.length>0){
        path += "?"+ paramList.join(";");
    }

	var options = {
	  host: 'beta.rest.ensembl.org',
	  path: path,
	  method: 'GET',
      headers: {
           'Content-Type': 'application/json'
      }
	};	

    var req = http.request(options, function(res) {
        
        runningRequests--;
        res.setEncoding('utf8');

        if (res.headers["x-ratelimit-remaining"] < 60){
            console.log("lessthanRate")
            waitTime = res.headers["x-ratelimit-reset"]*1000;
        }

		if (res.statusCode != 200) {
            var errorMsg = "Bad request, HTTP reponse code: " + res.statusCode;

            if (res.statusCode == 429){
                console.log("Too many requests: " + JSON.stringify(res.headers));
                console.log("Wait and retry");
                sleep(waitTime+500); 
                ensemblGet.apply(null,getArgs);
                // errorMsg += " " + JSON.stringify(res.headers);
                // console.log(res.headers);
            }else{ // what to do with the 500 errors?
                err = new Error(errorMsg);
                callback (err,record,fetchedData);                
            }
		}else{
		    
    		res.on('data',function(chunk){
                if (chunk != undefined ){
                    fetchedData += chunk;                
                }
    		});
            res.on('error',function(error){
                console.log(error);
                err = error;
                callback (err,record,fetchedData);
            });
            res.on('end',function(){                  
                sleep(waitTime);     
                var json;
                json = JSON.parse(fetchedData);
        
                callback (err,record,json);
                if (queuedRequests.length>0){
                    while(queuedRequests.length){
                        if (verbose) console.log("Draining");
                        ensemblGet.apply(this, queuedRequests.shift())
                    };                    
                }
            })
		}
    });	
    req.end();    
    req.on("error",function(err){
        console.log("error in HTTP request for: " + record + " - "  + err);
        console.log("Trying again.....");
        sleep(waitTime+500); 
        ensemblGet.apply(null,getArgs);
    })        
};

function sleep(milliSeconds){
   var startTime = new Date().getTime();
   while (new Date().getTime() < startTime + milliSeconds);
}
