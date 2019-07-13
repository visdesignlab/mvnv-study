function setPanelValuesFromFile() {

   //create internal dictionary of defaultDomains for each attribute;

  [['node','nodes'],['edge','links']].map(node_edge=>{
    Object.keys(config.attributeScales[node_edge[0]]).map(attr=>{
      let graphElements = graph[node_edge[1]]
      //use d3.extent for quantitative attributes
        if (typeof graphElements[0][attr] === typeof 2){
          defaultDomains[attr] = d3.extent(graphElements, n => n[attr])
        } else {
          //use .filter to find unique categorical values
          defaultDomains[attr] = graphElements
            .map(n => n[attr])
            .filter((value, index, self) => self.indexOf(value) === index)
        }

      //set domainValues in config.attributeScales if there are none
      config.attributeScales[node_edge[0]][attr].domain =  config.attributeScales[node_edge[0]][attr].domain || defaultDomains[attr]
    });
  })


  d3.select("#fontSlider").on("input", function() {
    d3.select("#fontSliderValue").text(this.value);
    config.labelSize = eval(this.value);
  });

  d3.select("#fontSlider").on("change", function() {
    updateVis();
  });

  d3.select("#markerSize").property(
    "value",
    config.nodeWidth + "," + config.nodeHeight
  );

  d3.select("#markerSize").on("change", function() {
    let markerSize = this.value.split(",");
    config.nodeWidth = eval(markerSize[0]);
    config.nodeHeight = eval(markerSize[1]);
    updateVis();
  });

  //set Panel Values

  d3.selectAll("input[name='isDirected']")
    .filter(function() {
      return d3.select(this).property("value") === config.isDirected.toString();
    })
    .attr("checked", "checked");

    //cannot have directed graph that is of single edge type, so disable that if it is the case;
    d3.selectAll("input[name='isDirected']")
    .property("disabled", function(){
      return  eval(d3.select(this).property("value")) === true && config.isMultiEdge === false;
    })

  d3.selectAll("input[name='isMultiEdge']")
    .filter(function() {
      return (
        d3.select(this).property("value") === config.isMultiEdge.toString()
      );
    })
    .attr("checked", "checked");

  //cannot have directed graph that is of single edge type, so disable that if it is the case;
      d3.selectAll("input[name='isMultiEdge']")
      .property("disabled", function(){
        return  eval(d3.select(this).property("value")) === false && config.isDirected === true;
      })

  d3.select("#renderBarsCheckbox").property("checked", config.drawBars);

  //get attribute list from baseConfig file;
  let nodeAttrs = Object.entries(config.attributeScales.node);
  let edgeAttrs = Object.entries(config.attributeScales.edge);

  let menuItems = [
    {
      name: "nodeFillSelect",
      type: typeof "string",
      configAttr: "nodeFillAttr"
    },
    {
      name: "nodeSizeSelect",
      type: typeof 2,
      configAttr: "nodeSizeAttr"
    },
    {
      name: "edgeStrokeSelect",
      type: typeof "string",
      configAttr: "edgeStrokeAttr"
    },
    {
      name: "edgeWidthSelect",
      type: typeof 2,
      configAttr: "edgeWidthAttr"
    },
    // {
    //   name: "nodeQuantSelect",
    //   type: typeof 2,
    //   configAttr: "quantAttrs"
    // },
    {
      name: "nodeCatSelect",
      type: typeof "string",
      configAttr: "catAttrs"
    },
    {
      name: "nodeQuantAttributes",
      type: typeof 2,
      configAttr: undefined
    }
  ];

  menuItems.map(m => {
    let item = d3.select("#" + m.name);

    let isNode = m.name.includes("node");
    let isCategorical = m.type === typeof "string";

    let menuOptions = isNode ? nodeAttrs : edgeAttrs;
    let attrScales = isNode ? config.attributeScales.node : config.attributeScales.edge;

    //filter to only those that match the type
    menuOptions = menuOptions.filter(option=>{
      return option[1].range && isCategorical || !option[1].range && !isCategorical
    }).map(d=>{return {attr:d[0],domain:d[1].domain}})

    //for quant attributes domain input boxes
      d3.select("#" + m.name)
        .select("input")
        .property("value", () =>  "[" + attrScales[config[m.configAttr]].domain + "]");

      let selectMenu = item.select("select")
        .selectAll("option")
        .data(menuOptions);

        let selectEnter = selectMenu
        .enter()
        .append("option");

        selectMenu.exit().remove();

        selectMenu = selectEnter.merge(selectMenu);


        selectMenu
        .attr("value", d => d.attr)
        .text(d => d.attr);

        selectMenu
        .selectAll("option")
        .filter((d, i) => config[m.configAttr] === d.attr)
        .property("selected", true);

      //  //Set up callbacks for the config panel on the left.
      item.select("select").on("change", function() {
        console.log('value is ', this.value)
        createHist(
          this.value,
          d3.select("#" + m.name + "_histogram"),
          isNode ? graph.nodes : graph.links
        );
      });

      //set selected element according to config file;

      //add svgs for quant attr selectors
      if (m.type !== typeof "string") {
        let newSvg = item.selectAll("svg").data([0]);

        let svgEnter = newSvg.enter().append("svg");

        newSvg = svgEnter.merge(newSvg);

        newSvg.attr("id", m.name + "_histogram");

        let attr = m.configAttr
          ? config[m.configAttr]
          : config.quantAttrs[0];
        createHist(attr, newSvg, isNode ? graph.nodes : graph.links);
      }

  });
