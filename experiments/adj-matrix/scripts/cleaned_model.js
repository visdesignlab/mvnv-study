//import * as d3 from 'd3';
var Model = /** @class */ (function () {
    function Model(controller) {
        var _this = this;
        this.controller = controller;
        d3.json("scripts/Eurovis2019Network.json").then(function (network) {
            d3.json("scripts/Eurovis2019Tweets.json").then(function (tweets) {
                var data = _this.grabTwitterData(network, tweets);
                _this.matrix = [];
                _this.nodes = data.nodes;
                _this.idMap = {};
                _this.order = _this.changeOrder(_this.controller.configuration.sortKey);
                if (_this.orderType == "screen_name") {
                    _this.nodes = _this.nodes.sort(function (a, b) { return a.screen_name.localeCompare(b.screen_name); });
                }
                else {
                    _this.nodes = _this.nodes.sort(function (a, b) { return b[_this.orderType] - a[_this.orderType]; });
                }
                _this.nodes.forEach(function (node, index) {
                    node.index = index;
                    _this.idMap[node.id] = index;
                });
                _this.edges = data.links;
                _this.controller = controller;
                _this.processData();
                _this.controller.loadData(_this.nodes, _this.edges, _this.matrix);
            });
        });
    }
    Model.prototype.grabTwitterData = function (graph, tweets) {
        var _this = this;
        var toRemove = [];
        var newGraph = { 'nodes': [], 'links': [] };
        //create edges from tweets.
        tweets = tweets.tweets;
        tweets.map(function (tweet) {
            //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
            if (_this.controller.configuration.edgeTypes.includes("mentions")) {
                tweet.entities.user_mentions.map(function (mention) {
                    var source = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                    var target = graph.nodes.find(function (n) { return n.id === mention.id; });
                    if (source && target) {
                        var link = { 'source': source.id, 'target': target.id, 'type': 'mentions' };
                        newGraph.links.push(link);
                        if (!newGraph.nodes.find(function (n) { return n === source; })) {
                            newGraph.nodes.push(source);
                        }
                        if (!newGraph.nodes.find(function (n) { return n === target; })) {
                            newGraph.nodes.push(target);
                        }
                    }
                    // console.log('link',link)
                });
            }
            //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
            if (tweet.retweeted_status && _this.controller.configuration.edgeTypes.includes("retweet")) {
                var source_1 = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                var target_1 = graph.nodes.find(function (n) { return n.id === tweet.retweeted_status.user.id; });
                if (source_1 && target_1) {
                    var link = { 'source': source_1.id, 'target': target_1.id, 'type': 'retweet' };
                    newGraph.links.push(link);
                    if (!newGraph.nodes.find(function (n) { return n === source_1; })) {
                        newGraph.nodes.push(source_1);
                    }
                    if (!newGraph.nodes.find(function (n) { return n === target_1; })) {
                        newGraph.nodes.push(target_1);
                    }
                }
            }
            //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
            if (tweet.in_reply_to_user_id_str && _this.controller.configuration.edgeTypes.includes("reply")) {
                var source_2 = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                var target_2 = graph.nodes.find(function (n) { return n.id === tweet.in_reply_to_user_id; });
                if (source_2 && target_2) {
                    var link = { 'source': source_2.id, 'target': target_2.id, 'type': 'reply' };
                    newGraph.links.push(link);
                    if (!newGraph.nodes.find(function (n) { return n === source_2; })) {
                        newGraph.nodes.push(source_2);
                    }
                    if (!newGraph.nodes.find(function (n) { return n === target_2; })) {
                        newGraph.nodes.push(target_2);
                    }
                }
            }
        });
        return newGraph;
    };
    /**
     *   Determines the order of the current nodes
     * @param  type A string corresponding to the attribute name to sort by.
     * @return      A numerical range in corrected order.
     */
    Model.prototype.changeOrder = function (type) {
        var _this = this;
        var order;
        this.orderType = type;
        this.controller.configuration.sortKey = type;
        if (type == 'screen_name') {
            order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[a].screen_name.localeCompare(_this.nodes[b].screen_name); });
        }
        else {
            order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[b][type] - _this.nodes[a][type]; });
        }
        this.order = order;
        return order;
    };
    /**
     * [processData description]
     * @return [description]
     */
    Model.prototype.processData = function () {
        var _this = this;
        // generate a hashmap of id's?
        // Set up node data
        this.nodes.forEach(function (rowNode, i) {
            rowNode.count = 0;
            /* Numeric Conversion */
            rowNode.followers_count = +rowNode.followers_count;
            rowNode.query_tweet_count = +rowNode.query_tweet_count;
            rowNode.friends_count = +rowNode.friends_count;
            rowNode.statuses_count = +rowNode.statuses_count;
            rowNode.favourites_count = +rowNode.favourites_count;
            rowNode.count_followers_in_query = +rowNode.count_followers_in_query;
            rowNode.id = +rowNode.id;
            rowNode.y = i;
            /* matrix used for edge attributes, otherwise should we hide */
            _this.matrix[i] = _this.nodes.map(function (colNode) { return { rowid: rowNode.screen_name, colid: colNode.screen_name, x: colNode.index, y: rowNode.index, z: 0, reply: 0, retweet: 0, mentions: 0 }; });
        });
        this.maxTracker = { 'reply': 0, 'retweet': 0, 'mentions': 0 };
        // Convert links to matrix; count character occurrences.
        this.edges.forEach(function (link) {
            var addValue = 0;
            console.log('first', link);
            if (link.type == "reply") {
                addValue = 3;
                _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].reply += 1;
                if (_this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].reply > _this.maxTracker['reply']) {
                    _this.maxTracker['reply'] = _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].reply;
                }
            }
            else if (link.type == "retweet") {
                addValue = 2;
                _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].retweet += 1;
                console.log(_this.matrix[_this.idMap[link.source]][_this.idMap[link.target]]);
                if (_this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].retweet > _this.maxTracker['retweet'] && _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].retweet !== null) {
                    _this.maxTracker['retweet'] = _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].retweet;
                }
            }
            else if (link.type == "mentions") {
                addValue = 1;
                _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].mentions += 1;
                if (_this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].mentions > _this.maxTracker['mentions']) {
                    _this.maxTracker['mentions'] = _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].mentions;
                }
            }
            console.log("Max", _this.maxTracker);
            _this.maxTracker = { 'reply': 3, 'retweet': 3, 'mentions': 2 };
            /* could be used for varying edge types */
            _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].z += addValue;
            _this.matrix[_this.idMap[link.source]].count += 1;
            if (_this.controller.configuration.isDirected) {
                _this.matrix[_this.idMap[link.target]][_this.idMap[link.source]].z += addValue;
                _this.matrix[_this.idMap[link.target]].count += 1;
            }
        });
    };
    Model.prototype.getOrder = function () {
        return this.order;
    };
    /**
     * Returns the node data.
     * @return Node data in JSON Array
     */
    Model.prototype.getNodes = function () {
        return this.nodes;
    };
    /**
     * Returns the edge data.
     * @return Edge data in JSON Array
     */
    Model.prototype.getEdges = function () {
        return this.edges;
    };
    return Model;
}());
// Work on importing class file
var View = /** @class */ (function () {
    /*
    private edgeSVGWidth: number;
    private edgeSVGHeight: number;
    private edgeSVGMargin: any;
    private edgeSVG: any;
  
    private xScale: d3.ScaleBand<string>;
    private edgeValueScale: d3.ScaleLinear<number,number>;
    private colorScale: d3.ScaleOrdinal<any,any>;
    private orders: any;
  */
    function View(controller) {
        this.controller = controller;
        // set up load
        this.renderLoading();
        // Add scroll handler to containers
        d3.selectAll('.container').on('mousewheel', scrollHandler);
        function scrollHandler() {
            // determine which didn't scroll and update it's scroll.
            var scrollHeight = d3.select(this).node().scrollTop;
            if (d3.select(this).attr('id') == "attributes") {
                // scroll topology
                var element = d3.select('#topology').node();
                element.scrollTop = scrollHeight;
            }
            else {
                // scroll attributes
                var element = d3.select('#attributes').node();
                element.scrollTop = scrollHeight;
            }
        }
    }
    /**
     * Takes in the data, hides the loading screen, and
     * initalizes visualization.
     * @param  data [description]
     * @return      [description]
     */
    View.prototype.loadData = function (nodes, edges, matrix) {
        this.nodes = nodes;
        this.edges = edges;
        this.matrix = matrix;
        this.hideLoading();
        this.renderView();
        //this.renderEdges();
    };
    /**
     * Initializes the adjacency matrix and row views with placeholder visualizations
     * @return [description]
     */
    View.prototype.renderView = function () {
        this.viewWidth = 1000;
        this.margins = { left: 65, top: 65, right: 10, bottom: 10 };
        this.initalizeEdges();
        this.initalizeAttributes();
        var that = this;
        d3.select("#order").on("change", function () {
            that.sort(this.value);
        });
    };
    /**
     * [highlightNodes description]
     * @param  name         [description]
     * @param  verticleNode [description]
     * @return              [description]
  
    highlightNodes(name: string, verticleNode: boolean) {
      let selector: string = verticleNode ? ".highlightRow" : ".highlightRow";
  
      d3.selectAll(selector)
        .filter((d: any) => { return d.name == name })
        .classed('hovered', true);
    }*/
    /**
     * [clickedNode description]
     * @return [description]
     */
    View.prototype.clickedNode = function () {
        // Find node and highlight it in orange
        // Find all of it's neighbors
        // process links for neighbors?
    };
    /**
     * Initalizes the edges view, renders SVG
     * @return None
     */
    View.prototype.initalizeEdges = function () {
        var _this = this;
        this.edgeWidth = 600 - this.margins.left - this.margins.right;
        this.edgeHeight = 600 - this.margins.top - this.margins.bottom;
        // Float edges so put edges and attr on same place
        d3.select('#topology').style('float', 'left');
        var width = this.edgeWidth + this.margins.left + this.margins.right;
        var height = this.edgeHeight + this.margins.top + this.margins.bottom;
        this.edges = d3.select('#topology').append("svg")
            .attr("viewBox", "0 0 " + width + " " + height + "")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .classed("svg-content", true)
            .attr('id', 'edgeMargin')
            .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
        this.verticalScale = d3.scaleBand().range([0, this.edgeWidth]).domain(d3.range(this.nodes.length));
        /* Draw Highlight Rows
        this.edges//.select('#highlightLayer')
          .append('g')
          .attr('id','highlightLayer')
          .selectAll('.highlightRow')
          .data(this.nodes)
          .enter()
          .append('rect')
          .classed('highlightRow', true)
          .attr('x', 0)
          .attr('y', (d, i) => this.verticalScale(i))
          .attr('width', this.edgeWidth + this.margins.right)
          .attr('height', this.verticalScale.bandwidth())
          .attr('fill', "#fff")
          .on('mouseover', function(d, index) {
            d3.select(this)
              .classed('hovered', true);
            d3.selectAll('.highlightRow')
              .filter((d: any, i) => { return d.index === index })
              .classed('hovered', true)
          })
          .on('mouseout', function(d, index) {
            d3.select(this)
              .classed('hovered', false);
            d3.selectAll('.highlightRow')
              .filter((d: any, i) => { return d.index === index })
              .classed('hovered', false)
          })
          .on('click', (d) => {
            this.clickedNode(d.index);
            // click node
            // select node and turn orange ish
            // highlight other nodes (add jumps?)
          })
          // Draw Highlight Columns
          this.edges.select('#highlightLayer') //highlightLayer alreadyt exists from rows
            .selectAll('.highlightCol')
            .data(this.nodes)
            .enter()
            .append('rect')
            .classed('highlightCol', true)
            .attr('x', (d, i) => this.verticalScale(i))
            .attr('y', 0 )
            .attr('width', this.verticalScale.bandwidth())
            .attr('height', this.edgeHeight + this.margins.bottom)
            .attr('fill', (d, i) => { return i % 2 == 0 ? "#fff" : "#eee" })
            .on('mouseover', function (d, index) {
              /* Option for getting x and y
              let mouse = d3.mouse(d3.event.target);
              let column = document.elementsFromPoint(mouse[0],mouse[1])[0];
              let row = document.elementsFromPoint(mouse[0],mouse[1])[1];
              d3.select(column).classed('hovered',true);
              d3.select(row).classed('hovered',true);
               */ //start removal
        /*
        that.highlightNode(d,index,"column");
      })
      .on('mouseout', (d, index)=> {
        this.unhighlightNode(d,index,"column");
      })
      .on('click', (d) => {
        this.clickedNode(d.index);
        // click node
        // select node and turn orange ish
        // highlight other nodes (add jumps?)
      })
    
    
    */
        this.edgeColumns = this.edges.selectAll(".column")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d, i) {
            return "translate(" + _this.verticalScale(i) + ")rotate(-90)";
        });
        this.edgeColumns.append("line")
            .attr("x1", -this.edgeWidth);
        this.edgeColumns
            .append('rect')
            .classed('highlightCol', true)
            .attr('id', function (d, i) {
            return "highlightCol" + d[i].colid;
        })
            .attr('x', -this.edgeHeight - this.margins.bottom)
            .attr('y', 0)
            .attr('width', this.edgeHeight + this.margins.bottom) // these are swapped as the columns have a rotation
            .attr('height', this.verticalScale.bandwidth())
            .attr('fill-opacity', 0)
            .on('mouseover', function () {
            /*
            let mouse = d3.mouse(d3.event.target);
            let column = document.elementsFromPoint(mouse[0],mouse[1])[0];
            let row = document.elementsFromPoint(mouse[0],mouse[1])[1];
            d3.select('.hovered').classed('hovered',false);
            d3.select(column).classed('hovered',true);
            d3.select(row).classed('hovered',true);
            */
        });
        // Draw each row (translating the y coordinate)
        this.edgeRows = this.edges.selectAll(".row")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
            return "translate(0," + _this.verticalScale(i) + ")";
        });
        this.edgeRows.append("line")
            .attr("x2", this.edgeWidth + this.margins.right);
        // added highligh row code
        this.edgeRows //.select('#highlightLayer')
            .append('rect')
            .classed('highlightTopoRow', true)
            .attr('id', function (d, i) {
            return "highlightTopoRow" + d[i].rowid;
        })
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.edgeWidth + this.margins.right)
            .attr('height', this.verticalScale.bandwidth())
            .attr('fill-opacity', 0)
            .on('mouseover', function (d, index) {
            /*this.highlightEdgeNode(d,index,"row");
    
            this.highlightEdgeNode(d,index,"row");
            d3.select(this)
              .classed('hovered', true);
              */
        })
            .on('mouseout', function () {
            /*d3.select(this)
              .classed('hovered', false);*/
            /*
          d3.selectAll('.highlightRow')
            .filter((d: any, i) => { return d.index === index })
            .classed('hovered', false)*/
        })
            .on('click', function (d) {
            _this.clickedNode(d.index);
            // click node
            // select node and turn orange ish
            // highlight other nodes (add jumps?)
        });
        this.edgeScales = {};
        this.controller.configuration.edgeTypes.forEach(function (type) {
            // calculate the max
            var extent = [0, _this.controller.model.maxTracker[type]];
            console.log(extent);
            // set up scale
            var scale = d3.scaleLinear().domain(extent).range(["white", _this.controller.configuration.style.edgeColors[type]]);
            // store scales
            _this.edgeScales[type] = scale;
            //console.log(type, this.edgeScales[type].domain(), this.edgeScales[type].range().clamp());
        });
        this.generateColorLegend();
        console.log(this.edgeScales);
        var cells = this.edgeRows.selectAll(".cell")
            .data(function (d) { return d; /*.filter(item => item.z > 0)*/ })
            .enter().append('g')
            .attr("class", "cell");
        if (this.controller.configuration.nestedBars) {
            // bind squars to cells for the mouse over effect
            cells
                .append("rect")
                .attr("x", function (d) { return _this.verticalScale(d.x); })
                .attr('height', this.verticalScale.bandwidth())
                .attr('width', this.verticalScale.bandwidth())
                .attr('fill-opacity', 0);
            var dividers_1 = this.controller.configuration.edgeTypes.length;
            dividers_1 = dividers_1 == 0 ? 1 : dividers_1; // if dividers = 0, set to 1  throw an error?
            var squares = cells;
            var _loop_1 = function (index) {
                var type = this_1.controller.configuration.edgeTypes[index];
                console.log(type);
                var scale = this_1.edgeScales[type];
                scale.range([0, this_1.verticalScale.bandwidth()]);
                scale.clamp(true);
                cells
                    .filter(function (d) {
                    return d[_this.controller.configuration.edgeTypes[index]] !== 0;
                })
                    .append("rect")
                    .attr('x', function (d, i) { return _this.verticalScale(d.x) + index * _this.verticalScale.bandwidth() / dividers_1; })
                    .attr('y', function (d) {
                    return _this.verticalScale.bandwidth() - scale(d[type]);
                })
                    .attr('height', function (d) { return _this.edgeScales[type](d[type]); })
                    .attr('width', this_1.verticalScale.bandwidth() / dividers_1)
                    .attr('fill', this_1.controller.configuration.style.edgeColors[type]);
            };
            var this_1 = this;
            for (var index = 0; index < dividers_1; index++) {
                _loop_1(index);
            }
            // determine scales for height
            // append 3 bars of different heights, filtering out 0's
        }
        else {
            var squares = cells
                .append("rect")
                .attr("x", function (d) { return _this.verticalScale(d.x); })
                //.filter(d=>{return d.item >0})
                .attr("width", this.verticalScale.bandwidth())
                .attr("height", this.verticalScale.bandwidth())
                .style("fill", 'white');
            squares
                .filter(function (d) { return d.z == 0; })
                .style("fill-opacity", 0);
            this.setSquareColors('all');
        }
        cells
            .on("mouseover", mouseoverCell)
            .on("mouseout", mouseoutCell);
        // color squares
        var that = this;
        function mouseoverCell(p) {
            /*let attrPrimaryRow = that.selectHighlight(p,"Row","Attr"),
                topologyPrimaryRow = that.selectHighlight(p,"Row","Topo",'y'),
                attrSecondaryRow = that.selectHighlight(p,"Row","Attr"),
                topologySecondaryCol = that.selectHighlight(p,"Col","Topo",'x');
      
            attrPrimaryRow.classed('hovered',true);
            topologyPrimaryRow.classed('hovered',true);
            attrSecondaryRow.classed('hovered',true);
            topologySecondaryCol.classed('hovered',true);*/
            console.log(p);
            that.highlightRow(p);
            that.highlightRowAndCol(p);
            /*
            let test1 = d3.selectAll(".highlightRow") // secondary
              .filter((d, i) => {
                if (d.index != null) {
                  return p.y == d.index;
                }
                return d[i].y == p.y;
              })
              .classed("hovered", true);
      
            that.attributes.selectAll('.highlightRow')
              .filter((d, i) => {
                if (d.index != null) {
                  return p.x == d.index;
                }
                return d[i].x == p.x;
              })
              .classed('hovered', true);
      
            let test = d3.selectAll(".highlightCol") // secondary
              .filter((d, i) => {
                if (d.index != null) {
                  return p.x == d.index;
                }
                return d[i].x == p.x;
              })
              .classed("hovered", true);
            console.log(test,test1);
            */
            // Highlight attribute rows on hovered edge
            var rowIndex, colIndex;
            d3.selectAll(".row text").classed("active", function (d, i) {
                if (i == p.y) {
                    rowIndex = i; //+ that.nodes.length;
                }
                return i == p.y;
            });
            d3.selectAll(".column text").classed("active", function (d, i) {
                if (i == p.x) {
                    colIndex = i; //+ that.nodes.length;
                }
                return i == p.x;
            });
            rowIndex = that.order[rowIndex];
            colIndex = that.order[colIndex];
            // determine the updated
            /*d3.selectAll('.highlightRow')
              .filter((d: any, i) => { return d.y === rowIndex || d.y == colIndex })
              .classed('hovered', true)
      
            that.tooltip.transition().duration(200).style("opacity", .9);
      
            let matrix = this.getScreenCTM()
              .translate(+this.getAttribute("x"), +this.getAttribute("y"));
      
            that.tooltip.transition()
              .duration(200)
              .style("opacity", .9);
      
            that.tooltip.html("DATA")
              .style("left", (window.pageXOffset + matrix.e - 20) + "px")
              .style("top", (window.pageYOffset + matrix.f - 20) + "px");*/
        }
        function mouseoutCell() {
            d3.selectAll("text").classed("active", false);
            that.tooltip.transition().duration(250).style("opacity", 0);
            // encapsulate in one function
            d3.selectAll('.highlightAttrRow')
                .classed('hovered', false);
            d3.selectAll('.highlightTopoRow')
                .classed('hovered', false);
            d3.selectAll('.highlightCol')
                .classed('hovered', false);
        }
        this.order = this.controller.getOrder();
        //
        this.edgeRows.append("text")
            .attr("class", "label")
            .attr("x", 0)
            .attr("y", this.verticalScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .style("font-size", 7.5 + "px")
            .text(function (d, i) { return _this.nodes[i].screen_name; })
            .on('click', function (d, i, nodes) {
            d3.select(nodes[i]).classed('selected', function (data) {
                console.log(data, data[0]);
                return !_this.controller.configuration.state.selectedNodes.includes(data[0].rowid);
            });
            _this.selectNode(d[0].rowid);
        });
        this.edgeColumns.append("text")
            .attr("class", "label")
            .attr("y", 3)
            .attr('x', 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .style("font-size", 7.5 + "px")
            .text(function (d, i) { return _this.nodes[i].screen_name; })
            .on('click', function (d, index, nodes) {
            d3.select(nodes[index]).classed('selected', !_this.controller.configuration.state.columnSelectedNodes.includes(d[index].rowid));
            console.log(d[index].rowid);
            _this.selectColumnNode(d[index].rowid);
        });
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    };
    /**
     * [mouseoverEdge description]
     * @return [description]
     */
    View.prototype.mouseoverEdge = function () {
    };
    View.prototype.linspace = function (startValue, stopValue, cardinality) {
        var arr = [];
        var step = (stopValue - startValue) / (cardinality - 1);
        for (var i = 0; i < cardinality; i++) {
            arr.push(startValue + (step * i));
        }
        return arr;
    };
    View.prototype.setSquareColors = function (type) {
        var _this = this;
        var squares = d3.selectAll('.cell').selectAll('rect')
            .transition()
            .duration(500);
        if (type == 'all') {
            console.log(this.edgeScales, squares);
            squares
                .style("fill", function (d) {
                if (d.reply !== 0) {
                    return _this.edgeScales["reply"](d.reply);
                }
                else if (d.retweet !== 0) {
                    return _this.edgeScales["retweet"](d.retweet);
                }
                else if (d.mentions !== 0) {
                    return _this.edgeScales["mentions"](d.mentions);
                }
                else if (d.z > 3) {
                    return "pink";
                }
            })
                .filter(function (d) { return d.reply !== 0 || d.retweet !== 0 || d.mentions !== 0; })
                .style("fill-opacity", function (d) {
                return (d.reply !== 0 || d.retweet !== 0 || d.mentions !== 0) ? 1 : 0;
            });
        }
        else if (type == "reply") {
            squares.style("fill", function (d) {
                if (d.reply !== 0) {
                    return _this.edgeScales["reply"](d.reply);
                }
                else {
                    return "white";
                }
            })
                .style("fill-opacity", function (d) {
                return d.reply !== 0 ? 1 : 0;
            });
        }
        else if (type == "retweet") {
            squares.style("fill", function (d) {
                if (d.retweet !== 0) {
                    return _this.edgeScales["retweet"](d.retweet);
                }
                else {
                    return "white";
                }
            })
                .style("fill-opacity", function (d) {
                return d.retweet !== 0 ? 1 : 0;
            });
        }
        else if (type == "mentions") {
            squares.style("fill", function (d) {
                if (d.mentions !== 0) {
                    return _this.edgeScales["mentions"](d.mentions);
                }
                else {
                    return "white";
                }
            })
                .style("fill-opacity", function (d) {
                return d.mentions !== 0 ? 1 : 0;
            });
        }
    };
    View.prototype.generateColorLegend = function () {
        var _this = this;
        var yOffset = 10;
        var xOffset = 10;
        var rectWidth = 25;
        var rectHeight = 10;
        var legendWidth = 200;
        var _loop_2 = function (type) {
            var scale = this_2.edgeScales[type];
            console.log(scale);
            var extent = scale.domain();
            console.log(extent, "translate(" + xOffset + "," + yOffset + ")");
            var sampleNumbers = this_2.linspace(extent[0], extent[1], 5);
            console.log(sampleNumbers);
            var svg = d3.select('#legends').append("g")
                .attr("id", "legendLinear" + type)
                .attr("transform", function (d, i) { return "translate(" + xOffset + "," + yOffset + ")"; })
                .on('click', function (d, i, nodes) {
                if (_this.controller.configuration.interaction.selectEdgeType == true) {
                    var edgeType = _this.controller.configuration.state.selectedEdgeType == type ? 'all' : type;
                    _this.controller.configuration.state.selectedEdgeType = edgeType;
                    _this.setSquareColors(edgeType);
                    console.log(nodes[i]);
                    if (edgeType == "all") {
                        d3.selectAll('.selectedEdgeType').classed('selectedEdgeType', false);
                    }
                    else {
                        d3.selectAll('.selectedEdgeType').classed('selectedEdgeType', false);
                        console.log(d3.selectAll('#legendLinear' + type).select('.edgeLegendBorder').classed('selectedEdgeType', true));
                    }
                }
            });
            var boxWidth = 6 * rectWidth + 15;
            svg.append('rect')
                .classed('edgeLegendBorder', true)
                .attr('stroke', 'gray')
                .attr('stroke-width', 1)
                .attr('width', boxWidth)
                .attr('height', 55)
                .attr('fill-opacity', 0)
                .attr('x', 0)
                .attr('y', -9)
                .attr('ry', 2)
                .attr('rx', 2);
            var pluralType = type;
            if (pluralType == "retweet") {
                pluralType = "retweets";
            }
            else if (pluralType == "reply") {
                pluralType = "replies";
            }
            svg.append('text')
                .attr('x', boxWidth / 2)
                .attr('y', 8)
                .attr('text-anchor', 'middle')
                .text("Number of " + pluralType);
            var groups = svg.selectAll('g')
                .data(sampleNumbers)
                .enter()
                .append('g')
                .attr('transform', function (d, i) { return 'translate(' + (10 + i * (rectWidth + 5)) + ',' + 15 + ')'; });
            groups
                .append('rect')
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('fill', function (d) {
                console.log(d);
                return scale(d);
            })
                .attr('stroke', function (d) {
                return d == 0 ? '#bbb' : 'white';
            });
            groups
                .append('text')
                .attr('x', rectWidth / 2)
                .attr('y', 25)
                .attr('text-anchor', 'middle')
                .text(function (d) {
                return Math.round(d);
            });
            xOffset += legendWidth;
        };
        var this_2 = this;
        for (var type in this.edgeScales) {
            _loop_2(type);
        }
    };
    View.prototype.highlightRow = function (node) {
        var nodeID = node.screen_name;
        if (node.screen_name == null) {
            nodeID = node.rowid;
        }
        // highlight attr
        this.highlightNode(nodeID, 'Attr');
        this.highlightNode(nodeID, 'Topo');
    };
    View.prototype.highlightRowAndCol = function (node) {
        var nodeID = node.screen_name;
        if (node.screen_name == null) {
            nodeID = node.colid;
        }
        this.highlightNode(nodeID, 'Attr');
        this.highlightNode(nodeID, '', 'Col');
    };
    View.prototype.highlightNode = function (nodeID, attrOrTopo, rowOrCol) {
        if (rowOrCol === void 0) { rowOrCol = 'Row'; }
        console.log(d3.selectAll('#highlight' + attrOrTopo + rowOrCol + nodeID), '.highlight' + attrOrTopo + rowOrCol + nodeID);
        d3.selectAll('#highlight' + attrOrTopo + rowOrCol + nodeID)
            .classed('hovered', true);
    };
    //u: BCC    BCCINVITADOS2019
    //p:
    //private selectedNodes : any;
    // DOESNT GET ADDED
    View.prototype.addHighlightNode = function (addingNode) {
        // if node is in
        var nodeIndex = this.nodes.findIndex(function (item, i) {
            return item.screen_name == addingNode;
        });
        console.log(this.matrix[nodeIndex]);
        for (var i = 0; i < this.matrix[0].length; i++) {
            console.log(this.matrix[i][nodeIndex].z, this.matrix[i][nodeIndex]);
            if (this.matrix[i][nodeIndex].z > 0) {
                var nodeID = this.matrix[i][nodeIndex].rowid;
                console.log(nodeID);
                if (this.controller.configuration.state.highlightedNodes.hasOwnProperty(nodeID) && !this.controller.configuration.state.highlightedNodes[nodeID].includes(addingNode)) {
                    // if array exists, add it
                    console.log(this.controller.configuration.state.highlightedNodes[nodeID]);
                    this.controller.configuration.state.highlightedNodes[nodeID].push(addingNode);
                }
                else {
                    // if array non exist, create it and add node
                    console.log(this.controller.configuration.state.highlightedNodes);
                    this.controller.configuration.state.highlightedNodes[nodeID] = [addingNode];
                    console.log(this.controller.configuration.state.highlightedNodes);
                }
            }
        }
    };
    /**
     * [removeHighlightNode description]
     * @param  nodeID       [description]
     * @param  removingNode [description]
     * @return              [description]
     */
    View.prototype.removeHighlightNode = function (removingNode) {
        // remove from selected nodes
        console.log(this.controller.configuration.state.columnSelectedNodes);
        console.log(this.controller.configuration.state.highlightedNodes);
        for (var nodeID in this.controller.configuration.state.highlightedNodes) {
            console.log('to_remove_Hightlight', nodeID);
            //finds the position of removing node in the nodes array
            var index = this.controller.configuration.state.highlightedNodes[nodeID].indexOf(removingNode);
            // keep on removing all places of removing node
            if (index > -1) {
                this.controller.configuration.state.highlightedNodes[nodeID].splice(index, 1);
                // delete properties if no nodes left
                if (this.controller.configuration.state.highlightedNodes[nodeID].length == 0) {
                    delete this.controller.configuration.state.highlightedNodes[nodeID];
                }
                console.log(this.controller.configuration.state.highlightedNodes[nodeID]);
            }
        }
    };
    View.prototype.renderHighlightNodes = function () {
        //for
        // remove all highlights
        d3.selectAll('.neighborSelected').classed('neighborSelected', false);
        // re add all highlights
        for (var nodeID in this.controller.configuration.state.highlightedNodes) {
            console.log("node to be highlighted", nodeID);
            d3.select('#highlight' + 'Topo' + 'Row' + nodeID)
                .classed('neighborSelected', true);
            d3.select('#highlight' + 'Attr' + 'Row' + nodeID)
                .classed('neighborSelected', true);
        }
    };
    View.prototype.selectNode = function (nodeID) {
        var index = this.controller.configuration.state.selectedNodes.indexOf(nodeID);
        if (index > -1) {
            this.controller.configuration.state.selectedNodes.splice(index, 1);
        }
        else {
            this.controller.configuration.state.selectedNodes.push(nodeID);
        }
        var attrRow = d3.selectAll('#highlight' + 'Attr' + 'Row' + nodeID);
        attrRow
            .classed('selected', !attrRow.classed('selected'));
        var topoRow = d3.selectAll('#highlight' + 'Topo' + 'Row' + nodeID);
        topoRow
            .classed('selected', !topoRow.classed('selected'));
        console.log(attrRow, topoRow);
    };
    /**
     * [selectColumnNode description]
     * @param  nodeID [description]
     * @return        [description]
     */
    View.prototype.selectColumnNode = function (nodeID) {
        var nodeIndex = this.controller.configuration.state.columnSelectedNodes.indexOf(nodeID);
        console.log(nodeIndex);
        if (nodeIndex > -1) {
            // find all neighbors and remove them
            console.log("remove node", this.controller.configuration.state.columnSelectedNodes, this.controller.configuration.state.columnSelectedNodes.splice(nodeIndex, 1));
            this.removeHighlightNode(nodeID);
            this.controller.configuration.state.columnSelectedNodes.splice(nodeIndex, 1);
            console.log("remove node", this.controller.configuration.state.columnSelectedNodes);
            // remove node from column selected nodes
        }
        else {
            console.log("add node", nodeID);
            this.addHighlightNode(nodeID);
            this.controller.configuration.state.columnSelectedNodes.push(nodeID);
        }
        console.log(this.controller.configuration.state.columnSelectedNodes);
        this.renderHighlightNodes();
        /*let index = this.controller.configuration.state.selectedNodes.indexOf(nodeID);
    
        if(index > -1){ // if in selected node, remove it (unless it is )
          this.controller.configuration.state.selectedNodes.splice(index,1);
          //find all partner nodes
          // if still exists keep,
        } else {
          // add node
          this.controller.configuration.state.selectedNodes.push(nodeID);
    
        }
    
        let attrRow = d3.selectAll('#highlight'+'Attr'+'Row'+nodeID);
        attrRow
          .classed('selected',(d)=>{
            // need to remove if clicked, but not if clicked from another node
            // store hashmap with counts
            // iterate through each time a click and change values
            // if lengths > 0
    
            // Add all elements to set
            // at each click, readd and remove all
    
            // if already selected, remove  and uncolor nodes
            // if not, add and color nodes
    
    
    
            return !
          });//!attrRow.classed('selected')
    
        console.log(attrRow,attrRow.classed('selected'));
    
        let topoRow = d3.selectAll('#highlight'+'Topo'+'Row'+nodeID);
        topoRow
            .classed('selected',!topoRow.classed('selected'));
    
    
            */
    };
    /**
     * [sort description]
     * @return [description]
     */
    View.prototype.sort = function (order) {
        var _this = this;
        this.order = this.controller.changeOrder(order);
        this.verticalScale.domain(this.order);
        var transitionTime = 500;
        d3.selectAll(".row")
            .transition()
            .duration(transitionTime)
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + _this.verticalScale(i) + ")"; })
            .selectAll(".cell")
            .delay(function (d) { return _this.verticalScale(d.x) * 4; })
            .attr("x", function (d) { return _this.verticalScale(d.x); });
        this.attributeRows
            .transition()
            .duration(transitionTime)
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + _this.verticalScale(i) + ")"; });
        // update each highlightRowsIndex
        //.attr('fill',(d,i)=>{console.log(this.order[i]);return this.order[i]%2 == 0 ? "#fff" : "#eee"})
        var t = this.edges.transition().duration(transitionTime);
        t.selectAll(".column")
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(" + _this.verticalScale(i) + ")rotate(-90)"; });
        /*d3.selectAll('.highlightRow') // taken care of as they're apart of row and column groupings already
          .transition()
          .duration(transitionTime)
          .delay((d, i) => { return this.verticalScale(i) * 4; })
          .attr("transform", (d, i) => { return "translate(0," + this.verticalScale(i) + ")"; })
    
        d3.selectAll('.highlightCol')
          .transition()
          .duration(transitionTime)
          .delay((d, i) => { return this.verticalScale(i) * 4; })
          .attr("transform", (d, i) => { return "translate(" + this.verticalScale(i) + ")rotate(-90)"; });*/
    };
    /**
     * [initalizeAttributes description]
     * @return [description]
     */
    View.prototype.initalizeAttributes = function () {
        var _this = this;
        this.attributeWidth = 450 - this.margins.left - this.margins.right;
        this.attributeHeight = 600 - this.margins.top - this.margins.bottom;
        var width = this.attributeWidth + this.margins.left + this.margins.right; //+ 75;
        var height = this.attributeHeight + this.margins.top + this.margins.bottom;
        this.attributes = d3.select('#attributes').append("svg")
            .attr("viewBox", "0 0 " + width + " " + height + "")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .classed("svg-content", true)
            .attr('id', 'attributeMargin')
            .attr("transform", "translate(" + 0 + "," + this.margins.top + ")");
        // add zebras and highlight rows
        /*
        this.attributes.selectAll('.highlightRow')
          .data(this.nodes)
          .enter()
          .append('rect')
          .classed('highlightRow', true)
          .attr('x', 0)
          .attr('y', (d, i) => this.verticalScale(i))
          .attr('width', this.attributeWidth)
          .attr('height', this.verticalScale.bandwidth())
          .attr('fill', (d, i) => { return i % 2 == 0 ? "#fff" : "#eee" })
          */
        var barMargin = { top: 1, bottom: 1, left: 5, right: 5 };
        var barHeight = this.verticalScale.bandwidth() - barMargin.top - barMargin.bottom;
        // Draw each row (translating the y coordinate)
        this.attributeRows = this.attributes.selectAll(".row")
            .data(this.nodes)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
            return "translate(0," + _this.verticalScale(i) + ")";
        });
        this.attributeRows.append("line")
            .attr("x1", 0)
            .attr("x2", this.attributeWidth)
            .attr('stroke', '2px')
            .attr('stroke-opacity', 0.3);
        this.attributeRows.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .classed('highlightAttrRow', true)
            .attr('id', function (d, i) {
            return "highlightAttrRow" + d.screen_name;
        })
            .attr('width', width)
            .attr('height', this.verticalScale.bandwidth()) // end addition
            .attr("fill-opacity", 0)
            .on('mouseover', function (p) {
            // selection constructor
            // selection of rows or columns
            // selection of edge or attribute
            // classing hovered as true
            console.log(p);
            // wont work for seriated matricies!
            var attrRow = _this.highlightRow(p);
            /*let sel = d3.selectAll(".highlightRow")
              .filter((d, i) => {
    
                  if(d.index != null){
                    return p.index == d.index; // attr
                  }
                  console.log(p.index,d[i]);
                  return //p.index == d[i].y; //topology
    
              })
              .classed("hovered", true);*/
            /*d3.selectAll(".highlightRow")
              .filter((d,index)=>{return d.index==index})*/
        })
            .on('mouseout', function () {
            d3.selectAll('.highlightAttrRow')
                .classed('hovered', false);
            d3.selectAll('.highlightTopoRow')
                .classed('hovered', false);
        });
        var columns = this.controller.configuration.columns;
        // Based on the data type set widths
        // numerical are 50, bool are a verticle bandwidth * 2
        //
        var formatCurrency = d3.format("$,.0f"), formatNumber = d3.format(",.0f");
        // generate scales for each
        var attributeScales = {};
        this.columnScale = d3.scaleOrdinal().domain(columns);
        // Calculate Column Scale
        var columnRange = [];
        var xRange = 0;
        var columnWidth = 450 / columns.length;
        columns.forEach(function (col) {
            // calculate range
            columnRange.push(xRange);
            if (col == "influential" || col == "original") { //if ordinal
                // append colored blocks
                var scale = d3.scaleLinear(); //.domain([true,false]).range([barMargin.left, colWidth-barMargin.right]);
                attributeScales[col] = scale;
            }
            else {
                var range = d3.extent(_this.nodes, function (d) { return d[col]; });
                var scale = d3.scaleLinear().domain(range).range([barMargin.left, columnWidth - barMargin.right]);
                attributeScales[col] = scale;
            }
            xRange += columnWidth;
        });
        // need max and min of each column
        /*this.barWidthScale = d3.scaleLinear()
          .domain([0, 1400])
          .range([0, 140]);*/
        this.columnScale.range(columnRange);
        for (var _i = 0, _a = Object.entries(attributeScales); _i < _a.length; _i++) {
            var _b = _a[_i], column = _b[0], scale = _b[1];
            if (column == "influential" || column == "original") {
                var circs = this.attributes.append("g")
                    .attr("transform", "translate(" + this.columnScale(column) + "," + -15 + ")");
                var circ1 = circs
                    .append('g')
                    .attr('transform', 'translate(10,5)');
                circ1
                    .append('circle')
                    .attr('cx', 0)
                    .attr('cy', -20)
                    .attr('fill', "#68AA73")
                    .attr('r', 4);
                circ1
                    .append('text')
                    .text('T')
                    .attr('text-anchor', 'middle');
                var circs2 = circs
                    .append('g')
                    .attr('transform', 'translate(35,5)');
                circs2
                    .append('circle')
                    .attr('cx', 0)
                    .attr('cy', -20)
                    .attr('fill', "#A88E69")
                    .attr('r', 4);
                circs2
                    .append('text')
                    .text('F')
                    .attr('text-anchor', 'middle');
                console.log(circs);
                continue;
            }
            this.attributes.append("g")
                .attr("class", "attr-axis")
                .attr("transform", "translate(" + this.columnScale(column) + "," + -15 + ")")
                .call(d3.axisTop(scale)
                .tickValues(scale.domain())
                .tickFormat(function (d) {
                if ((d / 1000) >= 1) {
                    d = Math.round(d / 1000) + "K";
                }
                return d;
            }))
                .selectAll('text')
                .style("text-anchor", function (d, i) { return i % 2 ? "end" : "start"; });
        }
        /* Create data columns data */
        columns.forEach(function (c) {
            var columnPosition = _this.columnScale(c);
            if (c == "influential" || c == "original") {
                _this.attributeRows
                    .append('circle')
                    .attr('cx', columnPosition + columnWidth / 2)
                    .attr('cy', _this.verticalScale.bandwidth() / 2)
                    .attr('fill', function (d) {
                    console.log(d);
                    return (d[c] ? "#68AA73" : "#A88E69");
                })
                    .attr('r', 2.5);
                return;
            }
            _this.attributeRows
                .append("rect")
                .attr("class", "glyph")
                .attr('height', barHeight)
                .attr('width', 10) // width changed later on transition
                .attr('x', columnPosition + barMargin.left)
                .attr('y', barMargin.top) // as y is set by translate
                .attr('fill', '#8B8B8B')
                .transition()
                .duration(2000)
                .attr('width', function (d, i) { return attributeScales[c](d[c]); });
            _this.attributeRows
                .append("div")
                .attr("class", "glyphLabel")
                .text(function (d, i) {
                return (i ? formatNumber : formatCurrency)(d);
            });
        });
        // Add Verticle Dividers
        this.attributes.selectAll('.column')
            .data(columns)
            .enter()
            .append('line')
            .style('stroke', '1px')
            .attr('x1', function (d) { return _this.columnScale(d); })
            .attr("y1", -20)
            .attr('x2', function (d) { return _this.columnScale(d); })
            .attr("y2", this.attributeHeight + this.margins.bottom)
            .attr('stroke-opacity', 0.4);
        // Add headers
        var columnHeaders = this.attributes.append('g')
            .classed('column-headers', true);
        this.columnNames = {
            "followers_count": "Followers",
            "query_tweet_count": "Tweets",
            "friends_count": "Friends",
            "statuses_count": "Statuses ",
            "listed_count": "Listed",
            "favourites_count": "Favourites",
            "count_followers_in_query": "Followers",
            "influential": "Influential",
            "original": "Original",
        };
        columnHeaders.selectAll('.header')
            .data(columns)
            .enter()
            .append('text')
            .classed('header', true)
            .attr('y', -45)
            .attr('x', function (d) { return _this.columnScale(d) + barMargin.left; })
            .style('font-size', '11px')
            .attr('text-anchor', 'left')
            .text(function (d, i) {
            return _this.columnNames[d];
        });
        //
        columnHeaders.selectAll('.legend');
        // Append g's for table headers
        // For any data row, add
        /*.on("click", clicked)
        .select(".g-table-column")
        .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
          return d === sortKey;
        });*/
        function type(d) {
            d.familyBefore = +d.familyBefore;
            d.familyAfter = +d.familyAfter;
            d.individualBefore = +d.individualBefore;
            d.individualAfter = +d.individualAfter;
            return d;
        }
    };
    /**
     * [selectHighlight description]
     * @param  nodeToSelect    the
     * @param  rowOrCol        String, "Row" or "Col"
     * @param  selectAttribute Boolean of to select attribute or topology highlight
     * @return                 [description]
     */
    View.prototype.selectHighlight = function (nodeToSelect, rowOrCol, attrOrTopo, orientation) {
        if (attrOrTopo === void 0) { attrOrTopo = "Attr"; }
        if (orientation === void 0) { orientation = 'x'; }
        console.log(nodeToSelect, attrOrTopo, orientation);
        var selection = d3.selectAll(".highlight" + attrOrTopo + rowOrCol)
            .filter(function (d, i) {
            if (attrOrTopo == "Attr" && d.index == null) {
                console.log(d);
                // attr
                return nodeToSelect.index == d[i][orientation];
            }
            console.log(d);
            //topology
            return nodeToSelect.index == d.index;
        });
        console.log(selection);
        return selection;
    };
    View.prototype.clicked = function (key) {
    };
    /**
     * Changes the current view to be a loading screen.
     * @return None
     */
    View.prototype.renderLoading = function () {
        d3.select('#overlay')
            .style('opacity', 0)
            .style('display', 'block')
            .transition()
            .duration(1000)
            .style('opacity', 1);
    };
    /**
     * Changes the current view to hide the loading screen
     * @return None
     */
    View.prototype.hideLoading = function () {
        if (d3.select('#overlay').attr('display') != "none") {
            d3.select('#overlay')
                .transition()
                .duration(1000)
                .style('opacity', 0)
                .delay(1000)
                .style('display', 'none');
        }
    };
    return View;
}());
// Work on importing class file
var Controller = /** @class */ (function () {
    function Controller() {
        var _this = this;
        this.configuration = d3.json("config.json");
        this.configuration.then(function (data) {
            _this.configuration = data;
        });
        this.view = new View(this); // initalize view,
        this.model = new Model(this); // start reading in data
    }
    /**
     * Passes the processed edge and node data to the view.
     * @return None
     */
    Controller.prototype.loadData = function (nodes, edges, matrix) {
        this.view.loadData(nodes, edges, matrix);
    };
    /**
     * Obtains the order from the model and returns it to the view.
     * @return [description]
     */
    Controller.prototype.getOrder = function () {
        return this.model.getOrder();
    };
    /**
     * Obtains the order from the model and returns it to the view.
     * @return [description]
     */
    Controller.prototype.changeOrder = function (order) {
        return this.model.changeOrder(order);
    };
    return Controller;
}());
var control = new Controller();
//window.controller = control;
