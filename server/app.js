const express=require("express");
const bodyParser=require("body-parser");
const _=require("lodash");
  var admin = require('firebase-admin');

var app=express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH");
  next();
});

var serviceAccount = require("./db/tachedown-firebase-adminsdk-hsjmc-9ee9289684.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tachedown.firebaseio.com"
});

//Middleware décodant les requetes JSON
app.use(bodyParser.json());

//https://httpstatuses.com/

var dbTache=admin.database().ref('/taches');

//routes

// GET /taches

app.get('/taches', (req, res)=>{

  dbTache.orderByChild('index').once('value',resp=>{
    res.status(200).send(resp.val());
  });
//   dbTache.once('value')
//   .then(function(resp) {
//     //console.log(resp.val());
//
//       res.status(200).send(resp.val());
//     })
//     .catch(function(error) {
//     res.status(400).send('erreur : '+ error);
// })
 });

// POST /taches
app.post('/taches', (req, res)=>{

//Recupération des données transmises
  var body= _.pick(req.body, ["categorie", "deadline", "titre", "etat", "description"]);

 //pas de titre => pas de tache
  if( !body.titre) res.status(400).send("Pas de titre transmis pour la création");

  //Les valeurs par défaut (si non renseignées)
 body.creation=new Date();
  if(!body.categorie) body.categorie="";
if(!body.deadline) {
  var deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 1);
  body.deadline= deadline;
}
if(!body.etat) body.etat=1;
if(!body.description) body.description="";

dbTache.orderByChild("index").limitToLast(1).once("value")
.then(resp=> {
  var value=resp.val();
  for(var i in value){
    body.index=++value[i].index;
    var dbTachePush = dbTache.push(body);
    var newId=dbTachePush.key;
      res.status(200).send(newId+" : "+body);
  }
})
.catch(function(error) {
res.status(400).send('erreur : '+ error);
});



  //res.send(todo.text);
});



// GET /taches/ID:
app.get('/taches/:id', (req, res)=>{
  var id=req.params.id;

  dbTache.child(id).once('value').then(resp=>{
      res.status(200).send(resp.val());
    }).catch(function(error) {
      res.status(400).send('erreur : '+ error);
    });

  });


  // PATCH /taches/ID:
  app.patch('/taches/:id', (req, res)=>{
    var id=req.params.id;
// console.log(id);
// console.log(req.body);
    //Recupération des données transmises
      var body= _.pick(req.body, ["categorie", "deadline", "titre", "etat", "description", "index"]);
      //console.log(body);
      var tache = dbTache.child(id)
      tache.update(body).then(()=>{
        dbTache.child(id).once('value').then(resp=>{
            res.status(200).send(resp.val());
          });
      }).catch(function(error) {
        res.status(400).send('erreur : '+ error);
      });


});


app.listen(3000, ()=>{
  console.log("Serveur démarré sur le port 3000");
});


module.exports={
  app,
};
