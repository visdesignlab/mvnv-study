var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//import * as d3 from 'd3';
deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements');
    }
    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function (prev, next) {
        return deepmerge(prev, next, optionsArgument);
    });
};
var Model = /** @class */ (function () {
    function Model(controller) {
        var _this = this;
        this.controller = controller;
        this.datumID = controller.datumID;
        d3.json(controller.configuration.graphFiles[controller.configuration.loadedGraph]).then(function (data) {
            // d3.json("../../data/network_" + controller.configuration.loadedGraph + ".json").then((data: any) => {
            //d3.json("scripts/Eurovis2019Tweets.json").then((tweets: any) => {
            //let data = this.grabTwitterData(network, network.links);
            _this.graph = data;
            _this.edges = data.links;
            //setPanelValuesFromFile(controller.configuration, data);
            _this.matrix = [];
            _this.scalarMatrix = [];
            _this.nodes = data.nodes;
            _this.populateSearchBox();
            _this.idMap = {};
            var clusterFlag = false;
            if (_this.controller.configuration.adjMatrix.sortKey in ['clusterBary', 'clusterLeaf', 'clusterSpectral']) {
                _this.orderType = 'shortName'; //this.controller.configuration.adjMatrix.sortKey;
                clusterFlag = true;
            }
            else {
                _this.orderType = _this.controller.configuration.adjMatrix.sortKey;
                console.log(_this.order);
            }
            _this.order = _this.changeOrder(_this.orderType);
            if (!_this.isQuant(_this.orderType)) { // == "screen_name" || this.orderType == "name") {
                _this.nodes = _this.nodes.sort(function (a, b) { return a[_this.orderType].localeCompare(b[_this.orderType]); });
            }
            else {
                _this.nodes = _this.nodes.sort(function (a, b) { return b[_this.orderType] - a[_this.orderType]; });
            }
            _this.nodes.forEach(function (node, index) {
                node.index = index;
                _this.idMap[node.id] = index;
            });
            _this.controller = controller;
            _this.processData();
            if (clusterFlag) {
                _this.orderType = _this.controller.configuration.adjMatrix.sortKey;
                _this.order = _this.changeOrder(_this.orderType);
            }
            _this.controller.loadData(_this.nodes, _this.edges, _this.matrix);
            //})
        });
    }
    Model.prototype.isQuant = function (attr) {
        // if not in list
        if (!Object.keys(this.controller.configuration.attributeScales.node).includes(attr)) {
            return false;
        }
        else if (this.controller.configuration.attributeScales.node[attr].range === undefined) {
            return true;
        }
        else {
            return false;
        }
    };
    Model.prototype.populateSearchBox = function () {
        var _this = this;
        var names = this.nodes.map(function (node) { return node.shortName; });
        autocomplete(document.getElementById("myInput"), names);
        d3.selectAll('.autocomplete').style('width', 150);
        d3.select('#searchButton').classed('search', true);
        d3.select('#searchButton')
            .on('click', function () {
            var nodeID = document.getElementById("myInput").value;
            var index = names.indexOf(nodeID);
            if (index == -1) {
                return;
            }
            var name = _this.nodes.filter(function (node) { return node.shortName == nodeID; });
            name = name[0][_this.datumID];
            var action = _this.controller.view.changeInteractionWrapper(name, null, 'search');
            _this.controller.model.provenance.applyAction(action);
            //pushProvenance(this.controller.model.app.currentState())
            /*
            let cell = d3.selectAll('#' + nodeID + nodeID)
            //.filter(d => (d.rowid == nodeID && d.colid == nodeID))
    
    
            var e = document.createEvent('UIEvents');
            e.initUIEvent('click', true, true, /* ... */ /*);
            cell.select("rect").node().dispatchEvent(e);
            */
        });
    };
    Model.prototype.getApplicationState = function () {
        var _this = this;
        return {
            currentState: function () { return _this.provenance.graph().current.state; }
        };
    };
    Model.prototype.setUpProvenance = function () {
        var initialState = {
            workerID: workerID,
            taskID: this.controller.tasks[this.controller.taskNum],
            nodes: '',
            search: '',
            startTime: Date.now(),
            endTime: '',
            time: Date.now(),
            count: 0,
            clicked: [],
            sortKey: this.controller.configuration.adjMatrix.sortKey,
            selections: {
                answerBox: {},
                attrRow: {},
                rowLabel: {},
                colLabel: {},
                neighborSelect: {},
                cellcol: {},
                cellrow: {},
                search: {}
            }
        };
        var provenance = ProvenanceLibrary.initProvenance(initialState);
        this.provenance = provenance;
        var app = this.getApplicationState();
        this.app = app;
        // creates the document with the name and worker ID
        //pushProvenance(app.currentState());
        var rowHighlightElements = d3.selectAll('.topoRow,.attrRow,.colLabel,.rowLabel');
        var columnElements = ['colLabel', 'topoCol'];
        var rowElements = ['rowLabel', 'topoRow', 'attrRow'];
        var elementNamesFromSelection = {
            cellcol: rowElements.concat(columnElements),
            colLabel: rowElements.concat(columnElements),
            rowLabel: rowElements.concat(columnElements),
            attrRow: rowElements,
            cellrow: rowElements.concat(columnElements),
            neighborSelect: rowElements,
            answerBox: rowElements.concat(columnElements),
            search: rowElements.concat(columnElements)
        };
        function classAllHighlights(state) {
            var clickedElements = new Set();
            var answerElements = new Set();
            var neighborElements = new Set();
            for (var selectionType in state.selections) {
                for (var selectionElement in elementNamesFromSelection[selectionType]) {
                    selectionElement = elementNamesFromSelection[selectionType][selectionElement];
                    for (var node in state.selections[selectionType]) {
                        if (selectionType == 'answerBox') {
                            answerElements.add('#' + selectionElement + node);
                        }
                        else if (selectionType == 'neighborSelect') {
                            neighborElements.add('#' + selectionElement + node);
                        }
                        else {
                            if (selectionType == 'attrRow' || selectionType == 'rowLabel') {
                                // if both in attrRow and rowLabel, don't highlight element
                                if (node in state.selections['attrRow'] && node in state.selections['rowLabel'])
                                    continue;
                            }
                            clickedElements.add('#' + selectionElement + node);
                        }
                    }
                }
            }
            var clickedSelectorQuery = Array.from(clickedElements).join(',');
            var answerSelectorQuery = Array.from(answerElements).join(',');
            var neighborSelectQuery = Array.from(neighborElements).join(',');
            clickedSelectorQuery != [] ? d3.selectAll(clickedSelectorQuery).classed('clicked', true) : null;
            answerSelectorQuery != [] ? d3.selectAll(answerSelectorQuery).classed('answer', true) : null;
            neighborSelectQuery != [] ? d3.selectAll(neighborSelectQuery).classed('neighbor', true) : null;
            return;
        }
        function setUpObservers() {
            var _this = this;
            var updateHighlights = function (state) {
                d3.selectAll('.clicked').classed('clicked', false);
                d3.selectAll('.answer').classed('answer', false);
                d3.selectAll('.neighbor').classed('neighbor', false);
                classAllHighlights(state);
            };
            var updateCellClicks = function (state) {
                var cellNames = [];
                Object.keys(state.selections.cellcol).map(function (key) {
                    var names = state.selections.cellcol[key];
                    names.map(function (name) {
                        var cellsNames = splitCellNames(name);
                        cellNames = cellNames.concat(cellsNames);
                    });
                    //names.map(name=>{
                    //})
                });
                var cellSelectorQuery = '#' + cellNames.join(',#');
                // if no cells selected, return
                d3.selectAll('.clickedCell').classed('clickedCell', false);
                if (cellSelectorQuery == '#')
                    return;
                d3.selectAll(cellSelectorQuery).selectAll('.baseCell').classed('clickedCell', true);
            };
            var updateAnswerBox = function (state) {
                window.controller.configuration.adjMatrix['toggle'] ? window.controller.view.updateAnswerToggles(state) : window.controller.view.updateCheckBox(state);
                //window.controller.view.updateAnswerToggles(state)
                var answer = [];
                for (var i = 0; i < window.controller.model.nodes.length; i++) {
                    if (window.controller.model.nodes[i][_this.controller.view.datumID] in state.selections.answerBox) {
                        answer.push(window.controller.model.nodes[i]);
                    }
                }
                updateAnswer(answer);
            };
            provenance.addObserver("selections.attrRow", updateHighlights);
            provenance.addObserver("selections.rowLabel", updateHighlights);
            provenance.addObserver("selections.colLabel", updateHighlights);
            provenance.addObserver("selections.cellcol", updateHighlights);
            provenance.addObserver("selections.cellrow", updateHighlights);
            provenance.addObserver("selections.neighborSelect", updateHighlights);
            provenance.addObserver("selections.cellcol", updateCellClicks);
            provenance.addObserver("selections.search", updateHighlights);
            provenance.addObserver("selections.answerBox", updateHighlights);
            provenance.addObserver("selections.answerBox", updateAnswerBox);
        }
        setUpObservers();
        return [app, provenance];
    };
    Model.prototype.reload = function () {
        this.controller.loadData(this.nodes, this.edges, this.matrix);
    };
    /**
     *   Determines the order of the current nodes
     * @param  type A string corresponding to the attribute screen_name to sort by.
     * @return      A numerical range in corrected order.
     */
    Model.prototype.changeOrder = function (type) {
        var _this = this;
        var order;
        this.orderType = type;
        this.controller.configuration.adjMatrix.sortKey = type;
        if (type == "clusterSpectral" || type == "clusterBary" || type == "clusterLeaf") {
            /*var graph = reorder.graph()
              .nodes(this.nodes)
              .links(this.edges)
              .init();*/ //"favourites_count"
            var graph = reorder.graph()
                .nodes(this.nodes)
                .links(this.edges)
                .init();
            if (type == "clusterBary") {
                var barycenter = reorder.barycenter_order(graph);
                order = reorder.adjacent_exchange(graph, barycenter[0], barycenter[1])[1];
            }
            else if (type == "clusterSpectral") {
                order = reorder.spectral_order(graph);
            }
            else if (type == "clusterLeaf") {
                var mat = reorder.graph2mat(graph);
                order = reorder.optimal_leaf_order()(mat);
            }
            //
            //order = reorder.optimal_leaf_order()(this.scalarMatrix);
        }
        else if (!this.isQuant(this.orderType)) { // == "screen_name" || this.orderType == "name") {
            order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[a][type].localeCompare(_this.nodes[b][type]); });
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
            //rowNode.id = +rowNode.id;
            rowNode.y = i;
            /* matrix used for edge attributes, otherwise should we hide */
            _this.matrix[i] = _this.nodes.map(function (colNode) { return { cellName: 'cell' + rowNode[_this.datumID] + '_' + colNode[_this.datumID], correspondingCell: 'cell' + colNode[_this.datumID] + '_' + rowNode[_this.datumID], rowid: rowNode[_this.datumID], colid: colNode[_this.datumID], x: colNode.index, y: rowNode.index, count: 0, z: 0, combined: 0, retweet: 0, mentions: 0 }; });
            _this.scalarMatrix[i] = _this.nodes.map(function (colNode) { return 0; });
        });
        function checkEdge(edge) {
            if (typeof edge.source !== "number")
                return false;
            if (typeof edge.target !== "number")
                return false;
            return true;
        }
        this.edges = this.edges.filter(checkEdge);
        this.maxTracker = { 'reply': 0, 'retweet': 0, 'mentions': 0 };
        // Convert links to matrix; count character occurrences.
        this.edges.forEach(function (link) {
            var addValue = 1;
            _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]][link.type] += link.count;
            //
            _this.scalarMatrix[_this.idMap[link.source]][_this.idMap[link.target]] += link.count;
            /* could be used for varying edge types */
            //this.maxTracker = { 'reply': 3, 'retweet': 3, 'mentions': 2 }
            _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].z += addValue;
            _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].count += 1;
            // if not directed, increment the other values
            if (!_this.controller.configuration.isDirected) {
                _this.matrix[_this.idMap[link.target]][_this.idMap[link.source]].z += addValue;
                _this.matrix[_this.idMap[link.target]][_this.idMap[link.source]][link.type] += link.count;
                _this.scalarMatrix[_this.idMap[link.source]][_this.idMap[link.target]] += link.count;
            }
            link.source = _this.idMap[link.source];
            link.target = _this.idMap[link.target];
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
        var _this = this;
        this.controller = controller;
        this.controller.clickedCells = new Set();
        this.datumID = controller.datumID;
        this.clickFunction = function (d, i, nodes) {
            var nodeID = _this.controller.view.determineID(d);
            // remove hover or clicked from the class name of the objects that are interacted
            // this is necessary as the click events are attached to the hovered rect in attrRow
            var interaction = d3.select(nodes[i]).attr('class');
            interaction = interaction.replace(' hoveredCell', '');
            interaction = interaction.replace(' hovered', '');
            interaction = interaction.replace(' clicked', '');
            interaction = interaction.replace(' answer', '');
            interaction = interaction.replace(' neighbor', '');
            var action = _this.controller.view.changeInteractionWrapper(nodeID, nodes[i], interaction);
            _this.controller.model.provenance.applyAction(action);
            //pushProvenance(this.controller.model.app.currentState())
        };
        // set up load
        this.renderLoading();
        this.mouseoverEvents = [];
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
        d3.select('.loading').style('display', 'block').style('opacity', 1);
        this.viewWidth = 1000;
        this.margins = { left: 75, top: 75, right: 0, bottom: 10 };
        this.initalizeEdges();
        this.initalizeAttributes();
        d3.select('.loading').style('display', 'none');
        var that = this;
        d3.select("#order").on("change", function () {
            that.sort(this.value);
        });
    };
    /**
     * [highlightNodes description]
     * @param  screen_name         [description]
     * @param  verticleNode [description]
     * @return              [description]
  
    highlightNodes(screen_name: string, verticleNode: boolean) {
      let selector: string = verticleNode ? ".highlightRow" : ".highlightRow";
  
      d3.selectAll(selector)
        .filter((d: any) => { return d.screen_name == screen_name })
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
        // Float edges so put edges and attr on same place
        d3.select('#topology').style('float', 'left');
        var width = this.controller.visWidth * this.controller.edgePorportion; //this.edgeWidth + this.margins.left + this.margins.right;
        var height = this.controller.visHeight; //this.edgeHeight + this.margins.top + this.margins.bottom;
        this.edgeWidth = width - (this.margins.left + this.margins.right); //*this.controller.edgePorportion;
        this.edgeHeight = height - (this.margins.top + this.margins.bottom); //*this.controller.edgePorportion;
        this.edges = d3.select('#topology').append("svg")
            .attr("viewBox", "0 0 " + (width) + " " + height + "")
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
            .attr("x1", -this.edgeWidth)
            .attr("z-index", 10);
        //append final line
        var extraLine = this.edges
            .append("line")
            .attr("x1", this.edgeWidth)
            .attr("x2", this.edgeWidth)
            .attr("y1", 0)
            .attr("y2", this.edgeHeight);
        this.edgeColumns
            .append('rect')
            .classed('topoCol', true)
            .attr('id', function (d, i) {
            return "topoCol" + d[i].colid;
        })
            .attr('x', -this.edgeHeight - this.margins.bottom)
            .attr('y', 0)
            .attr('width', this.edgeHeight + this.margins.bottom + this.margins.top) // these are swapped as the columns have a rotation
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
        // append grid lines
        this.edgeRows.append("line")
            .attr("x2", this.edgeWidth + this.margins.right);
        // added highligh row code
        this.edgeRows //.select('#highlightLayer')
            .append('rect')
            .classed('topoRow', true)
            .attr('id', function (d, i) {
            return "topoRow" + d[i].rowid;
        })
            .attr('x', -this.margins.left)
            .attr('y', 0)
            .attr('width', this.edgeWidth + this.margins.right + this.margins.left)
            .attr('height', this.verticalScale.bandwidth())
            .attr('fill-opacity', 0);
        this.edgeScales = {};
        this.controller.configuration.attributeScales.edge.type.domain.forEach(function (type) {
            // calculate the max
            var extent = [0, _this.controller.configuration.attributeScales.edge.count.domain[1]];
            //model.maxTracker[type]]
            // set up scale
            console.log(extent);
            var typeIndex = _this.controller.configuration.attributeScales.edge.type.domain.indexOf(type);
            //let scale = d3.scaleLinear().domain(extent).range(["white", this.controller.configuration.attributeScales.edge.type.range[typeIndex]]);
            var otherColors = ['#064B6E', '#4F0664', '#000000'];
            var scale = d3.scaleSqrt().domain(extent).range(["white", otherColors[typeIndex]]);
            scale.clamp(true);
            // store scales
            _this.edgeScales[type] = scale;
        });
        this.generateColorLegend();
        var cells = this.edgeRows.selectAll(".cell")
            .data(function (d) { return d; /*.filter(item => item.z > 0)*/ })
            .enter().append('g')
            .attr("class", "cell")
            .attr('id', function (d) { return d.cellName; })
            .attr('transform', function (d) { return 'translate(' + _this.verticalScale(d.x) + ',0)'; });
        var squares = cells
            .append("rect")
            .classed('baseCell', true)
            .attr("x", function (d) { return 0; })
            .attr('height', this.verticalScale.bandwidth())
            .attr('width', this.verticalScale.bandwidth())
            .attr('fill-opacity', 0);
        if (this.controller.configuration.adjMatrix.edgeBars) {
            // bind squares to cells for the mouse over effect
            var dividers = this.controller.configuration.isMultiEdge ? 2 : 1;
            //let squares = cells
            var offset_1 = 0;
            var squareSize = this.verticalScale.bandwidth() - 2 * offset_1;
            var _loop_1 = function (index) {
                var type = this_1.controller.configuration.isMultiEdge ? this_1.controller.configuration.attributeScales.edge.type.domain[index] : 'combined';
                var scale = this_1.edgeScales[type];
                var typeColor = scale.range()[1];
                // change encoding to position
                //scale.range([0, this.verticalScale.bandwidth()])
                //scale.clamp(true);
                cells
                    //.filter(d => {
                    //  return d[type] !== 0;
                    //})
                    .append("rect")
                    .classed('nestedEdges nestedEdges' + type, true)
                    .attr('x', offset_1) // index * this.verticalScale.bandwidth() / dividers })
                    .attr('y', function (d) {
                    return offset_1; //this.verticalScale.bandwidth() - scale(d[type]);
                })
                    .attr('height', squareSize) //)
                    .attr('width', squareSize)
                    .attr('fill', function (d) { return _this.edgeScales[type](d[type]); });
                offset_1 = squareSize / 4;
                squareSize = squareSize - 2 * offset_1;
            };
            var this_1 = this;
            for (var index = 0; index < dividers; index++) {
                _loop_1(index);
            }
            cells
                .selectAll('.nestedEdges')
                .filter(function (d) {
                return d.mentions == 0 && d.retweet == 0 && d.combined == 0;
            })
                .remove();
        }
        else {
            var squares_1 = cells
                .append("rect")
                .attr("x", 0) //d => this.verticalScale(d.x))
                //.filter(d=>{return d.item >0})
                .attr("width", this.verticalScale.bandwidth())
                .attr("height", this.verticalScale.bandwidth())
                .style("fill", 'white');
            squares_1
                .filter(function (d) { return d.z == 0; })
                .style("fill-opacity", 0);
            this.setSquareColors('all');
        }
        var that = this;
        cells
            .on("mouseover", function (cell, i, nodes) {
            var matrix = nodes[i].getScreenCTM()
                .translate(+nodes[i].getAttribute("x"), +nodes[i].getAttribute("y"));
            var combinedMessage = cell.combined > 0 ? cell.combined.toString() + " interactions" : ''; //
            if (cell.combined == 1) {
                combinedMessage = combinedMessage.substring(0, combinedMessage.length - 1);
            }
            var retweetMessage = cell.retweet > 0 ? cell.retweet.toString() + " retweets" : ''; //
            if (cell.retweet == 1) {
                retweetMessage = retweetMessage.substring(0, retweetMessage.length - 1);
            }
            var mentionsMessage = cell.mentions > 0 ? cell.mentions.toString() + " mentions" : ''; //
            if (cell.mentions == 1) {
                mentionsMessage = mentionsMessage.substring(0, mentionsMessage.length - 1);
            }
            var message = [combinedMessage, retweetMessage, mentionsMessage].filter(Boolean).join("</br>"); //retweetMessage+'</br>'+mentionsMessage
            console.log(message);
            if (message !== '') {
                var yOffset = (retweetMessage !== '' && mentionsMessage !== '') ? 45 : 30;
                console.log(yOffset);
                _this.tooltip.html(message)
                    .style("left", (window.pageXOffset + matrix.e - 45) + "px")
                    .style("top", (window.pageYOffset + matrix.f - yOffset) + "px");
                _this.tooltip.transition()
                    .delay(100)
                    .duration(200)
                    .style("opacity", .9);
            }
            var cellIDs = [cell.cellName, cell.correspondingCell];
            _this.selectedCells = cellIDs;
            _this.selectedCells.map(function (cellID) {
                d3.selectAll('#' + cellID).selectAll('.baseCell').classed('hoveredCell', true);
            });
            var cellID = cellIDs[0];
            that.addHighlightNodesToDict(_this.controller.hoverRow, cell.rowid, cellID); // Add row (rowid)
            if (cell.colid !== cell.rowid) {
                that.addHighlightNodesToDict(_this.controller.hoverRow, cell.colid, cellID); // Add row (colid)
                that.addHighlightNodesToDict(_this.controller.hoverCol, cell.rowid, cellID); // Add col (rowid)
            }
            // add mouseover events
            _this.mouseoverEvents.push({ time: new Date().getTime(), event: cellID });
            that.addHighlightNodesToDict(_this.controller.hoverCol, cell.colid, cellID); // Add col (colid)
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Col');
        })
            .on("mouseout", function (cell) {
            _this.tooltip.transition(25)
                .style("opacity", 0);
            var func = _this.removeHighlightNodesToDict;
            d3.selectAll('.hoveredCell').classed('hoveredCell', false);
            _this.selectedCells = [];
            var cellID = cell.cellName;
            that.removeHighlightNodesToDict(_this.controller.hoverRow, cell.rowid, cellID); // Add row (rowid)
            if (cell.colid !== cell.rowid) {
                that.removeHighlightNodesToDict(_this.controller.hoverRow, cell.colid, cellID);
                that.removeHighlightNodesToDict(_this.controller.hoverCol, cell.rowid, cellID); // Add col (rowid)
            }
            // Add row (colid)
            that.removeHighlightNodesToDict(_this.controller.hoverCol, cell.colid, cellID); // Add col (colid)
            d3.selectAll('.hovered').classed('hovered', false);
            //that.renderHighlightNodesFromDict(this.controller.hoverRow,'hovered','Row');
            //that.renderHighlightNodesFromDict(this.controller.hoverCol,'hovered','Col');
        })
            .on('click', function (d, i, nodes) {
            // only trigger click if edge exists
            if (d.combined != 0 || d.retweet != 0 || d.mentions != 0) {
                _this.clickFunction(d, i, nodes);
            }
            return;
        });
        /*(d, i, nodes) => {
    
          let nodeID = this.determineID(d);
    
          let action = this.changeInteractionWrapper(nodeID, i, nodes);
          this.controller.model.provenance.applyAction(action);
    
    
        });*/
        /*      .on("click", (cell, index, nodes) => {
                let cellElement = d3.select(nodes[index]).selectAll('rect');
                let cellID = cell.rowid + cell.colid;
    
                if (cell.combined != 0 || cell.mentions != 0 || cell.retweets != 0) {
    
                }
    
                cellElement.classed('clickedCell', !this.controller.clickedCells.has(cellID))
    
    
                if (this.controller.clickedCells.has(cellID)) {
                  this.controller.clickedCells.delete(cellID);
                  that.removeHighlightNodesToDict(this.controller.clickedRow, cell.rowid, cellID);  // Add row (rowid)
                  if (cell.colid !== cell.rowid) {
                    that.removeHighlightNodesToDict(this.controller.clickedRow, cell.colid, cellID);  // Add row (colid)
                  }
                  that.removeHighlightNodesToDict(this.controller.clickedCol, cell.colid, cellID);  // Add col (colid)
                } else {
                  this.controller.clickedCells.add(cellID);
                  that.addHighlightNodesToDict(this.controller.clickedRow, cell.rowid, cellID);  // Add row (rowid)
                  if (cell.colid !== cell.rowid) {
                    that.addHighlightNodesToDict(this.controller.clickedRow, cell.colid, cellID);  // Add row (colid)
                  }
    
                  that.addHighlightNodesToDict(this.controller.clickedCol, cell.colid, cellID);  // Add col (colid)
                }
    
                d3.selectAll('.clicked').classed('clicked', false);
                that.renderHighlightNodesFromDict(this.controller.clickedRow, 'clicked', 'Row');
                that.renderHighlightNodesFromDict(this.controller.clickedCol, 'clicked', 'Col');
    
              });*/
        // color squares
        this.controller.clickedRow = {};
        this.controller.clickedCol = {};
        this.controller.answerRow = {};
        this.controller.hoverRow = {};
        this.controller.hoverCol = {};
        function mouseoverCell(p) {
            // Add row (colid)
            // Add col (colid)
            /*let attrPrimaryRow = that.selectHighlight(p,"Row","Attr"),
                topologyPrimaryRow = that.selectHighlight(p,"Row","Topo",'y'),
                attrSecondaryRow = that.selectHighlight(p,"Row","Attr"),
                topologySecondaryCol = that.selectHighlight(p,"Col","Topo",'x');
      
            attrPrimaryRow.classed('hovered',true);
            topologyPrimaryRow.classed('hovered',true);
            attrSecondaryRow.classed('hovered',true);
            topologySecondaryCol.classed('hovered',true);*/
            //that.highlightRow(p);
            //that.highlightRowAndCol(p);
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
      
      
      
      
      
            */
            // Highlight attribute rows on hovered edge
            /* Highlight row and column labels
            d3.selectAll(".row text").classed("active", (d, i) => {
              if(d[i] == null){
                return false;
              }
              return d[i].screen_name == p.rowid;
            });
      
            d3.selectAll(".column text").classed("active", (d, i) => {
              return d[i].screen_name == p.colid;
            });*/
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
            d3.selectAll('.attrRow')
                .classed('hovered', false);
            d3.selectAll('.topoRow')
                .classed('hovered', false);
            d3.selectAll('.highlightCol')
                .classed('hovered', false);
        }
        this.order = this.controller.getOrder();
        var labelSize = this.controller.configuration.nodeAttributes.length > 4 ? 9.5 : 11;
        console.log(labelSize);
        this.edgeRows.append("text")
            .attr('class', 'rowLabel')
            .attr("id", function (d, i) {
            return "nodeLabelRow" + d[i].rowid;
        })
            .attr('z-index', 30)
            .attr("x", 0)
            .attr("y", this.verticalScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .style("font-size", labelSize)
            .text(function (d, i) { return _this.nodes[i].shortName; })
            .on("mouseout", function (d, i, nodes) {
            //let func = this.removeHighlightNodesToDict;
            var rowID = d[0].rowid;
            that.removeHighlightNodesToDict(_this.controller.hoverRow, rowID, rowID); // Add row (rowid)
            that.removeHighlightNodesToDict(_this.controller.hoverCol, rowID, rowID); // Add row (rowid)
            //that.addHighlightNodesToDict(this.controller.hoverCol, cell.colid, cellID);  // Add col (colid)
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Row');
        })
            .on('mouseover', function (d, i, nodes) {
            var rowID = d[0].rowid;
            that.addHighlightNodesToDict(_this.controller.hoverRow, rowID, rowID); // Add row (rowid)
            that.addHighlightNodesToDict(_this.controller.hoverCol, rowID, rowID); // Add row (rowid)
            _this.mouseoverEvents.push({ time: new Date().getTime(), event: 'rowLabel' + rowID });
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Col');
        })
            .on('click', this.clickFunction);
        this.edgeColumns.append("text")
            .attr("id", function (d, i) {
            return "nodeLabelCol" + d[i].rowid;
        })
            .attr('class', 'colLabel')
            .attr('z-index', 30)
            .attr("y", 3)
            .attr('x', 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .style("font-size", labelSize)
            .text(function (d, i) { return _this.nodes[i].shortName; })
            .on('click', function (d, i, nodes) {
            if (_this.controller.configuration.adjMatrix.neighborSelect) {
                _this.clickFunction(d, i, nodes);
                var action = _this.controller.view.changeInteractionWrapper(null, nodes[i], 'neighborSelect');
                _this.controller.model.provenance.applyAction(action);
            }
            else {
                _this.clickFunction(d, i, nodes);
            }
        })
            .on("mouseout", function (d, i, nodes) {
            //let func = this.removeHighlightNodesToDict;
            var colID = d[0].rowid; // as rows and columns are flipped
            that.removeHighlightNodesToDict(_this.controller.hoverCol, colID, colID); // Add row (rowid)
            that.removeHighlightNodesToDict(_this.controller.hoverRow, colID, colID); // Add row (rowid)
            //that.addHighlightNodesToDict(this.controller.hoverCol, cell.colid, cellID);  // Add col (colid)
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Col');
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
            //that.renderHighlightNodesFromDict(this.controller.hoverRow,'hovered','Row');
            //that.renderHighlightNodesFromDict(this.controller.hoverCol,'hovered','Col');
        })
            .on('mouseover', function (d, i, nodes) {
            var colID = d[0].rowid;
            that.addHighlightNodesToDict(_this.controller.hoverCol, colID, colID); // Add row (rowid)
            that.addHighlightNodesToDict(_this.controller.hoverRow, colID, colID); // Add row (rowid)
            _this.mouseoverEvents.push({ time: new Date().getTime(), event: 'colLabel' + colID });
            //that.addHighlightNodesToDict(this.controller.hoverCol, cell.colid, cellID);  // Add col (colid)
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Col');
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
        });
        //make rowlabel and collabel
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    };
    /**
     * [changeInteractionWrapper description]
     * @param  nodeID ID of the node being changed with
     * @param  node   nodes corresponding to the element class interacted with (from d3 select nodes[i])
     * @param  interactionType class name of element interacted with
     * @return        [description]
     */
    View.prototype.changeInteractionWrapper = function (nodeID, node, interactionType) {
        var _this = this;
        return {
            label: interactionType,
            action: function (nodeID) {
                var currentState = _this.controller.model.app.currentState();
                //add time stamp to the state graph
                currentState.time = Date.now();
                currentState.event = interactionType;
                var interactionName = interactionType; //cell, search, etc
                var interactedElement = interactionType;
                if (interactionName == 'cell') {
                    var cellData = d3.select(node).data()[0]; //
                    nodeID = cellData.colid;
                    interactedElement = cellData.cellName; // + cellData.rowid;
                    _this.changeInteraction(currentState, nodeID, interactionName + 'col', interactedElement);
                    _this.changeInteraction(currentState, nodeID, interactionName + 'row', interactedElement);
                    if (cellData.cellName != cellData.correspondingCell) {
                        interactedElement = cellData.correspondingCell; // + cellData.rowid;
                        nodeID = cellData.rowid;
                        _this.changeInteraction(currentState, nodeID, interactionName + 'col', interactedElement);
                        _this.changeInteraction(currentState, nodeID, interactionName + 'row', interactedElement);
                    }
                    return currentState;
                    //nodeID = cellData.rowid;
                    //interactionName = interactionName + 'row'
                }
                else if (interactionName == 'neighborSelect') {
                    //this.controller.model.provenance.applyAction(action);
                    var columnData = d3.select(node).data()[0];
                    interactedElement = 'colClick' + d3.select(node).data()[0][0].rowid;
                    columnData.map(function (node) {
                        if (node.mentions != 0 || node.combined != 0 || node.retweet != 0) {
                            var neighbor = node.colid;
                            _this.changeInteraction(currentState, neighbor, interactionName, interactedElement);
                        }
                    });
                    return currentState;
                }
                _this.changeInteraction(currentState, nodeID, interactionName, interactedElement);
                return currentState;
            },
            args: [nodeID]
        };
    };
    /**
     * Used to determine the ID based upon the datum element.
     * @param  data data returned as the first argument of d3 selection
     * @return      a list containing the id (ID's) of data elements
     */
    View.prototype.determineID = function (data) {
        // if attr Row
        if (data[this.datumID]) {
            return data[this.datumID];
        }
        else if (data.colid) { // if cell
            return data.colid + data.rowid;
        }
        else { // if colLabel or rowLabel
            return data[0].rowid;
        }
    };
    View.prototype.alreadyCellInState = function (state, nodeID) {
        var cellNames = splitCellNames(nodeID);
        var flag = false;
        cellNames.map(function (name) {
            if (state.selections['cell'][name]) {
                delete state.selections['cell'][name];
                flag = true;
            }
        });
        return flag;
    };
    /**
     * Adds the interacted node to the state object.
     * @param  state           [description]
     * @param  nodeID          [description]
     * @param  interaction     [description]
     * @param  interactionName [description]
     * @return                 [description]
     */
    View.prototype.changeInteraction = function (state, nodeID, interaction, interactionName) {
        if (interactionName === void 0) { interactionName = interaction; }
        // if there have been any mouseover events since the last submitted action, log them in provenance
        if (this.mouseoverEvents.length > 1) {
            state.selections.previousMouseovers = this.mouseoverEvents;
            this.mouseoverEvents = [];
        }
        if (nodeID in state.selections[interaction]) {
            // Remove element if in list, if list is empty, delete key
            var currentIndex = state.selections[interaction][nodeID].indexOf(interactionName);
            if (currentIndex > -1) {
                state.selections[interaction][nodeID].splice(currentIndex, 1);
                if (state.selections[interaction][nodeID].length == 0)
                    delete state.selections[interaction][nodeID];
            }
            else {
                state.selections[interaction][nodeID].push(interactionName);
            }
        }
        else {
            state.selections[interaction][nodeID] = [interactionName];
        }
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
            squares
                .style("fill", function (d) {
                if (d.combined !== 0) {
                    return _this.edgeScales["combined"](d.combined);
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
                .filter(function (d) { return d.combined !== 0 || d.retweet !== 0 || d.mentions !== 0; })
                .style("fill-opacity", function (d) {
                return (d.combined !== 0 || d.retweet !== 0 || d.mentions !== 0) ? 1 : 0;
            });
        }
        else if (type == "combined") {
            squares.style("fill", function (d) {
                if (d.combined !== 0) {
                    return _this.edgeScales["combined"](d.combined);
                }
                else {
                    return "white";
                }
            })
                .style("fill-opacity", function (d) {
                return d.combined !== 0 ? 1 : 0;
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
    View.prototype.generateScaleLegend = function (type, numberOfEdge) {
        var _this = this;
        var yOffset = 10;
        var xOffset = 10;
        if (this.controller.configuration.adjMatrix.edgeBars && this.controller.configuration.isMultiEdge) {
            var legendFile = 'assets/adj-matrix/';
            legendFile += this.controller.configuration.isMultiEdge ? 'nestedSquaresLegend' : 'edgeBarsLegendSingleEdge';
            legendFile += '.png';
            d3.select('#legend-svg').append('g').append("svg:image")
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 90)
                .attr('height', 120)
                .attr("xlink:href", legendFile);
            //return;
            xOffset = 100;
        }
        var rectWidth = 18;
        var rectHeight = 10;
        var legendWidth = 175;
        var legendHeight = 60;
        yOffset += legendHeight * numberOfEdge;
        var scale = this.edgeScales[type];
        var extent = scale.domain();
        var number = 5;
        var sampleNumbers = [0, 3, 7, 11]; //this.linspace(extent[0], extent[1], number);
        var svg = d3.select('#legend-svg').append("g")
            .attr("id", "legendLinear" + type)
            .attr("transform", function (d, i) { return "translate(" + xOffset + "," + yOffset + ")"; })
            .on('click', function (d, i, nodes) {
            if (_this.controller.configuration.adjMatrix.selectEdgeType == true) { //
                var edgeType = _this.controller.configuration.state.adjMatrix.selectedEdgeType == type ? 'all' : type;
                _this.controller.configuration.state.adjMatrix.selectedEdgeType = edgeType;
                _this.setSquareColors(edgeType);
                if (edgeType == "all") {
                    d3.selectAll('.selectedEdgeType').classed('selectedEdgeType', false);
                }
                else {
                    d3.selectAll('.selectedEdgeType').classed('selectedEdgeType', false);
                    d3.selectAll('#legendLinear' + type).select('.edgeLegendBorder').classed('selectedEdgeType', true);
                }
            }
        });
        var boxWidth = (number + 1) * rectWidth + 15;
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
        else if (pluralType == "combined") {
            pluralType = "interactions";
        }
        svg.append('text')
            .attr('x', boxWidth / 2)
            .attr('y', 8)
            .attr('text-anchor', 'middle')
            .text("# of " + pluralType);
        var sideMargin = ((boxWidth) - (sampleNumbers.length * (rectWidth + 5))) / 2;
        var groups = svg.selectAll('g')
            .data(sampleNumbers)
            .enter()
            .append('g')
            .attr('transform', function (d, i) { return 'translate(' + (sideMargin + i * (rectWidth + 5)) + ',' + 15 + ')'; });
        groups
            .append('rect')
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('fill', function (d) {
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
    };
    View.prototype.generateColorLegend = function () {
        var counter = 0;
        for (var type in this.edgeScales) {
            if (this.controller.configuration.isMultiEdge) {
                if (type == "combined") {
                    continue;
                }
                this.generateScaleLegend(type, counter);
                counter += 1;
            }
            else {
                if (type != "combined") {
                    continue;
                }
                this.generateScaleLegend(type, counter);
            }
        }
    };
    /**
     * [selectRow description]
     * @param  node [description]
     * @return      [description]
     */
    View.prototype.classHighlights = function (nodeID, rowOrCol, className) {
        if (rowOrCol === void 0) { rowOrCol = 'Row'; }
        // select attr and topo highlight
        d3.selectAll('Attr' + rowOrCol + nodeID + ',' + 'Topo' + rowOrCol + nodeID)
            .classed(className, true);
        //d3.selectAll('#highlight' + 'Topo' + rowOrCol + nodeID)
        //  .classed(className, true);*
        // highlight row text
        //d3.selectAll('')rowOrCol
        // else highlight column text
    };
    /**
     * [highlightRow description]
     * @param  node [description]
     * @return      [description]
     */
    /*highlightRow(node) {
      let nodeID = node[this.datumID];
      if (nodeID == null) {
        nodeID = node.rowid;
      }
      // highlight attr
      this.highlightNode(nodeID, 'attr');
      this.highlightNode(nodeID, 'topo');
    }
  
    highlightRowAndCol(node) {
      let nodeID = node.screen_name;
      if (node.screen_name == null) {
        nodeID = node.colid;
      }
  
      this.highlightNode(nodeID, 'attr');
      this.highlightNode(nodeID, '', 'Col');
    }
  
    highlightNode(nodeID: string, attrOrTopo: string, rowOrCol: string = 'Row') {
      d3.selectAll('.' + attrOrTopo + rowOrCol + nodeID)
        .classed('hovered', true);
    }*/
    //u: BCC    BCCINVITADOS2019
    //p:
    //private selectedNodes : any;
    // DOESNT GET ADDED
    View.prototype.addHighlightNode = function (addingNode) {
        // if node is in
        var nodeIndex = this.nodes.findIndex(function (item, i) {
            return item[this.datumID] == addingNode;
        });
        for (var i = 0; i < this.matrix[0].length; i++) {
            if (this.matrix[i][nodeIndex].z > 0) {
                var nodeID = this.matrix[i][nodeIndex].rowid;
                if (this.controller.configuration.state.adjMatrix.highlightedNodes.hasOwnProperty(nodeID) && !this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID].includes(addingNode)) {
                    // if array exists, add it
                    this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID].push(addingNode);
                }
                else {
                    // if array non exist, create it and add node
                    this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID] = [addingNode];
                }
            }
        }
    };
    /**
     * [removeHighlightNode description]
     * @param  nodeID       [description]
     * @param  removingNode [description]
     * @return              [description]
  
    removeHighlightNode(removingNode: string) {
      // remove from selected nodes
  
      for (let nodeID in this.controller.configuration.state.adjMatrix.highlightedNodes) {
        //finds the position of removing node in the nodes array
        let index = this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID].indexOf(removingNode);
        // keep on removing all places of removing node
        if (index > -1) {
          this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID].splice(index, 1);
          // delete properties if no nodes left
          if (this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID].length == 0) {
            delete this.controller.configuration.state.adjMatrix.highlightedNodes[nodeID];
          }
        }
      }
    }*/
    View.prototype.nodeDictContainsPair = function (dict, nodeToHighlight, interactedElement) {
        if (nodeToHighlight in dict) {
            return dict[nodeToHighlight].has(interactedElement);
        }
        return false;
    };
    /**
     * If an interactedElement has not been interacted with, it will add the nodeToHighlight
     * to the provided highlight dict. If it has, it will remove it and return false. Otherwise,
     * it will add the interacted element connection to the nodeToHighlight.
     * @param  dict       The underlying storage to show which
     * @param  nodeToHighlight  [description]
     * @param  interactedElement [description]
     * @return            [description]
     */
    View.prototype.addHighlightNodesToDict = function (dict, nodeToHighlight, interactedElement) {
        // if node already in highlight, remove it
        if (this.nodeDictContainsPair(dict, nodeToHighlight, interactedElement)) {
            this.removeHighlightNodesToDict(dict, nodeToHighlight, interactedElement);
            return false;
        }
        // create new set if set exists
        if (!(nodeToHighlight in dict)) {
            dict[nodeToHighlight] = new Set();
        }
        // add element to set
        dict[nodeToHighlight].add(interactedElement);
        return true;
    };
    View.prototype.removeHighlightNodesToDict = function (dict, nodeToHighlight, interactedElement) {
        // if node is not in list, simply return
        if (!this.nodeDictContainsPair(dict, nodeToHighlight, interactedElement)) {
            return;
        }
        // if there are other elements highlighting the node to highlight
        if (dict[nodeToHighlight].size > 1) { // if set has more than 1 object
            dict[nodeToHighlight].delete(interactedElement); // delete element from set
        }
        else {
            delete dict[nodeToHighlight];
        }
    };
    View.prototype.renderHighlightNodesFromDict = function (dict, classToRender, rowOrCol) {
        //unhighlight all other nodes
        if (rowOrCol === void 0) { rowOrCol = 'Row'; }
        //highlight correct nodes
        var cssSelector = '';
        for (var nodeID in dict) {
            if (rowOrCol == 'Row') {
                cssSelector += '#attr' + rowOrCol + nodeID + ',';
            }
            cssSelector += '#topo' + rowOrCol + nodeID + ',';
            if (classToRender == 'answer' && rowOrCol == "Row") {
                cssSelector += '#nodeLabelRow' + nodeID + ',';
            }
        }
        // remove last comma
        cssSelector = cssSelector.substring(0, cssSelector.length - 1);
        if (cssSelector == '') {
            return;
        }
        d3.selectAll(cssSelector).classed(classToRender, true);
    };
    View.prototype.selectNode = function (nodeID) {
        var index = this.controller.configuration.state.selectedNodes.indexOf(nodeID);
        if (index > -1) {
            this.controller.configuration.state.selectedNodes.splice(index, 1);
        }
        else {
            this.controller.configuration.state.selectedNodes.push(nodeID);
        }
        var attrRow = d3.selectAll('attr' + 'Row' + nodeID);
        attrRow
            .classed('selected', !attrRow.classed('selected'));
        var topoRow = d3.selectAll('topo' + 'Row' + nodeID);
        topoRow
            .classed('selected', !topoRow.classed('selected'));
    };
    View.prototype.selectColumnNode = function (nodeID) {
        // highlight
    };
    /**
     * Old implementation to select the neighboring nodes.
     * @param  nodeID [description]
     * @return        [description]
     */
    View.prototype.selectNeighborNodes = function (nodeID) {
        var nodeIndex = this.controller.configuration.state.adjMatrix.columnSelectedNodes.indexOf(nodeID);
        if (nodeIndex > -1) {
            // find all neighbors and remove them
            this.controller.configuration.state.adjMatrix.columnSelectedNodes.splice(nodeIndex, 1);
            this.removeHighlightNode(nodeID);
            this.controller.configuration.state.adjMatrix.columnSelectedNodes.splice(nodeIndex, 1);
            // remove node from column selected nodes
        }
        else {
            this.addHighlightNode(nodeID);
            this.controller.configuration.state.adjMatrix.columnSelectedNodes.push(nodeID);
        }
        this.renderNeighborHighlightNodes();
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
            //.transition()
            //.duration(transitionTime)
            //.delay((d, i) => { return this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) {
            if (i > _this.order.length - 1)
                return;
            return "translate(0," + _this.verticalScale(i) + ")";
        });
        var cells = d3.selectAll(".cell") //.selectAll('rect')
            //.transition()
            //.duration(transitionTime)
            //.delay((d, i) => { return this.verticalScale(i) * 4; })
            //.delay((d) => { return this.verticalScale(d.x) * 4; })
            .attr("transform", function (d, i) {
            return 'translate(' + _this.verticalScale(d.x) + ',0)';
        });
        this.attributeRows
            //.transition()
            //.duration(transitionTime)
            //.delay((d, i) => { return this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + _this.verticalScale(i) + ")"; });
        // update each highlightRowsIndex
        var t = this.edges; //.transition().duration(transitionTime);
        t.selectAll(".column")
            //.delay((d, i) => { return this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(" + _this.verticalScale(i) + ",0)rotate(-90)"; });
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
    View.prototype.updateCheckBox = function (state) {
        var _this = this;
        if (this.controller.configuration.attributeScales.node.selected == undefined) {
            return;
        }
        var color = this.controller.configuration.attributeScales.node.selected.range[0];
        d3.selectAll('.answerBox').selectAll('rect').transition().duration(250)
            .style("fill", function (d) {
            var answerStatus = d[_this.datumID] in state.selections.answerBox;
            return answerStatus ? color : "white";
        });
    };
    View.prototype.updateAnswerToggles = function (state) {
        var _this = this;
        //let answerStatus = nodeID in this.controller.answerRow;
        if (this.controller.configuration.attributeScales.node.selected == undefined) {
            return;
        }
        var color = this.controller.configuration.attributeScales.node.selected.range[0];
        d3.selectAll('.answerBox').selectAll('circle').transition().duration(500)
            .attr("cx", function (d) {
            var answerStatus = d[_this.datumID] in state.selections.answerBox;
            return (answerStatus ? 3 * _this.columnWidths['selected'] / 4 : 1.15 * _this.columnWidths['selected'] / 4);
        })
            .style("fill", function (d) {
            var answerStatus = d[_this.datumID] in state.selections.answerBox;
            return answerStatus ? color : "white";
        });
        d3.select('.answerBox').selectAll('rect').transition().duration(500)
            .style("fill", function (d) {
            var answerStatus = d[_this.datumID] in state.selections.answerBox;
            return answerStatus ? "#8B8B8B" : "lightgray";
        });
    };
    /**
     * [initalizeAttributes description]
     * @return [description]
     */
    View.prototype.initalizeAttributes = function () {
        var _this = this;
        var width = this.controller.visWidth * this.controller.attributePorportion; //this.edgeWidth + this.margins.left + this.margins.right;
        var height = this.controller.visHeight; //this.edgeHeight + this.margins.top + this.margins.bottom;
        this.attributeWidth = width - (this.margins.left + this.margins.right); //* this.controller.attributePorportion;
        this.attributeHeight = height - (this.margins.top + this.margins.bottom); // * this.controller.attributePorportion;
        this.attributes = d3.select('#attributes').append("svg")
            .attr("viewBox", "0 0 " + (width) + " " + height + "")
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
            .attr("x2", this.controller.attrWidth)
            .attr('stroke', '2px')
            .attr('stroke-opacity', 0.3);
        var attributeMouseOver = function (d) {
            that.addHighlightNodesToDict(_this.controller.hoverRow, d[_this.datumID], d[_this.datumID]); // Add row (rowid)
            that.addHighlightNodesToDict(_this.controller.hoverCol, d[_this.datumID], d[_this.datumID]); // Add row (rowid)
            _this.mouseoverEvents.push({ time: new Date().getTime(), event: 'attrRow' + d[_this.datumID] });
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
            that.renderHighlightNodesFromDict(_this.controller.hoverCol, 'hovered', 'Col');
        };
        this.attributeMouseOver = attributeMouseOver;
        var attributeMouseOut = function (d) {
            that.removeHighlightNodesToDict(_this.controller.hoverRow, d[_this.datumID], d[_this.datumID]); // Add row (rowid)
            that.removeHighlightNodesToDict(_this.controller.hoverCol, d[_this.datumID], d[_this.datumID]); // Add row (rowid)
            d3.selectAll('.hovered').classed('hovered', false);
            that.renderHighlightNodesFromDict(_this.controller.hoverRow, 'hovered', 'Row');
        };
        this.attributeMouseOut = attributeMouseOut;
        this.attributeRows.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .classed('attrRow', true)
            .attr('id', function (d, i) {
            return "attrRow" + d[_this.datumID];
        })
            .attr('width', width)
            .attr('height', this.verticalScale.bandwidth()) // end addition
            .attr("fill-opacity", 0)
            .on('mouseover', attributeMouseOver)
            .on('mouseout', attributeMouseOut).on('click', this.clickFunction);
        /*.on('click', (d, i, nodes) => {
    
          /*let cellElement = d3.select(nodes[index]).selectAll('rect');
          cellElement.classed('clickedCell', !cellElement.classed('clickedCell'))
          let cellID = cell.rowid + cell.colid;
          let nodeID = d.screen_name;
          /*
          // will add or remove node
          that.addHighlightNodesToDict(this.controller.answerRow, nodeID, nodeID);  // Add row (rowid)
          d3.selectAll('.answer').classed('answer', nodeID in this.controller.answerRow);
          that.renderHighlightNodesFromDict(this.controller.answerRow, 'answer', 'Row');
    
    
          that.addHighlightNodesToDict(this.controller.clickedRow, nodeID, nodeID);  // FOR ANSWER
          //d3.selectAll('.answer').classed('answer', false);
          d3.selectAll('.clicked').classed('clicked', nodeID in this.controller.clickedRow);
    
          that.renderHighlightNodesFromDict(this.controller.clickedCol, 'clicked', 'Col');
          that.renderHighlightNodesFromDict(this.controller.clickedRow, 'clicked', 'Row');
    
          // classes row
          //this.classHighlights(d.screen_name, 'Row', 'answer');
          //this.selectNode(d[0].rowid);
        });*/
        var columns = this.controller.configuration.nodeAttributes;
        //columns.unshift('selected'); // ANSWER COLUMNS
        var formatCurrency = d3.format("$,.0f"), formatNumber = d3.format(",.0f");
        // generate scales for each
        var attributeScales = {};
        this.columnScale = d3.scaleOrdinal().domain(columns);
        // Calculate Column Scale
        var columnRange = [];
        var xRange = 0;
        var columnWidths = this.determineColumnWidths(columns); // ANSWER COLUMNS
        //450 / columns.length;
        this.columnWidths = columnWidths;
        var categoricalAttributes = ["type", "continent"];
        var quantitativeAttributes = ["followers_count", "friends_count", "statuses_count", "count_followers_in_query", "favourites_count", "listed_count", "memberFor_days", "query_tweet_count"];
        columns.forEach(function (col, index) {
            // calculate range
            columnRange.push(xRange);
            var domain = _this.controller.configuration.attributeScales.node[col].domain;
            if (quantitativeAttributes.indexOf(col) > -1) {
                var scale = d3.scaleLinear().domain(domain).range([barMargin.left, columnWidths[col] - barMargin.right]);
                scale.clamp(true);
                attributeScales[col] = scale;
            }
            else {
                // append colored blocks
                // placeholder scale
                var range = _this.controller.configuration.attributeScales.node[col].range;
                var scale = d3.scaleOrdinal().domain(domain).range(range);
                //.domain([true,false]).range([barMargin.left, colWidth-barMargin.right]);
                attributeScales[col] = scale;
            }
            xRange += columnWidths[col];
        });
        this.attributeScales = attributeScales;
        // need max and min of each column
        /*this.barWidthScale = d3.scaleLinear()
          .domain([0, 1400])
          .range([0, 140]);*/
        var placementScale = {};
        this.columnScale.range(columnRange);
        for (var _i = 0, _a = Object.entries(attributeScales); _i < _a.length; _i++) {
            var _b = _a[_i], column = _b[0], scale = _b[1];
            if (categoricalAttributes.indexOf(column) > -1) { // if not selected categorical
                placementScale[column] = this.generateCategoricalLegend(column, columnWidths[column]);
            }
            else if (quantitativeAttributes.indexOf(column) > -1) {
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
        }
        /* Create data columns data */
        columns.forEach(function (column, index) {
            var columnPosition = _this.columnScale(column);
            if (categoricalAttributes.indexOf(column) > -1) { // if categorical
                _this.createUpsetPlot(column, columnWidths[index], placementScale[column]);
                return;
            }
            else if (quantitativeAttributes.indexOf(column) > -1) { // if quantitative
                _this.attributeRows
                    .append("rect")
                    .attr("class", "glyph")
                    .attr('height', barHeight)
                    .attr('width', 10) // width changed later on transition
                    .attr('x', columnPosition + barMargin.left)
                    .attr('y', barMargin.top) // as y is set by translate
                    .attr('fill', '#8B8B8B')
                    .on('mouseover', function (d) {
                    //if (that.columnNames[d] && that.columnNames[d].length > maxcharacters) {
                    //that.tooltip.transition().delay(1000).duration(200).style("opacity", .9);
                    var matrix = this.getScreenCTM()
                        .translate(+this.getAttribute("x"), +this.getAttribute("y"));
                    that.tooltip.html(Math.round(d[column]))
                        .style("left", (window.pageXOffset + matrix.e + columnWidths[column] / 2 - 35) + "px")
                        .style("top", (window.pageYOffset + matrix.f - 5) + "px");
                    that.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    attributeMouseOver(d);
                    //}
                })
                    .on('mouseout', function (d) {
                    that.tooltip.transition().duration(25).style("opacity", 0);
                    attributeMouseOut(d);
                })
                    .transition()
                    .duration(2000)
                    .attr('width', function (d, i) { return attributeScales[column](d[column]); });
                _this.attributeRows
                    .append("div")
                    .attr("class", "glyphLabel")
                    .text(function (d, i) {
                    return (i ? formatNumber : formatCurrency)(d);
                });
            }
            else {
                barMargin.left = 1;
                var answerBox = _this.attributeRows
                    .append('g')
                    .attr("class", "answerBox")
                    .attr("id", function (d) { return "answerBox" + d[_this.datumID]; })
                    .attr('transform', 'translate(' + (columnPosition + barMargin.left) + ',' + 0 + ')');
                if (_this.controller.configuration.adjMatrix.toggle) {
                    var rect = answerBox.append("rect")
                        .attr("x", (columnWidths[column] / 4)) // if column with is 1, we want this at 1/4, and 1/2 being mid point
                        .attr("y", barMargin.top)
                        .attr("rx", barHeight / 2)
                        .attr("ry", barHeight / 2)
                        .style("fill", "lightgray")
                        .attr("width", columnWidths[column] / 2)
                        .attr("height", barHeight)
                        .attr('stroke', 'lightgray')
                        .on('mouseover', attributeMouseOver)
                        .on('mouseout', attributeMouseOut);
                    var circle = answerBox.append("circle")
                        .attr("cx", (1.15 * columnWidths[column] / 4))
                        .attr("cy", barHeight / 2 + barMargin.top)
                        .attr("r", barHeight / 2)
                        .style("fill", "white")
                        .style('stroke', 'lightgray');
                }
                else {
                    var rect = answerBox.append("rect")
                        .attr("x", (columnWidths[column] / 2) - barHeight / 2) // if column with is 1, we want this at 1/4, and 1/2 being mid point
                        .attr("y", barMargin.top)
                        //.attr("rx", barHeight / 2)
                        //.attr("ry", barHeight / 2)
                        .style("fill", "white")
                        .attr("width", barHeight)
                        .attr("height", barHeight)
                        .attr('stroke', 'lightgray')
                        .on('mouseover', attributeMouseOver)
                        .on('mouseout', attributeMouseOut);
                }
                answerBox
                    .on('click', function (d, i, nodes) {
                    var color = _this.controller.configuration.attributeScales.node.selected.range[0];
                    //if already answer
                    var nodeID = _this.determineID(d);
                    //that.addHighlightNodesToDict(this.controller.answerRow, nodeID, nodeID);  // Add row or remove if already in
                    //d3.selectAll('.answer').classed('answer', false);
                    //that.renderHighlightNodesFromDict(this.controller.answerRow, 'answer', 'Row');
                    /*Visual chagne */
                    var answerStatus = nodeID in _this.controller.answerRow;
                    if (_this.controller.configuration.adjMatrix.toggle) {
                        d3.select(nodes[i]).selectAll('circle').transition().duration(500)
                            .attr("cx", (answerStatus ? 3 * columnWidths[column] / 4 : 1.15 * columnWidths[column] / 4))
                            .style("fill", answerStatus ? color : "white");
                        d3.select(nodes[i]).selectAll('rect').transition().duration(500)
                            .style("fill", answerStatus ? "#8B8B8B" : "lightgray");
                    }
                    else {
                    }
                    _this.clickFunction(d, i, nodes);
                    //let action = this.changeInteractionWrapper(nodeID, i, nodes);
                    //this.controller.model.provenance.applyAction(action);
                    //d3.select(nodes[i]).transition().duration(500).attr('fill',)
                });
            }
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
        this.columnNames = {
            "followers_count": "Followers",
            "query_tweet_count": "On-Topic Tweets",
            "friends_count": "Friends",
            "statuses_count": "Tweets",
            "favourites_count": "Liked Tweets",
            "count_followers_in_query": "In-Network Followers",
            "continent": "Continent",
            "type": "Type",
            "memberFor_days": "Account Age",
            "listed_count": "In Lists",
            "selected": "Answer"
        };
        var that = this;
        function calculateMaxChars(numColumns) {
            switch (numColumns) {
                case 1:
                    return { "characters": 20, "font": 17 };
                case 2:
                    return { "characters": 20, "font": 15 };
                case 3:
                    return { "characters": 20, "font": 14 };
                case 4:
                    return { "characters": 19, "font": 13 };
                case 5:
                    return { "characters": 18, "font": 12 };
                case 6:
                    return { "characters": 16, "font": 12 };
                case 7:
                    return { "characters": 14, "font": 10 };
                case 8:
                    return { "characters": 12, "font": 10 };
                case 9:
                    return { "characters": 10, "font": 10 };
                case 10:
                    return { "characters": 8, "font": 10 };
                default:
                    return { "characters": 8, "font": 10 };
            }
        }
        var options = calculateMaxChars(columns.length); // 10 attr => 8
        var maxcharacters = options.characters;
        var fontSize = options.font; //*1.1;
        //this.createColumnHeaders();
        var columnHeaders = this.attributes.append('g')
            .classed('column-headers', true);
        var columnHeaderGroups = columnHeaders.selectAll('.header')
            .data(columns)
            .enter()
            .append('g')
            .attr('transform', function (d) { return 'translate(' + (_this.columnScale(d)) + ',' + (-65) + ')'; });
        columnHeaderGroups
            .append('rect')
            .attr('width', function (d) { return _this.columnWidths[d]; })
            .attr('height', 20)
            .attr('y', 0)
            .attr('x', 0)
            .attr('fill', 'none')
            .attr('stroke', 'lightgray')
            .attr('stroke-width', 1);
        columnHeaderGroups
            .append('text')
            .classed('header', true)
            //.attr('y', -45)
            //.attr('x', (d) => this.columnScale(d) + barMargin.left)
            .style('font-size', fontSize.toString() + 'px')
            .attr('text-anchor', 'middle')
            //.attr('transform','rotate(-10)')
            .text(function (d, i) {
            if (_this.columnNames[d] && _this.columnNames[d].length > maxcharacters) {
                return _this.columnNames[d].slice(0, maxcharacters - 2) + '...'; // experimentally determine how big
            }
            return _this.columnNames[d];
        })
            .attr('x', function (d) { return _this.columnWidths[d] / 2; })
            .attr('y', 14)
            .on('mouseover', function (d) {
            if (that.columnNames[d] && that.columnNames[d].length > maxcharacters) {
                that.tooltip.transition().duration(200).style("opacity", .9);
                var matrix = this.getScreenCTM()
                    .translate(+this.getAttribute("x"), +this.getAttribute("y"));
                that.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                that.tooltip.html(that.columnNames[d])
                    .style("left", (window.pageXOffset + matrix.e - 25) + "px")
                    .style("top", (window.pageYOffset + matrix.f - 20) + "px");
            }
        })
            .on('mouseout', function (d) {
            that.tooltip.transition().duration(250).style("opacity", 0);
        })
            .on('click', function (d) {
            if (d !== 'selected') {
                _this.sort(d);
            }
        });
        var answerColumn = columnHeaders.selectAll('.header').filter(function (d) { return d == 'selected'; });
        answerColumn.attr('font-weight', 650); //.attr('y', 35).attr('x', 10);
        d3.select('.loading').style('display', 'none');
        this.controller.model.setUpProvenance();
        window.focus();
        // Append g's for table headers
        // For any data row, add
        /*.on("click", clicked)
        .select(".g-table-column")
        .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
          return d === sortKey;
        });*/
    };
    View.prototype.isCategorical = function (column) {
        return column == "type" || column == "continent" || column == "selected";
    };
    View.prototype.determineColumnWidths = function (columns) {
        var widths = {};
        // set all column widths to 0
        // set all categorical column width to their width, keep track of total width
        // set all other columns widths based off width - categorical
        var widthOffset = this.controller.attrWidth / columns.length;
        var totalCategoricalWidth = 0;
        var bandwidthScale = 2;
        var bandwidth = this.verticalScale.bandwidth();
        // fill in categorical column sizes
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            // if column is categorical
            if (this.isCategorical(column)) {
                var width = (bandwidthScale * bandwidth) * (this.controller.configuration.attributeScales.node[column].domain.length + 3 / bandwidthScale);
                if (column == "selected") {
                    width = 60;
                }
                widths[column] = width;
                totalCategoricalWidth += width; // add width
            }
        }
        var quantitativeWidth = this.controller.attrWidth - totalCategoricalWidth, quantitativeColumns = columns.length - Object.keys(widths).length, quantitativeColumnSize = quantitativeWidth / quantitativeColumns;
        // fill in remaining columns based off the size remaining for quantitative variables
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (!(column in widths)) {
                widths[column] = quantitativeColumnSize;
            }
        }
        return widths;
        // add categorical column width
    };
    View.prototype.createUpsetPlot = function (column, columnWidth, placementScaleForAttr) {
        var _this = this;
        var columnPosition = this.columnScale(column);
        var topMargin = 1;
        var height = this.verticalScale.bandwidth() - 2 * topMargin;
        var width = this.verticalScale.bandwidth() * 2;
        var _loop_2 = function (index) {
            this_2.attributeRows
                .append('rect')
                .attr('x', placementScaleForAttr[index].position)
                .attr('y', 1)
                .attr('fill', function (d) {
                return d[column] == placementScaleForAttr[index].value ? _this.attributeScales[column](d[column]) : '#dddddd'; // gray version: '#333333'
            })
                .attr('width', width)
                .attr('height', height)
                .on('mouseover', function (d, i, nodes) {
                if (d[column] == placementScaleForAttr[index].value) {
                    var matrix = nodes[i].getScreenCTM()
                        .translate(+nodes[i].getAttribute("x"), +nodes[i].getAttribute("y"));
                    _this.tooltip.html(d[column])
                        .style("left", (window.pageXOffset + matrix.e - 25) + "px")
                        .style("top", (window.pageYOffset + matrix.f - 25) + "px");
                    _this.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                }
                _this.attributeMouseOver(d);
            })
                .on('mouseout', function (d, i, nodes) {
                _this.tooltip.transition()
                    .duration(25)
                    .style("opacity", 0);
                //that.tooltip.transition().duration(25).style("opacity", 0);
                _this.attributeMouseOut(d);
            });
        };
        var this_2 = this;
        for (var index = 0; index < placementScaleForAttr.length; index++) {
            _loop_2(index);
        }
        return;
    };
    View.prototype.generateCategoricalLegend = function (attribute, legendWidth) {
        var attributeInfo = this.controller.configuration.attributeScales.node[attribute];
        var dividers = attributeInfo.domain.length;
        var legendHeight = 25;
        var bandwidthScale = 2;
        var bandwidth = this.verticalScale.bandwidth();
        var legendItemSize = bandwidth * bandwidthScale;
        //(legendWidth) / (dividers + 3/bandwidthScale);
        var margin = bandwidth * bandwidthScale / dividers;
        var xRange = [];
        var rects = this.attributes.append("g")
            .attr("transform", "translate(" + (this.columnScale(attribute) + 1 * bandwidth) + "," + (-legendHeight) + ")"); //
        for (var i = 0; i < dividers; i++) {
            var rect1 = rects
                .append('g')
                .attr('transform', 'translate(' + (i * (legendItemSize + margin)) + ',0)');
            xRange.push({
                "attr": attribute,
                "value": attributeInfo.domain[i],
                "position": (this.columnScale(attribute) + 1 * bandwidth) + (i * (legendItemSize + margin))
            });
            rect1
                .append('rect')
                .attr('x', 0) //(legendItemSize + margin)/2 -this.verticalScale.bandwidth()
                .attr('y', 0)
                .attr('fill', attributeInfo.range[i])
                .attr('width', legendItemSize)
                .attr('height', this.verticalScale.bandwidth());
            rect1
                .append('text')
                .text(attributeInfo.legendLabels[i])
                .attr('x', legendItemSize / 2)
                .attr('y', -3)
                .attr('text-anchor', 'middle')
                .style('font-size', 11);
            //.attr('transform', 'rotate(-90)')
        }
        return xRange;
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
        var selection = d3.selectAll("." + attrOrTopo + rowOrCol)
            .filter(function (d, i) {
            if (attrOrTopo == "Attr" && d.index == null) {
                // attr
                return nodeToSelect.index == d[i][orientation];
            }
            //topology
            return nodeToSelect.index == d.index;
        });
        return selection;
    };
    View.prototype.clicked = function (key) {
    };
    /**
     * Changes the current view to be a loading screen.
     * @return None
     */
    View.prototype.renderLoading = function () {
        d3.select('.loading');
        /*.style('opacity', 0)
        .style('display', 'block')
        .transition()
        .duration(1000)
        .style('opacity', 1);*/
    };
    /**
     * Changes the current view to hide the loading screen
     * @return None
     */
    View.prototype.hideLoading = function () {
        /*
        if (d3.select('.loading').attr('display') != "none") {
          d3.select('.loading')
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .delay(1000)
            .style('display', 'none');
        }*/
    };
    return View;
}());
// Work on importing class file
var Controller = /** @class */ (function () {
    function Controller() {
        this.clickedRow = {};
        this.clickedCol = {};
        this.answerRow = {};
        this.hoverRow = {};
        this.hoverCol = {};
        this.datumID = 'id';
        this.loadClearButton();
        this.loadTasks();
        // this.loadTask(0);
        this.sizeLayout();
        //this.loadConfigs();
    }
    Controller.prototype.setupExports = function (base, task) {
        d3.select("#exportBaseConfig").on("click", function () {
            exportConfig(Object.keys(base), Object.keys(base.adjMatrix), false);
        });
        d3.select("#exportConfig").on("click", function () {
            exportConfig(Object.keys(task), Object.keys(task.adjMatrixValues), true);
        });
    };
    Controller.prototype.setupCSS = function (base) {
        return;
        /*set css values for 'clicked' nodes;
        //set fill or stroke of selected node;
    
        //find the appropriate style sheet
        var sheet = Object.values(document.styleSheets).find(s =>
          s.href.includes("styles.css")
        );
    
        // let nodeIsRect = config.style.nodeShape === 'rect';
        // sheet.addRule(".node", (nodeIsRect? 'rx: 2; ry:2'  : 'rx:20; ry:20' ) , 1);
    
          let ruleString = "fill :" + base.style.selectedNodeColor +" !important;";
          sheet.addRule(".rect.selected", ruleString, 1);
          */
    };
    Controller.prototype.finishConstructing = function (config) {
        this.configuration = config;
        this.view = new View(this); // initalize view,
        this.model = new Model(this); // start reading in data
    };
    Controller.prototype.loadTask = function (taskNum) {
        this.taskNum = taskNum;
        this.task = this.tasks[this.taskNum];
        this.configuration = this.task.config;
        //let prompt = 'Task ' + (this.taskNum + 1) + ' - ' + this.task.prompt;
        //this.configuration.adjMatrix.edgeBars = true;
        if (this.task.replyType.includes('singleNodeSelection') || this.task.replyType.includes('multipleNodeSelection')) {
            if (!this.configuration.nodeAttributes.includes('selected')) {
                this.configuration.nodeAttributes.unshift('selected');
                var obj = {
                    "domain": [true, false],
                    "range": ["#e86b45", '#fff'],
                    "labels": ['answer', 'not answer'],
                    'glyph': 'rect',
                    'label': 'selected'
                };
                this.configuration.attributeScales.node['selected'] = obj;
            }
        }
        this.configuration.adjMatrix['toggle'] = false;
        //this.configuration.adjMatrix.neighborSelect = true;
        this.attrWidth = d3.min([125 * this.configuration.nodeAttributes.length, 650]);
        this.configuration.state = {};
        this.configuration.state.adjMatrix = {};
        if (this.configuration.adjMatrix.sortKey == null || this.configuration.adjMatrix.sortKey == '') {
            this.configuration.adjMatrix.sortKey = 'shortName';
        }
        this.sizeLayout();
        //configuration.adjMatrix.sortKey
        this.reload();
        // load data file
        // render vis from configurations
        // add observers and new provenance graph
        // create new field to store in fB?
    };
    Controller.prototype.loadTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.taskNum = 0;
                this.tasks = taskList;
                return [2 /*return*/];
            });
        });
    };
    Controller.prototype.loadClearButton = function () {
        var _this = this;
        d3.select('#clearButton').on('click', function () {
            var action = {
                label: 'clear',
                action: function () {
                    var currentState = _this.model.app.currentState();
                    //add time stamp to the state graph
                    currentState.time = Date.now();
                    currentState.event = 'clear';
                    currentState.selections = {
                        answerBox: {},
                        attrRow: {},
                        rowLabel: {},
                        colLabel: {},
                        cellcol: {},
                        cellrow: {},
                        search: {},
                        neighborSelect: {}
                    };
                    return currentState;
                },
                args: []
            };
            _this.model.provenance.applyAction(action);
            //pushProvenance(this.model.app.currentState())
            //this.view.renderHighlightNodesFromDict(this.clickedRow, 'clicked', 'Row');
            //this.view.renderHighlightNodesFromDict(this.clickedCol, 'clicked', 'Col');
            //this.view.renderHighlightNodesFromDict(this.answerRow, 'answer', 'Row');
            //this.view.renderHighlightNodesFromDict(this.clickedRow,'clicked','Row');
            //this.view.renderHighlightNodesFromDict(this.clickedRow,'clicked','Row');
            //that.renderHighlightNodesFromDict(this.controller.hoverRow, 'hovered', 'Row');
        });
    };
    Controller.prototype.sizeLayout = function () {
        var targetDiv = d3.select("#targetSize");
        var width = targetDiv.style("width").replace("px", ""), height = targetDiv.style("height").replace("px", "");
        var taskBarHeight = 74;
        var panelDimensions = {};
        panelDimensions.width = width * 0.2;
        panelDimensions.height = height - taskBarHeight;
        d3.select("#visPanel").style("width", panelDimensions.width + "px");
        d3.select('#panelDiv').style('display', 'none');
        this.visHeight = panelDimensions.height;
        this.visWidth = width * 0.8 - 40;
        this.edgeWidth = this.visWidth - this.attrWidth;
        var filler = 0;
        if (panelDimensions.height < this.edgeWidth) {
            this.edgeWidth = panelDimensions.height;
            filler = this.visWidth - this.attrWidth - this.edgeWidth;
            this.visWidth = this.visWidth;
        }
        this.attributePorportion = this.attrWidth / (this.edgeWidth + this.attrWidth + filler);
        this.edgePorportion = this.edgeWidth / (this.edgeWidth + this.attrWidth + filler);
        if (this.edgeWidth < panelDimensions.height) {
            this.visHeight = this.visWidth * this.edgePorportion;
        }
        d3.select('.topocontainer').style('width', (100 * this.edgePorportion).toString() + '%');
        d3.select('.topocontainer').style('height', (this.visHeight).toString() + 'px');
        d3.select('.attrcontainer').style('width', (100 * this.attributePorportion).toString() + '%');
        d3.select('.attrcontainer').style('height', (this.visHeight).toString() + 'px');
        //d3.select('.adjMatrix.vis').style('width',width*0.8);
        d3.select('.adjMatrix.vis').style('width', (this.visWidth).toString() + 'px');
    };
    Controller.prototype.clearView = function () {
        d3.select('.tooltip').remove();
        d3.select('#topology').selectAll('*').remove();
        d3.select('#attributes').selectAll('*').remove();
        d3.select('#legend-svg').selectAll('*').remove();
    };
    Controller.prototype.reload = function () {
        this.clearView();
        //this.loadCurrentTask();
        d3.select('.loading').style('display', 'block');
        this.view = new View(this); // initalize view,
        this.model = new Model(this); //.reload();
        this.tasks[this.taskNum].startTime = Date.now();
        //
        //this.model = new Model(this); // start reading in data
    };
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
        this.configuration.adjMatrix.sortKey = order;
        return this.model.changeOrder(order);
    };
    return Controller;
}());
window.controller = new Controller();
//window.controller = control;
/* Deep merge stuff */
function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object';
    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]';
}
function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}
function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true;
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
}
function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice();
    source.forEach(function (e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument);
        }
        else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument);
        }
        else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument));
        }
    });
    return destination;
}
function mergeObject(target, source, optionsArgument) {
    var destination = {};
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument);
        });
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument);
        }
        else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument);
        }
    });
    return destination;
}
function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge };
    var arrayMerge = options.arrayMerge || defaultArrayMerge;
    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
    }
    else {
        return mergeObject(target, source, optionsArgument);
    }
}
function splitCellNames(name) {
    //remove cell
    var cleanedCellName = name.replace('cell', '');
    var ids = cleanedCellName.split('_');
    return ['cell' + ids[0] + '_' + ids[1], 'cell' + ids[1] + '_' + ids[0]];
}
