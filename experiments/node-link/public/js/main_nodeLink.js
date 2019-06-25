/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global queue, labels*/

///////////////////////////For Experiment Begin/////////////////////////////
var userData = {
  condition: "",
  searchLog: [],
  visitLog: [] //visited data table (JSON Array)
};
var currentVisit = null;
var currentSearch = null;

// Set the condition
let rand = Math.random();
if (rand > 0) {
  userData.condition = "foresight";
} else {
  userData.condition = "control";
}

console.log("condition = " + userData.condition);

function recordVisit(item) {
  // record previous
  if (currentVisit && currentVisit["chartCode"] !== item) {
    currentVisit["end"] = Date.now();
    currentVisit["duration"] = currentVisit["end"] - currentVisit["start"];
    userData["visitLog"].push(currentVisit);
    currentVisit = null;
    //console.log(userData['visitLog'])
  }
  // start a new visit
  if (!currentVisit && item) {
    //console.log(item)
    currentVisit = {};
    currentVisit["start"] = Date.now();
    currentVisit["chartCode"] = item;
    currentVisit["searchId"] = currentSearch ? currentSearch["id"] : -1;
  }
}

///////////////////////////For Experiment End/////////////////////////////
var colorRange = ["#5e3c99", "#b2abd2", "#fdb863", "#e66101"];
var color = d3
  .scaleQuantize()
  //.range(["#156b87", "#876315", "#543510", "#872815"]); //Original
  //.range(["#56ebd3", "#33837f", "#68c3ef", "#1c4585"]) //Colorgorical, blue-ish
  //.range(['#016c59','#1c9099','#67a9cf','#bdc9e1']) //Colorbrewer2, blue-ish
  .range(colorRange);

var size = 1300//720;

var DATASET =
  //"exoplanets"
  "college";
//"college-all"

var DATA_FILE, RADIUS_ATTR, COLOR_ATTR, NAME_ATTR, DISTANCE_ATTR, LOAD_FUNC;
var detailMap = {};
var MAX_DATA_NUM = 300;
//var COLOR_DIVIDER = 1/38000
var COLOR_DIVIDER = 1 / 18000;

if (DATASET === "exoplanets") {
  // Exoplanets
  DATA_FILE = "data/exoplanets.json";
  RADIUS_ATTR = "P_Radius_EU";
  DISTANCE_ATTR = "S_Distance_pc";
  COLOR_ATTR = "P_Teq_Mean_K";
  NAME_ATTR = "P_Name";
  LOAD_FUNC = loadExoplanetStructure;
} else if (DATASET === "college") {
  // Education
  DATA_FILE = "data/college.csv";
  RADIUS_ATTR = "COSTT4_A";
  COLOR_ATTR = "MD_EARN_WNE_P10";
  DISTANCE_ATTR = "ADM_RATE";
  NAME_ATTR = "INSTNM";
  LOAD_FUNC = loadCollegeStructure;
  //detail map
  detailMap[RADIUS_ATTR] = "Annual Cost";
  detailMap[DISTANCE_ATTR] = "Admission Rate";
  detailMap[COLOR_ATTR] = "Median of Earnings";
}
/*
"MD_EARN_WNE_P10"
"COSTT4_A"
"ADM_RATE"
"PCIP14" //too many 0%
"PCTPELL"
*/

var pack = d3
  .pack()
  .size([size, size])
  .padding(5);

var svg;
var bubbles;
var tooltip;

var mouseOnBubble = false;
var margin = { left: 0, right: 100, top: 0, bottom: 0 };

// Single function to put chart into specified target
function loadBubbleChart(id) {
  $(function() {
    userData["windowWidth"] = $(window).width();
    userData["windowHeight"] = $(window).height();

    //instructions
    if (userData.condition == "control") {
      d3.selectAll(".foresightTraining").style("display", "none");
    }
    svg = d3
      .select("#" + id)
      .append("svg")
      .attr("width", size + margin.left + margin.right)
      .attr("height", size + margin.top + margin.bottom);
    // .attr("width", userData['windowWidth'])
    //   .attr("height", userData['windowHeight'])

    //   tooltip = d3
    //   .select("#" + id)
    //   .append("div")
    //   .attr("class", "vis-tooltip")
    //   .style("position", "relative")
    //   //.style("transform","translate(0,-"+size+")")
    //   .style("opacity", "0");

    queue()
      .defer(d3.csv, DATA_FILE, type)
      //.defer(d3.json, DATA_FILE)
      // .defer(d3.json, DATA_FILE, type)
      .await(boot);
  });
}

