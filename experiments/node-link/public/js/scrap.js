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