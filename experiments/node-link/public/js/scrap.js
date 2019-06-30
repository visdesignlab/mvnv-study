// add edge labels
var edgeLabels = d3
.select(".links")
.selectAll(".pathLabel")
.data(graph.links);

let edgeLabelsEnter = edgeLabels
.enter()
.append("text")
.attr("class", "pathLabel hideLabel")
.append("textPath")
.attr("startOffset", "50%")
.attr("text-anchor", "middle");

edgeLabels.exit().remove();

edgeLabels = edgeLabelsEnter.merge(edgeLabels);

edgeLabels
.attr("xlink:href", function(d) {
  return "#" + d.id;
})
.text(function(d) {
  return d.type;
});


          // d3.select(".links")
          //   .selectAll(".pathLabel")
          //   .classed("hideLabel", d => !currentData.edges.find(n => n === d.id));

          // console.log('pathData is ',d))