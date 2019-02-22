var express = require('express');
var app = express();
const joi = require('joi');
status = 0        //to check active logins

app.use(express.json());

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.urlencoded({ extended:true }));


User = {}
var Users = {}
var enrolled = {}

//Login MiddleWare     

app.use('/loginuser', function(req, res, next){

   if(req.body.regno in Users){
      if( Users[req.body.regno] == req.body.password){
         status = 1;
         User = req.body;
         next();
         
      }
      else{
         res.send("Invalid Credentials.");         //  Handling Validations 
      }

}
else{
   res.send(req.body.regno.toString() + " username doesn't exist.");    //  Handling Validations 
}

})


//Registration MiddleWare  
app.use('/registeruser', function(req, res, next){

   User = req.body;
   if(User.regno in Users){
      res.send("Username already exists.");     // Handling Validations 
   }
   else{

      //JOI VALIDATION
      const schema = {
         regno: joi.string().min(9).max(9).required(),
      }

      const result = joi.validate({'regno': req.body.regno}, schema);
      
      if (result.error != null && result.error.details[0].message) {
         res.status(400).send(result.error.details[0].message);
         return;
     }
      else{
         Users[req.body.regno] = req.body.password;
         enrolled[User.regno] = [];
         status = 1;
         next();
      }
   }

}  
);

//Courses (Kind of Database)
var courses = {
   'ECM4001': 'Data Structures & Algortihms',
   'CSE2004': 'Database Management System',
   'CSE4017': 'Software & Hardware Design',
   'MGT1036': 'Principles of Marketing',
   'MAT1014': 'Discrete Mathematics',
}


//HomePage
app.get('/', function(req, res){
   res.render("homepage", {status: status, User: User});
});

//Registration Form
app.get('/register', function(req, res){
   res.render("register");
});

//Login 
app.get('/login', function(req, res){
   res.render("login");
});


//LoginAuthentication 
app.post('/loginuser', function(req, res){
   res.redirect("/");         //Has a MiddleWare
});

//Logout
app.get('/logout', function(req, res){
   status = 0;
   User = {}
   res.redirect("/");
});


//Store details of new User and redirect to homepage
app.post('/registeruser', function(req, res){
   res.redirect("/");      //Has a MiddleWare
});


//View All
app.get('/viewall', function(req, res){
   res.render("printCourses", {courses: courses, status: status, User: User, enrolled: enrolled[User.regno]});
});

//Enroll Course using multiple params

app.post('/enroll/:regno/:courseCode/', function(req, res){
   if(req.params.regno in enrolled && !(enrolled[req.params.regno].includes(req.params.courseCode))){

      enrolled[req.params.regno].push(req.params.courseCode);   
   }

   res.render("printCourses", {courses: courses, status: status, User: User, enrolled: enrolled[User.regno]});
});


//Enrolled Courses of active User, using multiple params.
app.get('/enrolledcourses/:username', function(req, res){
   console.log(enrolled);
   console.log(enrolled[req.params.username]);
   res.render("enrolled", {courses: courses, enrolled: enrolled[req.params.username], status: status});
});




app.listen(8080);