var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var Account = require('../models/Account');
var Transaction = require('../models/Transaction');
var auth = require('../middlewares/auth');
var utility = require('../middlewares/utility')

function generateIban() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.post('/signup', function(req, res) {
    var user = new Account();
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.password = bcrypt.hashSync(req.body.password, 10);
    user.email = req.body.email;
    user.iban = generateIban();
    user.save(function(err, userCreated) {
        if (err) return res.status(400).json(err);
        res.status(201).json(userCreated);
    })
})

router.post('/login', function(req, res) {
    Account.findOne({email: req.body.email}, function(err, user){
        if (user === null) {
            return res.status(404).json({message: 'User not found'})
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
            var token = jwt.encode(user._id, auth.secret);
            return res.json({token: token});
        } else {
            return res.status(401).json({message: 'password not valid'});
        }

    })

})

router.get('/me', auth.verify, function(req, res, next) {
  res.json(req.user);
});

router.post('/send',  auth.verify, utility.findAccount, utility.checkBalance, function(req, res){
    var transaction = new Transaction();

    transaction.sender = req.user;
    transaction.receiver = req.receiver;
    transaction.transfer = req.body.transfer;

    req.user.balance = parseInt(req.user.balance) - parseInt(req.body.transfer);
    req.receiver.balance = parseInt(req.receiver.balance) + parseInt(req.body.transfer);

    transaction.save(function (err, savedTransaction) {
        if (err) return res.status(500).json(err);
        req.user.transactions.push(savedTransaction)
        req.receiver.transactions.push(savedTransaction)
        req.user.save();
        req.receiver.save();
        return res.status(201).json(savedTransaction)
    })
})

router.get('/', auth.verify, function(req,res){
    Account.findById(req.user._id)
        .populate("transactions")
        .exec(function(err, accountFound){
            if (err) {
                return res.status(500).json({error: err});
            }

            if (!accountFound.transactions) {
                return res.status(404).json({error: 'No one transactions'});
            }

            return res.status(200).json(accountFound.transactions);

        })
});


module.exports = router;
