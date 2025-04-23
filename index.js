const express = require('express');
const app = express();
//ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
//method-override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
//for parsing data
app.use(express.urlencoded({ extended: true }));
//uuid
const { v4: uuidv4 } = require('uuid');
//for accessing public folder
app.use(express.static(path.join(__dirname,"public"))); // for public folder]

//-----------------------------------------------------------------database connection--------------------------------
const { faker } = require('@faker-js/faker');

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password(),
    ];
}
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'demo_app',
    password: "Newapex#7"

});
//   let q = "INSERT INTO user (id, username, email, password) VALUES ?";
//   let data = [];
//   for(let i = 0 ; i<100; i++){
//     data.push(getRandomUser());
//   }
// try{
//     connection.query(q,[data], (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         console.log(result.length);
//     });

// }catch(err){
//     console.log(err);

// }
// connection.end();

//-----------------------------------------------------------start the server-------------------------------
app.listen(8080, () => {
    console.log("server is lisening to   port 8080");
});
//fetch and show total no. of users on our app
//-------------------------------------------------home route
app.get("/", (req, res) => {
    let q = "SELECT COUNT(*) FROM user";
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            const count = result[0]['COUNT(*)'];
            res.render("home.ejs", { count });
        });

    } catch (err) {
        console.log(err);
        res.send("error in the database");

    }
});
//fetch and show data(userid,username, email) of all users
//---------------------------------------------------------show  route
app.get("/users", (req, res) => {
    let q = "SELECT * FROM user";
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("showusers.ejs", { users });
        });

    } catch (err) {
        console.log(err);
        res.send("error in the database");

    }


});
//------------------------------------------------------Edit route (2 steps)
//i)get request :if user click on edit ...new page form will appear based on id, this form will require password to edit something
app.get("/users/:id/edit", (req, res) => {
    const id = req.params.id;
    let q = ` SELECT * FROM user WHERE id="${id}" `;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            const user = result[0];
            res.render("edit.ejs", { user });
        });

    } catch (err) {
        console.log(err);
        res.send("error in the database");

    }
});
//ii) patch request: if correct pass is entered  edit the form and save the changes to database
app.patch("/users/:id", (req, res) => {
    const id = req.params.id;
    let { password: formpass, username: newUsername } = req.body;

    //1)search user based on id
    let q1 = ` SELECT * FROM user WHERE id="${id}" `;


    try {
        connection.query(q1, (err, result) => {
            if (err) throw err;
            const user = result[0];
            //2)check if entered pass is equal to actual pass
            if (formpass != user.password) {
                res.send("wrong pass");
            } else {//3) pass is right , now update username
                let q2 = `UPDATE user SET username ='${newUsername}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    const user = result[0];
                    res.redirect("/users");
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("error in the database");
    }
});
//----------------------------------------------Add Route

app.get("/users/add", (req, res) => {
    res.render("adduser.ejs");
});
app.post("/users", (req, res) => {
    let { username: newUsername, email: newEmail, password: newPass } = req.body;
    let id = uuidv4();
    let q = "INSERT INTO user (id, username, email, password) VALUES (?,?,?,?)";
    let newdata =[`${id}`,`${newUsername}`,`${newEmail}`,`${newPass}`];
        connection.query(q, newdata, (err, result) => {
            if (err) console.log(err) ;
            console.log(result);
            console.log(result.length);
    
            console.log("New user added:", newdata);
            res.redirect("/users");
        });
})
//-----------------------------------------------------Delete route
app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    res.render("delete.ejs",{id});
});
app.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    let { email: formEmail, password: formPass } = req.body;
    let q1 = ` SELECT * FROM user WHERE id="${id}" `;


    try {
        connection.query(q1, (err, result) => {
            if (err) throw err;
            const user = result[0];;
            //check if entered value is equal to actual value
        
            if(formPass === user.password ||formEmail ===user.email) {
                let q2 = `DELETE FROM user WHERE email='${formEmail}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;       
                    res.redirect("/users");
                });
            }else{
                res.send("wrong info");
            }
        
        });
    } catch (err) {
        console.log(err);
        res.send("error in the database");
    }
});



