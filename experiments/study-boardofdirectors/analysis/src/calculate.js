var C2JConverter = require("csvtojson").Converter
  , j2c = require('json2csv')
  , fs     = require('fs')
  , _      = require('underscore')


  , oldFile   = process.argv[2]
  , fields
  , calculatedFields = [
    'if_search_factor',
    'sectionChange',
    'sectionChange_using_box',
    'sectionChange_not_using_box',
    'revisit',
    'time_for_charts',
    'time_using_box',
    'time_not_using_box',
    'num_of_findings',
    'char_of_findings',
    'word_of_findings',
    'activeSearchNum'
  ]
  , deleteFields = [
    'visitLog',
    'searchLog',
    'sectionLog',
    'findings',
    'activeSearchArray'
  ]
  , resultData
 
// Visualization-related
var CHART_NUM = 255
  ,visitedSet;

c2j = new C2JConverter();
c2j.fromFile(oldFile,function(err,result){

    resultData = result;

    // combine old and new fields
    fields = Object.keys(resultData[0]);
    fields = fields.concat(calculatedFields)

    // Iterate through participants
    resultData.forEach(function(participant, index){
      participant['revisit'] = 0
      visitedSet = [];
      participant['time_for_charts'] = 0
      
      // if the findings array fails to parse, it's a string
      if(typeof participant['findings'] === 'string' )
      {
        // replace (\\") with (') , then parse it to an array
        participant['findings'] = participant['findings'].replace(/\\\\"/g, "'")
        participant['findings'] = JSON.parse(participant['findings'])
      }
      //console.log(participant['findings'])
      var findings  = participant['findings'].filter(function(e){
        return e !== ""
      })
      participant['num_of_findings'] = findings.length;
      participant['word_of_findings'] = 0;
      participant['char_of_findings'] = 0;
      findings.forEach(function(d){
        participant['word_of_findings'] += d.split(' ').length
        participant['char_of_findings'] += d.length;
      })

      processLog(index)

      // process active search array
      var searchArray = participant['activeSearchArray']
      if(searchArray){
        // 1. turn to lower case
        searchArray = searchArray.map(function(d){return d.toLowerCase();}) 
      
        // 2. unique
        searchArray = _.uniq(searchArray) 
      }
      // 3. count and store back
      participant['activeSearchNum'] = searchArray ? searchArray.length : 0;
      participant['activeSearchArray'] = searchArray

      //stringify
      deleteFields.forEach(function(e){
        if(typeof participant[e] !== 'string'){
          participant[e] = JSON.stringify(participant[e])
        }
      })
    })

    // remove fields
    // deleteFields.forEach(function(e){
    //   fields.splice(fields.indexOf(e),1)
    // })

    generateNew(resultData);
});

function processLog(participant) {

  var visitLog = resultData[participant]['visitLog'];
  var searchLog = resultData[participant]['searchLog'];
  var sectionLog = resultData[participant]['sectionLog'];

  // Go through visitLog
  visitLog.forEach(function(visit, i) {
      var chartCode = visit['chartCode']
      //revisit
      calculateRevisit(chartCode, i, participant);
      //time_for_charts
      resultData[participant]['time_for_charts'] += visit['duration'];
  });

  //if search factor
  resultData[participant]['if_search_factor'] = searchLog.length > 0 ? "search" : "non-search";

  // section change
  resultData[participant]['sectionChange'] = sectionLog.filter(function(d){
    return d['duration'] > 1500;
  }).length - 1

  // section change using_box / not_using_box
  var changeUsingBox = 0
  var timeUsingBox = 0
  searchLog.forEach(function(search){
    
    var searchSection = sectionLog.filter(function(section){
      return section['duration'] > 1500 && 
              ((section['start'] > search['start'] && section['start'] < search['end']) || 
              (section['end'] > search['start'] && section['end'] < search['end'])) 
    }).length

    changeUsingBox += searchSection === 0 ? 0 : searchSection-1;
    timeUsingBox += search['duration']
  })
  resultData[participant]['sectionChange_using_box'] = changeUsingBox;
  resultData[participant]['sectionChange_not_using_box'] = resultData[participant]['sectionChange'] - changeUsingBox;
  resultData[participant]['time_using_box'] = timeUsingBox;
  resultData[participant]['time_not_using_box'] = resultData[participant]['time_diff_exploration'] - resultData[participant]['time_using_box']
}

function calculateRevisit(entry, i, subject){
    if(entry != "" && visitedSet.indexOf(entry) != -1){
        resultData[subject].revisit++;
    } else {
        visitedSet.push(entry);
    }
}

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
