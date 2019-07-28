d3.json("../public/twitter_data/Eurovis2019Network.json", function(
  error,
  graph
) {
  d3.json("../public/twitter_data/Eurovis2019Tweets.json", function(tweets) {
    tweets = tweets.tweets;

    d3.json("../public/data/network_types.json", function(nodes) {
      d3.json("../../configs/baseConfig.json", function(config) {
        d3.json("../public/data/network_mds.json", function(mds) {
        d3.json("../public/data/userInfo.json", function(users) {

          //iterate through all graph nodes and add more information:
          graph.nodes.map(node => {
            let moreInfo = users.find(n => n.screen_name === node.screen_name);

            if (moreInfo) {
              node.memberSince = new Date(moreInfo.created_at);
              node.name = moreInfo.name;
              node.location = moreInfo.location;

              let today = new Date().getTime();
              let memberStart = new Date(node.memberSince).getTime();
              node.memberFor_days = Math.ceil(
                Math.abs(today - memberStart) / (1000 * 60 * 60 * 24)
              );
            }
          });

          let graphSizes = { small: 30, medium: 50, large: 80 };
          let isDirected;
          let hasEdgeTypes;

          let graphSize;
          let newGraph;

          // console.log(JSON.stringify(graph.nodes.filter(n=>n.memberSince)[0]));
          let createEdge = function(source, target, type) {
            // console.log('calling createEdge')
            //stop adding edges if reached desired size of graph
            if (newGraph.nodes.length >= graphSize) {
              graphDone = true;
              return;
            }

            if (source && target) {
              //check to see that either source or target node already exists in the graph ( to ensure a connected graph)
              let sourceExists =
                newGraph.nodes.find(n => n.id === source.id) !== undefined;
              let targetExists =
                newGraph.nodes.find(n => n.id === target.id) !== undefined;

              if (!sourceExists && !targetExists && newGraph.nodes.length > 0) {
                //neither source or target already exists in the graph, don't add node to ensure only connected componetns.

                return;
              }

              let link = {
                source: source.id,
                target: target.id,
                type: hasEdgeTypes ? type : "combined", //set type based on flag to combine edges or not;
                count: 1,
                id: source.id + "_" + target.id + "_" + type,
                selected: false
              };

              let existingLink = newGraph.links.find(l => {
                //check for source and target in that order;
                let directedCondition =
                  l.source === link.source && l.target === link.target;

                //check for source and target or target and source combination
                let undirectedCondition =
                  directedCondition ||
                  (l.source === link.target && l.target === link.source);

                //Set condition based on directedFlag
                let condition = isDirected
                  ? directedCondition
                  : undirectedCondition;

                return condition && l.type === link.type;
              });

              //either increase the count of an existing link or add a new link
              if (!existingLink) {
                newGraph.links.push(link);
              } else {
                existingLink.count = existingLink.count + 1;
              }

              //Either add a new node or update neighbors and edge info for existing node;
              [source, target].map(node => {
                let source_node = node;
                let target_node = node === source ? target : source;

                if (!newGraph.nodes.find(n => n.id === source_node.id)) {
                  source_node.type = nodes[source_node.id].type;
                  source_node.continent = nodes[source_node.id].continent;
                  source_node.shortName = nodes[source_node.id].shortName;
                  source_node.x = mds.nodes.find(m=>m.name === source_node.shortName).x;
                  source_node.y = mds.nodes.find(m=>m.name === source_node.shortName).y;
                  // //Compute shorter string for name
                  // let nameString = source_node.name.split(' ');
                  // if (source_node.type === 'person'){
                  //   source_node.shortName = nameString[0][0] + '.' + nameString[nameString.length-1]
                  // }else {
                  //   let upperCase = nameString.filter(c=> c === c.toUpperCase());
                  //   source_node.shortName = upperCase.length>0 ? upperCase : nameString.reduce((acc,cValue)=>acc+ cValue[0],'');
                  // }

                  if (!existingLink) {
                    source_node.neighbors = [target_node.id];
                    source_node.edges = [link.id];
                  }
                  source_node.userSelectedNeighbors = []; //Keep track of when users have selected it's neighbors to keep it highlighted.
                  source_node.selected = false;
                  newGraph.nodes.push(source_node);
                  // console.log('pushing ' + source.screen_name + ' that connects to ' + target.screen_name)
                } else {
                  if (!existingLink) {
                    source_node.neighbors.push(target_node.id);
                    source_node.edges.push(link.id);
                  }
                }
              });
            }
          };

          //Iterate through all the combinations and write out a file for each
          //For each size

          Object.keys(graphSizes).map(size => {
            graphSize = graphSizes[size];
            //With each directionality
            [false, true].map(isDirectedFlag => {
              //For each edge type
              [false, true].map(hasEdgeTypesFlag => {
                graph.links = [];
                newGraph = { nodes: [], links: [] };

                isDirected = isDirectedFlag;
                hasEdgeTypes = hasEdgeTypesFlag;

                //don't make a directed graph if edgeTypes are not set to true;
                if (isDirected && !hasEdgeTypes) {
                  // do nothing
                } else {
                  // while (!graphDone) {
                  tweets.map(tweet => {
                    //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
                    if (tweet.retweeted_status) {
                      let source = graph.nodes.find(
                        n => n.id === tweet.user.id
                      );
                      let target = graph.nodes.find(
                        n => n.id === tweet.retweeted_status.user.id
                      );

                      createEdge(source, target, "retweet");
                    } else {
                      //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
                      tweet.entities.user_mentions.map(mention => {
                        let source = graph.nodes.find(
                          n => n.id === tweet.user.id
                        );
                        let target = graph.nodes.find(n => n.id === mention.id);

                        createEdge(source, target, "mentions");
                      });
                    }
                  });

                  //adjust data that falls outside of the domains established in the config file; 


                  Object.keys(config.attributeScales.node).map(attr=>{
                    let scale = config.attributeScales.node[attr];

                    if (typeof scale.domain[0] === typeof 2){
                      //Randomly assign values within the top 20% of the scale for values that are greater than the established domain.
                    let adjustmentWindow = (scale.domain[1] - scale.domain[0])*0.30;
                    let maxValue = scale.domain[1];
                    graph.nodes.map(n=>{n[attr] = n[attr]>= maxValue? maxValue - Math.random()*adjustmentWindow : n[attr]})
                    }
                    
                  })

                  let filename =
                    "network_" +
                    size +
                    "_" +
                    (isDirected ? "directed" : "undirected") +
                    "_" +
                    (hasEdgeTypes ? "multiEdge" : "singleEdge") +
                    ".json";
                  saveToFile(newGraph, filename);
                }
              });
            });
          });
        });
      });
    });
    });
  });

  function saveToFile(data, filename) {
    if (!data) {
      console.error("Console.save: No data");
      return;
    }

    if (!filename) filename = "output.json";

    if (typeof data === "object") {
      data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], { type: "text/json" }),
      e = document.createEvent("MouseEvents"),
      a = document.createElement("a");

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    a.dispatchEvent(e);
  }
});
