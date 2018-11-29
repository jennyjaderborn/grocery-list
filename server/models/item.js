module.exports = mongoose.model('listItem', new mongoose.Schema({
    item: String, 
    amount: Number,
  }));

  