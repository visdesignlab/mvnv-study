
d3.json("../public/twitter_data/Eurovis2019Network.json", function(error,graph) {

    d3.json("../public/twitter_data/Eurovis2019Tweets.json", function(tweets) {

      d3.json("../public/data/network_types.json", function(nodes) {

        d3.json("../public/data/userInfo.json", function(users) {

          let generateDirectedNetwork = true;

          let numNodes = 0;
          let graphSize = 80;

          let graphDone = false;

          //iterate through all graph nodes and add more information: 
          graph.nodes.map(node=>{
            let moreInfo = users.find(n=>n.screen_name === node.screen_name);

            if (moreInfo){
              node.memberSince = new Date(moreInfo.created_at);
              node.name = moreInfo.name;
              node.location = moreInfo.location;

              let today = new Date().getTime();
              let memberStart = new Date(node.memberSince).getTime();
              node.memberFor_days =  Math.ceil(Math.abs(today - memberStart) / (1000 * 60 * 60 * 24));
            }
          })
        // console.log(JSON.stringify(graph.nodes.filter(n=>n.memberSince)[0]));
      graph.links = [];

      let newGraph = { nodes: [], links: [] };

      //create edges from tweets.

      tweets = tweets.tweets;

      let createEdge = function(source, target, type) {

        // console.log('calling createEdge')
        if (numNodes >= graphSize){
          graphDone = true;
          return;
        }


        if (source && target) {

          //check to see that either source or target node already exists in the graph ( to ensure a connected graph)
          let sourceExists = newGraph.nodes.find(n => n.id === source.id) !== undefined;
          let targetExists = newGraph.nodes.find(n => n.id === target.id) !== undefined;

          if (!sourceExists && !targetExists && numNodes>0){
            return; 
          }

          let link = {
            source: source.id,
            target: target.id,
            type,
            count: 1,
            id: source.id + '_' + target.id + '_' + type
          };
          let existingLink = newGraph.links.find(
            l =>{
              let condition = (l.source === link.source && l.target === link.target) ;
              if (!generateDirectedNetwork){
                condition = condition || (l.source === link.target && l.target === link.source)
              }
             
              return condition && l.type === link.type
          }
          );
          //either increase the count of an existing link or add a new link
          if (!existingLink ) {
            link.selected = false;
            newGraph.links.push(link);
          } else {
            existingLink.count = existingLink.count + 1;
          }

          if (!newGraph.nodes.find(n => n.id === source.id)) {
            source.type = nodes[source.id].type;
            source.continent = nodes[source.id].continent;
            if (!existingLink) {
              source.neighbors = [target.id];
              source.edges = [link.id];
            }
            source.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            source.selected = false;
            newGraph.nodes.push(source);
            // console.log('pushing ' + source.screen_name + ' that connects to ' + target.screen_name)
            numNodes++;
          } else {
            if (!existingLink) {
              source.neighbors.push(target.id);
              source.edges.push(link.id);
            }
          }
          if (!newGraph.nodes.find(n => n.id === target.id)) {
            //randomly assign a categorical variable 'type'
            // target.type = Math.random() > 0.6 ? "institution" : "person";
            target.type = nodes[target.id].type;
            target.continent = nodes[target.id].continent;

            if (!existingLink) {
              target.neighbors = [source.id];
              target.edges = [link.id];
            }
            target.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            target.selected = false;
            newGraph.nodes.push(target);
            // console.log('pushing ' + target.screen_name + ' that connects to ' + source.screen_name)

            numNodes++;
          } else {
            if (!existingLink) {
              target.neighbors.push(source.id);
              target.edges.push(link.id);
            }
          }
        } 
        
        // else {
        //   console.log('something went wrong',source? source.screen_name : '',target? target.screen_name : '')
        // }

      };

      while (!graphDone){
          console.log('here')
        tweets.map(tweet => {
    
          //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
          if (tweet.retweeted_status) {
            let source = graph.nodes.find(n => n.id === tweet.user.id) ;
            let target = graph.nodes.find(
              n => n.id === tweet.retweeted_status.user.id
            );
  
            // console.log(tweet.retweeted_status.user.id === tweet.entities.user_mentions[0].id);
  
            createEdge(source, target, "retweet");
          } else {
            //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
          tweet.entities.user_mentions.map(mention => {
            let source = graph.nodes.find(n => n.id === tweet.user.id);
            let target = graph.nodes.find(n => n.id === mention.id);
  
              createEdge(source, target, "mentions");
  
  
          });
          }


      })
    
      

        

        

        //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
        // if (tweet.in_reply_to_user_id_str) {
        //   let source = graph.nodes.find(n => n.id === tweet.user.id);
        //   let target = graph.nodes.find(
        //     n => n.id === tweet.in_reply_to_user_id
        //   );

        //   createEdge(source, target, "reply");
        // }
      };

      console.log(JSON.stringify(newGraph))
      });
    });
      
    });
  });


      