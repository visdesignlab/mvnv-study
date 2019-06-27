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

var size = 1200; //720;

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
    .force("charge", d3.forceManyBody().strength(-700))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(radius * 2.5));

  d3.json("../public/twitter_data/Eurovis2019Network.json", function(
    error,
    graph
  ) {
    let toRemove = [];

    d3.json("../public/twitter_data/Eurovis2019Tweets.json", function(tweets) {
      // console.log(graph.nodes);
      graph.links = [];

      let newGraph = { nodes: [], links: [] };

      let countSiblingLinks = function(graph, source, target) {
        var count = 0;
        let links = graph.links;

        for (var i = 0; i < links.length; ++i) {
          if (
            (links[i].source.id == source.id &&
              links[i].target.id == target.id) ||
            (links[i].source.id == target.id && links[i].target.id == source.id)
          )
            count++;
        }
        return count;
      };

      let getSiblingLinks = function(graph, source, target) {
        var siblings = [];
        let links = graph.links;
        for (var i = 0; i < links.length; ++i) {
          if (
            (links[i].source.id == source.id &&
              links[i].target.id == target.id) ||
            (links[i].source.id == target.id && links[i].target.id == source.id)
          )
            siblings.push(links[i].type);
        }
        return siblings;
      };

      //create edges from tweets.

      tweets = tweets.tweets;

      let createEdge = function(source, target, type) {
        if (source && target) {
          let link = {
            source: source.id,
            target: target.id,
            type,
            count: 1,
            id: source.id + target.id + type
          };
          let existingLink = newGraph.links.find(
            l =>
              ((l.source === link.source && l.target === link.target) ||
                (l.source === link.target && l.target === link.source)) &&
              l.type === link.type
          );
          //either increase the count of an existing link or add a new link
          if (!existingLink) {
            link.selected = false;
            newGraph.links.push(link);
          } else {
            existingLink.count = existingLink.count + 1;
          }

          if (!newGraph.nodes.find(n => n.id === source.id)) {
            //randomly assign a categorical variable 'type'
            source.type = Math.random() > 0.6 ? "institution" : "person";
            if (!existingLink) {
              source.neighbors = [target.id];
              source.edges = [link.id];
            }
            source.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            source.selected = false;
            newGraph.nodes.push(source);
          } else {
            if (!existingLink) {
              source.neighbors.push(target.id);
              source.edges.push(link.id);
            }
          }
          if (!newGraph.nodes.find(n => n.id === target.id)) {
            //randomly assign a categorical variable 'type'
            target.type = Math.random() > 0.6 ? "institution" : "person";
            if (!existingLink) {
              target.neighbors = [source.id];
              target.edges = [link.id];
            }
            target.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            target.selected = false;
            newGraph.nodes.push(target);
          } else {
            if (!existingLink) {
              target.neighbors.push(source.id);
              target.edges.push(link.id);
            }
          }
        }
      };

      tweets.map(tweet => {
        //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
        tweet.entities.user_mentions.map(mention => {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(n => n.id === mention.id);

          createEdge(source, target, "mentions");
        });

        //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
        if (tweet.retweeted_status) {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(
            n => n.id === tweet.retweeted_status.user.id
          );

          createEdge(source, target, "retweet");
        }

        //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
        if (tweet.in_reply_to_user_id_str) {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(
            n => n.id === tweet.in_reply_to_user_id
          );

          createEdge(source, target, "reply");
        }
      });

      // console.log(JSON.stringify(newGraph))
      graph = newGraph;

      let nodeColor = d3
        .scaleOrdinal()
        .domain(d3.extent(graph.nodes.map(n => n.type)))
        // .range(['#fe9929','#993404'])
        // .range(["#bdbdbd", "#7A7A7A"]);
        .range(["white", "white"]);

      let edgeColor = d3
        .scaleOrdinal()
        .domain(d3.extent(graph.links.map(l => l.type)))
        // .range(["#9ebcda", "#88419d", "#4d004b"]);
        .range(["#427d9b", "#88419d", "#5c9942"]);
       
      // .range(["#1b9e77", "#d95f02","#666666"]);

      let edgeScale = d3
        .scaleLinear()
        .domain(d3.extent(graph.links.map(l => l.count)))
        .range([2, 10]);

      let friendExtent = d3.extent(graph.nodes.map(n => n.friends_count));
      let followerExtent = d3.extent(graph.nodes.map(n => n.followers_count));

      let scaleExtent = d3.extent(friendExtent.concat(followerExtent))

      let barPadding = radius*0.3;
      let follower_scale = d3
        .scaleLinear()
        .domain([0,2000])
        .range([0, 2*radius-barPadding])
        .clamp(true)

      let friends_scale = d3.scaleLinear()
      .domain([0,2000])
      .range([0, 2*radius-barPadding])
      .clamp(true)



      

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
        .append("path")
        .attr("id", d => d.id)
        .attr("class", "links");

      // .append("line")

      link.exit().remove();

      link = linkEnter.merge(link);

      link
        .style("stroke-width", l => edgeScale(l.count))
        .style("stroke", function(d) {
          return edgeColor(d.type);
        });
      // .style('opacity',1)

      // add edge labels
      var edgeLabels = d3
        .select(".links")
        .selectAll(".pathLabel")
        .data(graph.links);

      let edgeLabelsEnter = edgeLabels
        .enter()
        .append("text")
        .attr("class", "pathLabel hideLabel")
        .append("textPath")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle");

      edgeLabels.exit().remove();

      edgeLabels = edgeLabelsEnter.merge(edgeLabels);

      edgeLabels
        .attr("xlink:href", function(d) {
          return "#" + d.id;
        })
        .text(function(d) {
          return d.type;
        });

      //   let histScale = d3.scaleLinear()
      // .domain(friendExtent)
      // .range([5, 400]);

      // let histScale2 = d3.scaleLinear()
      // .domain(followerExtent)
      // .range([5, 400]);
      //   let svg1 = d3.select('#vis2').append('svg')
      //   .attr('width',1200)
      //   .attr('height',500)
      //   .append("g")
      //   .attr('class','histogram');

      //   svg1
      //   .selectAll('rect')
      //   .data(graph.nodes)
      //   .enter()
      //   .append('rect')
      //   .attr("width", radius*0.8)
      //   .attr("height", d => histScale(d.friends_count))
      //   .attr("x",(d,i)=>i*radius)
      //   .attr("y", d => 500 - histScale(d.friends_count))

      //   svg1
      //   .selectAll('text')
      //   .data(graph.nodes)
      //   .enter()
      //   .append('text')
      //   .attr('font-size',13)
      //   .attr("x",(d,i)=>i*radius)
      //   .attr("y", d => 500 - histScale(d.friends_count))
      //   .text(d=>d.screen_name)
      //   // .attr('transform','rotate(90)')

      //   let svg2 = d3.select('#vis2').append('svg')
      //   .attr('width',1200)
      //   .attr('height',500)
      //   .append("g")
      //   .attr('class','histogram');


      //   svg2
      //   .selectAll('rect')
      //   .data(graph.nodes)
      //   .enter()
      //   .append('rect')
      //   .attr("width", radius*0.8)
      //   .attr("height", d => histScale2(d.followers_count))
      //   .attr("x",(d,i)=>i*radius)
      //   .attr("y", d => 500 - histScale2(d.followers_count))

      //   svg2
      //   .selectAll('text')
      //   .data(graph.nodes)
      //   .enter()
      //   .append('text')
      //   .attr('font-size',13)
      //   .attr("x",(d,i)=>i*radius)
      //   .attr("y", d => 500 - histScale2(d.followers_count))
      //   .text(d=>d.screen_name)


      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("g");

      node
        .append("rect")
        .attr('class','node')
        // .attr("r", radius)
        .attr('x',-radius)
        .attr('y',-radius)
        .attr('width',radius*2)
        .attr('height', radius*2)
        .attr("fill", d => nodeColor(d.type));

      
        node
        .append("rect")
        .attr("class", "frame")
        .attr("width", radius / 2)
        .attr("height", friends_scale.range()[1])
        .attr("x", -radius / 2 - 2)
        .attr("y",-radius +barPadding/2 );

      node
        .append("rect")
        .attr("class", "frame")
        .attr("width", radius / 2)
        .attr("height", follower_scale.range()[1])
        .attr("x", 2)
        .attr(
          "y", -radius +barPadding/2);


      node
        .append("rect")
        .attr("class", "bar")
        .attr("width", radius / 2)
        .attr("height", d => friends_scale(d.friends_count))
        .attr("x", -radius / 2 - 2)
        .attr("y", d => radius - barPadding/2  - friends_scale(d.friends_count));

      node
        .append("rect")
        .attr("class", "bar")
        .attr("width", radius / 2)
        .attr("height", d => follower_scale(d.followers_count))
        .attr("x", 2)
        .attr(
          "y", d => radius - barPadding/2  - follower_scale(d.followers_count) 
        );

 


        // node
        // .append("rect")
        // .attr("class", "frame")
        // .attr("width", radius*1.2)
        // .attr("height", friends_scale.range()[1])
        // .attr("x", -radius*0.6)
        // .attr("y", -radius*0.7 )
        // .attr('fill',)

      node
        .selectAll(".bar")
        .style("fill", "#000000")
        // .style("stroke", d => nodeColor(d.type))
        // .style("stroke-width", "2px");

      node.append("rect").attr("class", "labelBackground");

      node
        .append("text")
        // .attr("dx",0)
        .attr("dy", "-2em")
        .classed("label", true)
        .text(function(d) {
          return d.screen_name;
        });

      node.select("text").attr("dx", function(d) {
        return (
          -d3
            .select(this)
            .node()
            .getBBox().width / 2
        );
      });

      node
        .select(".labelBackground")
        .style("fill", "white")
        .style("opacity", 0.7)
        .attr("width", function(d) {
          return d3
            .select(d3.select(this).node().parentNode)
            .select("text")
            .node()
            .getBBox().width;
        })
        .attr("height", "2em")
        .attr("x", function(d) {
          return (
            -d3
              .select(d3.select(this).node().parentNode)
              .select("text")
              .node()
              .getBBox().width / 2
          );
        })
        .attr("y", "-42");

      node.call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

      d3.select('#clear-selection').on('click',()=>{

        let clearSelection = function(d){
          let isNode = d.userSelectedNeighbors !== undefined;

          d.selected = false;
          if (isNode){
            d.userSelectedNeighbors=[];
          }
          return true;
        }
      
        d3.selectAll(".node")
        .classed("clicked", false);

        d3.select(".nodes")
          .selectAll("g")
          .filter(clearSelection)
          .classed('muted',false);

        d3.select(".links")
          .selectAll("path")
          .filter(clearSelection)
          .classed('muted',false);
      });

      node.on("click", function(currentData) {
        d3.event.stopPropagation();

        let isClicked =  d3.select(this).select('.node').classed('clicked');
        
        d3.select(this)
          .selectAll(".node")
          .classed("clicked", !isClicked);


        let isNeighbor = function(d) {

          if (d === currentData){
            d.selected = !isClicked;
          }

          let isNode = d.userSelectedNeighbors !== undefined;

          let isNeighbor =  d === currentData || currentData.neighbors.find(n => n === d.id) || currentData.edges.find(n => n === d.id);
          
          if (isNeighbor && isNode){ //add to list of selected neighbors
            if (!isClicked){
              d.userSelectedNeighbors.push(currentData.id);
            } else {
              d.userSelectedNeighbors = d.userSelectedNeighbors.filter(n=>n !== currentData.id);
            }
          } 
          
          if (!isNode && isNeighbor){
            d.selected = d.source.selected || d.target.selected || !d.selected;
          }

          return true;
        };

        // see if there is at least one node 'clicked'
        let hasUserSelection = d3.selectAll('.clicked').size()>0;


        //set the class of everything to 'muted', except for the selected node and it's neighbors;
        d3.select(".nodes")
          .selectAll("g")
          .filter(isNeighbor)
          .classed('muted',d=>{
            return hasUserSelection && d.userSelectedNeighbors.length<1; 
          });
          

        d3.select(".links")
          .selectAll("path")
          .filter(isNeighbor)
          .classed('muted',d=> hasUserSelection && !d.selected);

        // d3.select(".links")
        //   .selectAll(".pathLabel")
        //   .classed("hideLabel", d => !currentData.edges.find(n => n === d.id));

        // console.log('pathData is ',d))
      });

      

      node.append("title").text(function(d) {
        return d.screen_name;
      });
      simulation.nodes(graph.nodes).on("tick", ticked);
      simulation.force("link").links(graph.links);

      // for (var i = 0; i < 1000; ++i) simulation.tick();
      // simulation.stop();

      function arcPath(leftHand, d) {
        var x1 = leftHand ? d.source.x : d.target.x,
          y1 = leftHand ? d.source.y : d.target.y,
          x2 = leftHand ? d.target.x : d.source.x,
          y2 = leftHand ? d.target.y : d.source.y,
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),
          drx = dr,
          dry = dr,
          sweep = leftHand ? 0 : 1;
        siblingCount = countSiblingLinks(graph, d.source, d.target);
        (xRotation = 0), (largeArc = 0);

        if (siblingCount > 1) {
          var siblings = getSiblingLinks(graph, d.source, d.target);
          var arcScale = d3
            .scaleOrdinal()
            .domain(siblings)
            .range([1, siblingCount]);

          drx = drx / (1 + (1 / siblingCount) * (arcScale(d.type) - 1));
          dry = dry / (1 + (1 / siblingCount) * (arcScale(d.type) - 1));
        }

        return (
          "M" +
          x1 +
          "," +
          y1 +
          "A" +
          drx +
          ", " +
          dry +
          " " +
          xRotation +
          ", " +
          largeArc +
          ", " +
          sweep +
          " " +
          x2 +
          "," +
          y2
        );
      }

      function ticked() { updatePos();}

      function updatePos() {
        link.attr("d", function(d) {
          return arcPath(d.source.x < d.target.x, d);
        });

        node.attr("transform", d => {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      updatePos();

      function dragstarted(d) {
        if (!d3.event.active) 
        simulation
        .alphaTarget(0.1)
        .restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        // updatePos();
      }
      function dragended(d) {
        simulation.stop();
        // simulation.velocityDecay(0.9)
        // console.log(simulation.alpha())
        //   if (simulation.apha()>3) simulation.alphaTarget(0);
        //   d.fx = null;
        //   d.fy = null;
      }

    });
  });
 
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
