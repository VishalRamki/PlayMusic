const Datastore = require("nedb");

/*

  Just ignore the very long function names. I know that there is a code Convention to
  prevent it. The chaining.

*/

let DatabaseHandler = function() {
  this.db = new Datastore({ filename: './database/audiodata.db', autoload: true });
};

DatabaseHandler.prototype.find = function(q, cb) {
  this.db.find(q, (err, docs) => cb(err, docs));
};

DatabaseHandler.prototype.findWithSortAndLimit = function(q, sort, limit, cb) {
  this.db.find(q).sort(sort).limit(limit).exec((err, docs) => cb(err, docs));
};

DatabaseHandler.prototype.findWithSortAndLimitAndSkip = function(q, sort, limit, skip, cb) {
  this.db.find(q).sort(sort).skip(skip).limit(limit).exec((err, docs) => cb(err, docs));
};

DatabaseHandler.prototype.insert = function(doc) {
  this.db.insert(doc);
};

DatabaseHandler.prototype.count = async function() {
  return await this.countHandler();
};

DatabaseHandler.prototype.countHandler = function(cb) {
  this.db.count({}, (err, count) => cb(err, count));
};

module.exports = DatabaseHandler;
