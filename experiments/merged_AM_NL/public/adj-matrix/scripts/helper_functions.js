d3.select("#panelControl").on("click", () => {
  /*let panel = d3.select("#panelDiv");
  let isVisible = panel.style("display") === "block";
  panel.style("display", isVisible ? "none" : "block");
  let button1 = d3.select("#saturatedConfig");
  let button2 = d3.select("#nodeLinkConfig");
  let button3 = d3.select("#optimalConfig");
  //button1.style("display", isVisible ? "none" : "block");
  //button2.style("display", isVisible ? "none" : "block");
  //button3.style("display", isVisible ? "none" : "block");*/

  //window.controller.reload();
});
d3.select("#panelControl").on("click")();
function searchForNode(theForm) {
    console.log(theForm);
    var reason = "";
    reason += validateName(theForm.name);
    reason += validatePhone(theForm.phone);
    reason += validateEmail(theForm.emaile);

    if (reason != "") {
        alert("Some fields need correction:\n" + reason);
    } else {
        simpleCart.checkout();
    }
    return false;
}
  window.onload = function() {
    console.log(d3.select("#optimalConfig"));
    d3.select("#optimalConfig").on("click", () => {
      console.log("Clicked Optimal!")
      window.controller.tenAttr = false;
      window.controller.fiveAttr = false;
      window.controller.loadConfigs();
    });
    console.log(d3.select("#nodeLinkConfig"));
    d3.select("#nodeLinkConfig").on("click", () => { // 5 attr
      console.log("Clicked 5");
      window.controller.tenAttr = false;
      window.controller.fiveAttr = true;
      window.controller.loadConfigs();
    });

    d3.select("#saturatedConfig").on("click", () => { // 10 attr
      console.log("Clicked 10")
      window.controller.tenAttr = true;
      window.controller.fiveAttr = false;
      window.controller.loadConfigs();
    });
  }
