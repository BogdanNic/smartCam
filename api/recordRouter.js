var app = require("express");

var record = function (Model, db) {

    var router = app.Router();

    router.post("/", function (req, res) {
        var item = new Model();
        
    });
}