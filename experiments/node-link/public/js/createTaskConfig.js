(async ()=>{

    let taskListNames = ['large','small'];

    taskListNames.map(taskListName=>{
        let baseConfig = await d3.json("../../configs/baseConfig.json");
        let taskList =  await d3.json("../../taskLists/" + taskListName + '_sansConfig.json');

        //iterate through each taskKey and add config object;
        let allConfigs = Object.keys(taskList).map(async (key)=>{
            let taskConfig = await d3.json("../../configs/"+ key + "Config.json");
            config = mergeConfigs(baseConfig, taskConfig);
            taskList[key].config=config;
        })

        //export taskList now with configs for each task. 
        Promise.all(allConfigs).then((completed) => saveToFile(taskList, taskListName + ".json"));
        })
    
} )();


