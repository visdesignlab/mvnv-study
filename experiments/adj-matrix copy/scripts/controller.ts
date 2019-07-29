
// Work on importing class file
class controller {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private view: any;
  private model : any;


  constructor() {
    //this.view = new View(); initalize view,
    this.model = new Model(this);
  }

}
