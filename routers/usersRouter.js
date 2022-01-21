const fs = require("fs");
const { validateUser } = require("../userHelpers");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const serverConfig = require("../serverConfig");

var jwt = require('jsonwebtoken');
const { auth } = require('../middlewares/auth')
const User = require('../models/User')


// router.post("/", validateUser, async (req, res, next) => {
//     try {
//         const { username, age, password } = req.body;
//         const data = await fs.promises
//             .readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));
//         const id = uuidv4();
//         data.push({ id, username, age, password });
//         await fs.promises.writeFile("./user.json", JSON.stringify(data), {
//             encoding: "utf8",
//         });
//         res.send({ id, message: "sucess" });
//     } catch (error) {
//         next({ status: 500, internalMessage: error.message });
//     }
// });


router.post("/", validateUser, async (req, res, next) => {
    try {
        const { username, age, password } = req.body;
        const user = new User(username,age,password)
        const id = uuidv4();
        await User.save()
       
        res.send({ id, message: "done" });
    }catch (error) {
        next({ status: 500, internalMessage: error.message });
    }
});


// router.patch("/:userId",  validateUser, async (req, res, next) => {
//     try {
//         const { username, age, password } = req.body;
//         const users = await fs.promises.readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));

//         const newuser = users.map((user) => {
//             if (user.id !== req.params.userId) return user;
//             return { id: req.params.userId, username, password, age };
//         });

//         await fs.promises.writeFile("./user.json", JSON.stringify(newuser), {
//             encoding: "utf8",
//         });
//         res.status(200).send({ message: "done" });
//     } catch (error) {
//         next({ status: 500, internalMessage: error.message });
//     }
// });


router.patch("/:userId", auth , async (req, res, next) => {
    if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
    try {
      const {password, age} = req.body
      req.user.password = password
      req.user.age = age
      await req.user.save()
      res.send("sucess")
    } catch (error) {
  
    }
  });


// router.get("/", validateUser, async (req, res, next) => {
//     try {
//         const age = Number(req.query.age)
//         const users = await fs.promises
//             .readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));
//         const filteredUsers = users.filter(user => user.age === age)
//         res.send(filteredUsers)
//     } catch (error) {
//         next({ status: 500, internalMessage: error.message });
//     }

// });

router.get('/', auth, async (req,res,next)=>{
    try {
  
  const query= req.query.age?  {age:req.query} : {}
  
  const users= await User.find(query,{password:0})
  
    res.send(users)
    } catch (error) {
    next({ status: 500, internalMessage: error.message });
    }
  
  })



// router.post('/login', async (req, res, next) => {
//     try {
//         const { username, password } = req.body;

//         const users = await fs.promises
//             .readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));

//         const reqUser = users.find((user) => user.username === username && user.password === password);

//         if (username) {
//             return next({ status: 200, message: "success" })
//         } else {
//             return next({ status: 403, message: "try again" })
//         }
//     } catch {
//         next({ status: 500, internalMessage: error.message });
//     }

// });

router.post("/login", async (req, res, next) => {
    const {username, password} = req.body
    const user = await User.findOne({ username })
    if(!user) return next({status:401, message:"username or passord is incorrect"})
    if(user.password !== password) next({status:401, message:"username or passord is incorrect"})
    const payload = {id:user.id }
    const token= jwt.sign(payload, serverConfig.secret, {expiresIn: "1d"});
    return res.status(200).send({message:"success", token})

})


// router.get('/:uersId', async (req, res, next) => {
//     try {
//         const id = req.params.userId;

//         const users = await fs.promises
//             .readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));

//         const getUser = users.filter((user) => user.id === id);

//         res.status(200).send(getUser)

//     } catch (error) {
//         next({ status: 404, internalMessage: error.message });
//     }

// });


// router.delete('/:uesrId', async (req, res, next) => {
//     try {
//         const id = req.params.userId;

//         const users = await fs.promises
//             .readFile("./user.json", { encoding: "utf8" })
//             .then((data) => JSON.parse(data));

//         const remainUsers = users.filter((user) => user.id !== id);

//         await fs.promises.writeFile("./user.json", JSON.stringify(remainUsers), {
//             encoding: "utf8",
//         });

//         res.status(200).send({ message: "done" })

//     } catch (error) {
//         next({ status: 404, internalMessage: error.message });
//     }

// });


router.delete('/:uesrId', auth, async (req, res, next) => {
    try {

        const {username, password, age} = req.body;

        User.findOneAndRemove
        await User.findOneAndRemove({ _id: req.params.id })

        User.save()

        res.status(200).send({ message: "done" })

    } catch (error) {
        next({ status: 404, internalMessage: error.message });
    }

});

module.exports = router;
