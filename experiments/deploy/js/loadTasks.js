//global variable that defines the tasks to be shown to the user and the (randomized) order in which to show them
let taskList;
let workerID = "Carolina"; // to be populated when the user goes through the consent form;
let currentTask = 0; //start at task 0

let vis;

//bookkeeping vars
let studyTracking = {
  taskListObj: null,
  group: null,
  numConditions: null
};

let provenance; 
//  SET LISTENER FOR CTRL OR COMMAND Z AND CALL PROVENANCE.GOBACKONESTEP();
  function KeyPress(e) {
    var evtobj = window.event ? event : e;
    if (
      (evtobj.keyCode == 90 && evtobj.ctrlKey) ||
      (evtobj.keyCode == 90 && evtobj.metaKey)
    ) {
      if(provenance){
        provenance.goBackOneStep();
      }else {
        window.controller.model.provenance.goBackOneStep();
      }
    }
  }

  document.onkeydown = KeyPress;



//common data validation and submission code
function screenTest(width, height) {
  let widthTest = window.screen.availWidth >= width;
  let heightTest = window.screen.availHeight >= height;

  //remove orientation from window.screen object
  let screenSpecs = {
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  };

  return widthTest && heightTest ? screenSpecs : false;
}

d3.select("#answerBox").on("input", function() {
  updateAnswer(d3.select(this).property("value"));
});

//function that updates the answer in the side panel as well as in the results field in tasks
//answer is either an array of node objects or a string from the answer box;
function updateAnswer(answer) {
  //Update answer inside taskList;
  let taskObj = taskList[currentTask];
  let answerType = typeof answer;

  if (answerType === "string") {
    taskObj.answer.value = answer;
  } else {
    taskObj.answer.nodes = answer.map(a => {
      return { id: a.id, name: a.shortName };
    });

    let selectedList = d3
      .select("#selectedNodeList")
      .selectAll("li")
      .data(answer);

    let selectedListEnter = selectedList.enter().append("li");

    selectedList.exit().remove();

    selectedList = selectedListEnter.merge(selectedList);
    selectedList.text(d => d.shortName);
  }

  //validate the entire answer object, but error check for only the field that is being updated
  validateAnswer(taskObj.answer, answerType == "string" ? "value" : "nodes");
}

// Set submit button callback.
d3.select("#submitButton").on("click", async function() {
  // ******  need access to dylan's provenance graph
  // push final provenance graph here;

  //Enforce 'disabled' behavior on this 'button'
  if (d3.select(this).attr("disabled")) {
    return;
  }

  //TO DO validate answers that were not enforced with validateAnswer (such as a minimum number of selected nodes);
  let task = taskList[currentTask];
  let flexibleAnswer =
    task.replyType.includes("multipleNodeSelection") &&
    task.replyCount.type === "at least";

  //force validate answer;

  if (flexibleAnswer) {
    let isValid = validateAnswer(task.answer, "nodes", true);
    if (task.replyType.includes("value")) {
      let validateValue = validateAnswer(task.answer, "value", true);
      isValid = isValid && validateValue;
    }
    if (!isValid) {
      return;
    }
  }

  if (vis === "nodeLink") {
    //   updateState('Finished Task');
    let action = {
      label: "Finished Task",
      action: () => {
        const currentState = app.currentState();
        //add time stamp to the state graph
        currentState.time = Date.now();
        //Add label describing what the event was
        currentState.event = "Finished Task";
        return currentState;
      },
      args: []
    };

    provenance.applyAction(action);
    pushProvenance(app.currentState());
  } else {
    let action = {
      label: "Finished Task",
      action: () => {
        const currentState = window.controller.model.app.currentState();
        //add time stamp to the state graph
        currentState.time = Date.now();
        currentState.event = "Finished Task";
        return currentState;
      },
      args: []
    };

    window.controller.model.provenance.applyAction(action);
    pushProvenance(window.controller.model.app.currentState());
  }

  taskList[currentTask].endTime = Date.now();
  taskList[currentTask].minutesToComplete =
    Math.round(
      taskList[currentTask].endTime - taskList[currentTask].startTime
    ) / 60000;

  d3.select(".modalFeedback").classed("is-active", true);
});

d3.selectAll('.helpIcon').on("click",()=>{


  d3.select(".quickStart").classed("is-active", true);

})

d3.selectAll('#closeModal').on("click",()=>{


  d3.select(".quickStart").classed("is-active", false);

})

