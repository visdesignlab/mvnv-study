const initCalcState = {
  count: {
    count2: {
      count3: 0,
      count4: 1
    }
  }
};

function Calculator(provenance) {
  return {
    currentState: () => provenance.graph().current.state
  };
}

const provenance = ProvenanceLibrary.initProvenance(initCalcState);
const app = Calculator(provenance);

provenance.addObserver("count.count2", () => {
  console.log("I should be called Multiple times");
});

provenance.addObserver("count.count2.count4", state => {
  console.log("Only once", state.count);
});
console.log(app.currentState());

provenance.applyAction({
  label: "Add val",
  action: val => {
    const test = app.currentState();
    test.count.count2.count3 += val;
    return test;
  },
  args: [12]
});
console.log(app.currentState());

provenance.applyAction({
  label: "Add val",
  action: val => {
    const test = app.currentState();
    test.count.count2.count4 += val;
    return test;
  },
  args: [12]
});
console.log(provenance.graph());

console.log(app.currentState());

provenance.reset();
console.log(app.currentState());

console.log("");
console.log("");
console.log("");
