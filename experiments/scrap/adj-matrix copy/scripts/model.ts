//import * as d3 from 'd3';

class Model {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private data: any;
  private matrix: any;
  private nodes: any;
  private edges: any;
  private order: any;
  private controller: any;

  constructor(controller: any) {
    d3.json("data.json").then((data: any) => {
      this.matrix = [];
      this.nodes = data.nodes;
      this.edges = data.links;
      this.controller = controller;

      this.processData();

      this.order = this.changeOrder('name');
      console.log(this.order);

      this.controller.updateData(this.nodes, this.edges, this.matrix);
    })
  }

  /**
   *   Determines the order of the current nodes
   * @param  type A string corresponding to the attribute name to sort by.
   * @return      A numerical range in corrected order.
   */
  changeOrder(type: string) {
    let order;
    if (type == 'name') {
      order = d3.range(this.nodes.length).sort((a, b) => { return d3.ascending(this.nodes[a].name, this.nodes[b].name); })
    }
    else {
      order = d3.range(this.nodes.length).sort((a, b) => { return this.nodes[b][type] - this.nodes[a][type]; })
    }
    return order;
  }

  /**
   * [processData description]
   * @return [description]
   */
  processData() {
    // Set up node data
    this.nodes.forEach((node, i) => {
      node.index = i;
      node.count = 0;

      /* Numeric Conversion */
      node.familyBefore = +node.familyBefore;
      node.familyAfter = +node.familyAfter;
      node.individualBefore = +node.individualBefore;
      node.individualAfter = +node.individualAfter;

      /* matrix used for edge attributes, otherwise should we hide */
      this.matrix[i] = d3.range(this.nodes.length).map(function(j) { return { x: j, y: i, z: 0 }; });
    });

    // Convert links to matrix; count character occurrences.
    this.edges.forEach((link) => {
      /* could be used for varying edge types */
      this.matrix[link.source][link.target].z += link.value;
      this.matrix[link.target][link.source].z += link.value;
      //matrix[link.source][link.source].z += link.value;
      //matrix[link.target][link.target].z += link.value;
      this.matrix[link.source].count += link.value;
      this.matrix[link.target].count += link.value;
    });
  }

  getOrder() {
    return this.order;
  }

  /**
   * Returns the node data.
   * @return Node data in JSON Array
   */
  getNodes() {
    return this.nodes;
  }

  /**
   * Returns the edge data.
   * @return Edge data in JSON Array
   */
  getEdges() {
    return this.edges;
  }

}

// Work on importing class file
class View {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private controller: any;
  private nodes: any;
  private edges: any;
  private matrix: any;
  private edgeSVGWidth: number;
  private edgeSVGHeight: number;
  private edgeSVGMargin: any;
  private edgeSVG: any;

  private xScale: d3.ScaleBand<string>;
  private edgeValueScale: d3.ScaleLinear<number,number>;
  private colorScale: d3.ScaleOrdinal<any,any>;
  private orders: any;


  constructor(controller) {
    this.controller = controller;

    // set up load
    this.renderLoading();
    //this.initalizeEdges();
  }

  /**
   * Takes in the data, hides the loading screen, and
   * initalizes visualization.
   * @param  data [description]
   * @return      [description]
   */
  loadData(nodes: any, edges: any, matrix: any) {
    this.nodes = nodes
    this.edges = edges;
    this.matrix = matrix;

    this.hideLoading();
    console.log('view data', nodes, edges,matrix);
    this.initalizeEdges();
    this.renderEdges();


  }

