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

//common data validation and submission code

//set callback for free form answer input box

d3.select("#answerBox").on("input", function() {
  updateAnswer(d3.select(this).property("value"));
});

//function that updates the answer in the side panel as well as in the results field in tasks
//answer is either an array of node objects or a string from the answer box;
function updateAnswer(answer) {
  //Update answer inside taskList;
  let taskObj = taskList[currentTask];
  taskObj.answer = typeof answer == "object" ? answer.map(a => a.id) : answer; //answer will either be an array of objects or a value;
  //populate answer list; - will do nothing if there is no #selectedNodeList (which is the case for value answers)
  let selectedList = d3
    .select("#selectedNodeList")
    .selectAll("li")
    .data(answer, n => n.id);

  let selectedListEnter = selectedList.enter().append("li");

  selectedList.exit().remove();

  selectedList = selectedListEnter.merge(selectedList);
  selectedList.text(d => d.shortName);

  validateAnswer(taskObj.answer, currentTask);
}

// Set submit button callback.
d3.selectAll(".submit").on("click", async function (){
  // ******  need access to dylan's provenance graph
  // push final provenance graph here;

  //Enforce 'disabled' behavior on this 'button'
  if(d3.select(this).attr('disabled')){
      return;
  }

  if(vis === "nodeLink"){

    //   updateState('Finished Task');
    let action = {
        label:"Finished Task",
        action: () => {
          const currentState = app.currentState();
          //add time stamp to the state graph
          currentState.time = Date.now();
          //Add label describing what the event was
          currentState.event = "Finished Task";
          return currentState;
        },
        args: []
      }

    provenance.applyAction(action);
    pushProvenance(app.currentState())
  } else {

    console.log('should NOT be here')
    let action = {
      label: 'Finished Task',
      action: () => {
        const currentState = window.controller.model.app.currentState();
        //add time stamp to the state graph
        currentState.time = Date.now();
        currentState.event = 'Finished Task'
        return currentState;
      },
      args: []
    }

    window.controller.model.provenance.applyAction(action);
    pushProvenance(window.controller.model.app.currentState());
  }


  taskList[currentTask].endTime = Date.now();
  taskList[currentTask].minutesToComplete = Math.round(
    (taskList[currentTask].startTime - taskList[currentTask].endTime) / 60000
  );

  //show feedback box - changed to show modal
//   d3.select("#feedback").style("display", "inline");

    d3.select('.modalFeedback').classed('is-active',true)

  //add cover to vis and disable search and answerBox
  d3.select("#disableInteraction").style("display", "inline"); //add cover to the vis
  d3.select("#search-input").attr("disabled", "true"); //cannot search for nodes
  d3.select("#answerBox").attr("disabled", "true"); //can no longer edit answer;
  d3.selectAll(".submit").attr("disabled", "true"); //discourage multiple clicks on the submit button
  //update state with answer and end time;
});

