
d3.json("../public/twitter_data/Eurovis2019Network.json", function(error,graph) {

    d3.json("../public/twitter_data/Eurovis2019Tweets.json", function(tweets) {
      // console.log(graph.nodes);
      graph.links = [];

      let newGraph = { nodes: [], links: [] };

      let countSiblingLinks = function(graph, source, target) {
        var count = 0;
        let links = graph.links;

        for (var i = 0; i < links.length; ++i) {
          if (
            (links[i].source.id == source.id &&
              links[i].target.id == target.id) ||
            (links[i].source.id == target.id && links[i].target.id == source.id)
          )
            count++;
        }
        return count;
      };

      let getSiblingLinks = function(graph, source, target) {
        var siblings = [];
        let links = graph.links;
        for (var i = 0; i < links.length; ++i) {
          if (
            (links[i].source.id == source.id &&
              links[i].target.id == target.id) ||
            (links[i].source.id == target.id && links[i].target.id == source.id)
          )
            siblings.push(links[i].type);
        }
        return siblings;
      };

      //create edges from tweets.

      tweets = tweets.tweets;

      let createEdge = function(source, target, type) {
        if (source && target) {

          //target is always the one earlier in the alphabet. 
          // let sortedNodes=[source,target].sort();

          // source = sortedNodes[0];
          // target = sortedNodes[1];

          let link = {
            source: source.id,
            target: target.id,
            type,
            count: 1,
            id: source.id + '_' + target.id + '_' + type
          };
          let existingLink = newGraph.links.find(
            l =>
              ((l.source === link.source && l.target === link.target) ||
                (l.source === link.target && l.target === link.source)) &&
              l.type === link.type
          );
          //either increase the count of an existing link or add a new link
          if (!existingLink) {
            link.selected = false;
            newGraph.links.push(link);
          } else {
            existingLink.count = existingLink.count + 1;
          }

          if (!newGraph.nodes.find(n => n.id === source.id)) {
            //randomly assign a categorical variable 'type'
            source.type = Math.random() > 0.6 ? "institution" : "person";
            if (!existingLink) {
              source.neighbors = [target.id];
              source.edges = [link.id];
            }
            source.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            source.selected = false;
            newGraph.nodes.push(source);
          } else {
            if (!existingLink) {
              source.neighbors.push(target.id);
              source.edges.push(link.id);
            }
          }
          if (!newGraph.nodes.find(n => n.id === target.id)) {
            //randomly assign a categorical variable 'type'
            target.type = Math.random() > 0.6 ? "institution" : "person";
            if (!existingLink) {
              target.neighbors = [source.id];
              target.edges = [link.id];
            }
            target.userSelectedNeighbors=[]; //Keep track of when users have selected it's neighbors to keep it highlighted.
            target.selected = false;
            newGraph.nodes.push(target);
          } else {
            if (!existingLink) {
              target.neighbors.push(source.id);
              target.edges.push(link.id);
            }
          }
        }
      };

      tweets.map(tweet => {
        //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
        tweet.entities.user_mentions.map(mention => {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(n => n.id === mention.id);

          createEdge(source, target, "mentions");
        });

        //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
        if (tweet.retweeted_status) {
          let source = graph.nodes.find(n => n.id === tweet.user.id);
          let target = graph.nodes.find(
            n => n.id === tweet.retweeted_status.user.id
          );

          createEdge(source, target, "retweet");
        }

        //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
        // if (tweet.in_reply_to_user_id_str) {
        //   let source = graph.nodes.find(n => n.id === tweet.user.id);
        //   let target = graph.nodes.find(
        //     n => n.id === tweet.in_reply_to_user_id
        //   );

        //   createEdge(source, target, "reply");
        // }
      });

      console.log(JSON.stringify(newGraph))
    });
  });


      