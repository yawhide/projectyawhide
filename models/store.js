var db = require('../lib/db');

var StoreSchema = new db.Schema({
	storeName: String
	, storeLocation: String
	, storeNumber: Number
	, urlNumber: Number
	, city: String
	, postalCode: String
	, storeType: String
	, storeHours: {
		/*Sunday: String
		, Monday: String
		, Tuesday: String
		, Wednesday: String
		, Thursday: String
		, Friday: String
		, Saturday: String*/
	}
	, location: {lat: Number, long: Number}
	, flyerDate:{
		/*start:String
		, end:String*/
	}
	, currFlyerDate: {type:Date, default:Date.now}
	, categories: []
	/*{
		bakery: []
		, beverages: []
		, boxedMeats: []
		, candy: []
		, dairy: []
		, deli: []
		, floral: []
		, grocery: []
		, household: []
		, meat: []
		, pet: []
		, produce: []
		, seafood: []
		, spread: []
	}*/
	, currFlyer: [/*{
		item: String
		, price: String
		, savings: String
		, description: String
	}*/]
	, oldFlyers: [{
		date: Date
		, actualFlyer: [/*{
			item: String
			, price: String
			, savings: String
			, description: String
		}*/]
	}]
});

console.log('db ensureIndex');
StoreSchema.index({location: "2d"});

var Store = db.mongoose.model('store', StoreSchema);

/**
* makes a Store Object
* @param {String} -store, storeLoc, city, postalCode
* @param {Number} -storeNum, num
* @param {Object} - hours, latLng
* @return {cb} - callback
*/
var makeStore = function (storeType, store, storeLoc, storeNum, num, city, postalCode, hours, lat,lng, cb){
	var ins = new Store();
	ins.storeType = storeType;
	ins.storeName = store;
	ins.storeLocation = storeLoc;
	ins.storeNumber = storeNum;
	ins.urlNumber = num;
	ins.city = city;
	ins.postalCode = postalCode;
	ins.storeHours = hours;
	ins.location.lat = lat;
	ins.location.long = lng;
	ins.save(cb);
}

/**
* gets a sobey object by id
* @param {String} -id
* @return {cb} - callback
*/
var getStoreById = function(id, cb){
	Store.findById(
		id
		, null
		, cb);
}

/**
* finds a sobey object by id and pushes a flyer object
	into its flyer array
* @param {String} -id
* @param {Array} - arr
* @return {cb} - callback
*/
var makeFlyer = function(store, arr, cb){
	/** make backup of old flyer */
	var ob = {};
	ob.date = store.currFlyerDate;
	ob.actualFlyer = store.currFlyer;

	store.currFlyerDate = new Date().toISOString();
	store.currFlyer = arr;
	store.oldFlyers.push(ob);
	store.save(cb);
}

/**
* gets a sobey object by its store name
* @param {String} -name
* @return {cb} - callback
*/
var getStoreByStoreName = function(name, cb){
	Store.findOne(
		{storeName:name}
		, null
		, cb);
}

/**
* gets a sobey object by its url number
* @param {Number} -num
* @return {cb} - callback
*/
var getStoreByUrlNum = function(num, cb){
	Store.findOne(
		{urlNumber:num}
		, null
		, cb);
}

/**
* finds the nearest store based on lat and long
* @param {String} -elat, elong
* @param {Number} -maxD
* @return {collection} - callback
*/
var getNearestStores = function(elong,elat, maxD, callback){
	Store.find({"location":
		{$near: [elat,elong]
			,$maxDistance:maxD}}
			,{}
			,null//{limit:5}
			, callback
			);
    //One way, from cmd line: db.store.ensureIndex({location: "2d"})
}

/**
* gets all the sobey objects
* @return {cb} - callback
*/
var getAllStores = function(cb){
    Store.find(
        null
        , null
        , cb );
}


var addCategoryParts = function (urlnum, arr, date, cb){
	//console.log('\n\n\n\n');
	//console.log('infoObject is: ');
	//console.log(infoObject);
	
	Store.findOneAndUpdate(
		{urlNumber : urlnum}
		, {
			categories : arr
			, flyerDate: date
		}
		, cb);
}


module.exports.makeStore = makeStore;
module.exports.getStoreById = getStoreById;
module.exports.makeFlyer = makeFlyer;
module.exports.getStoreByStoreName = getStoreByStoreName;
module.exports.getStoreByUrlNum = getStoreByUrlNum;
module.exports.getNearestStores = getNearestStores;
module.exports.getAllStores = getAllStores;
module.exports.addCategoryParts = addCategoryParts;