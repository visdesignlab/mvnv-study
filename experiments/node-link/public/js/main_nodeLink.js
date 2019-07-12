/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global queue, labels*/

//Global config and graph variables;
//Config is set up in input file and the potentially modified  by user changes to the panel.
//dir and undir graphs store refs to the two flavors of a graph and that can be toggled by the user in the panel

var graph;

var taskNum = 0;
var config;
var allTaskConfigs;
var taskConfigs = {};

//compute default data domains once and use when needed
var defaultDomains = {};

///////////////////////////For Experiment End/////////////////////////////
var colorRange = ["#5e3c99", "#b2abd2", "#fdb863", "#e66101"];
var color = d3
  .scaleQuantize()
  //.range(["#156b87", "#876315", "#543510", "#872815"]); //Original
  //.range(["#56ebd3", "#33837f", "#68c3ef", "#1c4585"]) //Colorgorical, blue-ish
  //.range(['#016c59','#1c9099','#67a9cf','#bdc9e1']) //Colorbrewer2, blue-ish
  .range(colorRange);
var height = 1200;
var width = 1200;
var size = 1800; //720;

var svg;
var margin = { left: 0, right: 100, top: 0, bottom: 0 };

var simulation; //so we're not restarting it every time updateVis is called;

//Function to save exportedGraph to file automatically;
function saveToFile(data, filename) {
  if (!data) {
    console.error("Console.save: No data");
    return;
  }

  if (!filename) filename = "output.json";

  if (typeof data === "object") {
    data = JSON.stringify(data, undefined, 4);
  }

  var blob = new Blob([data], { type: "text/json" }),
    e = document.createEvent("MouseEvents"),
    a = document.createElement("a");

  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
  e.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);
}

//Helper functions to compute edge arcs
function countSiblingLinks(graph, source, target) {
  var count = 0;
  let links = graph.links;

  for (var i = 0; i < links.length; ++i) {
    if (
      (links[i].source.id == source.id && links[i].target.id == target.id) ||
      (links[i].source.id == target.id && links[i].target.id == source.id)
    )
      count++;
  }
  return count;
}

function getSiblingLinks(graph, source, target) {
  var siblings = [];
  let links = graph.links;
  for (var i = 0; i < links.length; ++i) {
    if (
      (links[i].source.id == source.id && links[i].target.id == target.id) ||
      (links[i].source.id == target.id && links[i].target.id == source.id)
    )
      siblings.push(links[i].type);
  }
  return siblings;
}

// Single function to put chart into specified target
function loadVis(id) {
  d3.select("#panelControl").on("click", () => {
    let panel = d3.select("#panelDiv");
    let isVisible = panel.style("display") === "block";
    panel.style("display", isVisible ? "none" : "block");
  });
  svg = d3
    .select("#" + id)
    .append("svg")
    .attr("id", "node-link-svg")
    .attr("width", width) //size + margin.left + margin.right)
    .attr("height", height);

  //set up svg and groups for nodes/links
  svg.append("g").attr("class", "links");

  svg.append("g").attr("class", "nodes");

  simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody()) //.strength(-800))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // .force("y", d3.forceY().y(0));


  //Set up 'selected values' for ui elements;

    //Load up new graph based on graph directionality selection
    d3.selectAll("input[type='radio']").on("change", function() {

    // console.log(this.name,this.value)
      config[this.name] = this.name === 'graphSize'? this.value : eval(this.value);
  
      let file =  config.graphSize + 
      ( config.isDirected ? '_directed' : '_undirected' ) +
      ( config.isMultiEdge ? '_multiEdge' : '_singleEdge' ) 

      console.log('will load in ', file, config.graphFiles[file])
      
      loadNewGraph(config.graphFiles[file]);
    });


  d3.select("#exportConfig").on("click", function() {
    console.log("saving to file");
    saveToFile(config, "config.json");
  });

  //Load up list of tasks here ** TO DO ** 

    //load in the first taskConfig
    loadConfigs("../../configs/task1Config.json");



}

