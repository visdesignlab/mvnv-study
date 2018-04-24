/**
 * Main JavaScript for foresight research
 * 02/28/2017
 **/

///////////////////////////For Experiment Begin/////////////////////////////
var userData = {
  "condition": "",
  "visitLog": [], // an array of chart visit sequence
  "searchLog": [], // an array of search sequence
  "sectionLog": [] // an array of section visit sequence
};
var currentVisit = null;
var currentSearch = null;
var currentSection = null;

var searchData = [];

// Set the condition
if (Math.random() > 0.5) {
  userData.condition = "foresight";
} else {
  userData.condition = "control";
}

console.log("condition = " + userData.condition);


///////////////////////////For Experiment End/////////////////////////////


// Initialize typeahead search box
$.typeahead({
  input: ".js-typeahead", // jQuery selector to reach Typeahead's input for initialization
  minLength: 1, // 0 to search on focus, minimum character length to perform a search
  maxItem: 0, // 0 / false as "Infinity" meaning all the results will be displayed
  order: "asc", // "asc" or "desc" to sort results
  offset: false, // Set to true to match items starting from their first character
  hint: false, // Added support for excessive "space" characters
  searchOnFocus: true, // Display search results on input focus
  mustSelectItem: false, // The submit function only gets called if an item is selected
  cancelButton: true, // If text is detected in the input, a cancel button will be available to reset the input (pressing ESC also cancels)
  display: ["companyname", "industry"], // Allows search in multiple item keys ["display1", "display2"]
  template: "{{companyname}} <small class='result-group'>{{industry}}</small>", // Display template of each of the result list
  emptyTemplate: "No result for {{query}}",
  source: { // Source of data for Typeahead to filter
    ajax: {
      url: "./data/data.json",
    }
  },
  callback: {
    onInit: null, // When Typeahead is first initialized (happens only once)
    onReady: null, // When the Typeahead initial preparation is completed
    onShowLayout: null, // Called when the layout is shown
    onHideLayout: null, // Called when the layout is hidden
    onSearch: null, // When data is being fetched & analyzed to give search results 
    onResult: function(node, query, result, resultCount, resultCountPerGroup) {
      // When the result container is displayed
      // Reset foresight if foresight has already been created
      if (newSearch) {
        newSearch.searchReset();
      }

      // Search while typing
      if (resultCount > 0) {
        var queryArray = [];
        for (var i = 0; i < result.length; i ++) {
          queryArray.push(result[i].ticker);
        }
        foresight(queryArray, "ticker", "circle");
      }

      // user data log: Record search
      //console.log(query);
      // record the previous search
      if(currentSearch){
        currentSearch['end'] = Date.now();
        currentSearch['duration'] = currentSearch['end'] - currentSearch['start'];
        userData['searchLog'].push(currentSearch)
        currentSearch = null;
        //console.log(userData['searchLog'])
      }
      // record the new search
      if(!currentSearch && query){
        currentSearch = {}
        currentSearch['id'] = userData['searchLog'].length;
        currentSearch['start'] = Date.now();
        currentSearch['content'] = query
        currentSearch['selectedCharts'] = resultCount;
      }
    },
    onLayoutBuiltBefore: null, // When the result HTML is build, modify it before it get showed
    onLayoutBuiltAfter: null, // Modify the dom right after the results gets inserted in the result container
    onNavigateBefore: null, // When a key is pressed to navigate the results, before the navigation happens
    onNavigateAfter: null, // When a key is pressed to navigate the results
    onMouseEnter: null, // When the mouse enter an item in the result list
    onMouseLeave: null, // When the mouse leaves an item in the result list
    onClickBefore: null, // Possibility to e.preventDefault() to prevent the Typeahead behaviors
    onClickAfter: function(node, a, item, event) {
      // Happens after the default clicked behaviors has been executed
      // Stops the default action
      event.preventDefault();
      // Reset foresight if foresight has already been created
      if (newSearch) {
        newSearch.searchReset();
      }
      // Search result
      foresight(item.ticker, "ticker", "circle");
    },
    onDropdownFilter: null, // When the dropdownFilter is changed, trigger this callback
    onSendRequest: null, // Gets called when the Ajax request(s) are sent
    onReceiveRequest: null, // Gets called when the Ajax request(s) are all received
    onPopulateSource: null, // Perform operation on the source data before it gets in Typeahead data
    onCacheSave: null, // Perform operation on the source data before it gets in Typeahead cache
    onSubmit: function(node, form, item, event) {
      // When Typeahead form is submitted
      // Stops the default action
      event.preventDefault();
      // var searchResults = this.result;
      // if (searchResults.length > 0) {
      //   $(".typeahead__list").children().first().click();
      // }
    },
    onCancel: null // Triggered if the typeahead had text inside and is cleared
  }
});
