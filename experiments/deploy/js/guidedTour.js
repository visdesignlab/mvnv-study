var shepherd;

var neighborRows = [];

function welcome(vis) {
  shepherd = setupShepherd(vis);

  if (vis === "adjMatrix") {
    //set up a group wrapper for the sortIcon so as to not override the native click handler for the sort icon.
    let labelParent = d3.select("#groupCol247943631");
    let labelGroup = labelParent.append("g").attr("class", "tourLabelGroup");

    labelGroup.node().append(document.querySelector("#sortIcon247943631")); //move the icon into the group wrapper

    //callback for when user clicks on Judge Label
    d3.select("#tourColLabel247943631").on("click", () => {
      if (shepherd.isActive()) {
        groupRows();
        shepherd.next();
      }
    });

    //callback for when user clicks on Judge sort
    d3.select(".tourLabelGroup").on("click", () => {
      if (shepherd.isActive()) {
        //slight timeout to give the sort time to do it's rearranging of rows
        setTimeout(function() {
          groupRows();
          shepherd.next();
        }, 100);
      }
    });
  }

  shepherd.start();
}

function groupRows(vis) {
  let parentSelector = vis === "nodeLink" ? ".nodes" : "#edgeMargin";

  let group = d3.select(".tourNeighborGroup");
  if (group.size() === 0) {
    group = d3
      .select(parentSelector)
      .append("g")
      .attr("class", "tourNeighborGroup");
    //move to before gridlines;
    document
      .querySelector(parentSelector)
      .insertBefore(group.node(), document.querySelector(".gridLines"));
  }

  let neighbors = [
    "#groupRow318046158",
    "#groupRow1652270612",
    "#groupRow136400506",
    "#groupRow16112517",
    "#groupRow1873322353",
    "#groupRow19299318",
    "#groupRow2873695769"
  ];

  let neighborFlag = false;
  d3.selectAll(".row").each(function(d, i) {
    let selector = "#groupRow" + d.id;
    let isNeighbor = neighbors.includes(selector);

    if (neighborFlag && !isNeighbor) {
      //tag this as the position you later want to reinsert the neighbor;
      neighborRows.map(row =>
        row.insertBefore
          ? ""
          : (row.insertBefore = document.querySelector(selector))
      );
    }

    neighborFlag = false;
    if (isNeighbor) {
      neighborFlag = true;
      neighborRows.push({ selector });
    }
  });

  neighbors.map(n => {
    let neighbor = document.querySelector(n);
    group.node().appendChild(neighbor);
  });
}