function setPanelValuesFromFile() {

   //create internal dictionary of defaultDomains for each attribute;
  
  [['node','nodes'],['edge','links']].map(node_edge=>{
    Object.keys(config.attributeScales[node_edge[0]]).map(attr=>{
      let graphElements = graph[node_edge[1]]
      //use d3.extent for quantitative attributes
        if (typeof graphElements[0][attr] === typeof 2){
          defaultDomains[attr] = d3.extent(graphElements, n => n[attr])
        } else {
          //use .filter to find unique categorical values
          defaultDomains[attr] = graphElements
            .map(n => n[attr])
            .filter((value, index, self) => self.indexOf(value) === index)
        } 
        
      //set domainValues in config.attributeScales if there are none
      config.attributeScales[node_edge[0]][attr].domain =  config.attributeScales[node_edge[0]][attr].domain || defaultDomains[attr] 
    });
  })


  d3.select("#fontSlider").on("input", function() {
    d3.select("#fontSliderValue").text(this.value);
    config.labelSize = eval(this.value);
  });

  d3.select("#fontSlider").on("change", function() {
    updateVis();
  });

  d3.select("#markerSize").property(
    "value",
    config.nodeWidth + "," + config.nodeHeight
  );

  d3.select("#markerSize").on("change", function() {
    let markerSize = this.value.split(",");
    config.nodeWidth = eval(markerSize[0]);
    config.nodeHeight = eval(markerSize[1]);
    updateVis();
  });

  //set Panel Values

  d3.selectAll("input[name='isDirected']")
    .filter(function() {
      return d3.select(this).property("value") === config.isDirected.toString();
    })
    .attr("checked", "checked");

    //cannot have directed graph that is of single edge type, so disable that if it is the case;
    d3.selectAll("input[name='isDirected']")
    .property("disabled", function(){
      return  eval(d3.select(this).property("value")) === true && config.isMultiEdge === false;
    })

  d3.selectAll("input[name='isMultiEdge']")
    .filter(function() {
      return (
        d3.select(this).property("value") === config.isMultiEdge.toString()
      );
    })
    .attr("checked", "checked");

  //cannot have directed graph that is of single edge type, so disable that if it is the case;
      d3.selectAll("input[name='isMultiEdge']")
      .property("disabled", function(){
        return  eval(d3.select(this).property("value")) === false && config.isDirected === true;
      })

  d3.select("#renderBarsCheckbox").property("checked", config.drawBars);

  //get attribute list from baseConfig file;
  let nodeAttrs = Object.entries(config.attributeScales.node);
  let edgeAttrs = Object.entries(config.attributeScales.edge);

  let menuItems = [
    {
      name: "nodeFillSelect",
      type: typeof "string",
      configAttr: "nodeFillAttr"
    },
    { 
      name: "nodeSizeSelect", 
      type: typeof 2, 
      configAttr: "nodeSizeAttr" 
    },
    {
      name: "edgeStrokeSelect",
      type: typeof "string",
      configAttr: "edgeStrokeAttr"
    },
    {
      name: "edgeWidthSelect",
      type: typeof 2,
      configAttr: "edgeWidthAttr"
    },
    // {
    //   name: "nodeQuantSelect",
    //   type: typeof 2,
    //   configAttr: "quantAttrs"
    // },
    {
      name: "nodeCatSelect",
      type: typeof "string",
      configAttr: "catAttrs"
    },
    {
      name: "nodeQuantAttributes",
      type: typeof 2,
      configAttr: undefined
    }
  ];

  menuItems.map(m => {
    let item = d3.select("#" + m.name);

    let isNode = m.name.includes("node");
    let isCategorical = m.type === typeof "string";

    let menuOptions = isNode ? nodeAttrs : edgeAttrs;
    let attrScales = isNode ? config.attributeScales.node : config.attributeScales.edge;

    //filter to only those that match the type 
    menuOptions = menuOptions.filter(option=>{
      return option[1].range && isCategorical || !option[1].range && !isCategorical
    }).map(d=>{return {attr:d[0],domain:d[1].domain}})

    //for quant attributes domain input boxes
      d3.select("#" + m.name)
        .select("input")
        .property("value", () =>  "[" + attrScales[config[m.configAttr]].domain + "]");

      let selectMenu = item.select("select")
        .selectAll("option")
        .data(menuOptions);

        let selectEnter = selectMenu
        .enter()
        .append("option");

        selectMenu.exit().remove();

        selectMenu = selectEnter.merge(selectMenu);


        selectMenu
        .attr("value", d => d.attr)
        .text(d => d.attr);

        selectMenu
        .selectAll("option")
        .filter((d, i) => config[m.configAttr] === d.attr)
        .property("selected", true);

      //  //Set up callbacks for the config panel on the left.
      item.select("select").on("change", function() {
        console.log('value is ', this.value)
        createHist(
          this.value,
          d3.select("#" + m.name + "_histogram"),
          isNode ? graph.nodes : graph.links
        );
      });

      //set selected element according to config file;

      //add svgs for quant attr selectors
      if (m.type !== typeof "string") {
        let newSvg = item.selectAll("svg").data([0]);

        let svgEnter = newSvg.enter().append("svg");

        newSvg = svgEnter.merge(newSvg);

        newSvg.attr("id", m.name + "_histogram");

        let attr = m.configAttr
          ? config[m.configAttr]
          : config.quantAttrs[0];
        createHist(attr, newSvg, isNode ? graph.nodes : graph.links);
      }
    
  });

  //set behavior for bar selections

  let barAttrs = config.quantAttrs;

  let section = d3.select("#nodeQuantSelect").select("ul");

    //filter to only those that are quantitative 
    attrOptions = nodeAttrs.filter(option=>{
      return !option[1].range 
    }).map(d=>{return {attr:d[0],domain:d[1].domain}})

  let fields = section.selectAll(".field").data(attrOptions);

  let fieldsEnter = fields
    .enter()
    .append("div")
    .attr("class", "field");

  fieldsEnter
    .append("input")
    .attr("class", "is-checkradio")
    .attr("type", "checkbox");

  fieldsEnter.append("label");

  fieldsEnter
    .append("div")
    .attr("class", "control is-inline-flex")
    .append("input")
    .attr("class", "input domain")
    .attr("type", "text")
    .attr("placeholder", "[min,max]");

  fields.exit().remove();

  fields = fieldsEnter.merge(fields);

  fields.select(".domain").property("value", d => "[" + d.domain + "]")

  fields
    .select(".is-checkradio")
    .attr("id", d => d.attr + "-checkbox")
    .attr("name", d => d.attr + "-checkbox")
    .property("checked", d => {
      return barAttrs.includes(d.attr) ? "checked" : false;
    })
    .on("change", function(d) {
      let includeAttr = d3.select(this).property("checked");
      if (includeAttr) {
        config.quantAttrs.push(d.attr);

        //call createHist for that attribute
        d3.select("#nodeQuantAttributes")
          .selectAll("option")
          .filter((opt, i) => {
            return d.attr === opt.attr;
          })
          .property("selected", true);

        createHist(
          d.attr,
          d3.select("#nodeQuantAttributes_histogram"),
          graph.nodes
        );
        updateVis();
      } else {
        config.quantAttrs = config.quantAttrs.filter(el => el !== d.attr);
        updateVis();
      }
    });

  fields
    .select("label")
    .attr("id", d => d.attr + "-label")
    .attr("for", d => d.attr + "-checkbox")
    .text(d => d.attr);

  fields
    .select(".domain")
    .attr("id", d => d.attr + "-domain")
    .on("change", function(d) {
       if (this.value){
        config.attributeScales.node[d.attr].domain = eval(this.value);
       } else {
        // if value is empty, use 'default ranges';
         this.value = '[' + defaultDomains[d.attr] + ']'
         config.attributeScales.node[d.attr].domain = eval(this.value);
       }
      
      updateVis();

      //call createHist for that attribute
      d3.select("#nodeQuantAttributes")
        .selectAll("option")
        .filter((opt, i) => {
          return d.attr === opt.attr;
        })
        .property("selected", true);

      createHist(
        d.attr,
        d3.select("#nodeQuantAttributes_histogram"),
        graph.nodes
      );
    });


 

  d3.select("#nodeFillSelect")
    .select("select")
    .on("change", function() {
      config.nodeFillAttr = this.value;
      config.drawBars = false;

      d3.select("#renderBarsCheckbox").property("checked", false);
      updateVis();
    });

  d3.select("#nodeStrokeSelect")
    .select("select")
    .on("change", function() {
      config.nodeStroke = this.value;
      // config.drawBars = false;

      // d3.select('#renderBarsCheckbox').property('checked', false)
      updateVis();
    });

  d3.select("#nodeSizeSelect")
    .select("select")
    .on("change", function() {
      config.nodeSizeAttr = this.value;
      config.drawBars = false;

      d3.select("#renderBarsCheckbox").property("checked", false);

      createHist(
        this.value,
        d3.select("#nodeSizeSelect_histogram"),
        graph.nodes
      );

      d3.select("#nodeSizeSelect")
        .select("input")
        .property("value", () => "[" +  config.attributeScales.node[config.nodeSizeAttr].domain + "]");

      // config.drawBars = false;

      // d3.select('#renderBarsCheckbox').property('checked', false)
      updateVis();
    });

    d3.select("#nodeSizeSelect")
    .selectAll("option")
    .property("selected", (d)=>d.attr === config.nodeSizeAttr);

    d3.select("#nodeSizeSelect")
      .select("input")
      .on("change", function(){

        console.log ( 'd is ' , config.nodeSizeAttr )
       if (this.value){
        config.attributeScales.node[config.nodeSizeAttr].domain = eval(this.value);
       } else {
        // if value is empty, use 'default ranges';
         this.value = '[' + defaultDomains[config.nodeSizeAttr] + ']'
         config.attributeScales.node[config.nodeSizeAttr].domain = eval(this.value);
       }

       console.log('new domain is', config.attributeScales.node[config.nodeSizeAttr])

       //also update the string for the corresponding domain input above
       d3.select("#" + config.nodeSizeAttr + "-domain")
       .property("value", () => "[" +  config.attributeScales.node[config.nodeSizeAttr].domain + "]");


 
      createHist(
        config.nodeSizeAttr,
        d3.select("#nodeSizeSelect_histogram"),
        graph.nodes
      );
           
      updateVis();

    });

  d3.select("#renderBarsCheckbox").on("input", function() {
    config.drawBars = d3.select(this).property("checked");

    updateVis();
  });

  d3.select("#edgeWidthScale").on("change", function() {
    config.edgeWidth.domain = eval(this.value);

    updateVis();
  });

  d3.select("#edgeWidthScale").on("change", function() {
    config.edgeWidth.domain = eval(this.value);

    updateVis();
  });

  //create nested quant attribute scales
}

