const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'first_db',
  password: 'Parth@2105',
});


//  THIS WAS JUST TO GET IDEA OF HOW WE CAN WRITE QUERY IN JAVASCRIPT
//let query="INSERT INTO user() VALUES(?,?,?,?)";
//let user= ["a1","shradha","shradha@gmail.com","khapra"];

//Second method
//let query="INSERT INTO user() VALUES ?";
//let users= [["a2","shradha2","shradha@gmail.com2","khapra2"],
//["a3","shradha3","shradha@gmail.com3","khapra3"]];







// THIS FUNCTION CREATES 
let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

let data = [];
for (let i = 1; i <= 100; i++) {
  data.push(createRandomUser());
}

let query = "INSERT INTO user() VALUES ?";

try {
  connection.query(query, [data], (err, results) => {
    if (err) throw err;
    else
      console.log(results);
  })
} catch (err) {
  console.log(err);
}

// connection.end();


app.get("/", (req, res) => {
  let query = "SELECT COUNT(*) FROM user;";
  try {
    connection.query(query, (err, result) => {
      if (err) throw err;
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in Database");
  }
});

app.get("/user", (req, res) => {
  let query = "SELECT * FROM user ORDER BY username ASC;";
  try {
    connection.query(query, (err, user) => {
      if (err) throw err;
      res.render("users.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in Database");
  }
});

//ADD ROUTE
app.get("/user/new", (req, res) => {
  res.render("newuser.ejs");
});

app.post("/user", (req, res) => {
  let { id, username, email, password } = req.body;
  let data=[];
  data[0] = [id, username, email, password];
  console.log(data);
  let q = "INSERT INTO user() VALUES ?";
  try {
    connection.query( q, [data], (err, result) => {
      if (err) throw  err;
      else {
        res.redirect("/user");
      }
    })
  } catch (err) {
    res.send(`Error : ${err}`);
  }
})

//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;

  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    })
  } catch (err) {
    console.log(err);
    res.send("Some Error in DB");
  }

});

//UPDATE ROUTE
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;

  let { username: newuser, password: formpass } = req.body;
  console.log(formpass);
  console.log(newuser);
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (formpass != user.password) {
        res.send("Wrong Password");
      } else {

        let q2 = `UPDATE user SET username="${newuser}" WHERE id="${id}"`;
        connection.query(q2, (err, result) => {
          res.redirect("/user");
        })
      }

    })
  } catch (err) {
    console.log(err);
    res.send("Some Error in DB");
  }

});


//DELETE ROUTE

app.post("/user/:id/delete", (req, res) => {
  let { id } = req.params;

  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("deleteform.ejs", { user });
    })
  } catch (err) {
    console.log(err);
    res.send("Some Error in DB");
  }
})
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { email, password } = req.body;

  console.log(email);
  console.log(password);

  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);

      if(password!=user.password && email!=user.email){
        res.send("Wrong Credentials");
      }else{
        let quer=`DELETE FROM user WHERE password='${user.password}';`;
        connection.query(quer,(err,result)=>{
          if(err){
            res.send("ERROR");
          }else{
            res.render("/user");
          }
        })
      }
    })
  } catch (err) {
    console.log(err);
    res.send("Some Error in DB");
  }

})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})