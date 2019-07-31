

(async ()=>{

    let taskListNames = ['large'];

    taskListNames.map(async taskListName=>{
        let taskList =  await d3.json("taskLists/" + taskListName + '_sansConfig.json');

        //iterate through each taskKey and add config object;
        let allConfigs = Object.keys(taskList).map(async (key)=>{
            let taskConfig = await d3.json("configs/"+ key + "Config.json");
            taskList[key].config=taskConfig;
        })

        //export taskList now with configs for each task. 
        // Promise.all(allConfigs).then((completed) => saveToFile(taskList, taskListName + ".json"));
        })
    
} )
();


//   Function that will merge a baseConfig with a taskConfig;
function mergeConfigs(baseConfig, taskConfig) {
    //copy over the nodeLink key/value pairs from the baseConfig to the taskConfig;
    Object.keys(baseConfig.nodeLink).map(nodeAttr => {
      taskConfig.nodeLink[nodeAttr] = baseConfig.nodeLink[nodeAttr];
    });
  
    //rehape both config values into a single dictionary.
    let config = {
      ...baseConfig,
      ...taskConfig
    };
  
    return config;
  }

  //Function to save exportedGraph to file automatically;
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

 


