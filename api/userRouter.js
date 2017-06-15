/**
 * Created by bogdan on 2/28/2016.
 */
var app = require("express");
var HttpStatus = require('http-status-codes');

var user = function (Model, db) {


    var router = app.Router();
    router.post("/login", function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        //only the fieds that are  needed are specifie
        Model.findOne({ email: email }, { name: 1, api: 1, password: 1, _id: 1 }, function (err, user) {
            console.log(user);
            if (err || user === undefined || user === null) {
                res.status(HttpStatus.OK).json({ error: true, message: "no user found" });
            } else {
                if (user.validPassword(password)) {
                    res.status(HttpStatus.OK).json({ error: false, user: { api: user.api, name: user.name } });
                } else {
                    res.status(HttpStatus.OK).json({ error: true, message: "invalid password" });
                }
            }
        });
    });

    router.post("/", function (req, res) {


        Model.findOne({ email: req.body.email }, function (err, existingUser) {
            if (existingUser === null) {
                var user = new Model();
                user.name = req.body.name;
                user.age = req.body.age;
                user.user_id = req.body.id;
                user.email = req.body.email;
                //user.password=req.body.password;
                //user.createdAt=req.body.createdAt;
                user.password = user.generateHash(req.body.password);
                user.setApi();
                console.log(user);
                user.save(function (err, user) {
                    if (err) res.send(err);
                    console.log(user);
                    delete user["password"];
                    res.status(201).json(user);
                });
            } else {
                res.status(200).json({ "error": true, message: "exiting mail" });
            }
        });

    });
    router.get('/', function (req, res) {

        Model.find(function (err, users) {
            if (err) {
                res.send({ error: true, message: "db error" });
            } else {
                res.json(users);
            }

        });

    });
    router.get('/:id', function (req, res) {
        var id = req.params.id;
        Model.findById(id, function (err, user) {
            if (err) res.send(err);
            res.json(user);
        });
    });

    router.put("/:id", function (req, res) {
        var id = req.params.id;
        Model.findById(id, function (err, model) {
            if (err) res.send({ error: true, message: "can't find id" });
            else {
                model.name = req.body.name;
                model.age = req.body.age;
                model.email = req.body.email;
                model.createdAt = req.body.createdAt;
                model.password = model.generateHash(req.body.password);
                model.save(function (err) {
                    if (err) {
                        res.send({ error: true, message: "can't save" });
                    } else {
                        res.json({ error: false, message: "done" });
                    }
                });
            }
        });
    });
    router.delete('/:id', function (req, res) {
        var id = req.body.id;
        console.log(id);

        Model.remove({ _id: req.params.id }, function (err, model) {
            if (err) {
                res.send(err);
            } else {
                res.json({ message: "Success delete" });
            }
        });

    });
    return router;
};

module.exports = user;