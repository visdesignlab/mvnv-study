var C2JConverter = require("csvtojson").Converter
  , j2c = require('json2csv')
  , fs     = require('fs')
  , _      = require('underscore')


  , oldFile   = process.argv[2]
  , fields
  , calculatedFields = [
    'if_search_factor',
    'revisit',
    'time_for_charts',
    'num_of_findings',
    'char_of_findings',
    'word_of_findings',
    'activeSearchNum'
  ]
  , deleteFields = [
    'visitLog',
    'searchLog',
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
    fields = _.uniq(fields)

    // Iterate through participants
    resultData.forEach(function(participant, index){
      participant['revisit'] = 0
      visitedSet = [];
      participant['time_for_charts'] = 0
      
      // process findings
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
      participant['activeSearchNum'] = 0
      if(participant['activeSearchArray']){
        participant['activeSearchArray'] = participant['activeSearchArray'].map(function(d){return d.toLowerCase();})
        participant['activeSearchArray'] = _.uniq(participant['activeSearchArray'])
        participant['activeSearchNum'] = participant['activeSearchArray'].length
      }

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
