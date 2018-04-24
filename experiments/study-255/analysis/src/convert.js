var j2c    = require('json2csv')
  , fs     = require('fs')
  , file   = process.argv[2]
  , _      = require('underscore')
  , data

var requiredFields = [
      'workerId',
      'postId',
      'condition',
      'windowWidth',
      'windowHeight',
      'time_diff_exploration',
      'time_start_exploration',
      'time_end_exploration',
      'time_diff_questions',
      'time_diff_experiment',
      'findings',
      'question1_extreme',
      'question2_comparison',
      'question3_trend',
      'age',
      'sex',
      'degree',
      'screen_size',
      'vis_experience',
      'searchLog',
      'visitLog'
  ]

  var optionalFields = [
      'strategy1_personal',
      'activeSearchArray',
      'strategy2_search_content',
      'strategy_3_how_related',
      'strategy4_difficulty',
      'strategy5_strategy',
      'handed',
      'comment_additional'
  ]

  var fields = requiredFields.concat(optionalFields)

fs.readFile(file, 'utf8', function (err, data) {
  if (err) console.log(err)

  data = JSON.parse(data)

  // stringify
  data = reStringify(data)

  // filters any undefined data (it makes R scripting easier)
  // preserve optional comments
  data = filterUndefined(data)

  // use 'debug' for your workerId when testing experiments, 
  //   comment out if you want to analyze data from yourself
  data = filterDebug(data) 

  convert( data )
})

function convert(d) {
  var params = {
    data: d,
    fields: fields
  }
  j2c(params, function(err, csv) {
    if (err) console.log(err)
    console.log(csv)
  })
}

function reStringify (data) {
  data.forEach(function(row,i){
    fields.forEach(function(col){
      if(typeof row[col] !== 'string'){
        data[i][col] = JSON.stringify(row[col])
      }
    })
  })
  return data;
}

function filterUndefined (arr) {
  return _.filter(arr, function(row) {
    return _.every(requiredFields, function(f) { return row[f] })
  })
}

function filterDebug (arr) {
  return _.filter(arr, function(row) {
    return row.workerId !== 'debug'
  })
}