  /**
   * Initalizes the edges view, renders SVG
   * @return None
   */
  initalizeEdges() {
    // Set up attributes
    this.edgeSVGMargin = { top: 90, right: 0, bottom: 10, left: 90 };

    this.edgeSVGWidth = 650;
    this.edgeSVGHeight = 650;



    // append SVG
    this.edgeSVG = d3.select("#topology").append("svg")
      .attr("width", this.edgeSVGWidth + this.edgeSVGMargin.left + this.edgeSVGMargin.right)
      .attr("height", this.edgeSVGHeight + this.edgeSVGMargin.top + this.edgeSVGMargin.bottom)
      //.style("margin-right", - this.margin.left + "px")
      .append("g")
      .attr("transform", "translate(" + this.edgeSVGMargin.left + "," + this.edgeSVGMargin.top + ")");
  }

  renderEdges() {
    // Set up scales

    this.xScale = d3.scaleBand().range([0, this.edgeSVGWidth]);
    this.edgeValueScale = d3.scaleLinear().domain([0, 4]).clamp(true);
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    this.orders = this.controller.getOrder();
    console.log(this.orders);

    this.xScale.domain(this.orders);
    console.log("bandwidth1-b",this.xScale.bandwidth());
    let xScale = this.xScale;
    let nodes = this.nodes;
    let colorScale = this.colorScale;
    let orders = this.orders;
    let edgeValueScale = this.edgeValueScale;
    this.edgeSVG.append("rect")
      .attr("class", "background")
      .attr("width", this.edgeSVGWidth)
      .attr("height", this.edgeSVGHeight);
    let row = this.edgeSVG.selectAll(".row")
      .data(this.matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => { return "translate(0," + this.xScale(i) + ")"; })
      .each(rowSelect);

    row.append("line")
      .attr("x2", this.edgeSVGWidth);

    row.append("text")
      .attr("x", -6)
      .attr("y", this.xScale.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text((d, i) => { return this.nodes[i].abbr; });

    row.append("g")
      .attr()
    this.renderAttributes();
    var column = this.edgeSVG.selectAll(".column")
      .data(this.matrix)
      .enter().append("g")
      .attr("class", "column")
      .attr("transform", (d, i) => { return "translate(" + this.xScale(i) + ")rotate(-90)"; });
    column.append("line")
      .attr("x1", -this.edgeSVGWidth);
    column.append("text")
      .attr("x", 6)
      .attr("y", this.xScale.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text((d, i : number) => { return this.nodes[i].abbr; });


    console.log(xScale);

    function rowSelect(row) {
      console.log(row,this);
      var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { console.log(d);return d.z; }))
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d : any)  {console.log(nodes,d); return xScale(d.x);  })
        .attr("width", xScale.bandwidth())
        .attr("height", xScale.bandwidth())
        .style("fill-opacity", function(d : any) { return edgeValueScale(d.z); })
        .style("fill", function(d : any) {console.log(nodes,d);return nodes[d.x].group ==  nodes[d.y].group ? colorScale(nodes[d.x].group) : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    }

    function mouseover(p) {
      d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
      d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }

    function mouseout() {
      d3.selectAll("text").classed("active", false);
    }
    let _this = this;
    d3.select("#order").on("change", function() {
      clearTimeout(timeout);
      order(this.value);
      _this.

    });

    function order(value) {
      console.log(orders,value);
      let newOrder = _this.controller.changeOrder(value);
      console.log(newOrder);
      xScale.domain(newOrder);
      var t = _this.edgeSVG.transition().duration(2500);
      t.selectAll(".row")
        .delay(function(d, i) { return xScale(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + xScale(i) + ")"; })
        .selectAll(".cell")
        .delay(function(d) { return xScale(d.x) * 4; })
        .attr("x", function(d) { return xScale(d.x); });
      t.selectAll(".column")
        .delay(function(d, i) { return xScale(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + xScale(i) + ")rotate(-90)"; });
    }
    var timeout = setTimeout(function() {
      order("group");
      d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 5000);

  }

  renderAttributes() {
    /* Table Data */
    var rowHeight = this.xScale.bandwidth();
    console.log("bandwidth2",this.xScale.bandwidth());
    var columns = [
      "familyBefore",
      "familyAfter",
      "individualBefore",
      "individualAfter"
    ];

    var sortKey = "familyBefore",
      sortOrder = d3.ascending;

    var formatCurrency = d3.format("$,.0f"),
      formatNumber = d3.format(",.0f");

    var x2 = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, 140]);

    var stateRow = d3.select(".g-table-body-states")
      .style("height",  750 + "px") //this.nodes.length * rowHeight
      .selectAll(".g-table-row")
      .data(this.nodes)
      .enter().append("div")
      .attr("class", "g-table-row")
      .style("top", function(d, i) {
        return i * rowHeight + "px";
      });

    let tableRow = d3.selectAll(".g-table-body .g-table-row");

    tableRow.append("div")
      .attr("class", "g-table-cell g-table-cell-state")
      .text(function(d: any) {
        return d.state;
      });

    columns.forEach(function(c) {
      tableRow.append("div")
        .attr("class", "g-table-cell g-table-cell-" + c)
        .append("div")
        .datum(function(d) {
          return d[c];
        })
        .attr("class", "g-table-bar")
        .append("div")
        .attr("class", "g-table-label")
        .text(function(d, i) {
          return (i ? formatNumber : formatCurrency)(d);
        });
    });

    var bar = tableRow.selectAll(".g-table-bar")
      .style("width", 0);

    tableRow.transition()
      .delay(function(d, i) {
        return i * 8;
      })
      .selectAll(".g-table-bar")
      .on("start", function(d: any) {
        let that: any = this;

        that.style.width = x2(d) + "px";
      });

    var columnLabel = d3.selectAll(".g-table-head .g-table-cell")
      .datum(function() {
        let that: any = this;

        return that.getAttribute("data-key");
      })
      .on("click", clicked)
      .select(".g-table-column")
      .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
        return d === sortKey;
      });

