var Account = require('../models/Account');

var findAccount = function(req, res, next) {
    Account.findOne({iban: req.body.iban}, function(err, account){
        if (err) return res.status(500).json(
            {
                error: err
            });
        req.receiver = account;
        next();
    })
}

var checkBalance = function(req, res, next) {
    if(req.user.balance >= req.body.transfer){
        next();
    } else {
        res.status(404).json(
            {
                error: "insufficient balance!"
            });
    }
}


module.exports.findAccount = findAccount;
module.exports.checkBalance = checkBalance;