//set up callback for 'next Task';
d3.select("#nextTask").on("click", async () => {
  let taskObj = taskList[currentTask];
  let selected = d3.selectAll("input[name=difficulty]").filter(function() {
    return d3.select(this).property("checked");
  });

  //check to see if something has been selected before allowing the user to continue:

  if (selected.size() === 0){
    //display error msg;
    d3.select('.modalFeedback').select('.errorMsg').style('display', 'inline')
    return
  } else{
    d3.select('.modalFeedback').select('.errorMsg').style('display', 'none')
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
    d3.select('.modalFeedback').classed('is-active',false)

  } else {
    console.log("finished Tasks");
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

function resetPanel() {
  let task = taskList[currentTask];
  task.startTime = Date.now();

  // clear any values in the feedback or search box;
  d3.select(".modalFeedback")
    .select(".textarea")
    .property("value", "");

    d3.select('.searchInput').property('value', '')
  
    //hide feedback box
  d3.select("#feedback").style("display", "none");

  //add cover to vis and disable search and answerBox
  d3.select("#disableInteraction").style("display", "none");
  d3.select("#search-input").attr("disabled", null);
  d3.select("#answerBox").attr("disabled", null);
  d3.select("#answerBox").property("value", "");
  d3.selectAll(".submit").attr("disabled", true);

  //Clear Selected Node List
  d3.select("#selectedNodeList")
    .selectAll("li")
    .remove();

  //clear any selected Radio buttons in the feedback box;
  d3.select(".modalFeedback")
    .selectAll("input")
    .property("checked", false);

  //set div of correct display type to visible;
  d3.selectAll(".answerCard").style("display", "none");

  switch (task.replyType) {
    case "singleNodeSelection":
      d3.select("#nodeAnswer").style("display", "inline");
      break;
    case "multipleNodeSelection":
      d3.select("#nodeAnswer").style("display", "inline");
      break;
    case "value":
      d3.select("#valueAnswer").style("display", "inline");
      break;
    default:
    // code block
  }

  d3.select("#taskArea")
    .select(".card-header-title")
    .text(task.prompt + " (" + task.taskID + ")");

    if (vis === 'nodeLink'){
        loadTask(task);
    } else {
        window.controller.loadTask(currentTask);
    }
}

 async function pushProvenance(provGraph) {
  console.log("should be updating", taskList[currentTask].taskID);
  console.log(provGraph);
  // Push the latest provenance graph to the firestore.
  
  let provGraphDoc = await db.collection("provenanceGraphs")
  .doc("Carolina").get();

let doc = provGraphDoc.data();

  let docSize = calcFirestoreDocSize("provenanceGraph",workerID,doc)/1000000

  console.log('Provenance graph size is ',docSize, ' MB')
  console.log ('Provenance graph has ', doc , 'elements')

  if (docSize>.75){
    console.log('Provenance Graph for this user is too large! Considering storing each state in its own document');
  } else {
    db.collection("provenanceGraphs")
    .doc(workerID)
    .update({
      [taskList[currentTask].taskID]: firebase.firestore.FieldValue.arrayUnion(
        provGraph
      )
    });
  }
 
 
}
//Function to ensure that the workerID is a valid database document ID; 
function sanitizeWorkerID(workerID){
    //     Must be valid UTF-8 characters
    // Must be no longer than 1,500 bytes
    // Cannot contain a forward slash (/)
    // Cannot solely consist of a single period (.) or double periods (..)
    // Cannot match the regular expression __.*__
    return workerID

}


//validates answer
function validateAnswer(answer, currentTask) {
  let isValid;
  let errorMsg;
  let numSelectedNodes = answer.length; //graph.nodes.filter(n => n.hardSelect).length

  let submitSelector = "#submitNode"; //changes to #submitText if replyType is 'value'

  switch (taskList[currentTask].replyType) {
    case "singleNodeSelection":
      isValid = numSelectedNodes === 1;

      if (numSelectedNodes > 1) {
        errorMsg =
          "Too many nodes selected, please select a single node as your answer.";
      }

      if (numSelectedNodes < 1) {
        errorMsg = "No nodes selected.";
      }
      break;
    case "multipleNodeSelection":
      isValid = answer.length == taskList[currentTask].replyCount;

      if (numSelectedNodes < taskList[currentTask].replyCount) {
        errorMsg =
          "Keep going! This question requires " +
          taskList[currentTask].replyCount +
          " node selections.";
      }

      if (numSelectedNodes < 1) {
        errorMsg = "No nodes selected.";
      }

      break;
    case "value":
      isValid = d3.select("#answerBox").property("value").length > 0; //TODO error check if the value is a number of string
      submitSelector = "#submitText";
      errorMsg = "Please enter a value in the answer box.";
      break;
  }

  d3.select(submitSelector).attr("disabled", isValid ? null : true);
  //toggle visibility of error message;
  d3.select(".errorMsg").style("display", isValid ? "none" : "inline");
  d3.select(".errorMsg").text(errorMsg);

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

async function loadTasks() {
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



  let group = 0 //assignedGroup.data().currentGroup;
  studyTracking.group = group;

  let selectedCondition = conditions[group];
  let selectedVis = selectedCondition.type;

  console.log('selected Vis is ',selectedVis)

  vis = selectedVis //='nodeLink' //= 'adjMatrix'

  //do an async load of the designated task list;
  taskListObj = await d3.json(selectedCondition.taskList);
  studyTracking.taskListObj = taskListObj;

  let taskListEntries = Object.entries(taskListObj);
  //Randomly order the tasks.
  shuffle(taskListEntries);

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
    d3.selectAll('.development').remove();
  }

  //load script tags for the appropriate vis technique;
  let scriptTags = {
    nodeLink: ["js/main_nodeLink.js", "js/helperFunctions.js"], //,"js/createTaskConfig.js"],
    adjMatrix: ["../../merged_AM_NL/public/adj-matrix/libs/reorder/science.v1.js","../../merged_AM_NL/public/adj-matrix/libs/reorder/tiny-queue.js","../../merged_AM_NL/public/adj-matrix/libs/reorder/reorder.v1.js","../../merged_AM_NL/public/adj-matrix/scripts/fill_config_settings.js","../../merged_AM_NL/public/adj-matrix/scripts/helper_functions.js","../../merged_AM_NL/public/adj-matrix/scripts/autocomplete.js","../../merged_AM_NL/public/adj-matrix/scripts/cleaned_model.js"]
  };
  let cssTags = {
    nodeLink: ["css/node-link.css"],
    adjMatrix: ["../../merged_AM_NL/public/adj-matrix/css/adj-matrix.css"]
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
  console.log("trying to assign tasks");

  //create a pared down copy of this taskList to store in firebase (no need to store configs);
  let configLessTaskList = JSON.parse(
    JSON.stringify(studyTracking.taskListObj)
  );

  Object.keys(configLessTaskList).map(key => {
    delete configLessTaskList[key].config;
  });

  var taskListRef = db.collection("results").doc(workerID);
  taskListRef.set(configLessTaskList, { merge: true });

  //create a document in the provenance graph colletion

  db.collection("provenanceGraphs")
    .doc(workerID)
    .set({'startingField':''}, { merge: true });
  //update group;
  db.collection("studyTracking")
    .doc("currentGroup")
    .update({
      currentGroup: (studyTracking.group + 1) % studyTracking.numConditions
    });
}

function calcFirestoreDocSize(collectionName, docId, docObject) {
    let docNameSize = encodedLength(collectionName) + 16
    let docIdType = typeof(docId)
    if(docIdType === 'string') {
        docNameSize += encodedLength(docId) + 1
    } else {
        docNameSize += 8
    }  
    let docSize = docNameSize + calcObjSize(docObject)

    return  docSize
}
function encodedLength(str) {
    var len = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) {
            len++;
        } else if (code > 0x7ff && code <= 0xffff) {
            len += 2;
        } if (code >= 0xDC00 && code <= 0xDFFF) {
            i--;
        }
    }
    return len;
}

function calcObjSize(obj) {
    let key;
    let size = 0;
    let type = typeof obj;

    if(!obj) {
        return 1
    } else if(type === 'number') {
        return 8
    } else if(type === 'string') {
        return encodedLength(obj) + 1
    } else if(type === 'boolean') {
        return 1
    } else if (obj instanceof Date) {
        return 8
    } else if(obj instanceof Array) {
        for(let i = 0; i < obj.length; i++) {
            size += calcObjSize(obj[i])
        }
        return size
    } else if(type === 'object') {

        for(key of Object.keys(obj)) {
            size += encodedLength(key) + 1 
            size += calcObjSize(obj[key])
        }
        return size += 32
    }
}