//set up callback for 'next Task';
d3.select("#nextTask").on("click", async () => {
  let taskObj = taskList[currentTask];

  let selected = d3.selectAll("input[name=difficulty]").filter(function() {
    return d3.select(this).property("checked");
  });

  //check to see if something has been selected before allowing the user to continue:

  if (selected.size() === 0) {
    //display error msg;
    d3.select(".modalFeedback")
      .select(".errorMsg")
      .style("display", "inline");
    return;
  } else {
    d3.select(".modalFeedback")
      .select(".errorMsg")
      .style("display", "none");
  }

  // grab any potential feedback from the user;
  let explanation = d3
    .select(".modalFeedback")
    .select(".textarea")
    .property("value");

  let difficulty = selected.size() > 0 ? selected.property("value") : "";

  taskObj.feedback = {
    difficulty,
    explanation
  };

  //update taskList with the answer for that task.
  db.collection("results")
    .doc(workerID)
    .update({
      [taskObj.taskID + ".answer"]: taskObj.answer,
      [taskObj.taskID + ".feedback"]: taskObj.feedback,
      [taskObj.taskID + ".startTime"]: taskObj.startTime,
      [taskObj.taskID + ".endTime"]: taskObj.endTime,
      [taskObj.taskID + ".minutesToComplete"]: taskObj.minutesToComplete
    });

  //increment current task;
  if (currentTask < taskList.length - 1) {
    currentTask = currentTask + 1;
    //set startTime for next task;
    taskList[currentTask].startTime = Date.now();
    resetPanel();
    d3.select(".modalFeedback").classed("is-active", false);
  } else {
    d3.select(".hit").style("display", "none");

    let participant = await db
      .collection("participants")
      .doc(workerID)
      .get();

    let endTime = Date.now();
    let startTime = participant.data().startTime;

    //update endTime in database;
    db.collection("participants")
      .doc(workerID)
      .set(
        {
          endTime,
          minutesToComplete: Math.round((endTime - startTime) / 60000) //60000 milliseconds in a minute
        },
        { merge: true }
      );

    experimentr.next();
  }
});

//set up callback for taskShortcuts

d3.selectAll('.taskShortcut')
.on("click",function(){
  //set new currentTask then call resetPanel;
  currentTask = taskList.findIndex(t=>t.taskID == d3.select(this).attr('id'));
  resetPanel();
})


function resetPanel() {
  let task = taskList[currentTask];
  task.startTime = Date.now();

  d3.selectAll('.taskShortcut')
  .classed('currentTask',function(){ return d3.select(this).attr('id') === taskList[currentTask].taskID});

  //Only start off with the submit button enabled for when the task only requires an unspecified node count;

  let flexibleAnswer =
    task.replyType.includes("multipleNodeSelection") &&
    task.replyCount.type === "at least";

  // clear any values in the feedback or search box;
  d3.select(".modalFeedback")
    .select(".textarea")
    .property("value", "");

  d3.select(".searchInput").property("value", "");

  d3.select("#answerBox").property("value", "");

  d3.selectAll(".submit").attr("disabled", flexibleAnswer ? null : true);

  // //Clear Selected Node List
  d3.select("#selectedNodeList")
    .selectAll("li")
    .remove();

  //clear any selected Radio buttons in the feedback box;
  d3.select(".modalFeedback")
    .selectAll("input")
    .property("checked", false);

  //check for different reply types

  if (task.replyType.includes("value")) {
    d3.select("#valueAnswer").style("display", "inline");
  } else {
    d3.select("#valueAnswer").style("display", "none");
  }

  if (
    task.replyType.includes("singleNodeSelection") ||
    task.replyType.includes("multipleNodeSelection")
  ) {
    d3.select("#nodeAnswer").style("display", "block");
  } else {
    d3.select("#nodeAnswer").style("display", "none");
  }

  d3.select("#taskArea")
    .select(".card-header-title")
    .text(task.prompt + " (" + task.taskID + ")");

  if (vis === "nodeLink") {
    loadTask(task);
  } else {
    window.controller.loadTask(currentTask);
  }
}

async function pushProvenance(provGraph) {
  // Push the latest provenance graph to the firestore.
  let provGraphDoc = await db
    .collection(workerID)
    .doc(taskList[currentTask].taskID)
    .get();

  let doc = provGraphDoc.data();

  let docSize =
    calcFirestoreDocSize("provenanceGraph", workerID, doc) / 1000000;

  console.log("Provenance graph size for ", workerID ,  " is ", docSize, " MB");
  console.log("Provenance graph has ", doc, "elements");

  if (docSize > 0.75) {
    console.log(
      "Provenance Graph for this user is too large! Considering storing each state in its own document"
    );
  } else {
    let docRef = db.collection(workerID).doc(taskList[currentTask].taskID);
    if (doc) {
      docRef.update({
        provGraphs: firebase.firestore.FieldValue.arrayUnion(provGraph)
      });
    } else {
      docRef.set({
        provGraphs: firebase.firestore.FieldValue.arrayUnion(provGraph)
      });
    }
  }
}
//Function to ensure that the workerID is a valid database document ID;
function sanitizeWorkerID(workerID) {
  // Must be valid UTF-8 characters
  // Must be no longer than 1,500 bytes
  // Cannot contain a forward slash (/)
  // Cannot solely consist of a single period (.) or double periods (..)
  // Cannot match the regular expression __.*__
  return workerID;
}

