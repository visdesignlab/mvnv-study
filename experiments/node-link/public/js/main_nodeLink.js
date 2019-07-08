/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global queue, labels*/

//Global config and graph variables;
//Config is set up in input file and the potentially modified  by user changes to the panel.
//dir and undir graphs store refs to the two flavors of a graph and that can be toggled by the user in the panel
var config;
var dir_graph;
var undir_graph;

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

var svg;
var margin = { left: 0, right: 100, top: 0, bottom: 0 };

// Single function to put chart into specified target
function loadVis(id) {
  svg = d3
    .select("#" + id)
    .append("svg")
    .attr("width", width) //size + margin.left + margin.right)
    .attr("height", height);

  //set up svg and groups for nodes/links
  svg.append("g").attr("class", "links");

  svg.append("g").attr("class", "nodes");

  drawVis();

  //Set up 'selected values' for ui elements;

  //Set up callbacks for the config panel on the left.
  d3.selectAll("input[name='isDirected']").on("change", function() {
    config.isDirected = eval(this.value);
    updateVis();
  });

  d3.selectAll("input[name='fixedPositions']").on("change", function() {
    config.fixedPositions = eval(this.value);
    updateVis();
  });
}

function setPanelValuesFromFile(config, graph) {
  // set callback for changes in the size slider;
  d3.select("#sizeSlider").on("input", function() {
    d3.select("#sliderValue").text(this.value);
  });

  d3.select("#sizeSlider").on("change", function() {
    //subsample graph and call updateVis();
  });

  d3.select("#fontSlider").on("input", function() {
    d3.select("#fontSliderValue").text(this.value);

    config.style.labelSize = eval(this.value);
  });

  d3.select("#fontSlider").on("change", function() {
    updateVis();
  });

  d3.select("#markerSize").property(
    "value",
    config.style.nodeWidth + "," + config.style.nodeHeight
  );

  d3.select("#markerSize").on("change", function() {
    let markerSize = this.value.split(",");
    config.style.nodeWidth = eval(markerSize[0]);
    config.style.nodeHeight = eval(markerSize[1]);
    updateVis();
  });

  //set Panel Values

  d3.selectAll("input[name='isDirected']")
    .filter(function() {
      return d3.select(this).property("value") === config.isDirected.toString();
    })
    .attr("checked", "checked");

  d3.selectAll("input[name='fixedPositions']")
    .filter(function() {
      return (
        d3.select(this).property("value") === config.fixedPositions.toString()
      );
    })
    .attr("checked", "checked");

  let ignoreAttr = [
    "edges",
    "id",
    "source",
    "target",
    "fx",
    "fy",
    "x",
    "y",
    "savedX",
    "savedY",
    "neighbors",
    "profile_image_url",
    "selected",
    "userSelectedNeighbors",
    "original",
    "utc_offset"
  ];
  //set all possible attribute values for node fill/stroke/size and edge fill/stroke
  let allNodeAttributes = Object.keys(graph.nodes[0]).filter(
    k => !ignoreAttr.includes(k)
  );
  let allEdgeAttributes = Object.keys(graph.links[0]).filter(
    k => !ignoreAttr.includes(k)
  );

  //  graph.nodes.map(n=>console.log(n.screen_name + '---' +  n.location))

  let menuItems = [
    { name: "nodeFillSelect", type: typeof "string", configAttr: "nodeFill" },
    {
      name: "nodeStrokeSelect",
      type: typeof "string",
      configAttr: "nodeStroke"
    },
    { name: "nodeSizeSelect", type: typeof 2, configAttr: "nodeSize" },
    {
      name: "edgeStrokeSelect",
      type: typeof "string",
      configAttr: "edgeColor"
    },
    {
      name: "edgeWidthSelect",
      type: typeof 2,
      configAttr: "edgeWidth"
    },
    {
      name: "nodeBarsSelect",
      type: typeof 2,
      configAttr: "bars"
    },
    {
      name: "nodeCirclesSelect",
      type: typeof "string",
      configAttr: "circles"
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
    let allAttributes = isNode ? allNodeAttributes : allEdgeAttributes;

    let possibleValues = allAttributes.filter(attr => {
      let type = isNode
        ? typeof graph.nodes[0][attr]
        : typeof graph.links[0][attr];
      return (
        type === m.type &&
        (m.type === typeof 2 ||
          graph.nodes.filter(n => n[attr] === graph.nodes[10][attr]).length > 3)
      );
    });

    let barAttrs = config.attr.bars.map(b => b.attr);

    if (m.configAttr === "bars") {
      let list = item.select("ul");

      let fields = list.selectAll(".field").data(possibleValues);

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
        .attr("placeholder", "[min,max]")
        .property("value", d => {
          let findAttr = config.attr.bars.find(obj => obj.attr === d);
          return findAttr
            ? findAttr.domain
              ? "[" + findAttr.domain + "]"
              : "[ " + d3.extent(graph.nodes, n => n[d]).join(",") + "]"
            : "";
        });

      fields.exit().remove();

      fields = fieldsEnter.merge(fields);

      fields
        .select(".is-checkradio")
        .attr("id", d => d + "-checkbox")
        .attr("name", d => d + "-checkbox")
        .property("checked", d => {
          return barAttrs.includes(d) ? "checked" : false;
        })
        .on("change", function(d) {
          let includeAttr = d3.select(this).property("checked");
          if (includeAttr) {
            let newDomain =
              "[ " + d3.extent(graph.nodes, n => n[d]).join(",") + "]";
            d3.select("#" + d + "-domain").property("value", newDomain);

            let newAttr = { attr: d, domain: eval(newDomain) };
            config.attr.bars.push(newAttr);
          
            //call createHist for that attribute
            d3.select("#nodeQuantAttributes")
              .selectAll("option")
              .filter((opt, i) => {
                return d === opt;
              })
              .property("selected", true);

            createHist(
              d,
              d3.select("#nodeQuantAttributes_histogram"),
              graph.nodes
            );
            updateVis();

          } else {
            config.attr.bars = config.attr.bars.filter(el => el.attr !== d);
            updateVis();
          }
        });

      fields
        .select("label")
        .attr("id", d => d + "-label")
        .attr("for", d => d + "-checkbox")
        .text(d => d);

      fields
        .select(".domain")
        .attr("id", d => d + "-domain")
        .on("change", function(d) {
          let newDomain = eval(this.value);

          let activeAttr = config.attr.bars.find(bar => bar.attr === d);

          if (activeAttr) {
            //if no domain has been defined, compute auto Domain
            if (newDomain === undefined) {
              newDomain = d3.extent(graph.nodes, n => n[d]);
              d3.select("#" + d + "-domain").property(
                "value",
                "[" + newDomain + "]"
              );
            }
            activeAttr.domain = newDomain;
          }
          updateVis();

          //call createHist for that attribute
          d3.select("#nodeQuantAttributes")
            .selectAll("option")
            .filter((opt, i) => {
              return d === opt;
            })
            .property("selected", true);

          createHist(
            d,
            d3.select("#nodeQuantAttributes_histogram"),
            graph.nodes
          );
        });
    } else {
      d3.select("#" + m.name)
        .select("input")
        .property("value", () => {
          return config.attr[m.configAttr].domain
            ? "[" + config.attr[m.configAttr].domain + "]"
            : "[ " +
                d3
                  .extent(graph.nodes, n => n[config.attr[m.configAttr].attr])
                  .join(",") +
                "]";
        });

      let selectMenu = item.select("select");

      selectMenu
        .selectAll("option")
        .data(possibleValues)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

      item
        .selectAll("option")
        .filter((opt, i) => {
          return (
            (m.configAttr == undefined && i === 2) ||
            config.attr[m.configAttr] === opt
          );
        })
        .property("selected", true);

      //  //Set up callbacks for the config panel on the left.
      selectMenu.on("change", function() {
        createHist(
          this.value,
          d3.select("#" + m.name + "_histogram"),
          isNode ? graph.nodes : graph.links
        );
      });

      //set selected element according to config file;

      if (m.type !== typeof "string" && m.configAttr !== "bars") {
        let newSvg = item.append("svg").attr("id", m.name + "_histogram");

        let attr = m.configAttr
          ? config.attr[m.configAttr].attr
          : config.attr.bars[0].attr;
        createHist(attr, newSvg, isNode ? graph.nodes : graph.links);
      }
    }
  });

  d3.select("#nodeFillSelect")
    .select("select")
    .on("change", function() {
      config.attr.nodeFill = this.value;
      config.attr.drawBars = false;

      d3.select("#renderBarsCheckbox").property("checked", false);
      updateVis();
    });

  d3.select("#nodeStrokeSelect")
    .select("select")
    .on("change", function() {
      config.attr.nodeStroke = this.value;
      // config.attr.drawBars = false;

      // d3.select('#renderBarsCheckbox').property('checked', false)
      updateVis();
    });

  d3.select("#renderBarsCheckbox").on("input", function() {
    config.attr.drawBars = d3.select(this).property("checked");

    updateVis();
  });

  d3.select("#edgeWidthScale").on("change", function() {
    config.attr.edgeWidth.domain = eval(this.value);

    updateVis();
  });

  d3.select("#edgeWidthScale").on("change", function() {
    config.attr.edgeWidth.domain = eval(this.value);

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
  let scale = config.attr.bars.find(bar => bar.attr === attrName && bar.domain);

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



  text.attr("transform", d=>'translate(' + x(d) + ',10) rotate(-30)').text(d => {
    let format = d < 1000 ? d3.format("2.0s") : d3.format(".2s");

    return format(d);
  });
}
function updateVis() {
  //Helper functions to compute edge arcs
  let countSiblingLinks = function(graph, source, target) {
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
  };

  let getSiblingLinks = function(graph, source, target) {
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
  };

  //choose which graph to render;
  let graph = config.isDirected ? dir_graph : undir_graph;

  // console.log(
  //   "rendering " + (config.isDirected ? "directed" : "undirected") + " graph"
  // );

  console.log("network size is ", graph.nodes.length, graph.links.length);
  // let nodeMarkerLength = 60;
  // let nodeMarkerHeight = 35;

  let nodeMarkerLength = config.style.nodeWidth || 60;
  let nodeMarkerHeight = config.style.nodeHeight || 35;

  config.style.nodeIsRect = config.attr.drawBars;

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody().strength(-800))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("y", d3.forceY().y(0));

  //set datalist property for search box:
  {
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
  }

  //Create Scales

  let nodeLength = function(node) {
    let nodeSizeScale = d3
      .scaleLinear()
      .domain(
        config.attr.nodeSize.domain
          ? config.attr.nodeSize.domain
          : d3.extent(graph.nodes.map(n => n[config.attr.nodeSize.attr]))
      )
      .range([nodeMarkerLength, nodeMarkerLength * 2])
      .clamp(true);

    let value =
      config.attr.nodeSize.attr && !config.attr.drawBars
        ? nodeSizeScale(node[config.attr.nodeSize.attr])
        : nodeMarkerLength;
    return config.style.nodeIsRect ? value : value * 1.3;
  };

  let nodeHeight = function(node) {
    let nodeSizeScale = d3
      .scaleLinear()
      .domain(
        config.attr.nodeSize.domain
          ? config.attr.nodeSize.domain
          : d3.extent(graph.nodes.map(n => n[config.attr.nodeSize.attr]))
      )
      .range([nodeMarkerHeight, nodeMarkerHeight * 2])
      .clamp(true);

    let value =
      config.attr.nodeSize.attr && !config.attr.drawBars
        ? nodeSizeScale(node[config.attr.nodeSize.attr])
        : nodeMarkerHeight;
    return config.style.nodeIsRect ? value : value * 1.3;
  };

  let nodeFill = function(node) {
    let nodeFillScale = d3
      .scaleOrdinal()
      .domain(
        graph.nodes
          .map(n => n[config.attr.nodeFill])
          .filter((value, index, self) => self.indexOf(value) === index)
      )
      .range(config.style.nodeColors);

    let value;
    let selectedNodeEncoding = config.attr.selectedNodes === "fill";

    if (node.selected && selectedNodeEncoding) {
      value =
        config.attr.selectedColor || nodeFillScale(node[config.attr.nodeFill]);
    } else {
      value =
        config.attr.nodeFill && !selectedNodeEncoding && !config.attr.drawBars
          ? nodeFillScale(node[config.attr.nodeFill])
          : config.attr.noNodeFill;
    }

    if (value === undefined) {
      console.log("fail", node, nodeFillScale(node[config.attr.nodeFill]));
    }

    return value;
  };

  let nodeStroke = function(node) {
    let nodeStrokeScale = d3
      .scaleOrdinal()
      .domain(d3.extent(graph.nodes.map(n => n[config.attr.nodeStroke])))
      .range(config.style.nodeColors);

    let value;
    let selectedNodeEncoding = config.attr.selectedNodes === "stroke";

    if (node.selected && selectedNodeEncoding) {
      value = config.attr.selectedColor;
    } else {
      value =
        config.attr.nodeStroke && !selectedNodeEncoding
          ? nodeStrokeScale(node[config.attr.nodeStroke])
          : config.attr.noNodeStroke;
    }

    return value;
  };

  let edgeColor = function(edge) {
    let edgeColorScale = d3
      .scaleOrdinal()
      .domain(d3.extent(graph.links.map(l => l[config.attr.edgeColor])))
      .range(config.style.edgeColors);

    let value = config.attr.edgeColor
      ? edgeColorScale(edge[config.attr.edgeColor])
      : config.attr.noEdgeColor;
    return value;
  };

  let edgeWidth = function(edge) {
    let domain =
      config.attr.edgeWidth.domain ||
      d3.extent(graph.links.map(l => l[config.attr.edgeWidth.attr]));

    // console.log('domain is', domain)
    let edgeWidthScale = d3
      .scaleLinear()
      .domain(domain)
      .clamp(true)
      .range([2, 10]);

    let value = config.attr.edgeWidth.attr
      ? edgeWidthScale(edge[config.attr.edgeWidth.attr])
      : config.attr.noEdgeColor;
    return value;
  };

  //set css values for 'clicked' nodes;
  //set fill or stroke of selected node;

  //find the appropriate style sheet
  var sheet = Object.values(document.styleSheets).find(s =>
    s.href.includes("node-link.css")
  );

  // let nodeIsRect = config.style.nodeShape === 'rect';
  // sheet.addRule(".node", (nodeIsRect? 'rx: 2; ry:2'  : 'rx:20; ry:20' ) , 1);

  if (config.attr.selectedColor !== undefined) {
    let ruleString =
      config.attr["selectedNodes"] + ":" + config.attr.selectedColor;

    sheet.addRule(".node.clicked", ruleString, 1);
  }

  //create scales for bars;
  let scaleObjects = config.attr.bars;

  //object to store scales as a function of attr name;
  let scales = {};
  let scaleColors = {}

  let barPadding = 3;

  scaleObjects.map((s, i) => {

    let attrDomain = s.domain || d3.extent(graph.nodes.map(n => n[s.attr]))
    let scale = d3
      .scaleLinear()
      .domain(attrDomain)
      .range([0, nodeMarkerHeight - 2 * barPadding])
      .clamp(true);

      let domainKey = attrDomain.join('-')
      scaleColors[domainKey]='';

      console.log('domainKey is ', domainKey)

    //save scale and color to use with that attribute bar
    scales[s.attr] = { scale, domainKey, position: 0 };
  });

  //Assign one color per unique domain;
  Object.keys(scaleColors).map((domainKey,i)=>{scaleColors[domainKey] = config.attr.barColors[i]});

  Object.keys(scales).map(s=>scales[s].fill = scaleColors[scales[s].domainKey]);

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

  // .append("line")

  link.exit().remove();

  link = linkEnter.merge(link);

  // console.log(
  //   "link elements: ",
  //   d3
  //     .select(".links")
  //     .selectAll("path")
  //     .size()
  // );
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

  // nodeEnter
  //   .append("title")

  nodeEnter.append("rect").attr("class", "labelBackground");

  nodeEnter.append("text").classed("label", true);

  node.exit().remove();

  node = nodeEnter.merge(node);

  // node.select('title')
  // .text(function(d) {
  //   return d.screen_name;
  // });

  node
    .select(".node")
    .attr("x", d => -nodeLength(d) / 2)
    .attr("y", d => -nodeHeight(d) / 2)
    .attr("width", nodeLength)
    .attr("height", d => nodeHeight(d))
    .style("fill", nodeFill)
    .style("stroke", nodeStroke)
    .attr("rx", d =>
      config.style.nodeIsRect ? nodeLength(d) / 20 : nodeLength(d) / 2
    )
    .attr("ry", d =>
      config.style.nodeIsRect ? nodeHeight(d) / 20 : nodeHeight(d) / 2
    );

  node
    .select("text")
    .style("font-size", config.style.labelSize)
    .text(d => d[config.attr.labelAttr])
    .attr("y", d => (config.attr.drawBars ? -nodeHeight(d) * 0.5 - 4 : ".5em"))
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
      config.attr.drawBars ? -nodeHeight(d) * 0.5 - 16 : "-.5em"
    );

  node.call(
    d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );

  // //  Separate enter/exit/update for bars so as to bind to the correct data;

  let drawCircles = Object.keys(config.attr.circles).length > 0;
  let circleRegion = drawCircles ? nodeMarkerLength * 0.4 : 0;
  let circleRadius = drawCircles ? nodeMarkerHeight * 0.2 : 0;
  let circlePadding = drawCircles ? 5 : 0;

  let barAttrs = config.attr.drawBars ? Object.keys(scales) : [];
  let numBars = barAttrs.length;
  let nodeWidth = nodeMarkerLength - barPadding - circleRadius - circlePadding;
  let barWidth = nodeWidth / numBars - barPadding;

  let groupingFactor = 2;

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
    let offset =
      scales[d.attr].position === 0
        ? barXScale(i)
        : barXScale(i) - scales[d.attr].position * groupingFactor;

    return "translate(" + offset + ",0)";
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

  let circleAttrs = config.attr.drawBars ? config.attr.circles : [];

  let circleYScale = d3
    .scaleLinear()
    .domain([0, circleAttrs.length - 1])
    .range([-nodeMarkerHeight * 0.2, nodeMarkerHeight * 0.2]);

  let circles = node
    .selectAll(".categorical")
    //for each circle associate the relevant data from the parent node
    .data(d =>
      circleAttrs.map(obj => {
        //compute color scale for this attr from config file
        let colorFillScale = d3
          .scaleOrdinal()
          .domain(
            graph.nodes
              .map(n => n[obj.attr])
              .filter((value, index, self) => self.indexOf(value) === index)
          )
          .range(obj.colors);

        return { data: d[obj.attr], attr: obj.attr, scale: colorFillScale };
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
    .style("fill", d => d.scale(d.data));

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
      .selectAll(".nodeGroup")
      .filter(isNeighbor)
      .classed("muted", d => {
        return hasUserSelection && d.userSelectedNeighbors.length < 1;
      });

    d3.select(".links")
      .selectAll(".linkGroup")
      .filter(isNeighbor)
      .classed("muted", d => hasUserSelection && !d.selected);

    node
      .select(".node")
      .style("fill", nodeFill)
      .style("stroke", nodeStroke);
  });

  if (config.fixedPositions) {
    //restablish link references to their source and target nodes;
    graph.links.map(l => {
      l.source = graph.nodes.find(n => n.id === l.source) || l.source;
      l.target = graph.nodes.find(n => n.id === l.target) || l.target;
    });

    graph.nodes.map(n => {
      n.fx = n.savedX;
      n.fy = n.savedY;
      n.x = n.savedX;
      n.y = n.savedY;
    });
  } else {
    graph.nodes.map(n => {
      n.x = 0;
      n.y = 0;
      n.vx = null;
      n.vy = null;
      n.fx = null;
      n.fy = null;
    });

    // if (!config.fixedPositions) {

    // }

    simulation.nodes(graph.nodes).on("tick", ticked);
    simulation.force("link").links(graph.links);


    d3.select("#stop-simulation").on("click", () => {
      simulation.stop();
    })

    d3.select("#start-simulation").on("click", () => {
      simulation.alphaTarget(0.1).restart();
    })

    d3.select("#release-nodes").on("click", () => {
      graph.nodes.map(n=>{n.fx = null; n.fy = null})
      simulation.alphaTarget(0.1).restart();
    })




    if (!config.fixedPositions) {

      for (var i = 0; i < 2000; ++i) simulation.tick();
      simulation.stop();

      // updatePos()

      //  add a collision force that is proportional to the radius of the nodes;

      simulation.force(
        "collision",
        d3.forceCollide().radius(d => nodeLength(d))
      );

      simulation.alphaTarget(0.1).restart();
      // for (var i = 0; i < 1000; ++i) simulation.tick();
      // simulation.stop();

      // if (config.fixedPositions) {

      // }
    }
  }

  // console.log("fixed positions are ", config.fixedPositions);

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
    link.select("path").attr("d", function(d) {
      let path = arcPath(d.type === "mentions", d);
      if (path.includes("null")) {
        console.log("bad path");
      }
      return path;
    });

    let radius = nodeMarkerLength / 2;

    node.attr("transform", d => {
      d.x = Math.max(radius, Math.min(width - radius, d.x));
      d.y = Math.max(radius, Math.min(height - radius, d.y));
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  if (config.fixedPositions) {
    updatePos();
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

//drawLesMis NodeLink
function drawVis() {
  //read in configuration file;
  d3.json("../public/data/baseState.json", function(fileConfig) {
    config = fileConfig;
    //load undirected graph specified in configuration file;
    d3.json(config.undirectedGraph, function(undir_graph_from_file) {
      //load directed graph specified in configuration file;
      d3.json(config.directedGraph, function(dir_graph_from_file) {
        dir_graph = dir_graph_from_file;
        undir_graph = undir_graph_from_file;

        //save positions to revert to later if needed;
        dir_graph.nodes.map(n => {
          (n.savedX = n.fx), (n.savedY = n.fy);
        });
        undir_graph.nodes.map(n => {
          (n.savedX = n.fx), (n.savedY = n.fy);
        });

        setPanelValuesFromFile(config, dir_graph || undir_graph);

        updateVis();
      });
    });
  });
}
