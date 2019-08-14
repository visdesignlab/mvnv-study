var shepherd;

function welcome(vis) {
  shepherd = setupShepherd(vis);
  shepherd.start();
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
        text:
          "You can search for any node by name. Try searching for Judge",
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
          },
        //   {
        //     action: function() {
        //       return this.next();
        //     },
        //     text: "Next"
        //   }
        ],
        id: "creating",
        modalOverlayOpeningPadding: "10"

      },
    ],

    useModalOverlay: true,
    styleVariables: {
        // arrowSize:2.5,
          shepherdThemePrimary: "#00213b",
          shepherdThemeSecondary: "#e5e5e5",
        //   shepherdButtonBorderRadius: 6,
        //   shepherdElementBorderRadius: 6,
        // //   shepherdHeaderBackground: '#eeeeee',
        // //   shepherdThemePrimary: '#9b59b6',
        //   useDropShadow: true,
          overlayOpacity:.25
        },
  });

  if (vis === "adjMatrix") {
    const steps = [
     
      {
        title: "Selected Row",
        text:
          "This has selected the row representing Judge.",
        attachTo: {
          element: "#groupRow247943631",
          // element:'#Judge_group',
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
        title: "Selected Column ",
        text:
          "As well as the Column",
        attachTo: {
          element: "#groupCol247943631",
          // element:'#Judge_group',
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
        text:
          "Select judge's neighbors by clicking on the column label",
        attachTo: {
          // element: "#groupCol247943631",
          element:'#colLabel247943631',
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
        title: "Selected Neighbors ",
        text:
        "This highlights all of Judge's neighbors in green.",
        attachTo: {
          element: "#groupCol247943631",
          // element:'#Judge_group',
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
        title: "Grouping Neighbors ",
        text:
          "You can bring all neighbors to the top of the matrix by clicking on the sort icon. Try it out!",
        attachTo: {
          element: "#sortIcon247943631",
          // element:'#Judge_group',
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
      },{
        title: "Grouping Neighbors ",
        text:
          "All of judge's neighbors are now grouped at the top of the matrix",
        attachTo: {
          element: ".svg-content",
          // element:'#Judge_group',
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
        title: "Attributes  ",
        text:
          "You can see the attributes for all nodes in the adjacent table",
        attachTo: {
          element: "#attributeMargin",
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
        title: "Sorting",
        text:
          "Click on the column header to sort by that attribute",
        attachTo: {
          element: "#attributeMargin",
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
          },
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
          "Hovering over a cell (the edge) highlights both the row and the column intersecting at the cell. "+ 
          " It also highlights the row corresponding to the selected column, and vice versa.",
         
        attachTo: {
          element: ".svg-content",
          // element:'#Judge_group',
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
        title: "Edge Click ",
        text:
          "Click on a cell (edge) selects the rows and cols highlighted on hover, while also outlining the clicked edge  and the ‘mirror edge’ in red. ",
         
        attachTo: {
          element: ".svg-content",
          // element:'#Judge_group',
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
        title: "Selecting an Answer ",
        text:
          "To select a node the answer to a task, use the checkbox under the 'answer column' for that row.",
         
        attachTo: {
          element: "#answerBox247943631",
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

     
      

    ];

    shepherd.addSteps(steps);
  } else {
    // This should add steps after the ones added with `addSteps`
    shepherd.addStep({
      title: "Centered Shepherd Element",
      text:
        'But attachment is totally optional!\n       Without a target, a tour step will create an element that\'s centered within the view.       Check out the <a href="https://shepherdjs.dev/docs/">documentation</a> to learn more.',
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
      id: "centered-example"
    });

    shepherd.addStep({
      title: "Learn more",
      text: "Star Shepherd on Github so you remember it for your next project",
      attachTo: {
        element: ".hero-followup",
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
          text: "Done"
        }
      ],
      id: "followup",
      modalOverlayOpeningPadding: "10"
    });
  }

  return shepherd;
}