//validates answer
//validates the entire answer object before assigning the submit button enable/disabled;
//error checks the field specified to show any error msgs.
//force argument is true when this is run from the submit button. Forces error message to show up that wouldn't otherwise.
function validateAnswer(answer, errorCheckField, force = false) {
  let task = taskList[currentTask];
  let replyTypes = task.replyType;

  //infer type of answer
  let numSelectedNodes = answer.nodes.length;

  let isValid = true;
  let errorMsg;

  let isFlexibleAnswer =
    replyTypes.includes("multipleNodeSelection") &&
    task.replyCount.type == "at least";

  if (replyTypes.includes("singleNodeSelection")) {
    isValid = isValid && numSelectedNodes === 1;

    if (errorCheckField === "nodes") {
      if (numSelectedNodes > 1) {
        errorMsg =
          "Too many nodes selected, please select a single node as your answer.";
      }

      if (numSelectedNodes < 1) {
        errorMsg = "No nodes selected.";
      }
    }
  } else if (replyTypes.includes("multipleNodeSelection")) {
    //only naturally perform 'isValid' check for counts that are exactly
    if (task.replyCount.type === "exactly") {
      isValid = isValid && numSelectedNodes == task.replyCount.value;

      if (errorCheckField === "nodes") {
        if (numSelectedNodes < task.replyCount.value) {
          errorMsg =
            "Keep going! This question requires " +
            task.replyCount.value +
            " node selections.";
        }

        if (numSelectedNodes > task.replyCount.value) {
          errorMsg =
            "Too many nodes selected. This task requires " +
            task.replyCount.value +
            " node selections.";
        }

        if (numSelectedNodes < 1) {
          errorMsg = "No nodes selected.";
        }
      }
    }
  }

  if (replyTypes.includes("value")) {
    isValid = isValid && d3.select("#answerBox").property("value").length > 0;

    if (errorCheckField === "value") {
      if (d3.select("#answerBox").property("value").length < 1) {
        errorMsg = "Please enter a value in the answer box.";
        console.log("should be here");
      }
    }
  }

  //when running Validate answer with 'force' = true, then this is happening on submit;
  if (
    force &&
    errorCheckField === "nodes" &&
    task.replyCount.type === "at least"
  ) {
    console.log("forcing!");
    isValid = isValid && numSelectedNodes >= task.replyCount.value;
    if (numSelectedNodes < 1) {
      errorMsg = "No nodes selected!";
    } else if (numSelectedNodes < task.replyCount.value) {
      errorMsg = "Please select at least  " + task.replyCount.value + " nodes.";
    }
  }

  console.log("answer is valid ", isValid);
  console.log("errorMsg is ", errorMsg);
  d3.select("#submitButton").attr(
    "disabled",
    isValid || isFlexibleAnswer ? null : true
  );
  //toggle visibility of error message;

  let errorMsgSelector =
    errorCheckField === "value"
      ? d3.select("#valueAnswer").select(".errorMsg")
      : d3.select("#nodeAnswer").select(".errorMsg");

  errorMsgSelector
    .style("display", !isValid ? "inline" : "none")
    .text(errorMsg);

  return isValid;
}

