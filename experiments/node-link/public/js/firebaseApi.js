// Mini api to connect to, add and retrieve data from a FireBase datastore.


let db;

let fb = {

    connect() {
        // Your web app's Firebase configuration
        var firebaseConfig = {
          apiKey: "AIzaSyAdGhNvUkAKeMWhzPHfuoXPUC36gBj68wU",
          authDomain: "mvn-turk.firebaseapp.com",
          databaseURL: "https://mvn-turk.firebaseio.com",
          projectId: "mvn-turk",
          storageBucket: "",
          messagingSenderId: "83565157892",
          appId: "1:83565157892:web:9fff8e165c4e2651"
        };
        // Initialize Firebase
        let app = firebase.initializeApp(firebaseConfig);
      
        db = firebase.firestore(app);
      },
      
      addDocument(data,collection = "users") {
        db.collection(collection)
          .add(data)
          .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
      },
      
      async getCollection(name = "users") {
        db.collection(name)
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(doc => {
              console.log(`${doc.id} => ${doc.data()}`);
            });
            
            return querySnapshot
          });
      }

}