function setupShepherd(vis) {
  //   var prefix = "demo-";
  var shepherd = new Shepherd.Tour({
    defaultStepOptions: {
      //   classes: "class-1 class-2",
      scrollTo: {
        behavior: "smooth",
        block: "center"
      },
      showCancelLink: true,
      tippyOptions: {
        maxWidth: "400px",
        popperOptions: {
          modifiers: {
            preventOverflow: {
              escapeWithReference: true
            }
          }
        }
      }
    },
    // classPrefix: prefix,
    // This should add the first tour step
    steps: [
      {
        title: "Task Definition",
        text: "This is the task that you will be answering.",
        attachTo: {
          element: ".taskCard",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              return this.cancel();
            },
            secondary: true,
            text: "Exit"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "welcome"
      },
      {
        title: "Searching for a Node",
        text: "You can search for any node by name. <span class='instructions'>Try searching for Judge</span>",
        attachTo: {
          element: ".searchInput",
          on: "bottom"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          }
        ],
        id: "creating",
        modalOverlayOpeningPadding: "10"
      }
    ],

    useModalOverlay: true,
    styleVariables: {
      // arrowSize:2.5,
      shepherdThemePrimary: "#1b5486",
      shepherdThemeSecondary: "#e5e5e5",
      //   shepherdButtonBorderRadius: 6,
      //   shepherdElementBorderRadius: 6,
      // //   shepherdHeaderBackground: '#eeeeee',
      // //   shepherdThemePrimary: '#9b59b6',
      //   useDropShadow: true,
      overlayOpacity: 0.25
    }
  });

  if (vis === "adjMatrix") {
    const steps = [
      {
        title: "Selected Row",
        text: "This has selected the row representing Judge.",
        attachTo: {
          element: "#groupRow247943631",
          // element:'#Judge_group',
          on: "top"
        },
        buttons: [
          {
            action: function() {
              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Selected Column ",
        text: "As well as the Column",
        attachTo: {
          element: "#groupCol247943631",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Selecting Neighbors",
        text: "<span class=instructions> Select judge's neighbors by clicking on the column label </span>",
        attachTo: {
          element: "#tourColLabel247943631",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          }
        ],
        id: "attaching"
      },
      {
        title: "Selected Neighbors ",
        text: "This highlights all of Judge's neighbors in green.",
        attachTo: {
          element: ".tourNeighborGroup",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              let parentSelector =
              vis === "nodeLink" ? ".nodes" : "#edgeMargin";

            neighborRows.map(n => {
              let neighbor = document.querySelector(n.selector);
              d3.select(parentSelector)
                .node()
                .insertBefore(neighbor, n.insertBefore);
            });

              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              let parentSelector =
                vis === "nodeLink" ? ".nodes" : "#edgeMargin";

              neighborRows.map(n => {
                let neighbor = document.querySelector(n.selector);
                d3.select(parentSelector)
                  .node()
                  .insertBefore(neighbor, n.insertBefore);
              });

              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Grouping Neighbors ",
        text:
          "You can bring all neighbors to the top of the matrix by clicking on the sort icon. <span class=instructions>Try it out!</span>",
        attachTo: {
          element: "#sortIcon247943631",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              groupRows(vis)
              return this.back();
            },
            secondary: true,
            text: "Back"
          }
          // {
          //   action: function() {
          //     return this.next();
          //   },
          //   text: "Next"
          // }
        ],
        id: "attaching"
      },
      {
        title: "Grouping Neighbors ",
        text:
          "All of judge's neighbors are now grouped at the top of the matrix",
        attachTo: {
          element: ".tourNeighborGroup",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              let parentSelector =
              vis === "nodeLink" ? ".nodes" : "#edgeMargin";

            neighborRows.map(n => {
              let neighbor = document.querySelector(n.selector);
              d3.select(parentSelector)
                .node()
                .insertBefore(neighbor, n.insertBefore);
            });
              window.controller.view.sort('shortName');
              // window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              let parentSelector =
                vis === "nodeLink" ? ".nodes" : "#edgeMargin";

              neighborRows.map(n => {
                let neighbor = document.querySelector(n.selector);
                d3.select(parentSelector)
                  .node()
                  .insertBefore(neighbor, n.insertBefore);
              });

              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Attributes  ",
        text: "You can see the attributes for all nodes in the adjacent table",
        attachTo: {
          element: "#attributeMargin",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              groupRows(vis);
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Sorting",
        text: "<span class=instructions>Click on a column header to sort by that attribute </span>",
        attachTo: {
          element: ".column-headers",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              window.controller.view.sort('shortName');
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Clearing Selections",
        text:
          "At any point you can clear your selected nodes with the clear selection button. <span class='instructions'>Try it out!</span> ",
        attachTo: {
          element: "#clear-selection",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              window.controller.view.sort('shortName');
              // window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          }
          //   {
          //     action: function() {
          //       return this.next();
          //     },
          //     text: "Next"
          //   }
        ],
        id: "attaching"
      },
      {
        title: "Edge Hover ",
        text:
          "Hover over a cell (the edge)  to highlight both the row and the column intersecting at the cell. " +
          " Notice this also highlights the row corresponding to the selected column, and vice versa.",

        attachTo: {
          element: ".svg-content",
          // element:'#Judge_group',
          on: "right"
        },
        buttons: [
          {
            action: function() {
              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Edge Click ",
        text:
          "Click on a cell (edge) to select the rows and cols highlighted on hover. This also outlines the clicked edge  and the ‘mirror edge’ in red. ",

        attachTo: {
          element: ".svg-content",
          // element:'#Judge_group',
          on: "right"
        },
        buttons: [
          {
            action: function() {
              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Selecting an Answer ",
        text:
          "To select a node as the answer to a task, use the checkbox under the 'answer column' for that row.",

        attachTo: {
          element: "#tourAnswerBox16112517",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Answer List",
        text: "This populates the answer panel so you can easily keep track of the node(s) you are going to submit as your answer",
        attachTo: {
          element: ".answerCard",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              window.controller.model.provenance.goBackOneStep();
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Next"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      }, 
      {
        title: "And you're ready!",
        text: "Thanks for taking the tour, you are ready to begin!",
        buttons: [
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Let's Get Started"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      },
    ];

    shepherd.addSteps(steps);
  } else {
    const steps = [
      {
        title: "Selected Node",
        text: "This has selected the Node representing Judge. Try clicking on the node directly to unselect, then reselect the same node.",
        attachTo: {
          element: "#Judge_group",
          on: "top"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"

      },
      {
        title: "Highlight Neighbors ",
        text: "Selecting a node, whether through click or search, also highlights all of its neighbors",
        attachTo: {
          element: ".nodes",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Dragging Nodes",
        text: "You can drag nodes around to get a better sense of the structure of the network. Try it out!",
        attachTo: {
          element: ".nodes",
          on: "top"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Attribute Encoding",
        text: "For some tasks, you will see attribute encodings directly inside the nodes. Hovering over the node shows tooltips with exact values.",
        attachTo: {
          element: "#Troy_group",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Next"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      },
      {
        title: "Legend",
        text: "The legend on the left shows what the bars and other icons represent. In this case, the bars represent the number of followers, and the number of friends, while the colored circles show if the node is a person or an institution.",
        attachTo: {
          element: "#legendDiv",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              let parentSelector =
                vis === "nodeLink" ? ".nodes" : "#edgeMargin";

              neighborRows.map(n => {
                let neighbor = document.querySelector(n.selector);
                d3.select(parentSelector)
                  .node()
                  .insertBefore(neighbor, n.insertBefore);
              });

              return this.next();
            },
            text: "Next"
          }
        ],
        id: "attaching"
      },
      {
        title: "Clearing Selections",
        text:
          "At any point you can clear your selected nodes with the clear selection button. Try it out! ",
        attachTo: {
          element: "#clear-selection",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          }
          //   {
          //     action: function() {
          //       return this.next();
          //     },
          //     text: "Next"
          //   }
        ],
        id: "attaching"
      },
      {
        title: "Selecting an Answer",
        text: "To select a node as your answer, click anywhere on the top label of the node. Try it out!",
        attachTo: {
          element: "#Sarah_group .labelBackground",
          on: "left"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Next"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      },
      {
        title: "Answer List",
        text: "This populates the answer panel so you can easily keep track of the node(s) you are going to submit as your answer",
        attachTo: {
          element: ".answerCard",
          on: "right"
        },
        buttons: [
          {
            action: function() {
              return this.back();
            },
            secondary: true,
            text: "Back"
          },
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Next"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      },      
      {
        title: "And you're ready!",
        text: "Thanks for taking the tour, you are ready to begin!",
        buttons: [
          {
            action: function() {
              return this.next();
            },
            secondary: true,
            text: "Let's Get Started"
          }
        ],
        id: "attaching",
        modalOverlayOpeningPadding: "10"
      }
    ];

    shepherd.addSteps(steps);

    // This should add steps after the ones added with `addSteps`
    // shepherd.addStep({
    //   title: "Centered Shepherd Element",
    //   text:
    //     'But attachment is totally optional!\n       Without a target, a tour step will create an element that\'s centered within the view.       Check out the <a href="https://shepherdjs.dev/docs/">documentation</a> to learn more.',
    //   buttons: [
    //     {
    //       action: function() {
    //         return this.back();
    //       },
    //       secondary: true,
    //       text: "Back"
    //     },
    //     {
    //       action: function() {
    //         return this.next();
    //       },
    //       text: "Next"
    //     }
    //   ],
    //   id: "centered-example"
    // });
  }

  return shepherd;
}
