const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  sender: {type: Schema.Types.ObjectId, ref:'User', required: true},
  receiver: {type: Schema.Types.ObjectId, ref:'User', required: true},
  transfer: {type: Number, required: true},
  date: {type: Date, required: true, default: Date.now()}
});

module.exports = mongoose.model('Transaction', TransactionSchema);
