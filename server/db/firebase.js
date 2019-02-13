const firebase =require("https://www.gstatic.com/firebasejs/5.8.1/firebase.js");

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCHN6XAQRkT9wErC3qflREi_kGYoj4-cMQ",
    authDomain: "tachedown.firebaseapp.com",
    databaseURL: "https://tachedown.firebaseio.com",
    projectId: "tachedown",
    storageBucket: "tachedown.appspot.com",
    messagingSenderId: "983415663903"
  };
  firebase.initializeApp(config);


  var getTaches=()=>{
    firebase.database().ref("taches.json").once('value').then(resp=>{
      return resp;
    })
    .catch(this.handleError('getTaches', []))
};


    module.exports={
     getTaches,
    };