    function type(d) {
      d.familyBefore = +d.familyBefore;
      d.familyAfter = +d.familyAfter;
      d.individualBefore = +d.individualBefore;
      d.individualAfter = +d.individualAfter;
      return d;
    }
  }

  clicked(key) {
    d3.event.preventDefault();

    this.columnLabel
      .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), false);

    if (sortKey === key) sortOrder = sortOrder === d3.ascending ? d3.descending : d3.ascending;
    else sortKey = key;

    this.nodes
      .sort(function(a, b) {
        return sortOrder(a[sortKey], b[sortKey]);
      })
      .forEach(function(d: any, i) {
        d.index = i;
      });

    columnLabel
      .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
        return d === sortKey;
      });

    stateRow.transition()
      .delay(function(d: any) {
        return d.index * 8;
      })
      .on("start", function(d: any) {
        return this.style.top = d.index * rowHeight + "px";
      });
  }

  /**
   * Changes the current view to be a loading screen.
   * @return None
   */
  renderLoading() {
    d3.select('#overlay')
      .style('opacity', 0)
      .style('display', 'block')
      .transition()
      .duration(1000)
      .style('opacity', 1);
  }

  /**
   * Changes the current view to hide the loading screen
   * @return None
   */
  hideLoading() {
    if (d3.select('#overlay').attr('display') != "none") {
      d3.select('#overlay')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .delay(1000)
        .style('display', 'none');
    }
  }

}

// Work on importing class file
class Controller {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private view: any;
  private model: any;


  constructor() {
    this.view = new View(this); // initalize view,
    this.model = new Model(this); // start reading in data
  }

  /**
   * Passes the processed edge and node data to the view.
   * @return None
   */
  updateData(nodes: any, edges: any, matrix: any) {
    this.view.loadData(nodes, edges, matrix);
  }

  /**
   * Obtains the order from the model and returns it to the view.
   * @return [description]
   */
  getOrder(){
    return this.model.getOrder();
  }

  /**
   * Obtains the order from the model and returns it to the view.
   * @return [description]
   */
  changeOrder(order : string){
    return this.model.changeOrder(order);
  }


  // Add handlers to the view?

}

let control = new Controller();
//window.controller = control;
