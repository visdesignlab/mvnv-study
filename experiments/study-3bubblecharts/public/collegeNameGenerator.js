/*
The script takes a list of town name, and add prefix or suffix of college names.
*/
var j2c    = require('json2csv')
  , fs     = require('fs')
  , file   = "data/fakeTowns.json"
  , _      = require('underscore')
  , data

var addOn = [
  {position: "end", name: "University"},
  {position: "end", name: "College"},
  {position: "end", name: "Institute"},
  {position: "end", name: "Institute of Technology"},
  {position: "end", name: "Institute of Arts"},
  {position: "end", name: "Community College"},
  {position: "end", name: "State University"},
  {position: "start", name: "University of"}
]
fs.readFile(file, 'utf8', function (err, data) {
  if (err) console.log(err)

  data = JSON.parse(data)
  
  data.forEach(function(town, i) {
    var add = addOn[parseInt(Math.random() * addOn.length)]
    if(add['position'] === "start") {
      data[i] = add['name'] + " " + town;
    } else {
      data[i] = town + " " + add['name']
    }
    
  })

  data = shuffle(data)
  console.log(JSON.stringify(data))
  return

  convert( data )
})

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return a;
}
