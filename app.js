const express = require('express');
const PORT = 4000;
const ejs = require('ejs');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/users');
const session = require('express-session')
const nocache = require("nocache");
const oneHour= 1000 * 60 * 60;

const app = express();
const atlasDB = 'mongodb+srv://shabeeb:shabeeb123@nodetaskmanager.cmu7pt6.mongodb.net/registerLogin?retryWrites=true&w=majority';



mongoose.connect(atlasDB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
})

app.use(session({
    name: 'newOne',
    secret: 'keyboard cat',
    cookie: { maxAge:oneHour},
    resave: false,
    saveUninitialized: true,
  }))

  app.use(nocache());

// app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))


const isThereAuser = (req,res,next)=>{
    if(req.session.loggedIn){
       return res.redirect('/home');
    }
    next()
}


app.get('/',isThereAuser,(req,res)=>{
    res.render('index')
})

app.get('/home', (req,res)=>{
    console.log(req.session);
    if(req.session.loggedIn){
        res.render('homePage')
    }
    else{
        res.redirect('/login')
    }

})

app.get('/register',isThereAuser,(req,res)=>{
    res.render('register')
})

app.get('/login',isThereAuser,(req,res)=>{
 
    res.render('login')

    
})


//////////////////////////  POST   //////////////////////

app.post('/register',(req,res)=>{
    console.log(req.body);
    const email =req.body.email;
    const password =req.body.password;
    
    User.findOne({email:email},(err,foundEmail)=>{
        if(err){
          console.log(err);
        }else{
            if(foundEmail){
                res.redirect('/register');
                console.log("email exist");
            }
        }
    })

    const newUser = new User ({
        email: email,
        password:password
    });

    newUser.save((err)=>{
        err?console.log(err):res.redirect('/login');
    })
    

        
  


})

app.post('/login',(req,res)=>{
    console.log(req.body);
    const email =req.body.email;
    const password =req.body.password;

    User.findOne({email:email},(err,foundResult)=>{
        if(err){
            console.log(err);
        }
        else{
            if(foundResult.password === password){
                req.session.loggedIn = true
                res.redirect('/home')
            }else{
                console.log("Invalid Credentials");
                res.redirect("/login")
            }
        }
    })
})

app.post('/logout',(req,res)=>{
    req.session.destroy();
    
    res.redirect('/login');
})




app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}  http://localhost:${PORT}/`);
})