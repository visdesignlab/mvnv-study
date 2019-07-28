/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global queue, labels*/

///////////////////////////For Experiment Begin/////////////////////////////
var userData = {
    "condition": "",
    "searchLog": [],
    "visitLog": []   //visited data table (JSON Array)
};
var currentVisit = null;
var currentSearch = null;

// Set the condition
if (Math.random() > 0) {
    userData.condition = "foresight";
} else {
    userData.condition = "control";
}

console.log("condition = " + userData.condition);

function recordVisit(item){
    // record previous
    if(currentVisit && currentVisit['chartCode'] !== item){
        currentVisit['end'] = Date.now()
        currentVisit['duration'] = currentVisit['end'] - currentVisit['start'];
        userData['visitLog'].push(currentVisit);
        currentVisit = null;
        //console.log(userData['visitLog'])
    }
        // start a new visit
    if(!currentVisit && item){
        //console.log(item)
        currentVisit = {}
        currentVisit['start'] = Date.now();
        currentVisit['chartCode'] = item;
        currentVisit['searchId'] = currentSearch ? currentSearch['id'] : -1;
    }
}


///////////////////////////For Experiment End/////////////////////////////
var colorRange = ['#5e3c99','#b2abd2', '#fdb863','#e66101']
var color = 
            d3.scaleQuantize()
    //.range(["#156b87", "#876315", "#543510", "#872815"]); //Original
    //.range(["#56ebd3", "#33837f", "#68c3ef", "#1c4585"]) //Colorgorical, blue-ish
    //.range(['#016c59','#1c9099','#67a9cf','#bdc9e1']) //Colorbrewer2, blue-ish
    .range(colorRange)

var size = 720;

var DATASET = 
        "exoplanets"

var DATA_FILE, RADIUS_ATTR, COLOR_ATTR, NAME_ATTR, DISTANCE_ATTR, LOAD_FUNC;
var detailMap = {};
var MAX_DATA_NUM = 300;
var COLOR_DIVIDER = 1/18000

if(DATASET === "exoplanets"){
// Exoplanets
    DATA_FILE = "data/exoplanets.json"
    RADIUS_ATTR = "P_Radius_EU";
    DISTANCE_ATTR = "S_Distance_pc"
    COLOR_ATTR = "P_Teq_Mean_K";
    NAME_ATTR = "P_Name";
    LOAD_FUNC = loadExoplanetStructure;
    //detail map
detailMap[RADIUS_ATTR] = "Planet Radius: " 
detailMap[DISTANCE_ATTR] = "Distance from Earch: " 
detailMap[COLOR_ATTR] = "Temperature: "
}

var pack = d3.pack()
    .size([size, size])
    .padding(5);

var svg;
var bubbles;
var tooltip;

var mouseOnBubble = false;
var margin = {left:0, right:100, top:0, bottom: 0}

// Single function for put chart into specified target
function loadBubbleChart(id) {
    $(function () {
        userData['windowWidth'] = $(window).width();
        userData['windowHeight'] = $(window).height();
            //instructions
        if(userData.condition == "control")
        {
                d3.selectAll('.foresightTraining').style('display','none');
        } 
        svg = d3.select("#"+id).append("svg")
                    .attr("width", size + margin.left + margin.right)
                    .attr("height", size + margin.top + margin.bottom);
        tooltip = d3.select("#"+id)
                     .append("div")
                     .attr("class", "vis-tooltip")
                     .style("position","relative")
                     //.style("transform","translate(0,-"+size+")")
                     .style("opacity", "0")

        queue()
                .defer(d3.json, DATA_FILE)
                .await(boot);
    });
}

function type(d) {
  d[RADIUS_ATTR] = parseFloat(d[RADIUS_ATTR])
  d[COLOR_ATTR] = parseFloat(d[COLOR_ATTR])
  d[DISTANCE_ATTR] = parseFloat(d[DISTANCE_ATTR])
  return d;
}

function showDetail(d){
    d3.select(this).attr('stroke','black');
}

function loadSearchBox(){
    // Load the searchbox if foresight condition
    if(userData.condition === "foresight")
    {
        d3.select('#hit').select('#search-box').style('display','inline')
        enableSearch()
    }
}

var searchData;

function loadExoplanetStructure(data){

  data = data.filter(function(d) { return !isNaN(d[DISTANCE_ATTR]) && !isNaN(d[COLOR_ATTR]) })
  var planets = data.filter(function(d) { return d[DISTANCE_ATTR] === 0; }),
  exoplanets = data.filter(function(d, i) { return d[DISTANCE_ATTR] !== 0 && i < MAX_DATA_NUM + planets.length; });
  
  searchData = exoplanets;

  console.log("searchData.length=" + searchData.length)

  // Only exoplanets are displayed
  var root;
  root = d3.hierarchy({children: exoplanets})
      .sum(function(d) { return d[RADIUS_ATTR] * d[RADIUS_ATTR]; })
      .sort(function(a, b) {
        return !a.children - !b.children
            || isNaN(a.data[DISTANCE_ATTR]) - isNaN(b.data[DISTANCE_ATTR])
            || a.data[DISTANCE_ATTR] - b.data[DISTANCE_ATTR];
      });

  pack(root);

  return root;
}

function showTooltip(d){
                 tooltip
                    .style("top", (d.y + d.r  - size) + "px")
                    .style("left", (d.x + 5) + "px")
                    .transition()
                        .duration(0)
                        .style("opacity", 1)
                    
                    tooltip.html(function() {
                        var percent = Math.round(d.data[DISTANCE_ATTR] * 10000) / 100
                        return d.data[NAME_ATTR] + "<br/>"
                            + detailMap[DISTANCE_ATTR] + ": " + percent + " EU <br>"
                            + detailMap[RADIUS_ATTR] + ": " + d.data[RADIUS_ATTR] + " pc<br/>"
                            + detailMap[COLOR_ATTR] + ": " + d.data[COLOR_ATTR] + " K"
                    });
}

