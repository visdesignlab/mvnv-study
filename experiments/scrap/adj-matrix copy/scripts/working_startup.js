"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require(['d3'], function (d3) {
  var margin = { top: 90, right: 0, bottom: 10, left: 90 }, width = 750, height = 750;
  var x = d3.scaleBand().range([0, width]), z = d3.scaleLinear().domain([0, 4]).clamp(true), c = d3.scaleOrdinal(d3.schemeCategory10);
  var svg = d3.select("#topology").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-right", -margin.left + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  /*
    nodes:{index: number,count:number},
    links:{source:{}}}*/

  d3.json("data.json").then(function (data) {
    console.log(data);
      var matrix = [], nodes = data.nodes, n = nodes.length;
      console.log(data);

      // Compute index per node.
      nodes.forEach(function (node, i) {
          node.index = i;
          node.count = 0;
          matrix[i] = d3.range(n).map(function (j) { return { x: j, y: i, z: 0 }; });
      });

      // Convert links to matrix; count character occurrences.
      data.links.forEach(function (link) {
          matrix[link.source][link.target].z += link.value;
          matrix[link.target][link.source].z += link.value;
          //matrix[link.source][link.source].z += link.value;
          //matrix[link.target][link.target].z += link.value;
          nodes[link.source].count += link.value;
          nodes[link.target].count += link.value;
      });

      // Precompute the orders.
      var orders = {
          name: d3.range(n).sort(function (a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
          count: d3.range(n).sort(function (a, b) { return nodes[b].count - nodes[a].count; }),
          group: d3.range(n).sort(function (a, b) { return nodes[b].group - nodes[a].group; })
      };

      // The default sort order.
      x.domain(orders.name);
      svg.append("rect")
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height);
      var row = svg.selectAll(".row")
          .data(matrix)
          .enter().append("g")
          .attr("class", "row")
          .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
          .each(rowSelect);
      row.append("line")
          .attr("x2", width);

      console.log(x);
      row.append("text")
          .attr("x", -6)
          .attr("y", x.bandwidth() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "end")
          .text(function (d, i) { return nodes[i].abbr; });
      var column = svg.selectAll(".column")
          .data(matrix)
          .enter().append("g")
          .attr("class", "column")
          .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

      column.append("line")
          .attr("x1", -width);

      column.append("text")
          .attr("x", 6)
          .attr("y", x.bandwidth() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "start")
          .text(function (d, i) { return nodes[i].abbr; });

      function rowSelect(row) {
        console.log(x);
          var cell = d3.select(this).selectAll(".cell")
              .data(row.filter(function (d) { return d.z; }))
              .enter().append("rect")
              .attr("class", "cell")
              .attr("x", function (d) { return x(d.x); })
              .attr("width", x.bandwidth())
              .attr("height", x.bandwidth())
              .style("fill-opacity", function (d) { return z(d.z); })
              .style("fill", function (d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
              .on("mouseover", mouseover)
              .on("mouseout", mouseout);
      }

      function mouseover(p) {
          d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
          d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
      }

      function mouseout() {
          d3.selectAll("text").classed("active", false);
      }

      d3.select("#order").on("change", function () {
          clearTimeout(timeout);
          order(d3.select("#order").node().value);
      });

      function order(value) {
          x.domain(orders[value]);
          var t = svg.transition().duration(2500);
          t.selectAll(".row")
              .delay(function (d, i) { return x(i) * 4; })
              .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
              .selectAll(".cell")
              .delay(function (d) { return x(d.x.toString()) * 4; })
              .attr("x", function (d) { return x(d.x); });
          t.selectAll(".column")
              .delay(function (d, i) { return x(i) * 4; })
              .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
      }

      var timeout = setTimeout(function () {
          order("group");
          d3.select("#order").property("selectedIndex", 2).node().focus();
      }, 5000);
  });

  /* Table Data */
  var rowHeight = 20;

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

  var x = d3.scaleLinear()
    .domain([0, 900])
    .range([0, 320]);

  d3.csv("hcdata.csv")
    .then(function(states) {
      console.log(states);
      var averageRow = d3.select(".g-table-body-average")
        .style("height", rowHeight + "px")
        .append("div")
        .datum(states.pop())
        .attr("class", "g-table-row");

      var stateRow = d3.select(".g-table-body-states")
        .style("height", states.length * rowHeight + "px")
        .selectAll(".g-table-row")
        .data(states.sort(function(a, b) {
          return sortOrder(a[sortKey], b[sortKey]);
        }))
        .enter().append("div")
        .attr("class", "g-table-row")
        .style("top", function(d, i) {
          return i * rowHeight + "px";
        });

      var row = d3.selectAll(".g-table-body .g-table-row");

      row.append("div")
        .attr("class", "g-table-cell g-table-cell-state")
        .text(function(d) {
          return d.state;
        });

      columns.forEach(function(c) {
        row.append("div")
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

      var bar = row.selectAll(".g-table-bar")
        .style("width", 0);

      row.transition()
        .delay(function(d, i) {
          return i * 8;
        })
        .selectAll(".g-table-bar")
        .on("start", function(d) {
          this.style.width = x(d) + "px";
        });

      var columnLabel = d3.selectAll(".g-table-head .g-table-cell")
        .datum(function() {
          return this.getAttribute("data-key");
        })
        .on("click", clicked)
        .select(".g-table-column")
        .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
          return d === sortKey;
        });

      function clicked(key) {
        d3.event.preventDefault();

        columnLabel
          .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), false);

        if (sortKey === key) sortOrder = sortOrder === d3.ascending ? d3.descending : d3.ascending;
        else sortKey = key;

        states
          .sort(function(a, b) {
            return sortOrder(a[sortKey], b[sortKey]);
          })
          .forEach(function(d, i) {
            d.index = i;
          });

        columnLabel
          .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
            return d === sortKey;
          });

        stateRow.transition()
          .delay(function(d) {
            return d.index * 8;
          })
          .on("start", function(d) {
            return this.style.top = d.index * rowHeight + "px";
          });
      }
    });

  function type(d) {
    d.familyBefore = +d.familyBefore;
    d.familyAfter = +d.familyAfter;
    d.individualBefore = +d.individualBefore;
    d.individualAfter = +d.individualAfter;
    return d;
  }
});
