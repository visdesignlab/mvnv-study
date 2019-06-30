/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global queue, labels*/

//initial state:
const initCalcState = {
  count: {
    count2: {
      count3: 0,
      count4: 1
    }
  }
};

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
var height = 800;
var width = 1800;
var size = 1800; //720;

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
      .attr("width", width) //size + margin.left + margin.right)
      .attr("height", height) //size + margin.top + margin.bottom);
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

  var dragging = false; //flag to dictate whether to draw simulation updates or not;
  // userData["windowWidth"] = $(window).width();
  // userData["windowHeight"] = $(window).height();

  // d3.select("svg").attr('width',userData.windowWidth);

  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 20;

    console.log('width',width, 'height', height)

  //   var color = d3.scaleOrdinal(d3.schemeCategory20);
  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(radius*2.5))
    .force('y', d3.forceY().y(0));


    //Helper functions to compute edge arcs
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

    //add Arrow marker
    svg.append("svg:defs").selectAll("marker")
    .data(["retweet","mentions"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

    // svg.append("symbol")
    // .attr('class','svg-icon')
    // .attr('width','2em')
    // .attr('heigh','2em')
    // .attr('id','personIcon')
    // .attr('viewBox','0 0 20 20')
    // .append('path')
    // .attr('d',"M12.075,10.812c1.358-0.853,2.242-2.507,2.242-4.037c0-2.181-1.795-4.618-4.198-4.618S5.921,4.594,5.921,6.775c0,1.53,0.884,3.185,2.242,4.037c-3.222,0.865-5.6,3.807-5.6,7.298c0,0.23,0.189,0.42,0.42,0.42h14.273c0.23,0,0.42-0.189,0.42-0.42C17.676,14.619,15.297,11.677,12.075,10.812 M6.761,6.775c0-2.162,1.773-3.778,3.358-3.778s3.359,1.616,3.359,3.778c0,2.162-1.774,3.778-3.359,3.778S6.761,8.937,6.761,6.775 M3.415,17.69c0.218-3.51,3.142-6.297,6.704-6.297c3.562,0,6.486,2.787,6.705,6.297H3.415z")


    
    //set up svg and groups for nodes/links
    svg
    .append("g")
    .attr("class", "links")

    svg
    .append("g")
    .attr("class", "nodes")


  d3.json("../public/data/baseState.json", function(config) {
    console.log("config", config);

    d3.json(config.graph, function(graph) {

      // let typeDict = {};
      // graph.nodes.map(n=>{
      //   typeDict[n.id]={screen_name:n.screen_name,type:n.type};
      // })

      // console.log(JSON.stringify(typeDict))
      
      //Create Scales

      //array of colors to iterate through for on-node color encoding, depending on the no. of unique values
      let nodeColorOptions=['#fe9929','#993404','#bdbdbd']

      let nodeColor = d3
        .scaleOrdinal()
        .domain(d3.extent(graph.nodes.map(n => n[config.colorAttr])))
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

      let scaleExtent = d3.extent(friendExtent.concat(followerExtent));

      let barPadding = radius;
      let follower_scale = d3
        .scaleLinear()
        .domain([0, 2000])
        .range([0, 2 * radius - barPadding])
        .clamp(true);

      let friends_scale = d3
        .scaleLinear()
        .domain([0, 2000])
        .range([0, 2 * radius - barPadding])
        .clamp(true);

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

      let link = d3.select('.links')
        .selectAll("path")
        .data(graph.links);

      let linkEnter = link
        .enter()
        .append('g')

        linkEnter
        .append("path")
        .attr("id", d => d.id)
        .attr("class", "links")
        // .attr("marker-mid", d=>"url(#" + d.type + ")");

        linkEnter.append('text')
        .attr('class','edgeArrow')
        .attr('dy',4)
        .append('textPath')
        .attr('startOffset',"50%")
        
        


      // .append("line")

      link.exit().remove();

      link = linkEnter.merge(link);

      link
       .select('path')
        .style("stroke-width", l => edgeScale(l.count))
        .style("stroke", function(d) {
          return edgeColor(d.type);
        })
        .attr('id',d=>d.id)



      link.select('textPath')
      .attr('class',d=>d.type)
      .attr('xlink:href',d=>"#" + d.id)
      .text(d=>config.isDirected ? (d.type === 'mentions' ? '▶' : '◀' ): ''); //only add arrows to directed graphs;
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

    
      var node = d3.select('.nodes')
        .selectAll("g")
        .data(graph.nodes);


        let nodeEnter = node
        .enter()
        .append("g");

      nodeEnter
        .append("rect")
        .attr("class", "node")
        .attr("x", -radius)
        .attr("y", -radius)
        .attr("width", radius * 2)
        .attr("height", radius * 2);

      nodeEnter
        .append("rect")
        .attr("class", "frame")
        .attr("width", radius / 2)
        .attr("x", -radius / 2 - 2)
        .attr("y", -radius + barPadding / 2);

      nodeEnter
        .append("rect")
        .attr("class", "frame")
        .attr("width", radius / 2)
        .attr("x", 2)
        .attr("y", -radius + barPadding / 2);

      nodeEnter
        .append("rect")
        .attr("class", "bar " + config.layout.barAttrs.scale1[0])
        .attr("width", radius / 2)
        .attr("x", -radius / 2 - 2)

      nodeEnter
        .append("rect")
        .attr("class", "bar " + config.layout.barAttrs.scale1[1])
        .attr("width", radius / 2)
        .attr("x", 2)


      nodeEnter.append("rect").attr("class", "labelBackground");


        nodeEnter
        .append("text")
        .attr("dy", "-2em")
        .classed("label", true)

        // nodeEnter
        // .append('use')
        // .attr('xlink:href', "#personIcon")


        
        node.exit().remove();

        node = nodeEnter.merge(node);

        // node.select('.node')
        //   .attr("fill", d => nodeColor(d.type));

          node.select('.node')
          .attr('class',d=>'node ' + d.type)

        node.selectAll('.frame')
          .attr("height", friends_scale.range()[1])

        node.select('.' + config.layout.barAttrs.scale1[0])
          .classed('clipped',d=>d[config.layout.barAttrs.scale1[0]]>friends_scale.domain()[1])
          .attr("height", d => friends_scale(d[config.layout.barAttrs.scale1[0]]))
          .attr("y", d => radius - barPadding / 2 - friends_scale(d[config.layout.barAttrs.scale1[0]]));

        node.select('.' + config.layout.barAttrs.scale1[1])
        .classed('clipped',d=>d[config.layout.barAttrs.scale1[1]]>friends_scale.domain()[1])
          .attr("height", d => friends_scale(d[config.layout.barAttrs.scale1[1]]))
          .attr("y", d => radius - barPadding / 2 - friends_scale(d[config.layout.barAttrs.scale1[1]]));


      node.select('text')
        .text(function(d) {
          return d[config.layout.labelAttr];
        })
        .attr("dx", function(d) {
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
        .attr("height", "1em")
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

      d3.select("#clear-selection").on("click", () => {
        let clearSelection = function(d) {
          let isNode = d.userSelectedNeighbors !== undefined;

          d.selected = false;
          if (isNode) {
            d.userSelectedNeighbors = [];
          }
          return true;
        };

        d3.selectAll(".node").classed("clicked", false);

        d3.select(".nodes")
          .selectAll("g")
          .filter(clearSelection)
          .classed("muted", false);

        d3.select(".links")
          .selectAll("g")
          .filter(clearSelection)
          .classed("muted", false);
      });

      node.on("click", function(currentData) {
        d3.event.stopPropagation();

        let isClicked = d3
          .select(this)
          .select(".node")
          .classed("clicked");

        d3.select(this)
          .selectAll(".node")
          .classed("clicked", !isClicked);

        let isNeighbor = function(d) {
          if (d === currentData) {
            d.selected = !isClicked;
          }

          let isNode = d.userSelectedNeighbors !== undefined;

          let isNeighbor =
            d === currentData ||
            currentData.neighbors.find(n => n === d.id) ||
            currentData.edges.find(n => n === d.id);

          if (isNeighbor && isNode) {
            //add to list of selected neighbors
            if (!isClicked) {
              d.userSelectedNeighbors.push(currentData.id);
            } else {
              d.userSelectedNeighbors = d.userSelectedNeighbors.filter(
                n => n !== currentData.id
              );
            }
          }

          if (!isNode && isNeighbor) {
            d.selected = d.source.selected || d.target.selected || !d.selected;
          }

          return true;
        };

        // see if there is at least one node 'clicked'
        let hasUserSelection = d3.selectAll(".clicked").size() > 0;

        //set the class of everything to 'muted', except for the selected node and it's neighbors;
        d3.select(".nodes")
          .selectAll("g")
          .filter(isNeighbor)
          .classed("muted", d => {
            return hasUserSelection && d.userSelectedNeighbors.length < 1;
          });

        d3.select(".links")
          .selectAll("g")
          .filter(isNeighbor)
          .classed("muted", d => hasUserSelection && !d.selected);

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

      for (var i = 0; i < 2000; ++i) simulation.tick();
      simulation.stop();
      
      
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

      function ticked() {
        if (dragging){
          updatePos();
        }
      }

      function updatePos() {
        link.select('path').attr("d", function(d) {
          return arcPath(d.type === "mentions", d);
        });

        node.attr("transform", d => {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      updatePos();

      //set all nodes to fixed positions. 
      // graph.nodes.map(d=>{d.fx = d.x; d.fy = d.y;});


      function dragstarted(d) {
        // if (!d3.event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
        // dragging = true;
      }
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        d.x = d.fx;
        d.y = d.fy;
        updatePos();
      }
      function dragended(d) {
        // dragging = false;
        // simulation.stop();
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