function type(d) {
  // d[RADIUS_ATTR] = +d[RADIUS_ATTR];
  // d[COLOR_ATTR] = +d[COLOR_ATTR];
  // d[DISTANCE_ATTR] = d[DISTANCE_ATTR] ? +d[DISTANCE_ATTR] : NaN;
  d[RADIUS_ATTR] = parseFloat(d[RADIUS_ATTR]);
  d[COLOR_ATTR] = parseFloat(d[COLOR_ATTR]);
  d[DISTANCE_ATTR] = parseFloat(d[DISTANCE_ATTR]);
  return d;
}

function showDetail(d) {
  d3.select(this).attr("stroke", "black");
}

function loadSearchBox() {
  // Load the searchbox if foresight condition
  if (userData.condition !== "control") {
    d3.select("#hit")
      .select("#search-box")
      .style("display", "inline");
    //enableSearch();
  }
}

var searchData;

function loadExoplanetStructure(data) {
  var planets = data.filter(function(d) {
      return d[DISTANCE_ATTR] === 0;
    }),
    exoplanets = data.filter(function(d, i) {
      return !isNaN(d[DISTANCE_ATTR]) && d[DISTANCE_ATTR] !== 0 && i < 300;
    });
  //exoplanets = data.filter(function(d, i) { return !isNaN(d[DISTANCE_ATTR]) && d[DISTANCE_ATTR] !== 0; });
  searchData = planets.concat(exoplanets);

  var root;
  root = d3
    .hierarchy({ children: [{ children: planets }].concat(exoplanets) })
    //d3.hierarchy({children: exoplanets})
    .sum(function(d) {
      return d[RADIUS_ATTR] * d[RADIUS_ATTR];
    })
    .sort(function(a, b) {
      return (
        !a.children - !b.children ||
        isNaN(a.data[DISTANCE_ATTR]) - isNaN(b.data[DISTANCE_ATTR]) ||
        a.data[DISTANCE_ATTR] - b.data[DISTANCE_ATTR]
      );
    });

  pack(root);

  return root;
}

function loadCollegeStructure(data) {
  var bfl = data.length;
  //filter
  data = data.filter(function(d) {
    return !(
      isNaN(d[RADIUS_ATTR]) ||
      isNaN(d[COLOR_ATTR]) ||
      isNaN(d[DISTANCE_ATTR]) ||
      d[DISTANCE_ATTR] === 0
    );
  });
  //sort
  data = data.sort(function(a, b) {
    return a[DISTANCE_ATTR] - b[DISTANCE_ATTR];
  });
  //data = data.sort(function(a, b){return b[COLOR_ATTR] - a[COLOR_ATTR]})
  //then filter
  data = data.filter(function(d, i) {
    return i < MAX_DATA_NUM;
  });
  console.log("filtered=" + (bfl - data.length));

  searchData = data;

  //extract top 10
  // var top10 = data.splice(0, 10)
  // console.log("top 10")
  // console.log(top10)
  // searchData = data.concat(top10);
  console.log("searchData.length=" + searchData.length);

  var root;
  //root = d3.hierarchy({children: [{children: top10}].concat(data)})
  root = d3
    .hierarchy({ children: data })
    .sum(function(d) {
      return d[RADIUS_ATTR];
    })
    .sort(function(a, b) {
      return (
        !a.children - !b.children ||
        //|| b.data[DISTANCE_ATTR] - a.data[DISTANCE_ATTR];
        a.data[DISTANCE_ATTR] - b.data[DISTANCE_ATTR]
      );
    });
  pack(root);
  //console.log(root)

  return root;
}

function showTooltip(d) {
  tooltips
    .style("top", d.y + d.r - size + "px")
    .style("left", d.x + 5 + "px")
    .transition()
    .duration(0)
    .style("opacity", 1);

  tooltip.html(function() {
    var percent = Math.round(d.data[DISTANCE_ATTR] * 10000) / 100;
    return (
      d.data[NAME_ATTR] +
      "<br/>" +
      detailMap[DISTANCE_ATTR] +
      ": " +
      percent +
      "%<br>" +
      detailMap[RADIUS_ATTR] +
      ": $" +
      d.data[RADIUS_ATTR] +
      "<br/>" +
      detailMap[COLOR_ATTR] +
      ": $" +
      d.data[COLOR_ATTR]
    );
  });
}

