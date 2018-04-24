// Foresight v0.1

var newSearch;

/**
 * Search visualization by using the given query
 * @param  {[string|array]} query   Search query
 * @param  {[string]} key     Targeted Key in data object
 * @param  {[string]} tagName Targeted D3 element tag name
 * @return {[undefined]}
 */
function foresight(query, key, tagName) {
  newSearch = new visualSearch(query, key, tagName);
  // If key has provided, select elements based on query and key;
  // otherwise select elements based on query only.
  if (key) {
    newSearch.selectElementWithKey();
  } else {
    newSearch.selectElementWithoutKey();
  }
  // Fade unselected elements
  newSearch.fadeAllElements();
  // Unfade selected elements
  newSearch.unhfadeSelectedElements();
}

function visualSearch(query, key, tagName) {

  this.key = key;
  this.selectedElmArray = [];
  this.tagNames = [];
  this.query = [];

  // if query is a string, convert it to an array
  if (!Array.isArray(query)) {
    this.query.push(query);
  } else {
    this.query = query;
  }

  // If tag name has provided, only look into the element has that tag name.
  if (tagName) {
    var tagNameElements = document.getElementsByTagName(tagName);
    this.elements = tagNameElements;
  } else {
    // Get and loop through SVG canvas elements
    var svgs = document.getElementsByTagName("svg");
    for (var i = 0; i < svgs.length; i++) {
      // Get and loop through all elements on this canvas
      var allElements = svgs[i].getElementsByTagName("*");
      this.elements = allElements;
    }
  }
}

// Check bounded data and select elements based on query and key
visualSearch.prototype.selectElementWithKey = function() {
  var sel, tagName;
  for (var i = 0; i < this.elements.length; i++) {
    // Get into the element if it has bounded data
    var data = this.elements[i].__data__;
    if (data && data[this.key]) {

      sel = d3.select(this.elements[i]);
      tagName = sel.node().tagName;

      for (var j = 0; j < this.query.length; j++) {
        // Preform case-insensitive match
        if (data[this.key] && data[this.key].toLowerCase() === this.query[j].toLowerCase()) {
          // Push selected element's tag name into tagNames
          if (this.tagNames.indexOf(tagName) === -1) {
            this.tagNames.push(tagName);
          }
          this.selectedElmArray.push(sel);
        }
      }

    }
  }
}

// Check bounded data and select elements based on query only
visualSearch.prototype.selectElementWithoutKey = function() {
  var string, sel, tagName;
  for (var i = 0; i < this.elements.length; i++) {
    // Get into the element if it has bounded data
    var data = this.elements[i].__data__;
    if (data) {
      // Serialize data object
      if (!data.innerHTML) {
        string = JSON.stringify(data);
      } else {
        continue;
      }

      sel = d3.select(this.elements[i]);
      tagName = sel.node().tagName;

      for (var j = 0; j < this.query.length; j++) {
        // Preform case-insensitive search
        if (string.toLowerCase().indexOf(this.query[j].toLowerCase()) !== -1) {
          // Push selected element's tag name into tagNames
          if (this.tagNames.indexOf(tagName) === -1) {
            this.tagNames.push(tagName);
          }
          this.selectedElmArray.push(sel);
        }
      }
    }
  }
}

// Fade unselected elements
visualSearch.prototype.fadeAllElements = function() {
  for (var i = 0; i < this.elements.length; i ++) {
    var sel, tagName;
    var data = this.elements[i].__data__;
    if (data) {
      sel = d3.select(this.elements[i]);
      tagName = sel.node().tagName;

      if (this.tagNames.indexOf(tagName) > -1) {
        sel.classed("visualsearch-fade", true);
      }
    }
  }
}

// Unfade selected elements
visualSearch.prototype.unhfadeSelectedElements = function() {
  for (var i = 0; i < this.selectedElmArray.length; i ++) {
    this.selectedElmArray[i].classed("visualsearch-fade", false)
                            .classed("visualsearch-highlight", true)

  }
}

// Reset visualization
visualSearch.prototype.searchReset = function() {
  for (var i = 0; i < this.tagNames.length; i++) {
    d3.selectAll(this.tagNames[i])
      .classed("visualsearch-fade", false)
      .classed("visualsearch-highlight", false)
  }
  this.tagNames = [];
  this.selectedElmArray = [];
}