function createHist(attrName, svgSelection, data, categorical = false) {
  let nBins = 10;

  let margin = { top: 20, right: 10, bottom: 50, left: 20 },
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  let histHeight = height;

  // x scale for time

  // check to see if a domain has been hard coded;
  let scale = config.attributeScales.node[attrName];

  domain = scale ? scale.domain : d3.extent(data, n => n[attrName]);

  var x = d3
    .scaleLinear()
    .domain(domain)
    .range([0, width])
    .clamp(true)
    .nice(nBins);

  // if (categorical){
  //      // x scale for time
  //  x = d3.scaleBand()
  // .domain(d3.extent(data,n=>n[attrName]))
  // .range([0, width])
  // }

  // y scale for histogram
  var y = d3.scaleLinear().range([histHeight, 0]);

  var colours = d3
    .scaleOrdinal()
    .range([
      "#ffc388",
      "#ffb269",
      "#ffa15e",
      "#fd8f5b",
      "#f97d5a",
      "#f26c58",
      "#e95b56",
      "#e04b51",
      "#d53a4b",
      "#c92c42",
      "#bb1d36",
      "#ac0f29",
      "#9c0418",
      "#8b0000"
    ]);

  // set parameters for histogram
  var histogram = d3
    .histogram()
    .value(function(d) {
      return d[attrName];
    })
    .domain(x.domain())
    .thresholds(x.ticks(nBins));

  var svg = svgSelection
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var hist = svg.selectAll(".histogram").data([0]);

  let histEnter = hist
    .enter()
    .append("g")
    .attr("class", "histogram")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  hist.exit().remove();

  hist = histEnter.merge(hist);

  ////////// load data //////////

  // group data for bars
  var bins = histogram(data);

  // console.log('bins', bins)

  // y domain based on binned data
  y.domain([
    0,
    d3.max(bins, function(d) {
      return d.length;
    })
  ]);

  colours.domain(bins.map(b => b.length).sort());

  var bar = hist.selectAll(".barGroup").data(bins);

  barEnter = bar
    .enter()
    .append("g")
    .attr("class", "barGroup");

  barEnter
    .append("rect")
    .attr("class", "bar")
    .attr("x", 1);

  barEnter
    .append("text")
    .attr("dy", "-.1em")
    // .attr("y", "0")
    .attr("text-anchor", "middle")
    .style("fill", "black");

  bar.exit().remove();

  bar = barEnter.merge(bar);

  bar.attr("transform", function(d) {
    return "translate(" + x(d.x0) + "," + y(d.length) + ")";
  });

  bar
    .select("rect")
    .attr("width", function(d) {
      return x(d.x1) - x(d.x0);
    })
    .attr("height", function(d) {
      return histHeight - y(d.length);
    })
    .attr("fill", function(d) {
      return colours(d.length);
    });

  bar
    .select("text")
    .attr("x", function(d) {
      return (x(d.x1) - x(d.x0)) / 2;
    })
    .text(d => (d.length > 0 ? d.length : ""));

  ////////// slider //////////

  var currentValue = 0;

  var slider = svg.selectAll(".slider").data([0]);

  let sliderEnter = slider
    .enter()
    .append("g")
    .attr("class", "slider")
    .attr(
      "transform",
      "translate(" + margin.left + "," + (margin.top + histHeight) + ")"
    );

  sliderEnter
    .insert("g")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 15 + ")");

  slider.exit().remove();

  slider = sliderEnter.merge(slider);

  slider;

  let text = slider
    .select(".ticks")
    .selectAll("text")
    .data(x.ticks(nBins));

  let textEnter = text
    .enter()
    .append("text")
    .attr("text-anchor", "middle");

  text.exit().remove();

  text = textEnter.merge(text);

  text
    .attr("transform", d => "translate(" + x(d) + ",10) rotate(-30)")
    .text(d => {
      let format = d < 1000 ? d3.format("2.0s") : d3.format(".2s");

      return format(d);
    });
}
function updateVis() {
  //choose which graph to render;

  let nodeMarkerLength = config.nodeWidth || 60;
  let nodeMarkerHeight = config.nodeHeight || 35;

  config.nodeIsRect = config.drawBars;

  //Create Scales

  let nodeLength = function(node) {

    let nodeSizeScale = d3
    .scaleLinear()
    .range([nodeMarkerLength/2, nodeMarkerLength * 2])
    .clamp(true);
    
    //if an attribute has been assigned to nodeSizeAttr, set domain
    if (config.nodeSizeAttr){
     nodeSizeScale
      .domain(config.attributeScales.node[config.nodeSizeAttr].domain)
    }

    let value =
        config.nodeSizeAttr && !config.drawBars
        ? nodeSizeScale(node[config.nodeSizeAttr])
        : nodeMarkerLength;
        //make circles a little larger than just the radius of the marker;
    return config.nodeIsRect ? value : value * 1.3;
  };

  let nodeHeight = function(node) {

    let nodeSizeScale = d3
    .scaleLinear()
    .range([nodeMarkerHeight/2, nodeMarkerHeight * 2])
    .clamp(true);
    
    //if an attribute has been assigned to nodeSizeAttr, set domain
    if (config.nodeSizeAttr){
     nodeSizeScale
      .domain( config.attributeScales.node[config.nodeSizeAttr].domain)
    }

    let value =
    config.nodeSizeAttr && !config.drawBars
        ? nodeSizeScale(node[config.nodeSizeAttr])
        : nodeMarkerHeight;
    return config.nodeIsRect ? value : value * 1.3;
  };

  let nodeFill = function(node) {
    let nodeFillScale = d3
      .scaleOrdinal()
      

    //if an attribute has been assigned to nodeFillAttr, set domain
    if (config.nodeFillAttr){
      nodeFillScale
       .domain( config.attributeScales.node[config.nodeFillAttr].domain)
       .range(config.attributeScales.node[config.nodeFillAttr].range);
     }

    let value =
        config.nodeFillAttr && !config.drawBars
          ? nodeFillScale(node[config.nodeFillAttr])
          : config.noNodeFill;

    return value;
  };
  
  //function to determine fill color of nestedCategoricalMarks
  let catFill = function(attr,value) {

    //assume there are defined domain and ranges for these
    let nodeFillScale = d3
      .scaleOrdinal()
      .domain( config.attributeScales.node[attr].domain)
      .range(config.attributeScales.node[attr].range);
      
    return nodeFillScale(value);

  };

  let nodeStroke = function(node) {
    return node.selected ? config.selectedNodeColor : config.noNodeStroke; 
  };

  let edgeColor = function(edge) {
    let edgeStrokeScale = d3
      .scaleOrdinal()
      .domain(config.attributeScales.edge[config.edgeStrokeAttr].domain)
      .range(config.attributeScales.edge[config.edgeStrokeAttr].range);

    let value = config.edgeStrokeAttr
      ? edgeStrokeScale(edge[config.edgeStrokeAttr])
      : config.noEdgeColor;
    return value;
  };

  let edgeWidth = function(edge) {
    let edgeWidthScale = d3
      .scaleLinear()
      .domain(config.attributeScales.edge[config.edgeWidthAttr].domain)
      .clamp(true)
      .range([2, 10]);

    let value = config.edgeWidthAttr
      ? edgeWidthScale(edge[config.edgeWidthAttr])
      : config.noEdgeColor;
    return value;
  };

  //create scales for bars;
  let barAttributes = config.quantAttrs;

  //object to store scales as a function of attr name;
  let scales = {};
  let scaleColors = {}; //Object to store which color to use for which scales

  let barPadding = 3;

  barAttributes.map((b, i) => {
    let scale = d3
      .scaleLinear()
      .domain(config.attributeScales.node[b].domain)
      .range([0, nodeMarkerHeight - 2 * barPadding])
      .clamp(true);

    let domainKey = scale.domain().join("-");
    scaleColors[domainKey] = "";

    //save scale and color to use with that attribute bar
    scales[b]= { scale, domainKey};
  });

  //Assign one color per unique domain;
  Object.keys(scaleColors).map((domainKey, i) => {
    scaleColors[domainKey] = config.quantColors[i];
  });

  Object.keys(scales).map(
    s => (scales[s].fill = scaleColors[scales[s].domainKey])
  );

  //Drawing Graph
  {
    //Draw Links
    let link = d3
      .select(".links")
      .selectAll(".linkGroup")
      .data(graph.links);

    let linkEnter = link
      .enter()
      .append("g")
      .attr("class", "linkGroup");

    linkEnter.append("path").attr("class", "links");

    linkEnter
      .append("text")
      .attr("class", "edgeArrow")
      .attr("dy", 4)
      .append("textPath")
      .attr("startOffset", "50%");

    link.exit().remove();

    link = linkEnter.merge(link);

    link
      .select("path")
      .style("stroke-width", edgeWidth)
      .style("stroke", edgeColor)
      .attr("id", d => d.id);

    // TO DO , set ARROW DIRECTION DYNAMICALLY
    link
      .select("textPath")
      .attr("xlink:href", d => "#" + d.id)
      .text(d => (config.isDirected ? (d.type === "mentions" ? "▶" : "◀") : ""))
      .style("fill", edgeColor)
      .style("stroke", edgeColor);

    //draw Nodes
    var node = d3
      .select(".nodes")
      .selectAll(".nodeGroup")
      .data(graph.nodes);

    let nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "nodeGroup");

    nodeEnter.append("rect").attr("class", "node");

    nodeEnter.append("rect").attr("class", "labelBackground");

    nodeEnter.append("text").classed("label", true);

    node.exit().remove();

    node = nodeEnter.merge(node);

    node
      .select(".node")
      .attr("x", d => -nodeLength(d) / 2)
      .attr("y", d => -nodeHeight(d) / 2)
      .attr("width", nodeLength)
      .attr("height", d => nodeHeight(d))
      .style("fill", nodeFill)
      .style("stroke", nodeStroke)
      .attr("rx", d =>
        config.nodeIsRect ? nodeLength(d) / 20 : nodeLength(d) / 2
      )
      .attr("ry", d =>
        config.nodeIsRect ? nodeHeight(d) / 20 : nodeHeight(d) / 2
      );

    node
      .select("text")
      .style("font-size", config.labelSize)
      .text(d => d[config.labelAttr])
      .attr("y", d =>
        config.drawBars ? -nodeHeight(d) * 0.5 - 4 : ".5em"
      )
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
      .attr("width", function(d) {
        let textWidth = d3
          .select(d3.select(this).node().parentNode)
          .select(".label")
          .node()
          .getBBox().width;

        //make sure label box spans the width of the node
        return d3.max([textWidth, nodeLength(d) + 4]);
      })
      .attr("height", "1em")
      .attr("x", function(d) {
        let textWidth = d3
          .select(d3.select(this).node().parentNode)
          .select("text")
          .node()
          .getBBox().width;

        //make sure label box spans the width of the node
        return d3.min([-textWidth / 2, -nodeLength(d) / 2 - 2]);
      })
      .attr("y", d =>
        config.drawBars ? -nodeHeight(d) * 0.5 - 16 : "-.5em"
      );

    node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
  }

  //Drawing Nested Bar Charts
  {
    // //  Separate enter/exit/update for bars so as to bind to the correct data;

    let drawCircles = Object.keys(config.catAttrs).length > 0;
    let circleRegion = drawCircles ? nodeMarkerLength * 0.4 : 0;
    let circleRadius = drawCircles ? nodeMarkerHeight * 0.2 : 0;
    let circlePadding = drawCircles ? 5 : 0;

    let barAttrs = config.drawBars ? Object.keys(scales) : [];
    let numBars = barAttrs.length;
    let nodeWidth =
      nodeMarkerLength - barPadding - circleRadius - circlePadding;
    let barWidth = nodeWidth / numBars - barPadding;

    let scaleStart = -nodeMarkerLength / 2 + barPadding;
    let scaleEnd = scaleStart + (numBars - 1) * (barWidth + barPadding);

    let barXScale = d3
      .scaleLinear()
      .domain([0, numBars - 1])
      .range([scaleStart, scaleEnd]);

    let bars = node
      .selectAll(".bars")
      //for each bar associate the relevant data from the parent node, and the attr name to use the correct scale
      .data(d =>
        barAttrs.map(b => {
          return { data: d[b], attr: b };
        })
      );

    let barsEnter = bars
      .enter()
      .append("g")
      .attr("class", "bars");

    barsEnter
      .append("rect")
      .attr("class", "frame")
      .append("title");

    barsEnter
      .append("rect")
      .attr("class", "bar")
      .append("title");

    bars.exit().remove();

    bars = barsEnter.merge(bars);

    bars.selectAll("rect").attr("width", barWidth);

    bars.selectAll("title").text(function(d) {
      return d.attr + " : " + d.data;
    });

    bars.attr("transform", (d, i) => {
      return "translate(" + barXScale(i) + ",0)";
    });

    bars
      .select(".frame")
      .attr("height", d => scales[d.attr].scale.range()[1])
      .attr("y", d => -scales[d.attr].scale.range()[1] / 2)
      .style("stroke", d => scales[d.attr].fill);

    bars
      .select(".bar")
      .classed("clipped", d => d.data > scales[d.attr].scale.domain()[1])
      .attr("height", d => scales[d.attr].scale(d.data))
      .attr(
        "y",
        d => nodeMarkerHeight / 2 - barPadding - scales[d.attr].scale(d.data)
      )
      .style("fill", d => scales[d.attr].fill);

    d3.select("#nodeBarsSelect")
      .selectAll("label")
      .style("color", "#a6a6a6")
      .style("font-weight", "normal");

    //color the text from the panel accordingly
    barAttrs.map(attr => {
      d3.select("#" + attr + "-label")
        .style("color", scales[attr].fill)
        .style("font-weight", "bold");
    });

    let circleAttrs = config.drawBars ? config.catAttrs : [];

    let circleYScale = d3
      .scaleLinear()
      .domain([0, circleAttrs.length - 1])
      .range([-nodeMarkerHeight * 0.2, nodeMarkerHeight * 0.2]);

    let circles = node
      .selectAll(".categorical")
      //for each circle associate the relevant data from the parent node
      .data(d =>
        circleAttrs.map(attr => {
          return {data: d[attr],attr};
        })
      );

    let circleEnter = circles
      .enter()
      .append("circle")
      .attr("class", "categorical")
      .attr("r", circleRadius);

    circles.exit().remove();

    circles = circleEnter.merge(circles);

    circles
      .attr("cx", circleRegion)
      .attr("cy", (d, i) => circleYScale(i))
      .style("fill", d => catFill(d.attr,d.data));
  }

  d3.select("#exportGraph").on("click", () => {
    let graphCopy = JSON.parse(JSON.stringify(graph));

    graphCopy.links.map(l => {
      l.index = undefined;
      l.source = l.source.id;
      l.target = l.target.id;
    });
    graphCopy.nodes.map(n => {
      n.index = undefined;
      n.vx = undefined;
      n.vy = undefined;
      n.fx = n.x;
      n.fy = n.y;
    });

    // let parseInputFilename =
    // let filename = config.isDirected ? config.directedGraph : config.undir_graph;

    console.log(JSON.stringify(graphCopy));
  });

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
      .selectAll(".nodeGroup")
      .filter(clearSelection)
      .classed("muted", false);

    d3.select(".links")
      .selectAll(".linkGroup")
      .filter(clearSelection)
      .classed("muted", false);

    node
      .select(".node")
      .style("fill", nodeFill)
      .style("stroke", nodeStroke);
  });

  node.on("click", function(currentData) {
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

      //isNeighbor only if config.interaction.selectNeighbors is set to true.
      let isNeighbor =
        d === currentData ||
        currentData.neighbors.find(n => n === d.id) ||
        currentData.edges.find(n => n === d.id);
      if (config.selectNeighbors) {
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
      }

      return true;
    };

    // see if there is at least one node 'clicked'
    let hasUserSelection = d3.selectAll(".node.clicked").size() > 0;

    //set the class of everything to 'muted', except for the selected node and it's neighbors;
    d3.select(".nodes")
      .selectAll(".nodeGroup")
      .filter(isNeighbor)
      .classed("muted", d => {
        return (
          config.selectNeighbors &&
          hasUserSelection &&
          d.userSelectedNeighbors.length < 1
        );
      });

    d3.select(".links")
      .selectAll(".linkGroup")
      .filter(isNeighbor)
      .classed(
        "muted",
        d =>
          config.selectNeighbors && hasUserSelection && !d.selected
      );

    node
      .select(".node")
      .style("fill", nodeFill)
      .style("stroke", nodeStroke);
  });

  //set up simulation
  simulation.nodes(graph.nodes).on("tick", ticked);
  simulation.force("link").links(graph.links);
  simulation.force("collision", d3.forceCollide().radius(d => nodeLength(d)));

    //if source/target are still strings from the input file
    if (graph.links[0].source.id === undefined) {
      //restablish link references to their source and target nodes;
      graph.links.map(l => {
        l.source = graph.nodes.find(n => n.id === l.source) || l.source;
        l.target = graph.nodes.find(n => n.id === l.target) || l.target;
      });
    }
    //check to see if there are already saved positions in the file, if not
    //run simulation to get fixed positions;

    //remove collision force
    // simulation.force('collision',null);

    if (graph.nodes[0].fx === undefined) {
      for (var i = 0; i < 2000; ++i) simulation.tick();
      simulation.stop();

      // //put the collision force back in
      // simulation.force(
      //   "collision",
      //   d3.forceCollide().radius(d => nodeLength(d))
      // );

      // for (var i = 0; i < 1000; ++i) simulation.tick();
      //   simulation.stop();

      graph.nodes.map(n => {
        n.fx = n.x;
        n.fy = n.y;
        n.savedX = n.fx;
        n.savedY = n.fy;
      });
    } else {
      graph.nodes.map(n => {
        n.fx = n.savedX;
        n.fy = n.savedY;
        n.x = n.savedX;
        n.y = n.savedY;
      });
    }
    updatePos();
   
  
  // else {
  //   graph.nodes.map(n => {
  //     n.x = 0;
  //     n.y = 0;
  //     n.vx = null;
  //     n.vy = null;
  //     n.fx = null;
  //     n.fy = null;
  //   });

  //   for (var i = 0; i < 2000; ++i) simulation.tick();
  //   simulation.stop();

  //   //  add a collision force that is proportional to the radius of the nodes;
  //   simulation.force("collision", d3.forceCollide().radius(d => nodeLength(d)));

  //   simulation.alphaTarget(0.1).restart();
  // }

  d3.select("#stop-simulation").on("click", () => {
    simulation.stop();
    graph.nodes.map(n => {
      n.savedX = n.x;
      n.savedY = n.y;
    });
  });

  d3.select("#start-simulation").on("click", () => {
    simulation.alphaTarget(0.1).restart();
  });

  d3.select("#release-nodes").on("click", () => {
    graph.nodes.map(n => {
      n.fx = null;
      n.fy = null;
    });
    simulation.alphaTarget(0.1).restart();
  });

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
    updatePos();
  }

  function updatePos() {
    d3.selectAll(".linkGroup")
      .select("path")
      .attr("d", function(d) {
        let path = arcPath(d.type === "mentions", d);
        if (path.includes("null")) {
          console.log("bad path");
        }
        return path;
      });

    let radius = nodeMarkerLength / 2;

    d3.selectAll(".nodeGroup").attr("transform", d => {
      d.x = Math.max(radius, Math.min(width - radius, d.x));
      d.y = Math.max(radius, Math.min(height - radius, d.y));
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

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
    d.x = d3.event.x;
    d.y = d3.event.y;
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
}

function loadConfigs(taskConfigFile) {
  //load base configuration for all tasks
  d3.json("../../configs/baseConfig.json", function(baseConfig) {
    //load task specific configuration
    d3.json(taskConfigFile, function(taskConfig) {
      //rehape relevant config values into a single dictionary.
      config = {
        ...baseConfig,
        ...baseConfig.nodeLink,
        ...baseConfig.style,
        ...taskConfig,
        ...taskConfig.nodeLink
      };

      delete config.nodeLink;
      delete config.adjMatrix;
      delete config.style;

      console.log("new config is ", config);

      loadNewGraph(config.graphFiles[config.loadedGraph])
    });
  });
}

function loadNewGraph(fileName){

     //load in actual graph data
     d3.json(fileName, function(fileGraph) {
      //save as global variable
      graph = fileGraph;

      console.log("loaded graph is ", graph);
      graph.nodes.map(n => {
        (n.savedX = n.fx), (n.savedY = n.fy);
      });

      setPanelValuesFromFile();
      updateVis();
    });

}


function drawVis() {
  //read in configuration file;
  d3.json("../public/data/task_config.json", function(taskConfig) {
    //load in the three configs first;
    allTaskConfigs = taskConfig;

    let task = allTaskConfigs.tasks[taskNum];

    console.log(taskNum, task);

    d3.select("#taskArea")
      .select(".card-header-title")
      .text(task.prompt);

    d3.json("../public/task_configs/" + task.id + "_config1.json", function(
      config1
    ) {
      // console.log('loaded in config1', config1);

      taskConfigs.config1 = config1;

      d3.json("../public/task_configs/" + task.id + "_config2.json", function(
        config2
      ) {
        taskConfigs.config2 = config2;

        d3.json("../public/task_configs/" + task.id + "_config3.json", function(
          config3
        ) {
          taskConfigs.config3 = config3;
          config = JSON.parse(JSON.stringify(taskConfigs.config1));
          loadGraphs(config.graphSize, config.multiEdgeTypes);

          d3.select("#config1").on("click", () => applyConfig("config1"));

          d3.select("#config2").on("click", () => applyConfig("config2"));

          d3.select("#config3").on("click", () => applyConfig("config3"));

          let applyConfig = function(configNo) {
            d3.select("#taskArea")
              .selectAll(".button")
              .classed("clicked", false);
            d3.select("#" + configNo).classed("clicked", true);
            config = JSON.parse(JSON.stringify(taskConfigs[configNo]));
            updateVis();
            setPanelValuesFromFile();
          };

          d3.select("#next").on("click", () => {
            taskNum = d3.min([taskNum + 1, allTaskConfigs.tasks.length - 1]);
            drawVis();
            applyConfig("config1");
          });

          d3.select("#previous").on("click", () => {
            taskNum = d3.max([taskNum - 1, 0]);
            drawVis();
            applyConfig("config1");
          });
        });
      });
    });
  });
}

function loadGraphs(size, multiEdgeTypes = config.multiEdgeTypes) {
  //load undirected graph specified in configuration file;
  let edgeType = multiEdgeTypes ? "multiEdge" : "singleEdge";
  d3.json(config.graph[size] + "_undirected_" + edgeType + ".json", function(
    undir_graph_from_file
  ) {
    //load directed graph specified in configuration file;
    d3.json(config.graph[size] + "_directed_" + edgeType + ".json", function(
      dir_graph_from_file
    ) {
      dir_graph = dir_graph_from_file || undir_graph_from_file;
      undir_graph = undir_graph_from_file;

      //save positions to revert to later if needed;
      dir_graph.nodes.map(n => {
        (n.savedX = n.fx), (n.savedY = n.fy);
      });
      undir_graph.nodes.map(n => {
        (n.savedX = n.fx), (n.savedY = n.fy);
      });
      setPanelValuesFromFile();

      updateVis();
    });
  });
}