//function that generates random 'completion code' for worker to input back into Mechanical Turk;
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function loadTasks(visType) {

  //Helper function to shuffle the order of tasks given - based on https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
  }

  //find out which group to delegate and load appropriate taskList json file; ;
  var conditionsRef = db.collection("studyTracking").doc("conditions");

  let conditionsObj = await conditionsRef.get().catch(function(error) {
    console.log("Error getting document:", error);
  });

  let conditions = conditionsObj.data().conditionList;
  studyTracking.numConditions = conditions.length;

  var assignedGroupDoc = db.collection("studyTracking").doc("currentGroup");
  let assignedGroup = await assignedGroupDoc.get().catch(function(error) {
    console.log("Error getting document:", error);
  });

  let group = visType ? visType === "nodeLink" ? 0 : 1 : assignedGroup.data().currentGroup;

  studyTracking.group = group;

  let selectedCondition = conditions[group];
  let selectedVis = selectedCondition.type;

  //(force the task list if this is a heuristics run)
  // if (visType) {
  //   selectedCondition.taskList = "taskLists/heuristics.json";
  // }

  vis = selectedVis; // = 'adjMatrix'//='nodeLink' //

  //set the source for the quickStart guide image in the modal; 

  d3.select('.quickStart')
  .select('img')
  .attr('src',(vis === 'nodeLink' ? 'training/nodeLink_quickStart.png' :  'training/adjMatrix_quickStart.png')
  )
  
  d3.select('.quickStart').select('.modal-card').style('width','calc(100vh - 100px)')

  //do an async load of the designated task list;
  taskListObj = await d3.json(selectedCondition.taskList);
  studyTracking.taskListObj = taskListObj;

  let taskListEntries = Object.entries(taskListObj);
  
  if (!heuristics){
    //Randomly order the tasks.
  shuffle(taskListEntries);
  }
  // insert order and taskID into each element in this list
  taskList = taskListEntries.map((t, i) => {
    let task = t[1];
    task.order = i;
    task.taskID = t[0];
    task.workerID = workerID;
    return task;
  });

  //remove divs that are irrelevant to the vis approach being used am/nl
  if (selectedVis === "nodeLink") {
    d3.selectAll(".adjMatrix").remove();
  } else {
    d3.selectAll(".nodeLink").remove();
    d3.selectAll(".development").remove();
  }

  //load script tags for the appropriate vis technique;
  let scriptTags = {
    nodeLink: [
      "js/nodeLink/main_nodeLink.js",
      "js/nodeLink/helperFunctions.js"
    ], //,"js/createTaskConfig.js"],
    adjMatrix: [
      "js/adjMatrix/libs/reorder/science.v1.js",
      "js/adjMatrix/libs/reorder/tiny-queue.js",
      "js/adjMatrix/libs/reorder/reorder.v1.js",
      "js/adjMatrix/fill_config_settings.js",
      "js/adjMatrix/helper_functions.js",
      "js/adjMatrix/autocomplete.js",
      "js/adjMatrix/cleaned_model.js"
    ]
  };
  let cssTags = {
    nodeLink: [
      "css/nodeLink/node-link.css",
      "css/nodeLink/bulma-checkradio.min.css"
    ],
    adjMatrix: ["css/adjMatrix/adj-matrix.css"]
  };

  // //   dynamically load only js/css relevant to the vis approach being used;
  const loadAllScripts = async () => {
    return await Promise.all(
      scriptTags[selectedVis].map(async src => {
        return await loadScript(src, () => "");
      })
    );
  };

  await loadAllScripts();

  cssTags[selectedVis].map(href => {
    var newStyleSheet = document.createElement("link");
    newStyleSheet.href = href;
    newStyleSheet.rel = "stylesheet";
    d3.select("head")
      .node()
      .appendChild(newStyleSheet);
  });
}

//function that loads in a .js script tag and only resolves the promise once the script is fully loaded
function loadScript(url, callback) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {
      // only required for IE <9
      script.onreadystatechange = function() {
        if (
          script.readyState === "loaded" ||
          script.readyState === "complete"
        ) {
          script.onreadystatechange = null;
          callback();
          resolve();
        }
      };
    } else {
      //Others
      script.onload = function() {
        callback();
        resolve();
      };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

//Once a user has signed the consent form. Update the 'currentGroup' and push the taskList to their name;
async function assignTasks() {
  //create a pared down copy of this taskList to store in firebase (no need to store configs);
  let configLessTaskList = JSON.parse(
    JSON.stringify(studyTracking.taskListObj)
  );

  Object.keys(configLessTaskList).map(key => {
    delete configLessTaskList[key].config;
  });

  var taskListRef = db.collection("results").doc(workerID);
  taskListRef.set(configLessTaskList);

  //update group;
  db.collection("studyTracking")
    .doc("currentGroup")
    .update({
      currentGroup: (studyTracking.group + 1) % studyTracking.numConditions
    });
}

function calcFirestoreDocSize(collectionName, docId, docObject) {
  let docNameSize = encodedLength(collectionName) + 16;
  let docIdType = typeof docId;
  if (docIdType === "string") {
    docNameSize += encodedLength(docId) + 1;
  } else {
    docNameSize += 8;
  }
  let docSize = docNameSize + calcObjSize(docObject);

  return docSize;
}
function encodedLength(str) {
  var len = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) {
      len++;
    } else if (code > 0x7ff && code <= 0xffff) {
      len += 2;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      i--;
    }
  }
  return len;
}

function calcObjSize(obj) {
  let key;
  let size = 0;
  let type = typeof obj;

  if (!obj) {
    return 1;
  } else if (type === "number") {
    return 8;
  } else if (type === "string") {
    return encodedLength(obj) + 1;
  } else if (type === "boolean") {
    return 1;
  } else if (obj instanceof Date) {
    return 8;
  } else if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      size += calcObjSize(obj[i]);
    }
    return size;
  } else if (type === "object") {
    for (key of Object.keys(obj)) {
      size += encodedLength(key) + 1;
      size += calcObjSize(obj[key]);
    }
    return (size += 32);
  }
}
