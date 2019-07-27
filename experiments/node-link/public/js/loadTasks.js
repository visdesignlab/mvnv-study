
    //global variable that defines the tasks to be shown to the user and the (randomized) order in which to show them
    let taskList;
    let workerID; // to be populated when the user goes through the consent form; 

    let vis;

    //bookkeeping vars 
    let studyTracking={
        taskListObj:null,
        group:null,
        numConditions:null
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
        var conditionsRef = db.collection("studyTracking").doc("FZP1xMCY2bNOu5Iyi9KP");

        let conditionsObj = await conditionsRef.get()
            .catch(function (error) {
                console.log("Error getting document:", error);
            });

        let conditions = conditionsObj.data().conditions;
        studyTracking.numConditions = conditions.length;

        var assignedGroupDoc = db.collection("studyTracking").doc("currentGroup")
        let assignedGroup = await assignedGroupDoc.get()
            .catch(function (error) {
                console.log("Error getting document:", error);
            });


        let group = assignedGroup.data().currentGroup;
        studyTracking.group = group;


        let selectedCondition = conditions[group];
        let selectedVis = selectedCondition.type;

        vis = selectedVis;

        //do an async load of the designated task list;
        taskListObj = await d3.json(selectedCondition.taskList);
        studyTracking.taskListObj = taskListObj;

        let taskListEntries = Object.entries(taskListObj);
        //Randomly order the tasks. 
        shuffle(taskListEntries);

        // insert order and taskID into each element in this list  
        taskList = taskListEntries.map((t,i)=>{
            let task = t[1];
            task.order = i;
            task.taskID = t[0];
            return task
        })


        //remove divs that irrelevant to the vis approach being used am/nl
        if (selectedVis === 'nodeLink'){
            d3.select('#adjMatrix').remove();
        } else {
            d3.select('#nodeLink').remove();
        }

        //load script tags for the appropriate vis technique; 
        let scriptTags = {
            nodeLink: ["js/main_nodeLink.js", "js/helperFunctions.js"],
            adjMatrix: []
        }
        let cssTags = {
            nodeLink: ["css/node-link.css"],
            adjMatrix: []
        }

        //dynamically load only js/css relevant to the vis approach being used; 
        scriptTags[selectedVis].map(src=>{
            var newScript = document.createElement("script");
            newScript.src = src;
            newScript.type = "text/javascript";
            d3.select('head').node().appendChild(newScript);
        })

        cssTags[selectedVis].map(href=>{
            var newStyleSheet = document.createElement("link");
            newStyleSheet.href = href;
            newStyleSheet.rel = "stylesheet";
            d3.select('head').node().appendChild(newStyleSheet);
        })

        

    }

    //Once a user has signed the consent form. Update the 'currentGroup' and push the taskList to their name;
    async function assignTasks(){

        //create a pared down copy of this taskList to store in firebase (no need to store configs);
        let configLessTaskList = JSON.parse(JSON.stringify(studyTracking.taskListObj));

        Object.keys(configLessTaskList).map(key=>{
                delete configLessTaskList[key].config;
        })

        var taskListRef = db.collection('results').doc(workerID);
        taskListRef.set(configLessTaskList,{ merge: true });

        //update group; 
        db.collection("studyTracking").doc("currentGroup").update({
            "currentGroup": (studyTracking.group + 1) % studyTracking.numConditions
        })
    }