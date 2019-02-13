const expect=require("expect");
const request=require("supertest");
const {ObjectID} =require("mongodb");
const {app}=require("./../app");
const {Todo}=require("./../models/Todo");

const dummyTodos=[
  { _id : new ObjectID(),
    text:"dummy toDo 1",
},
{_id :new ObjectID(),
  text:"dummy toDo 2",
}

]
//hooking
beforeEach((done) => {
  Todo.deleteMany({}).then(() =>{
    return Todo.insertMany(dummyTodos);
  }).then(()=>done());
});

//Groupe de tests
describe("POST /todos", ()=>{
  it("doit créer un nouveau todo", (done) =>{
    var text= "test todo";
    request(app)
    .post("/todos")
    .send({text}) // == .send({"text":text,})
    .expect(201)
    .expect(res => {
      expect(res.body.text).toBe(text);
    })
    .end(done);
  }),

  it("ne doit pas créer un toDo avec un texte non valide", (done)=>{
    request(app)
    .post("/todos")
    .send({})
    .expect(400)
    .end(done);
  })
});


describe("GET /todos", ()=>{
  it("doit recevoir la liste des toDos", (done)=>{
    request(app)
    .get("/todos")
    .expect(200)
    .expect(res=>{
      // console.log(res.body.todos);
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  }),

  it("doit recevoir un todo", (done)=>{
    request(app)
    .get(`/todos/${dummyTodos[0]._id}`)
    .expect(200)
    .expect(res=>{
      // console.log(res.body.todos);
      expect(res.body.todo.text).toBe(dummyTodos[0].text);
    })
    .end(done);
  }),

  it("doit retourner 404 si le todo n'est pas trouvé", (done)=>{
    request(app)
    .get("/todos"+new ObjectID())
    .send({})
    .expect(404)
    .end(done);
  })

})
;

describe("DELETE /todos", ()=>{
  it("doit effacer un todo", (done)=>{
    var id=dummyTodos[0]._id.toHexString()
    request(app)
    .delete(`/todos/${id}`)
    .expect(200)
    .expect(res=>{
      // console.log(res.body.todos);
      expect(res.body.todo._id).toBe(id);
    })
    .end(
      (err,res)=> {
        if(err) return done(err);
        Todo.findById(id).then(todo=>{
          expect(todo).toBeFalsy();
          done();
        })
        .catch(done)
      }
    )
    ;
  }),

  it("doit retourner 404 si le todo n'est pas trouvé", (done)=>{
    request(app)
    .delete("/todos"+new ObjectID())
    .send({})
    .expect(404)
    .end(done);
  })


});


describe("PATCH /todos", ()=>{
  it("doit mettre à jour un todo", (done)=>{
    var id=dummyTodos[0]._id.toHexString();
    var text="nouveau texte";
    request(app)
    .patch(`/todos/${id}`)
    .send({text, completed :true})
    .expect(200)
    .expect(res=>{
      // console.log(res.body.todos);
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeTruthy();
    })
    .end(done)
  }),

  it("doit passer completed à false", (done)=>{
    var id=dummyTodos[0]._id.toHexString();
    request(app)
    .patch(`/todos/${id}`)
    .send({completed :false})
    .expect(200)
    .expect(res=>{
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
    })
    .end(done)
      })
});
