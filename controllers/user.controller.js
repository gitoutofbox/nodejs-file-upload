const bryptjs = require("bcryptjs");
const passport = require("passport");
const db = require("../config/db");
const User = db.User;
const fs = require('fs');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/avatars')
    },
    filename: function (req, file, cb) {
        const mimeExtension = {
            'image/jpeg': '.jpeg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
        }
        cb(null, file.fieldname + '-' + Date.now() + mimeExtension[file.mimetype]);
    }
})

const uploadAvatar = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log(file.mimetype)
        if(file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(null, false);
            req.fileError = 'File format is not valid';
        }
    }
 })


const getusers = (req, res) => {
    User.find()
        .then(users => res.send(users))
        .catch(err => res.send(err))
};
const addUser = (req, res) => {
    console.log(req.body)
    const { name, email, password, cpassword } = req.body;
    let errors = {};
    if(req.fileError) {
        errors['avatar'] = req.fileError;
    }
    User.findAll({
        where: { email: email }
    })
        .then(users => {
            if (users.length) {
                errors['email'] = 'This email already exists';
                fs.unlinkSync(req.file.path);
            } 
            
            if(Object.keys(errors).length) {
                res.render('register', {
                    name,
                    email,
                    errors: { ...errors }
                })
            } else {
                const newUser = new User({ ...req.body });
                bryptjs.genSalt(10, (err, salt) => {
                    bryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        console.log(req.file.filename)
                        User.create({
                            name: newUser.name,
                            email: newUser.email,
                            password: newUser.password,
                            avatar: req.file.filename
                        })
                            .then(user => { return res.redirect("/login") })
                            .catch(err => res.send(err));
                    })
                })
            }
        })
        .catch(error => {
            console.log("error", error);
        })


};
const login = (req, res) => {
    res.render("login")
}

const checkLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);

    // const userObj = req.body;
    // User.findOne({email: userObj.email}).then(user => {
    //     bryptjs.compare(userObj.password, user.password, (err, isMatch) => {
    //         if(isMatch) {
    //             return res.redirect("/dashboard");
    //         } else {
    //             return res.redirect("/login");
    //         }
    //     })
    // })
    // .catch(err => {
    //     return res.redirect("/login");
    // })

}
const register = (req, res) => {
    res.render("register")
}
module.exports = {
    getusers,
    addUser,
    login,
    register,
    checkLogin,
    uploadAvatar
}