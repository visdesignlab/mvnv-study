var Model = /** @class */ (function () {
    function Model(controller) {
        var _this = this;
        this.controller = controller;
        this.datumID = controller.datumID;
        d3.json(controller.configuration.graphFiles[controller.configuration.loadedGraph]).then(function (data) {
            _this.graph = data;
            _this.edges = data.links;
            //setPanelValuesFromFile(controller.configuration, data);
            _this.matrix = [];
            _this.scalarMatrix = [];
            _this.nodes = data.nodes;
            _this.populateSearchBox();
            _this.idMap = {};
            // sorts adjacency matrix, if a cluster method, sort by shortname, then cluster later
            var clusterFlag = false;
            if (_this.controller.configuration.adjMatrix.sortKey in ['clusterBary', 'clusterLeaf', 'clusterSpectral']) {
                _this.orderType = 'shortName'; //this.controller.configuration.adjMatrix.sortKey;
                clusterFlag = true;
            }
            else {
                _this.orderType = _this.controller.configuration.adjMatrix.sortKey;
            }
            _this.order = _this.changeOrder(_this.orderType);
            // sorts quantitative by descending value, sorts qualitative by alphabetical
            if (!_this.isQuant(_this.orderType)) {
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
        });
    }
    /**
     * Determines if the attribute is quantitative
     * @param  attr [string that corresponds to attribute type]
     * @return      [description]
     */
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
        /*
        d3.select("#search-input").attr("list", "characters");
        let inputParent = d3.select("#search-input").node().parentNode;
    
        let datalist = d3
        .select(inputParent).selectAll('#characters').data([0]);
    
        let enterSelection = datalist.enter()
        .append("datalist")
        .attr("id", "characters");
    
        datalist.exit().remove();
    
        datalist= enterSelection.merge(datalist);
    
        let options = datalist.selectAll("option").data(this.nodes);
    
        let optionsEnter = options.enter().append("option");
        options.exit().remove();
    
        options = optionsEnter.merge(options);
        options.attr("value", d => d.shortName);
        options.attr("id", d => d.id);
    
        d3.select("#search-input").on("change", (d,i,nodes) => {
          let selectedOption = d3.select(nodes[i]).property("value");
          console.log(this.controller.view.search(selectedOption))
        });
    */
    };
    /**
     * returns an object containing the current provenance state.
     * @return [the provenance state]
     */
    Model.prototype.getApplicationState = function () {
        var _this = this;
        return {
            currentState: function () { return _this.provenance.graph().current.state; }
        };
    };
    /**
     * Initializes the provenance library and sets observers.
     * @return [none]
     */
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
        var columnElements = ['topoCol'];
        var rowElements = ['topoRow', 'attrRow'];
        var elementNamesFromSelection = {
            cellcol: rowElements.concat(columnElements),
            colLabel: rowElements.concat(columnElements).concat(['colLabel']),
            rowLabel: rowElements.concat(columnElements).concat(['rowLabel']),
            attrRow: rowElements.concat(['rowLabel']),
            cellrow: rowElements.concat(columnElements),
            neighborSelect: rowElements,
            answerBox: rowElements.concat(columnElements),
            search: rowElements.concat(columnElements)
        };
        function classAllHighlights(state) {
            var clickedElements = new Set();
            var answerElements = new Set();
            var neighborElements = new Set();
            // go through each interacted element, and determine which rows/columns should
            // be highlighted due to it's interaction
            for (var selectionType in state.selections) {
                for (var index in elementNamesFromSelection[selectionType]) {
                    var selectionElement = elementNamesFromSelection[selectionType][index];
                    for (var node in state.selections[selectionType]) {
                        if (selectionType == 'answerBox') {
                            answerElements.add('#' + selectionElement + node);
                        }
                        else if (selectionType == 'neighborSelect') {
                            neighborElements.add('#' + selectionElement + node);
                        }
                        else {
                            // if both in attrRow and rowLabel, don't highlight element
                            if (selectionType == 'attrRow' || selectionType == 'rowLabel') {
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
        else if (this.orderType == 'edges') {
            order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[a][type].length - _this.nodes[b][type].length; });
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
            _this.matrix[i] = _this.nodes.map(function (colNode) { return { cellName: 'cell' + rowNode[_this.datumID] + '_' + colNode[_this.datumID], correspondingCell: 'cell' + colNode[_this.datumID] + '_' + rowNode[_this.datumID], rowid: rowNode[_this.datumID], colid: colNode[_this.datumID], x: colNode.index, y: rowNode.index, count: 0, z: 0, interacted: 0, retweet: 0, mentions: 0 }; });
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
