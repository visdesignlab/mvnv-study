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
    'if_search_factor', // per participant
    // per visit
    'chartCode',
    'active_search_factor', // per visit
    'search_state',
    'search_content',
    'duration',
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
      visit['postId'] = participant['postId']
      visit['condition'] = participant['condition']
      visit['if_search_factor'] = participant['if_search_factor']
      visit['time_diff_exploration'] = participant['time_diff_exploration']
      
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
          var min_num = 1
          var MAX_COMP = visit['search_content'].length >= min_num ? visit['search_content'].length : min_num;
          if(visit['search_content'].length >= min_num && visit['chartCode'].toLowerCase().includes(visit['search_content'].substring(0,MAX_COMP).toLowerCase())){
            // check for correctness
            //cmd:  node src/visitlogparser.js results/data.csv
             //console.log(index+": "+ visit['search_content'] +" --- "+ visit['chartCode'])
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
