var db = require('../lib/db');

var ItemSchema = new db.Schema({
	item: {type:String, required: true}
	, price: String
	, savings: String
	, description: String
	, url: String
	, extra: String
	, bestPercent: String
	, bestSav: String
	, category: String
	, urlNum:Number
});

var Item = db.mongoose.model('item', ItemSchema);

var makeItem = function(item, price, savings, desc, url, extra, bestPercent, bestSav, category, urlNum, cb){
	var ins = new Item();
	ins.item = item;
	ins.price = price;
	ins.savings = savings;
	ins.description = desc;
	ins.url = url;
	ins.extra = extra;
	ins.bestPercent = bestPercent;
	ins.bestSav = bestSav;
	ins.category = category;
	ins.urlNum = urlNum
	ins.save(cb);
}

var getItemFromUrlNum = function(urlnum, cb){
	Item.find(
		{urlNum : urlnum}
		, null
		, cb);
}

module.exports.makeItem = makeItem;
module.exports.getItemFromUrlNum = getItemFromUrlNum;