function visitItem(item, data) {
  //item: circle, data: object
  d3.select(item).classed("expVisited", true);

  //visit and search log
  userData["visited"]++;
  //console.log("visited=")
  //console.log(userData['visited'])
  recordVisit(data.data[NAME_ATTR]);
}

//drawLesMis NodeLink
function drawVis(root) {

  // userData["windowWidth"] = $(window).width();
  // userData["windowHeight"] = $(window).height();

  console.log(userData)

  // d3.select("svg").attr('width',userData.windowWidth);


  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 20;

  //   var color = d3.scaleOrdinal(d3.schemeCategory20);
  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody() .strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    // .force("collision", d3.forceCollide().radius(radius));


  d3.json("../public/twitter_data/Eurovis2019Network.json", function(error, graph) {
    let toRemove = [];

    d3.json("../public/twitter_data/Eurovis2019Tweets.json", function(tweets) {



// console.log(graph.nodes);
 graph.links=[];

let newGraph = {'nodes':[],'links':[]};

  //create edges from tweets. 

  tweets = tweets.tweets;

  tweets.map((tweet)=>{

    //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person. 
    tweet.entities.user_mentions.map(mention=>{
      let source = graph.nodes.find(n=>n.id === tweet.user.id);
      let target = graph.nodes.find(n=>n.id === mention.id);


      if (source && target){
        let link = {'source':source.id,'target':target.id,'type':'mentions','count':1}
        let existingLink = newGraph.links.find(l=>l.source === link.source && l.target === link.target && l.type === link.type);
        //either increase the count of an existing link or add a new link
        if (!existingLink){
          newGraph.links.push(link);
        } else {
          existingLink.count = existingLink.count +1;
        }
        
        if (!newGraph.nodes.find(n=>n.id===source.id)){
          //randomly assign a categorical variable 'type'
          source.type = Math.random()>0.6 ? 'institution' : 'person';
          newGraph.nodes.push(source);
        }
        if (!newGraph.nodes.find(n=>n.id===target.id)){
          //randomly assign a categorical variable 'type'
          target.type = Math.random()>0.6 ? 'institution' : 'person';
          newGraph.nodes.push(target);
        }
      }
      // console.log('link',link)
      
    })

    

    //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
    if (tweet.retweeted_status){
      let source = graph.nodes.find(n=>n.id === tweet.user.id);
      let target = graph.nodes.find(n=>n.id === tweet.retweeted_status.user.id);


      if (source && target){
        let link = {'source':source.id,'target':target.id,'type':'retweet','count':1}

        let existingLink = newGraph.links.find(l=>l.source === link.source && l.target === link.target && l.type === link.type);
        //either increase the count of an existing link or add a new link
        if (!existingLink){
          newGraph.links.push(link);
        } else {
          existingLink.count = existingLink.count +1;
        }

        if (!newGraph.nodes.find(n=>n===source)){
          newGraph.nodes.push(source);
        }
        if (!newGraph.nodes.find(n=>n===target)){
          newGraph.nodes.push(target);
        }
      } 
    


    }

    //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
    if (tweet.in_reply_to_user_id_str){
      let source = graph.nodes.find(n=>n.id === tweet.user.id);
      let target = graph.nodes.find(n=>n.id === tweet.in_reply_to_user_id);
  
      if (source && target){
        let link = {'source':source.id,'target':target.id,'type':'reply','count':1}

        let existingLink = newGraph.links.find(l=>l.source === link.source && l.target === link.target && l.type === link.type);
        //either increase the count of an existing link or add a new link
        if (!existingLink){
          newGraph.links.push(link);
        } else {
          existingLink.count = existingLink.count +1;
        }

        if (!newGraph.nodes.find(n=>n===source)){
          newGraph.nodes.push(source);
        }
        if (!newGraph.nodes.find(n=>n===target)){
          newGraph.nodes.push(target);
        }
      }    
  }

  })

  // console.log(newGraph)
// console.log(JSON.stringify(newGraph))
  graph = newGraph;


// graph.links = graph.links.filter(l => {
//   let findSource = graph.nodes.find(n => l.source === n.id);
//   let findTarget = graph.nodes.find(n => l.target === n.id);

//   if (findSource && findTarget) {
//     return true;
//   } else {
//     return false;
//   }
// });

//subsample graph
// graph.links = graph.links.filter(d => Math.random() > 0.75);

// graph.nodes = graph.nodes.filter(n => {
//   if (graph.links.find(l => l.source === n.id || l.target === n.id)) {
//     return true;
//   } else {
//     return false;
//   }
// });


// let color = d3
//   .scaleLinear()
//   .domain(d3.extent(graph.nodes.map(n => n.statuses_count)))
//   .range(["purple", "orange"]);

  let nodeColor = d3
  .scaleOrdinal()
  .domain(d3.extent(graph.nodes.map(n => n.type)))
  .range(["#e6ab02", '#7570b3']);

  let edgeColor = d3
  .scaleOrdinal()
  .domain(d3.extent(graph.links.map(l => l.type)))
  .range(["#1b9e77", "#d95f02","#666666"]);

  let edgeScale = d3
  .scaleLinear()
  .domain(d3.extent(graph.links.map(l => l.count)))
  .range([2,10]);


  let follower_scale = d3
  .scaleLinear()
  .domain(d3.extent(graph.nodes.map(n => n.followers_count)))
  .range([10,20]);

  let friends_scale = d3
  .scaleLinear()
  .domain(d3.extent(graph.nodes.map(n => n.friends_count)))
  .range([10,20]);


  // console.log(
  //   'friends',d3.extent(graph.nodes.map(n => n.friends_count)),
  //   'followers',d3.extent(graph.nodes.map(n => n.followers_count)),
  //   'favorites',d3.extent(graph.nodes.map(n => n.favourites_count)),
  //   'listed',d3.extent(graph.nodes.map(n => n.listed_count)),
  //   'status_count',d3.extent(graph.nodes.map(n => n.statuses_count))
  // )

// console.log(color.domain(), color.range());

//set datalist property for search box:

d3.select("#search-input").attr("list", "characters");
let inputParent = d3.select("#search-input").node().parentNode;

let datalist = d3
  .select(inputParent)
  .append("datalist")
  .attr("id", "characters");

let options = datalist.selectAll("option").data(graph.nodes);

let optionsEnter = options.enter().append("option");
options.exit().remove();

options = optionsEnter.merge(options);
options.attr("value", d => d.screen_name);

if (error) throw error;
var link = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(graph.links);

  let linkEnter = link
  .enter()
  .append("line")

  link.exit().remove();


  link = linkEnter.merge(link);

  link
  .style("stroke-width", l=>edgeScale(l.count))
  .style("stroke", function(d) {
    return edgeColor(d.type);
  })
  // .style('opacity',1)


var node = svg
  .append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(graph.nodes)
  .enter()
  .append("g");

node
  .append("circle")
  .attr("r", radius)
  .attr("fill", d=>nodeColor(d.type));

node
  .append("rect")
  .attr('class','bar')
  .attr("width", radius/2)
  .attr("height", d => friends_scale(d.friends_count))
  .attr("x", -radius/2 )
  .attr("y", d => -(friends_scale(d.friends_count)) / 2)
 

  node
  .append("rect")
  .attr('class','bar')
  .attr("width", radius/2)
  .attr("height", d => follower_scale(d.followers_count))
  .attr("x", 0 )
  .attr("y", d => -(follower_scale(d.followers_count)) / 2)

  node.selectAll('.bar')
  .style('fill','black')
  .style('stroke',d=>nodeColor(d.type))
  .style('stroke-width','2px')

  node
  .append("rect")
  .attr('class','labelBackground')
  


  node.append("text")
  // .attr("dx",0)
  .attr("dy", "-2em")
  .classed('label',true)
  .text(function(d) { return d.screen_name });

  node.select('text')
  .attr('dx',function(d){ 
    return -d3.select(this).node().getBBox().width/2})

  node.select('.labelBackground')
  .style('fill','white')
  .style('opacity',.5)
  .attr("width", function(d){ 
    return d3.select(d3.select(this).node().parentNode).select('text').node().getBBox().width})
  .attr("height", '2em')
  .attr("x", function(d){ 
    return -d3.select(d3.select(this).node().parentNode).select('text').node().getBBox().width/2})
  .attr("y","-42")
 
node
  .call(
    d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );

node.on("click", function() {
  d3.selectAll("circle").classed("clicked", false);
  d3.select(this)
    .select("circle")
    .classed("clicked", true);
});

node.append("title").text(function(d) {
  return d.screen_name;
});
simulation.nodes(graph.nodes).on("tick", ticked);
simulation.force("link").links(graph.links);
function ticked() {
  link
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });

  //   node
  //     .attr("cx", function(d) {
  //       return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
  //     })
  //     .attr("cy", function(d) {
  //       return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
  //     });

  node.attr(
    "transform",
    d =>{
      d.x = Math.max(radius, Math.min(width - radius, d.x));
      d.y = Math.max(radius, Math.min(height - radius, d.y));
      return "translate(" + d.x + "," + d.y +")"

    }
      
  );
  // .attr("x", function(d) {
  //   return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
  // })
  // .attr("y", function(d) {
  //   return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
  // });

  //   node
  //     .attr("cx", function(d) {
  //       return d.x;
  //     })
  //     .attr("cy", function(d) {
  //       return d.y;
  //     });
}


    })

    
  });
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function dragended(d) {
    // console.log(simulation.alpha())
    if (simulation.apha()>3) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

function boot(error, data) {
  //console.log(data)
  if (DATASET === "exoplanets") {
    data = data.children;
  }

  data.forEach(type);
  color.domain(
    d3.extent(data, function(d) {
      return d[COLOR_ATTR] / COLOR_DIVIDER;
    })
  );
  color.domain([Math.pow(13000, 2), Math.pow(65000, 2)]);

  // console.log(
  //   d3.extent(data, function(d) {
  //     return Math.sqrt(d[COLOR_ATTR] / COLOR_DIVIDER);
  //   })
  // );
  //console.log(d3.extent(data, function(d) { return d[RADIUS_ATTR]; }))

  //var root = loadExoplanetStructure(data);
  var root = LOAD_FUNC(data);
  drawVis(root);
  loadSearchBox();
}

// Search box
function enableSearch() {
  //$(document).ready(function () {

  var searchInput = $("#search-input");

  // Get options for auto complete
  function getSearchOptions(data) {
    var optionsData = [];
    if (data && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        optionsData.push(data[i][NAME_ATTR]);
      }
      console.log(optionsData.length);
    }
    initSearchBox(optionsData);
  }
  getSearchOptions(searchData);

  // Init search box with auto complete
  function initSearchBox(options) {
    // Invoke auto complete for search box
    var searchOptions = {
      data: options,
      list: {
        maxNumberOfElments: 0,
        match: { enabled: true },
        onChooseEvent: function() {
          searchChooseItem();
        }
      }
    };
    searchInput.easyAutocomplete(searchOptions);

    // Start searching when typing in search box
    searchInput.on("input", function(e) {
      e.preventDefault();
      searchChooseItem();
    });
  }

  // Search choosen item
  function searchChooseItem() {
    searchFilter(searchInput.val().toLowerCase());
  }

  function recordPreviousSearch() {
    if (currentSearch != null) {
      currentSearch.end = Date.now();
      currentSearch.duration = currentSearch.end - currentSearch.start;
      userData.searchLog.push(currentSearch);
      currentSearch = null;

      //debug log
      //console.log("searchLog=")
      //console.log(userData.searchLog)
    }
  }

  function searchFilter(value) {
    // Record user data for search
    // Record the previous search if any, before reset
    recordPreviousSearch();

    // Reset and return if empty
    if (value === "") {
      resetSearch();
      return;
    }

    // Init the current search, after reset
    currentSearch = {
      id: userData.searchLog.length, // index for the next
      content: value,
      start: Date.now(),
      visited: 0
    };

    // Start Filtering
    // Fade all lines and boxes
    d3.selectAll(".bubbles").classed("search-selected", false);
    $("#vis").addClass("search-active");

    // Make contains case-insensitive
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
      return function(elem) {
        return (
          $(elem)
            .text()
            .toUpperCase()
            .indexOf(arg.toUpperCase()) >= 0
        );
      };
    });

    // Unfade selected elements
    //console.log(value)
    var filteredBubbles = d3.selectAll(".bubbles").filter(function(d) {
      return (
        d.data[NAME_ATTR] && d.data[NAME_ATTR].toLowerCase().includes(value)
      );
    });

    if (value && filteredBubbles) {
      // Unfade
      filteredBubbles.classed("search-selected", true);
      // Record current search
      currentSearch.selectedCharts = filteredBubbles.size();
      //console.log(filteredBubbles)
      //console.log("searching for: "+currentSearch.content+" #="+currentSearch.selectedCharts)
    }
  }

  // Click button to reset
  $("#search-reset").click(function() {
    resetSearch();
  });

  // Press ESC to reset
  $(document).keydown(function(e) {
    if (e.which === 27)
      //ESC
      resetSearch();
  });

  function resetSearch() {
    // Reset faded elemnets
    $("#vis").removeClass("search-active");
    $(".bubbles").removeClass("search-selected");
    // Reset search
    recordPreviousSearch();
    currentSearch = null;
    // Clear search input box
    searchInput.val("");
  }
}
