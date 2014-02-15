var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

// Connect to cloud database

var username = "user";
var password = "sobeys";
var address = '@ds053858.mongolab.com:53858/projectyawhide';

var localUsername = "localhost";
var localPassword = "27017";
var localAddress = "/projectyawhide";

connect();
// Connect to mongo
function connect() {

    var url0 = 'mongodb://' + username + ':' + password + address;
    var url1 = 'mongodb://' + localUsername + ':' + localPassword + localAddress;

    mongoose.connect(url0);
    console.log("Database connected!");
}
function disconnect() {mongoose.disconnect()}