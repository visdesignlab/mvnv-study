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
      this.nodes = data.nodes
      console.log(this.nodes)
      this.nodes = this.nodes.sort((a, b) => a.name.localeCompare(b.name));
      console.log(this.nodes)

      this.edges = data.links;
      this.controller = controller;

      this.processData();

      this.order = this.changeOrder('name');
      console.log(this.order, d3.range(this.nodes.length),"Data");


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

  private viewWidth: number;

  private edgeWidth: number;
  private edgeHeight: number;
  private attributeWidth: number;
  private attributeHeight: number;
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

  constructor(controller) {
    this.controller = controller;

    // set up load
    this.renderLoading();

    // Add scroll handler to containers
    d3.selectAll('.container').on('mousewheel', scrollHandler);

    function scrollHandler() {
      // determine which didn't scroll and update it's scroll.
      let scrollHeight = d3.select(this).node().scrollTop;
      if (d3.select(this).attr('id') == "attributes") {
        // scroll topology
        let element: any = d3.select('#topology').node();
        element.scrollTop = scrollHeight;
      } else {
        // scroll attributes
        let element: any = d3.select('#attributes').node()
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
  loadData(nodes: any, edges: any, matrix: any) {
    this.nodes = nodes
    this.edges = edges;
    this.matrix = matrix;

    this.hideLoading();
    console.log('view data', nodes, edges, matrix);
    this.renderView();



    //this.renderEdges();


  }
  private margins: { left: number, top: number, right: number, bottom: number };
  private orderings: [number];
  private attributes: any;
  private verticalScale: d3.ScaleBand<number>;
  private edgeRows: any;
  private edgeColumns: any;

  /**
   * Initializes the adjacency matrix and row views with placeholder visualizations
   * @return [description]
   */
  renderView() {
    this.viewWidth = 1000;

    //this.viewHeight =
    this.margins = { left: 45, top: 55, right: 10, bottom: 10 };

    this.initalizeEdges();
    this.initalizeAttributes();
    let that = this;
    d3.select("#order").on("change", function() {
      that.sort(this.value);
    });
  }

  /**
   * [highlightNodes description]
   * @param  name         [description]
   * @param  verticleNode [description]
   * @return              [description]
   */
  highlightNodes(name: string, verticleNode: boolean) {
    console.log(name);
    let selector: string = verticleNode ? ".highlightRow" : ".highlightRow";

    d3.selectAll(selector)
      .filter((d: any) => { return d.name == name })
      .classed('hovered', true);
  }

  /**
   * Initalizes the edges view, renders SVG
   * @return None
   */
  initalizeEdges() {
    this.edgeWidth = 600 - this.margins.left - this.margins.right;
    this.edgeHeight = 600 - this.margins.top - this.margins.bottom;

    // Float edges so put edges and attr on same place
    d3.select('#topology').style('float', 'left');

    this.edges = d3.select('#topology').append("svg")
      .attr("width", this.edgeWidth + this.margins.left + this.margins.right)
      .attr("height", this.edgeHeight + this.margins.top + this.margins.bottom)
      .append("g")
      .attr('id', 'edgeMargin')
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

    this.verticalScale = d3.scaleBand<number>().range([0, this.edgeWidth]).domain(d3.range(this.nodes.length));

    // Draw Highlight Rows
    this.edges.selectAll('.highlightRow')
      .data(this.nodes)
      .enter()
      .append('rect')
      .classed('highlightRow', true)
      .attr('x', 0)
      .attr('y', (d, i) => this.verticalScale(i))
      .attr('width', this.edgeWidth + this.margins.right)
      .attr('height', this.verticalScale.bandwidth())
      .attr('fill', "#fff")
      .on('mouseover', function() {
        d3.select(this)
          .classed('hovered', true);
      })
      .on('mouseout', function() {
        d3.select(this)
          .classed('hovered', false);
      })





    // Draw each row (translating the y coordinate)
    this.edgeRows = this.edges.selectAll(".row")
      .data(this.matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => {
        return "translate(0," + this.verticalScale(i) + ")";
      });

    var squares = this.edgeRows.selectAll(".cell")
      .data(d => { console.log(d); return d.filter(item => item.z > 0) })
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => this.verticalScale(d.x))
      .attr("width", this.verticalScale.bandwidth())
      .attr("height", this.verticalScale.bandwidth())
      /*.style("fill-opacity", d => opacityScale(d.z)).style("fill", d => {
        return nodes[d.x].group == nodes[d.y].group ? colorScale(nodes[d.x].group) : "grey";
      }) */
      .on("mouseover", mouseoverCell)
      .on("mouseout", mouseoutCell);

    let that = this;
    function mouseoverCell(p) {
      console.log(p);
      d3.event.preventDefault();

      // Highlight attribute rows on hovered edge
      let rowIndex, colIndex;
      d3.selectAll(".row text").classed("active", (d, i) => {
        if (i == p.y) {
          rowIndex = i //+ that.nodes.length;
        }
        return i == p.y;
      });
      d3.selectAll(".column text").classed("active", (d, i) => {
        if (i == p.x) {
          colIndex = i //+ that.nodes.length;
        }
        return i == p.x;
      });
      // determine the updated
      console.log(that.order, that.order[rowIndex], rowIndex, colIndex);
      rowIndex = that.order[rowIndex] + that.nodes.length;
      colIndex = that.order[colIndex] + that.nodes.length;

      d3.selectAll('.highlightRow')
        .filter((d, i) => { return i === rowIndex || i == colIndex || i === rowIndex - that.nodes.length; })
        .classed('hovered', true)

      that.tooltip.transition().duration(200).style("opacity", .9);

      let matrix = this.getScreenCTM()
        .translate(+this.getAttribute("x"), +this.getAttribute("y"));

      that.tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      that.tooltip.html("DATA")
        .style("left", (window.pageXOffset + matrix.e - 20) + "px")
        .style("top", (window.pageYOffset + matrix.f - 20) + "px");
    }

    function mouseoutCell() {
      d3.selectAll("text").classed("active", false);
      that.tooltip.transition().duration(250).style("opacity", 0);
      d3.selectAll('.highlightRow')
        .classed('hovered', false);
    }

    this.order = this.controller.getOrder();
    console.log("Here", this.order);

    this.edgeColumns = this.edges.selectAll(".column")
      .data(this.matrix)
      .enter().append("g")
      .attr("class", "column")
      .attr("transform", (d, i) => {
        return "translate(" + this.verticalScale(i) + ")rotate(-90)";
      });

    this.edgeRows.append("text")
      .attr("class", "label")
      .attr("x", -5)
      .attr("y", this.verticalScale.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .style("font-size", 8 + "px")
      .text((d, i) => this.nodes[i].abbr);

    this.edgeColumns.append("text")
      .attr("class", "label")
      .attr("y", 100)
      .attr("y", this.verticalScale.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .style("font-size", 8 + "px")
      .text((d, i) => this.nodes[i].abbr);

    this.edgeRows.append("line")
      .attr("x2", this.edgeWidth + this.margins.right);

    this.edgeColumns.append("line")
      .attr("x1", -this.edgeWidth);

    this.tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  }
  private attributeRows: any;
  private tooltip: any;
  private barWidthScale: any;
  private columnScale: any;
  private order: any;

  /**
   * [sort description]
   * @return [description]
   */
  sort(order) {
    this.order = this.controller.changeOrder(order);
    console.log(this.order);
    this.verticalScale.domain(this.order);
    console.log(d3.selectAll(".row"));
    d3.selectAll(".row")
      .transition()
      .duration(500)
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(0," + this.verticalScale(i) + ")"; })
      .selectAll(".cell")
      .delay((d) => { console.log(d); return this.verticalScale(d.x) * 4; })
      .attr("x", (d) => this.verticalScale(d.x));

    console.log(this.attributes, this.attributeRows);
    this.attributeRows
      .transition()
      .duration(500)
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(0," + this.verticalScale(i) + ")"; })

    /*d3.selectAll('.highlightRow')
      .transition()
      .duration(500)
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr('fill',(d,i)=>{console.log(d);return i%2 == 0 ? "#aaa" : "#bbb"})*/

    var t = this.edges.transition().duration(500);
    t.selectAll(".column")
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(" + this.verticalScale(i) + ")rotate(-90)"; });
  }
  private columnNames: {};
  /**
   * [initalizeAttributes description]
   * @return [description]
   */
  initalizeAttributes() {
    this.attributeWidth = 375 - this.margins.left - this.margins.right;
    this.attributeHeight = 600 - this.margins.top - this.margins.bottom;

    this.attributes = d3.select('#attributes').append("svg")
      .attr("width", this.attributeWidth + this.margins.left + this.margins.right)
      .attr("height", this.attributeHeight + this.margins.top + this.margins.bottom)
      .append("g")
      .attr('id', 'edgeMargin')
      .attr("transform", "translate(" + 0 + "," + this.margins.top + ")");


    // add zebras and highlight rows
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
      .on('mouseover', function() {
        d3.select(this)
          .classed('hovered', true);
      })
      .on('mouseout', function() {
        d3.select(this)
          .classed('hovered', false);
      })

    let barMargin = { top: 2, bottom: 1, left: 5, right: 5 }
    let barHeight = 10 - barMargin.top - barMargin.bottom;
    // Draw each row (translating the y coordinate)
    this.attributeRows = this.attributes.selectAll(".row")
      .data(this.nodes)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => {
        return "translate(0," + this.verticalScale(i) + ")";
      });




    this.attributeRows.append("line")
      .attr("x1", 0)
      .attr("x2", this.attributeWidth)
      .attr('stroke', '2px')
      .attr('stroke-opacity', 0.3);

    var columns = [
      "familyBefore",
      "familyAfter",
      "individualBefore",
      "individualAfter"
    ];

    var formatCurrency = d3.format("$,.0f"),
      formatNumber = d3.format(",.0f");

    this.barWidthScale = d3.scaleLinear()
      .domain([0, 1400])
      .range([0, 140]);

    this.columnScale = d3.scaleOrdinal().domain(columns)

    // Calculate Column Scale
    let columnRange = []
    let xRange = 0;
    columns.forEach((c) => {
      columnRange.push(xRange);
      let value = this.barWidthScale(d3.max(this.nodes, (d) => d[c]));

      if (value < 100) {
        value = 100;
      }

      xRange += value;

    })



    console.log(columnRange);
    this.columnScale.range(columnRange);




    /* Create data columns data */
    columns.forEach((c) => {
      console.log(c);
      let columnPosition = this.columnScale(c);
      console.log(columnPosition);


      this.attributeRows
        .append("rect")
        .attr("class", "glyph")
        .attr('height', barHeight)
        .attr('width', 10) // width changed later on transition
        .attr('x', columnPosition + barMargin.left)
        .attr('y', barMargin.top) // as y is set by translate
        .attr('fill', '#8B8B8B')
        .transition()
        .duration(2000)
        .attr('width', (d, i) => { console.log(d, this.barWidthScale(d[c])); return this.barWidthScale(d[c]) - barMargin.right - barMargin.left })


      this.attributeRows
        .append("div")
        .attr("class", "glyphLabel")
        .text(function(d, i) {
          return (i ? formatNumber : formatCurrency)(d);
        });



    });

    // Add Verticle Dividers
    this.attributes.selectAll('.column')
      .data(columns)
      .enter()
      .append('line')
      .style('stroke', '1px')
      .attr('x1', (d) => this.columnScale(d))
      .attr("y1", -20)
      .attr('x2', (d) => this.columnScale(d))
      .attr("y2", this.attributeHeight + this.margins.bottom)
      .attr('stroke-opacity', 0.4);

    // Add headers

    let columnHeaders = this.attributes.append('g')
      .classed('column-headers', true)

    this.columnNames = {
      "familyBefore": "Family (B)",
      "familyAfter": "Family (A)",
      "individualBefore": "Individual (B)",
      "individualAfter": "Individual (A)"
    }

    console.log(columnHeaders);
    columnHeaders.selectAll('.header')
      .data(columns)
      .enter()
      .append('text')
      .classed('header', true)
      .attr('y', -30)
      .attr('x', (d) => this.columnScale(d) + barMargin.left)
      .style('font-size', '16px')
      .attr('text-anchor', 'left')
      .text((d, i) => {
        console.log(d)
        return this.columnNames[d];
      });

    //
    columnHeaders.selectAll('.legend')








    console.log(this.attributeRows)
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



  }

  clicked(key) {

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
  getOrder() {
    return this.model.getOrder();
  }

  /**
   * Obtains the order from the model and returns it to the view.
   * @return [description]
   */
  changeOrder(order: string) {
    return this.model.changeOrder(order);
  }


  // Add handlers to the view?

}

let control = new Controller();
//window.controller = control;
