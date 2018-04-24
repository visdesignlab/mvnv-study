var C2JConverter = require("csvtojson").Converter
  , j2c = require('json2csv')
  , fs     = require('fs')
  , _      = require('underscore')
  , oldFile   = "results/data-upgrade.csv" || process.argv[2]
  //, visFile   = "data/college.csv" || process.argv[3]
  , fields = [
    // per participant
    'index',
    // 'workerId',
    'postId',
    'condition',
    'if_search_factor',
    // per visit
    'chartCode',
    'active_search_factor', // whether it's in the activeSearchArray
    'search_state',
    'search_content',
    'duration',
    'sectionCode',
    'searchId'
  ]
  , logData = []

c2j = new C2JConverter();
c2j.fromFile(oldFile,function(err,data){
  //c2j.fromFile(visFile, function(error, dataVis){

    // Iterate through participants
    data.forEach(function(participant, index){
    var visitLog = participant['visitLog'];
    var searchLog = participant['searchLog'];

    // Go through visitLog
    visitLog.forEach(function(visit, i) {
      visit['index'] = index
      // visit['workerId'] = participant['workerId']
      visit['postId'] = participant['postId']
      visit['condition'] = participant['condition']
      visit['if_search_factor'] = participant['if_search_factor']

      // active search factor
      visit['active_search_factor'] = participant['activeSearchArray'] && participant['activeSearchArray'].find(function(e){
        return e.toLowerCase() === visit['chartCode'].toLowerCase();
      }) ? true : false;

      // search_state
      visit['search_state'] = "non_search"
      visit['search_content'] = ""
      if(participant['if_search_factor'] === "search"){

        visit['search_state'] = "not_using_box"

        if(visit['searchId'] !== -1){
          visit['search_content'] = searchLog[visit['searchId']]['content']
          //using-bar: if match first 3 char
          var MAX_COMP = visit['search_content'].length >= 3 ? visit['search_content'].length : 3;
          if(visit['search_content'].length >= 3 && visit['chartCode'].toLowerCase().includes(visit['search_content'].substring(0,MAX_COMP).toLowerCase())){
            // check for correctness
            //console.log(index+": "+visit['chartCode']+" --- "+visit['search_content'])
            visit['search_state'] = "using_box"
          }
        }
      }
      
      logData.push(visit)
      
  });
})

    generateNew(logData);
//  })
});



function generateNew(newData) {
  var params = {
    data: newData,
    fields: fields
  }
  j2c(params, function(err, csv) {
    if (err) console.log(err)
    console.log(csv)
  })
}
