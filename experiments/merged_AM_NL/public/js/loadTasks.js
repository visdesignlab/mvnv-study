//global variable that defines the tasks to be shown to the user and the (randomized) order in which to show them
let taskList;
let workerID = "MaryEllen"; // to be populated when the user goes through the consent form;

let vis;

//bookkeeping vars
let studyTracking = {
  taskListObj: null,
  group: null,
  numConditions: null
};

async function loadTasks() {
  //Helper function to shuffle the order of tasks given - based on https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
  }

  //find out which group to delegate and load appropriate taskList json file; ;
  var conditionsRef = db
    .collection("studyTracking")
    .doc("FZP1xMCY2bNOu5Iyi9KP");

  let conditionsObj = await conditionsRef.get().catch(function(error) {
    console.log("Error getting document:", error);
  });

  let conditions = conditionsObj.data().conditions;
  studyTracking.numConditions = conditions.length;

  var assignedGroupDoc = db.collection("studyTracking").doc("currentGroup");
  let assignedGroup = await assignedGroupDoc.get().catch(function(error) {
    console.log("Error getting document:", error);
  });

  let group = assignedGroup.data().currentGroup;
  studyTracking.group = group;

  let selectedCondition = conditions[group];
  let selectedVis = 'adjMatrix'//selectedCondition.type;

  vis = selectedVis;

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
    d3.select("#adjMatrix").remove();
  } else {
    d3.select("#nodeLink").remove();
  }

  //load script tags for the appropriate vis technique;
  let scriptTags = {
    nodeLink: ["js/main_nodeLink.js", "js/helperFunctions.js"], //,"js/createTaskConfig.js"],
    adjMatrix: ["adj-matrix/libs/reorder/science.v1.js","adj-matrix/libs/reorder/tiny-queue.js","adj-matrix/libs/reorder/reorder.v1.js","adj-matrix/scripts/fill_config_settings.js","adj-matrix/scripts/helper_functions.js","adj-matrix/scripts/autocomplete.js","adj-matrix/scripts/cleaned_model.js"]
  };
  let cssTags = {
    nodeLink: ["css/node-link.css"],
    adjMatrix: ["adj-matrix/css/adj-matrix.css"]
  };

// //   dynamically load only js/css relevant to the vis approach being used;
 const loadAllScripts = async () => {
    return await Promise.all(scriptTags[selectedVis].map(async src => {
        return await loadScript(src,()=>'')
      }))
  }

  await loadAllScripts();

  cssTags[selectedVis].map(href=>{
      var newStyleSheet = document.createElement("link");
      newStyleSheet.href = href;
      newStyleSheet.rel = "stylesheet";
      console.log(newStyleSheet);
      d3.select('head').node().appendChild(newStyleSheet);
  })
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

  //update group;
  db.collection("studyTracking")
    .doc("currentGroup")
    .update({
      currentGroup: (studyTracking.group + 1) % studyTracking.numConditions
    });
}
