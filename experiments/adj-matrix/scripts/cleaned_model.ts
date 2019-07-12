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
  private idMap;
  private orderType;


  grabTwitterData(graph, tweets) {
    let toRemove = [];
    let newGraph = { 'nodes': [], 'links': [] };

    //create edges from tweets.

    tweets = tweets.tweets;

    tweets.map((tweet) => {

      //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
      if (this.controller.configuration.edgeTypes.includes("mentions")) {
        tweet.entities.user_mentions.map(mention => {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(n => n.id === mention.id);


          if (source && target) {
            let link = { 'source': source.id, 'target': target.id, 'type': 'mentions' }

            newGraph.links.push(link);
            if (!newGraph.nodes.find(n => n === source)) {
              newGraph.nodes.push(source);
            }
            if (!newGraph.nodes.find(n => n === target)) {
              newGraph.nodes.push(target);
            }
          }
          // console.log('link',link)

        })
      }




      //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
      if (tweet.retweeted_status && this.controller.configuration.edgeTypes.includes("retweet")) {
        let source = graph.nodes.find(n => n.id === tweet.user.id);
        let target = graph.nodes.find(n => n.id === tweet.retweeted_status.user.id);


        if (source && target) {
          let link = { 'source': source.id, 'target': target.id, 'type': 'retweet' }

          newGraph.links.push(link);
          if (!newGraph.nodes.find(n => n === source)) {
            newGraph.nodes.push(source);
          }
          if (!newGraph.nodes.find(n => n === target)) {
            newGraph.nodes.push(target);
          }
        }

      }

      //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
      if (tweet.in_reply_to_user_id_str && this.controller.configuration.edgeTypes.includes("reply")) {
        let source = graph.nodes.find(n => n.id === tweet.user.id);
        let target = graph.nodes.find(n => n.id === tweet.in_reply_to_user_id);

        if (source && target) {
          let link = { 'source': source.id, 'target': target.id, 'type': 'reply' }

          newGraph.links.push(link);
          if (!newGraph.nodes.find(n => n === source)) {
            newGraph.nodes.push(source);
          }
          if (!newGraph.nodes.find(n => n === target)) {
            newGraph.nodes.push(target);
          }
        }
      }

    })
    return newGraph;
  }
  constructor(controller: any) {
    this.controller = controller;
    d3.json("scripts/Eurovis2019Network.json").then((network: any) => {
      d3.json("scripts/Eurovis2019Tweets.json").then((tweets: any) => {
        let data = this.grabTwitterData(network, tweets);
        this.matrix = [];
        this.nodes = data.nodes
        this.idMap = {};

        this.order = this.changeOrder(this.controller.configuration.sortKey);
        if (this.orderType == "screen_name") {
          this.nodes = this.nodes.sort((a, b) => a.screen_name.localeCompare(b.screen_name));
        } else {
          this.nodes = this.nodes.sort((a, b) => { return b[this.orderType] - a[this.orderType]; });
        }

        this.nodes.forEach((node, index) => {
          node.index = index;
          this.idMap[node.id] = index;
        })

        this.edges = data.links;
        this.controller = controller;

        this.processData();




        this.controller.loadData(this.nodes, this.edges, this.matrix);
      })
    })
  }

  /**
   *   Determines the order of the current nodes
   * @param  type A string corresponding to the attribute name to sort by.
   * @return      A numerical range in corrected order.
   */
  changeOrder(type: string) {
    let order;
    this.orderType = type;
    this.controller.configuration.sortKey = type;
    if (type == 'screen_name') {
      order = d3.range(this.nodes.length).sort((a, b) => { return this.nodes[a].screen_name.localeCompare(this.nodes[b].screen_name) })
    }
    else {
      order = d3.range(this.nodes.length).sort((a, b) => { return this.nodes[b][type] - this.nodes[a][type]; })
    }
    this.order = order;
    return order;
  }
  private maxTracker: any;
  /**
   * [processData description]
   * @return [description]
   */
  processData() {
    // generate a hashmap of id's?
    // Set up node data
    this.nodes.forEach((rowNode, i) => {
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
      this.matrix[i] = this.nodes.map(function(colNode) { return { rowid: rowNode.screen_name, colid: colNode.screen_name, x: colNode.index, y: rowNode.index, z: 0, reply: 0, retweet: 0, mentions: 0 }; });
    });

    this.maxTracker = { 'reply': 0, 'retweet': 0, 'mentions': 0 }
    // Convert links to matrix; count character occurrences.
    this.edges.forEach((link) => {
      let addValue = 0;
      console.log('first', link);
      if (link.type == "reply") {
        addValue = 3;
        this.matrix[this.idMap[link.source]][this.idMap[link.target]].reply += 1;
        if (this.matrix[this.idMap[link.source]][this.idMap[link.target]].reply > this.maxTracker['reply']) {
          this.maxTracker['reply'] = this.matrix[this.idMap[link.source]][this.idMap[link.target]].reply
        }
      } else if (link.type == "retweet") {
        addValue = 2;
        this.matrix[this.idMap[link.source]][this.idMap[link.target]].retweet += 1;
        console.log(this.matrix[this.idMap[link.source]][this.idMap[link.target]]);
        if (this.matrix[this.idMap[link.source]][this.idMap[link.target]].retweet > this.maxTracker['retweet'] && this.matrix[this.idMap[link.source]][this.idMap[link.target]].retweet !== null) {
          this.maxTracker['retweet'] = this.matrix[this.idMap[link.source]][this.idMap[link.target]].retweet
        }
      } else if (link.type == "mentions") {
        addValue = 1;
        this.matrix[this.idMap[link.source]][this.idMap[link.target]].mentions += 1;
        if (this.matrix[this.idMap[link.source]][this.idMap[link.target]].mentions > this.maxTracker['mentions']) {
          this.maxTracker['mentions'] = this.matrix[this.idMap[link.source]][this.idMap[link.target]].mentions
        }
      }
      console.log("Max", this.maxTracker);
      this.maxTracker = { 'reply': 3, 'retweet': 3, 'mentions': 2 }

      /* could be used for varying edge types */
      this.matrix[this.idMap[link.source]][this.idMap[link.target]].z += addValue;

      this.matrix[this.idMap[link.source]].count += 1;
      if (this.controller.configuration.isDirected) {
        this.matrix[this.idMap[link.target]][this.idMap[link.source]].z += addValue;
        this.matrix[this.idMap[link.target]].count += 1;
      }
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

    this.margins = { left: 65, top: 65, right: 10, bottom: 10 };

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
  clickedNode() {
    // Find node and highlight it in orange
    // Find all of it's neighbors
    // process links for neighbors?

  }
  private edgeScales: any;
  /**
   * Initalizes the edges view, renders SVG
   * @return None
   */
  initalizeEdges() {
    this.edgeWidth = 600 - this.margins.left - this.margins.right;
    this.edgeHeight = 600 - this.margins.top - this.margins.bottom;

    // Float edges so put edges and attr on same place
    d3.select('#topology').style('float', 'left');
    let width = this.edgeWidth + this.margins.left + this.margins.right;
    let height = this.edgeHeight + this.margins.top + this.margins.bottom;
    this.edges = d3.select('#topology').append("svg")
      .attr("viewBox", "0 0 " + width + " " + height + "")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .classed("svg-content", true)
      .attr('id', 'edgeMargin')
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

    this.verticalScale = d3.scaleBand<number>().range([0, this.edgeWidth]).domain(d3.range(this.nodes.length));

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
      .attr("transform", (d, i) => {
        return "translate(" + this.verticalScale(i) + ")rotate(-90)";
      });


    this.edgeColumns.append("line")
      .attr("x1", -this.edgeWidth);

    this.edgeColumns
      .append('rect')
      .classed('highlightCol', true)
      .attr('id', (d, i) => {
        return "highlightCol" + d[i].colid;
      })
      .attr('x', -this.edgeHeight - this.margins.bottom)
      .attr('y', 0)
      .attr('width', this.edgeHeight + this.margins.bottom) // these are swapped as the columns have a rotation
      .attr('height', this.verticalScale.bandwidth())
      .attr('fill-opacity', 0)
      .on('mouseover', () => {
        /*
        let mouse = d3.mouse(d3.event.target);
        let column = document.elementsFromPoint(mouse[0],mouse[1])[0];
        let row = document.elementsFromPoint(mouse[0],mouse[1])[1];
        d3.select('.hovered').classed('hovered',false);
        d3.select(column).classed('hovered',true);
        d3.select(row).classed('hovered',true);
        */
      })


    // Draw each row (translating the y coordinate)
    this.edgeRows = this.edges.selectAll(".row")
      .data(this.matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => {
        return "translate(0," + this.verticalScale(i) + ")";
      });
    this.edgeRows.append("line")
      .attr("x2", this.edgeWidth + this.margins.right);


    // added highligh row code
    this.edgeRows//.select('#highlightLayer')
      .append('rect')
      .classed('highlightTopoRow', true)
      .attr('id', (d, i) => {
        return "highlightTopoRow" + d[i].rowid;
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.edgeWidth + this.margins.right)
      .attr('height', this.verticalScale.bandwidth())
      .attr('fill-opacity', 0)
      .on('mouseover', (d, index) => {

        /*this.highlightEdgeNode(d,index,"row");

        this.highlightEdgeNode(d,index,"row");
        d3.select(this)
          .classed('hovered', true);
          */
      })
      .on('mouseout', () => {
        /*d3.select(this)
          .classed('hovered', false);*/
        /*
      d3.selectAll('.highlightRow')
        .filter((d: any, i) => { return d.index === index })
        .classed('hovered', false)*/
      })
      .on('click', (d) => {
        this.clickedNode(d.index);
        // click node
        // select node and turn orange ish
        // highlight other nodes (add jumps?)
      })


    this.edgeScales = {};

    this.controller.configuration.edgeTypes.forEach(type => {
      // calculate the max
      let extent = [0, this.controller.model.maxTracker[type]]
      console.log(extent);
      // set up scale
      let scale = d3.scaleLinear().domain(extent).range(["white", this.controller.configuration.style.edgeColors[type]]);

      // store scales
      this.edgeScales[type] = scale;
      //console.log(type, this.edgeScales[type].domain(), this.edgeScales[type].range().clamp());
    })

    this.generateColorLegend();
    console.log(this.edgeScales);
    var cells = this.edgeRows.selectAll(".cell")
      .data(d => { return d/*.filter(item => item.z > 0)*/ })
      .enter().append('g')


      .attr("class", "cell");

    if(this.controller.configuration.nestedBars){
      // bind squars to cells for the mouse over effect
      cells
      .append("rect")
      .attr("x", d => this.verticalScale(d.x))
      .attr('height',this.verticalScale.bandwidth())
      .attr('width',this.verticalScale.bandwidth())
      .attr('fill-opacity',0);

      let dividers = this.controller.configuration.edgeTypes.length;
      dividers = dividers == 0 ? 1 : dividers; // if dividers = 0, set to 1  throw an error?
      let squares = cells
      for(let index = 0; index < dividers; index++){
        let type = this.controller.configuration.edgeTypes[index]
        console.log(type);
        let scale = this.edgeScales[type];
        scale.range([0,this.verticalScale.bandwidth()])
        scale.clamp(true);

        cells
        .filter(d=>{
          return d[this.controller.configuration.edgeTypes[index]] !== 0;
        })
        .append("rect")
        .attr('x',(d,i)=>{return this.verticalScale(d.x) + index*this.verticalScale.bandwidth()/dividers})
        .attr('y',(d)=>{
          return this.verticalScale.bandwidth() - scale(d[type]);
        })
        .attr('height',d=>this.edgeScales[type](d[type]))
        .attr('width',this.verticalScale.bandwidth()/dividers)
        .attr('fill',this.controller.configuration.style.edgeColors[type])
      }



      // determine scales for height
      // append 3 bars of different heights, filtering out 0's

    } else {
      let squares = cells
      .append("rect")
      .attr("x", d => this.verticalScale(d.x))
      //.filter(d=>{return d.item >0})
      .attr("width", this.verticalScale.bandwidth())
      .attr("height", this.verticalScale.bandwidth())
      .style("fill", 'white')
      squares
        .filter(d => d.z == 0)
        .style("fill-opacity", 0);
      this.setSquareColors('all');
    }

    cells
      .on("mouseover", mouseoverCell)
      .on("mouseout", mouseoutCell);
    // color squares


    let that = this;
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
      .text((d, i) => this.nodes[i].screen_name)
      .on('click', (d, i, nodes) => {
        d3.select(nodes[i]).classed('selected', (data) => {
          console.log(data, data[0]);
          return !this.controller.configuration.state.selectedNodes.includes(data[0].rowid)
        });

        this.selectNode(d[0].rowid);
      });


    this.edgeColumns.append("text")
      .attr("class", "label")
      .attr("y", 3)
      .attr('x', 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .style("font-size", 7.5 + "px")
      .text((d, i) => this.nodes[i].screen_name)
      .on('click', (d, index, nodes) => {

        d3.select(nodes[index]).classed('selected', !this.controller.configuration.state.columnSelectedNodes.includes(d[index].rowid));

        console.log(d[index].rowid);
        this.selectColumnNode(d[index].rowid);

      });


    this.tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  }
  /**
   * [mouseoverEdge description]
   * @return [description]
   */
  mouseoverEdge() {

  }
  linspace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
  }

  setSquareColors(type) {
    let squares = d3.selectAll('.cell').selectAll('rect')
      .transition()
      .duration(500);


    if (type == 'all') {
      console.log(this.edgeScales, squares);
      squares
        .style("fill", (d: any) => {
          if (d.reply !== 0) {
            return this.edgeScales["reply"](d.reply);
          } else if (d.retweet !== 0) {
            return this.edgeScales["retweet"](d.retweet);
          } else if (d.mentions !== 0) {
            return this.edgeScales["mentions"](d.mentions);
          } else if (d.z > 3) {
            return "pink";
          }
        })
        .filter(d => {return d.reply !== 0 || d.retweet !== 0 || d.mentions !== 0)
          .style("fill-opacity", (d)=>{
            return (d.reply !== 0 || d.retweet !== 0 || d.mentions !== 0)? 1:0;
          });
    } else if (type == "reply") {
      squares.style("fill", (d: any) => {
        if (d.reply !== 0) {
          return this.edgeScales["reply"](d.reply);
        } else {
          return "white";
        }
      })
        .style("fill-opacity", (d)=>{
          return d.reply !== 0? 1:0;
        });


    } else if (type == "retweet") {
      squares.style("fill", (d: any) => {
        if (d.retweet !== 0) {
          return this.edgeScales["retweet"](d.retweet);
        }else {
          return "white";
        }
      })
      .style("fill-opacity", (d)=>{
        return d.retweet !== 0? 1:0;
      });
    } else if (type == "mentions") {
      squares.style("fill", (d: any) => {
        if (d.mentions !== 0) {
          return this.edgeScales["mentions"](d.mentions);
        }else {
          return "white";
        }
      })
      .style("fill-opacity", (d)=>{
        return d.mentions !== 0? 1:0;
      });
    }
  }


generateColorLegend(){
  let yOffset = 10;
  let xOffset = 10;
  let rectWidth = 25
  let rectHeight = 10;
  let legendWidth = 200;
  for (let type in this.edgeScales) {

    let scale = this.edgeScales[type];
    console.log(scale)
    let extent = scale.domain();
    console.log(extent, "translate(" + xOffset + "," + yOffset + ")");
    let sampleNumbers = this.linspace(extent[0], extent[1], 5);
    console.log(sampleNumbers);
    let svg = d3.select('#legends').append("g")
      .attr("id", "legendLinear" + type)
      .attr("transform", (d, i) => "translate(" + xOffset + "," + yOffset + ")")
      .on('click', (d,i,nodes) => {
        if (this.controller.configuration.interaction.selectEdgeType == true) {
          let edgeType = this.controller.configuration.state.selectedEdgeType == type ? 'all' : type;
          this.controller.configuration.state.selectedEdgeType = edgeType;
          this.setSquareColors(edgeType);
          console.log(nodes[i]);
          if(edgeType == "all"){
            d3.selectAll('.selectedEdgeType').classed('selectedEdgeType',false);
          } else {
            d3.selectAll('.selectedEdgeType').classed('selectedEdgeType',false);
            console.log(d3.selectAll('#legendLinear' + type).select('.edgeLegendBorder').classed('selectedEdgeType',true));
          }
        }
      });
    let boxWidth = 6* rectWidth + 15

    svg.append('rect')
      .classed('edgeLegendBorder',true)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1)
      .attr('width',boxWidth)
      .attr('height', 55)
      .attr('fill-opacity', 0)
      .attr('x', 0)
      .attr('y', -9)
      .attr('ry', 2)
      .attr('rx', 2)

    let pluralType = type;

    if(pluralType == "retweet"){
      pluralType = "retweets";
    } else if(pluralType == "reply"){
      pluralType = "replies";
    }

    svg.append('text')
      .attr('x',boxWidth / 2)
      .attr('y', 8)
      .attr('text-anchor', 'middle')
      .text("Number of " + pluralType)

    let groups = svg.selectAll('g')
      .data(sampleNumbers)
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(' + (10 + i * (rectWidth + 5)) + ',' + 15 + ')')

    groups
      .append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', (d) => {
        console.log(d);
        return scale(d);
      })
      .attr('stroke', (d) => {
        return d == 0 ? '#bbb' : 'white';
      })

    groups
      .append('text')
      .attr('x', rectWidth / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .text(d => {
        return Math.round(d);
      })


    xOffset += legendWidth;




  }
}







  highlightRow(node) {
    let nodeID = node.screen_name;
    if (node.screen_name == null) {
      nodeID = node.rowid;
    }
    // highlight attr
    this.highlightNode(nodeID, 'Attr');
    this.highlightNode(nodeID, 'Topo');
  }

  highlightRowAndCol(node) {
    let nodeID = node.screen_name;
    if (node.screen_name == null) {
      nodeID = node.colid;
    }

    this.highlightNode(nodeID, 'Attr');
    this.highlightNode(nodeID, '', 'Col');
  }

  highlightNode(nodeID: string, attrOrTopo: string, rowOrCol: string = 'Row') {
    console.log(d3.selectAll('#highlight' + attrOrTopo + rowOrCol + nodeID), '.highlight' + attrOrTopo + rowOrCol + nodeID);
    d3.selectAll('#highlight' + attrOrTopo + rowOrCol + nodeID)
      .classed('hovered', true);
  }



  //u: BCC    BCCINVITADOS2019
  //p:

  //private selectedNodes : any;
  // DOESNT GET ADDED
  addHighlightNode(addingNode: string) {
    // if node is in
    let nodeIndex = this.nodes.findIndex(function(item, i) {
      return item.screen_name == addingNode;
    });
    console.log(this.matrix[nodeIndex]);
    for (let i = 0; i < this.matrix[0].length; i++) {
      console.log(this.matrix[i][nodeIndex].z, this.matrix[i][nodeIndex]);
      if (this.matrix[i][nodeIndex].z > 0) {
        let nodeID = this.matrix[i][nodeIndex].rowid;
        console.log(nodeID);
        if (this.controller.configuration.state.highlightedNodes.hasOwnProperty(nodeID) && !this.controller.configuration.state.highlightedNodes[nodeID].includes(addingNode)) {
          // if array exists, add it
          console.log(this.controller.configuration.state.highlightedNodes[nodeID]);
          this.controller.configuration.state.highlightedNodes[nodeID].push(addingNode);
        } else {
          // if array non exist, create it and add node
          console.log(this.controller.configuration.state.highlightedNodes);
          this.controller.configuration.state.highlightedNodes[nodeID] = [addingNode];
          console.log(this.controller.configuration.state.highlightedNodes);
        }
      }
    }
  }







  /**
   * [removeHighlightNode description]
   * @param  nodeID       [description]
   * @param  removingNode [description]
   * @return              [description]
   */
  removeHighlightNode(removingNode: string) {
    // remove from selected nodes
    console.log(this.controller.configuration.state.columnSelectedNodes);

    console.log(this.controller.configuration.state.highlightedNodes);
    for (let nodeID in this.controller.configuration.state.highlightedNodes) {
      console.log('to_remove_Hightlight', nodeID);
      //finds the position of removing node in the nodes array
      let index = this.controller.configuration.state.highlightedNodes[nodeID].indexOf(removingNode);
      // keep on removing all places of removing node
      if (index > -1) {
        this.controller.configuration.state.highlightedNodes[nodeID].splice(index, 1);
        // delete properties if no nodes left
        if (this.controller.configuration.state.highlightedNodes[nodeID].length == 0) {
          delete this.controller.configuration.state.highlightedNodes[nodeID];
        }
        console.log(this.controller.configuration.state.highlightedNodes[nodeID])
      }
    }
  }


  renderHighlightNodes() {
    //for
    // remove all highlights
    d3.selectAll('.neighborSelected').classed('neighborSelected', false);
    // re add all highlights
    for (let nodeID in this.controller.configuration.state.highlightedNodes) {
      console.log("node to be highlighted", nodeID);
      d3.select('#highlight' + 'Topo' + 'Row' + nodeID)
        .classed('neighborSelected', true);
      d3.select('#highlight' + 'Attr' + 'Row' + nodeID)
        .classed('neighborSelected', true);
    }
  }

  selectNode(nodeID: string) {
    let index = this.controller.configuration.state.selectedNodes.indexOf(nodeID)
    if (index > -1) {
      this.controller.configuration.state.selectedNodes.splice(index, 1);
    } else {
      this.controller.configuration.state.selectedNodes.push(nodeID);
    }
    let attrRow = d3.selectAll('#highlight' + 'Attr' + 'Row' + nodeID);
    attrRow
      .classed('selected', !attrRow.classed('selected'));

    let topoRow = d3.selectAll('#highlight' + 'Topo' + 'Row' + nodeID);
    topoRow
      .classed('selected', !topoRow.classed('selected'));
    console.log(attrRow, topoRow)
  }

  /**
   * [selectColumnNode description]
   * @param  nodeID [description]
   * @return        [description]
   */
  selectColumnNode(nodeID) {
    let nodeIndex = this.controller.configuration.state.columnSelectedNodes.indexOf(nodeID);
    console.log(nodeIndex);
    if (nodeIndex > -1) {
      // find all neighbors and remove them
      console.log("remove node", this.controller.configuration.state.columnSelectedNodes, this.controller.configuration.state.columnSelectedNodes.splice(nodeIndex, 1));
      this.removeHighlightNode(nodeID);
      this.controller.configuration.state.columnSelectedNodes.splice(nodeIndex, 1);
      console.log("remove node", this.controller.configuration.state.columnSelectedNodes);
      // remove node from column selected nodes
    } else {
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
    this.verticalScale.domain(this.order);
    let transitionTime = 500;
    d3.selectAll(".row")
      .transition()
      .duration(transitionTime)
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(0," + this.verticalScale(i) + ")"; })
      .selectAll(".cell")
      .delay((d) => { return this.verticalScale(d.x) * 4; })
      .attr("x", (d) => this.verticalScale(d.x));

    this.attributeRows
      .transition()
      .duration(transitionTime)
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(0," + this.verticalScale(i) + ")"; })

    // update each highlightRowsIndex



    //.attr('fill',(d,i)=>{console.log(this.order[i]);return this.order[i]%2 == 0 ? "#fff" : "#eee"})

    var t = this.edges.transition().duration(transitionTime);
    t.selectAll(".column")
      .delay((d, i) => { return this.verticalScale(i) * 4; })
      .attr("transform", (d, i) => { return "translate(" + this.verticalScale(i) + ")rotate(-90)"; });

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
  }
  private columnNames: { };
  /**
   * [initalizeAttributes description]
   * @return [description]
   */
  initalizeAttributes() {
    this.attributeWidth = 450 - this.margins.left - this.margins.right;
    this.attributeHeight = 600 - this.margins.top - this.margins.bottom;

    let width = this.attributeWidth + this.margins.left + this.margins.right; //+ 75;
    let height = this.attributeHeight + this.margins.top + this.margins.bottom;

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

    let barMargin = { top: 1, bottom: 1, left: 5, right: 5 }
    let barHeight = this.verticalScale.bandwidth() - barMargin.top - barMargin.bottom;

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

    this.attributeRows.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .classed('highlightAttrRow', true)
      .attr('id', (d, i) => {
        return "highlightAttrRow" + d.screen_name;
      })
      .attr('width', width)
      .attr('height', this.verticalScale.bandwidth()) // end addition
      .attr("fill-opacity", 0)
      .on('mouseover', (p: any) => {
        // selection constructor
        // selection of rows or columns
        // selection of edge or attribute
        // classing hovered as true

        console.log(p);
        // wont work for seriated matricies!
        let attrRow = this.highlightRow(p);

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
      .on('mouseout', function() {

        d3.selectAll('.highlightAttrRow')
          .classed('hovered', false)
        d3.selectAll('.highlightTopoRow')
          .classed('hovered', false)
      })


    let columns = this.controller.configuration.columns;

    // Based on the data type set widths
    // numerical are 50, bool are a verticle bandwidth * 2
    //


    var formatCurrency = d3.format("$,.0f"),
      formatNumber = d3.format(",.0f");

    // generate scales for each
    let attributeScales = {};
    this.columnScale = d3.scaleOrdinal().domain(columns)

    // Calculate Column Scale
    let columnRange = []
    let xRange = 0;
    let columnWidth = 450 / columns.length;




    columns.forEach(col => {
      // calculate range
      columnRange.push(xRange);

      if (col == "influential" || col == "original") { //if ordinal
        // append colored blocks
        let scale = d3.scaleLinear()//.domain([true,false]).range([barMargin.left, colWidth-barMargin.right]);

        attributeScales[col] = scale;
      } else {
        let range = d3.extent(this.nodes, (d) => { return d[col] })
        let scale = d3.scaleLinear().domain(range).range([barMargin.left, columnWidth - barMargin.right]);
        attributeScales[col] = scale;
      }

      xRange += columnWidth;
    })




    // need max and min of each column
    /*this.barWidthScale = d3.scaleLinear()
      .domain([0, 1400])
      .range([0, 140]);*/







    this.columnScale.range(columnRange);

    for (let [column, scale] of Object.entries(attributeScales)) {
      if (column == "influential" || column == "original") {
        let circs = this.attributes.append("g")
          .attr("transform", "translate(" + this.columnScale(column) + "," + -15 + ")");
        let circ1 = circs
          .append('g')
          .attr('transform', 'translate(10,5)')

        circ1
          .append('circle')
          .attr('cx', 0)
          .attr('cy', -20)
          .attr('fill', "#68AA73")
          .attr('r', 4);

        circ1
          .append('text')
          .text('T')
          .attr('text-anchor', 'middle')
        let circs2 = circs
          .append('g')
          .attr('transform', 'translate(35,5)')
        circs2
          .append('circle')
          .attr('cx', 0)
          .attr('cy', -20)
          .attr('fill', "#A88E69")
          .attr('r', 4)
        circs2
          .append('text')
          .text('F')
          .attr('text-anchor', 'middle')
        console.log(circs);
        continue;
      }
      this.attributes.append("g")
        .attr("class", "attr-axis")
        .attr("transform", "translate(" + this.columnScale(column) + "," + -15 + ")")
        .call(d3.axisTop(scale)
          .tickValues(scale.domain())
          .tickFormat((d) => {
            if ((d / 1000) >= 1) {
              d = Math.round(d / 1000) + "K";
            }
            return d;
          }))
        .selectAll('text')
        .style("text-anchor", function(d, i) { return i % 2 ? "end" : "start" });

    }



    /* Create data columns data */
    columns.forEach((c) => {
      let columnPosition = this.columnScale(c);

      if (c == "influential" || c == "original") {
        this.attributeRows
          .append('circle')
          .attr('cx', columnPosition + columnWidth / 2)
          .attr('cy', this.verticalScale.bandwidth() / 2)
          .attr('fill', (d) => {
            console.log(d);
            return (d[c] ? "#68AA73" : "#A88E69");
          })
          .attr('r', 2.5);
        return;
      }



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
        .attr('width', (d, i) => { return attributeScales[c](d[c]); })


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
      "followers_count": "Followers",
      "query_tweet_count": "Tweets",
      "friends_count": "Friends",
      "statuses_count": "Statuses ",
      "listed_count": "Listed",
      "favourites_count": "Favourites",
      "count_followers_in_query": "Followers",
      "influential": "Influential",
      "original": "Original",
    }

    columnHeaders.selectAll('.header')
      .data(columns)
      .enter()
      .append('text')
      .classed('header', true)
      .attr('y', -45)
      .attr('x', (d) => this.columnScale(d) + barMargin.left)
      .style('font-size', '11px')
      .attr('text-anchor', 'left')
      .text((d, i) => {
        return this.columnNames[d];
      });

    //
    columnHeaders.selectAll('.legend')








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

  /**
   * [selectHighlight description]
   * @param  nodeToSelect    the
   * @param  rowOrCol        String, "Row" or "Col"
   * @param  selectAttribute Boolean of to select attribute or topology highlight
   * @return                 [description]
   */
  selectHighlight(nodeToSelect: any, rowOrCol: string, attrOrTopo: string = "Attr", orientation: string = 'x') {
    console.log(nodeToSelect, attrOrTopo, orientation)
    let selection = d3.selectAll(".highlight" + attrOrTopo + rowOrCol)
      .filter((d, i) => {
        if (attrOrTopo == "Attr" && d.index == null) {
          console.log(d);
          // attr
          return nodeToSelect.index == d[i][orientation];
        }
        console.log(d);
        //topology
        return nodeToSelect.index == d.index;
      })
    console.log(selection);
    return selection;
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
  private configuration: any;


  constructor() {
    this.configuration = d3.json("config.json");
    this.configuration.then(data => {
      this.configuration = data;
    })

    this.view = new View(this); // initalize view,
    this.model = new Model(this); // start reading in data
  }

  /**
   * Passes the processed edge and node data to the view.
   * @return None
   */
  loadData(nodes: any, edges: any, matrix: any) {
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