function visitItem(item, data){ //item: circle, data: object
    d3.select(item).classed("expVisited", true)

    //visit and search log
    userData['visited']++;
    //console.log("visited=")
    //console.log(userData['visited'])
    recordVisit(data.data[NAME_ATTR]);
}

function drawVis(root){

    // draw bubbles
  bubbles = svg.selectAll("circle")
    .data(root.descendants().slice(1))
    .enter().append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
    .filter(function(d) { return d.data; })
      .style("fill", function(d) { 
                                    return color(d.data[COLOR_ATTR]);    
                                })
      .classed("bubbles",true)

    //Add mouse events to bubbles
    bubbles.on('mouseover', function(d){
        if(d.data.children)
            return
        showTooltip(d)
        visitItem(this, d)
    });
    bubbles.on("mouseout", function(d){
        recordVisit(null);

        tooltip.transition()
            .duration(0)
            .style("opacity", 0);
        return 
        })   

    // Draw legend
    var legend = svg.append('g')
                    .classed('legend',true)
    var currentLegendHeight = 40;
    var legendSpaceStep = 20;
    var legendTextStep = 10;

    legend.append('text')
          .attr("x",size + margin.right)
          .attr("y", currentLegendHeight)
          .text("Distance to Center: Distance from Earth (pc)")
    currentLegendHeight += legendTextStep + legendSpaceStep

    legend.append('text')
          .attr("x",size + margin.right)
          .attr("y", currentLegendHeight)
          .text("Radius: Planet Radius (EU)")
    currentLegendHeight += legendTextStep + legendSpaceStep

    legend.append('text')
          .attr("x",size + margin.right)
          .attr("y", currentLegendHeight)
          .text("Color: Temperature (Kelvin)")
    currentLegendHeight += legendTextStep + legendSpaceStep

    // color legend
    var colorDomain = color.domain()
    var colorStep = (colorDomain[1] - colorDomain[0])/4
    var colorValues = [
                colorDomain[0], 
                colorDomain[0]+colorStep, 
                colorDomain[0] + 2 * colorStep, 
                colorDomain[0] + 3 * colorStep
                ]
    var colorLegendData = colorRange.map(function(d, i){
        var obj = {}
        obj['color'] = d
        obj['start'] = colorValues[i]
        return obj
    })
    var rectWidth = 40
    var legendColorBlocks = legend.append('g').selectAll('g')
            .data(colorLegendData)
            .enter().append('g')
            .attr('transform',function(d,i){ return 'translate('+(size + margin.right - (4-i) * rectWidth) +','+ currentLegendHeight+' )'})

    legendColorBlocks.append('rect')
            .attr('width', rectWidth)
            .attr('height', 10)
            .attr('fill', function(d){return d['color']})
    legendColorBlocks.append('text')
            .attr('x',10)
            .attr('y', -5)
            .text(function(d){return d['start']})
    currentLegendHeight += 20 + legendSpaceStep


}

function boot(error, data){

    console.log(error)
    console.log(data)

    if(DATASET === "exoplanets"){
        data = data.children
        data.forEach(type)
    }
    
    data.forEach(type)
    color.domain([0,1200]);

    var root = LOAD_FUNC(data);
    drawVis(root);
    loadSearchBox();
 
}

// Search box
function enableSearch(){
//$(document).ready(function () {

    var searchInput = $("#search-input");

    // Get options for auto complete
    function getSearchOptions(data) {
        var optionsData = []
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    optionsData.push(data[i][NAME_ATTR]);
                }
                console.log(optionsData.length)
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
                match: {enabled: true},
                onChooseEvent: function () {
                    searchChooseItem();
                }
            }
        };
        searchInput.easyAutocomplete(searchOptions);

        // Start searching when typing in search box
        searchInput.on("input", function (e) {
            e.preventDefault();
            searchChooseItem();
        });
    }
    
    // Search choosen item
    function searchChooseItem() {
        searchFilter(searchInput.val().toLowerCase());
    }

    function recordPreviousSearch(){
        if(currentSearch != null)
        {
            currentSearch.end = Date.now();
            currentSearch.duration = currentSearch.end - currentSearch.start;
            userData.searchLog.push(currentSearch);
            currentSearch = null

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
            "id": userData.searchLog.length, // index for the next
            "content": value,
            "start": Date.now(),
            "visited": 0
        }

        // Start Filtering
        // Fade all lines and boxes
        d3.selectAll(".bubbles").classed("search-selected",false);
        $("#vis").addClass("search-active");

        // Make contains case-insensitive
        $.expr[":"].contains = $.expr.createPseudo(function (arg) {
            return function (elem) {
                return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
            };
        });

        // Unfade selected elements
        //console.log(value)
        var filteredBubbles = d3.selectAll(".bubbles").filter(function(d){
                                                        return d.data[NAME_ATTR] && d.data[NAME_ATTR].toLowerCase().includes(value)
                                                    })

        if (value && filteredBubbles) {
            // Unfade
            filteredBubbles.classed("search-selected",true);
            // Record current search
            currentSearch.selectedCharts = filteredBubbles.size()
            //console.log(filteredBubbles)
            //console.log("searching for: "+currentSearch.content+" #="+currentSearch.selectedCharts)
        }

        

    }

    // Click button to reset
    $("#search-reset").click(function () {
        resetSearch();
    });

    // Press ESC to reset
    $(document).keydown(function (e) {
        if (e.which === 27) //ESC
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