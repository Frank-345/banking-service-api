const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  name: {type: String, required: true},
  surname: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  iban: {type: String, required: true, unique: true},
  balance: {type: Number, required: true, default: 100},
  transactions: [{type: Schema.Types.ObjectId, ref:'Transaction'}]
});

module.exports = mongoose.model('Account', AccountSchema);
