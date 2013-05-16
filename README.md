# Fetch me some genes
-  Node.js convenience functions for querying the [Ensembl Rest API](http://beta.rest.ensembl.org)

## Example: Fetching genes from Chr 1 slice

    var EnsemblRest = require("./EnsemblRest");

    var ensemblRest = new EnsemblRest(0);
    var region = "1:100000-200000";

    var callback = function(err,record,data){        
        console.log(data);
    }
    ensemblRest.fetchGenesFromRegion("human",region,callback);
    

## Current Functions:

- fetchAllSpecies : function(callback)

- fetchRegionInfo : function (speciesName,region,callback)
    
- fetchAssemblyInfo : function(speciesName,callback)
    
- fetchGenesFromRegion : function(speciesName,region,callback)
    
- fetchGeneById : function(geneId,callback)
    
- fetchXrefByGeneId : function(geneId,params,callback) 


## Tests
- Tests run under nodeunit
