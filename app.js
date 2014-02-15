var express = require('express')
, http = require('http')
, path = require('path')
, fs = require('graceful-fs')
, Backbone = require('backbone')
, request = require('request')
, exphbs = require('express3-handlebars')
, cheerio = require('cheerio')
, Store = require('./models/store.js')
, Item = require('./models/item.js')
, Geocoder = require('node-geocoder-ca').Geocoder
, geocoder = new Geocoder()
, s = require('./algorithms/sobeyFunc')
, async = require('async')
, ce = require('cloneextend');

app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 8000);
	app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
	app.use("/public", express.static(__dirname + '/public'));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

var isEmptyObject = function (obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

//when the root route is called, do our mobile check
app.get('/index', function (req, res){
  // var htmlString = $("div.card-inset").html();
  // console.log(JSON.stringify(htmlString));
  res.end('this worked');
});

app.get('/mobile', function (req, res){
});

var date;
var data = {}
, div = 'div.card > div.card-plain > div.card-inset > table > ';

var getBest = function (ob, cb){
	var bestPercent = 0
	,  bestSav = 0
	, extra = ''
	, test1 = /[0-9]\/\$/g /** ex 3/$ */
	, test2 = /\s[0-9]/g  /** ex _5 */
	, test3 = /[0-9]+%/g
	, number = /\d\d/
	, getNumber = /[0-9][\.,][0-9][0-9]/ /** $3.99*/
	, getNumber2 = /[0-9][\.,][0-9][0-9]/
	, num = 1;
	/** tests 3 for 5 dollars */
	if(test1.test(ob.price)){
		/** tests if sav doesn't have on 3 */
		if(!test2.test(ob.sav)){
			if(ob.sav === '' || !number.test(ob.sav)){
				bestSav = 0;
				bestPercent = 0;
				extra = 'has 2/$5 but no savings'
			}
			else{
				var tmp = getNumber2.exec(ob.sav)[0];
				var splitted = ob.price.split('/$');
				tmp = tmp / splitted[0];
				bestSav = Math.round(tmp*100)/100;
				bestPercent = Math.round(tmp / (tmp + (splitted[1] / splitted[0]))*100);
				extra = 'price has n for some price deal'
			}
			
		}
		/** tests if sav does have a 3*/
		else{
			var tmp = getNumber.exec(ob.sav)[0]
			, splitted = ob.price.split('/$');
			tmp = tmp.replace('$', '');
			tmp /= splitted[0];
			bestSav = Math.round(tmp*100)/100;
			bestPercent = Math.round(tmp / (tmp + (splitted[1]/splitted[0]))*100);
			extra = 'price has n for some price, sav only has the savings, no number'
		}
	}
	/** is price has a percent in it */
	else if (ob.price.indexOf('%') > -1){
		bestSav = getNumber.exec(ob.sav) !== null ? getNumber.exec(ob.sav)[0] : 0;
		bestPercent = test3.exec(ob.price)[0].replace('%', '');
		//bestPercent /= 100;
		extra = 'price has percent'
	}
	/** doesn't have a price in sav */
	else if (getNumber.exec(ob.sav) === null){
		var savLower = ob.sav.toLowerCase();
		/** buy 1 get one free deal */
		if(savLower.indexOf('buy') > -1 && savLower.indexOf('get') > -1 && savLower.indexOf('free') > -1){
			bestSav = 'Buy 1 Get 1 Free';
			bestPercent = 0.5;
			extra = 'buy1get1free';
		}
		/** no savings so we dont know %tage */
		else{
			bestSav = 0;
			bestPercent = 0;
			extra = 'no savings';
		}
	}
	/** has a price and savings */
	else{
		if(ob.price === ''){
			var tmp = parseFloat(getNumber2.exec(ob.sav)[0])
			bestSav = tmp;
			bestPrice = 0;
			extra = 'has reg savings but no price';
		}
		else{
			var tmp = parseFloat(getNumber2.exec(ob.sav)[0])
			, tmp2 = parseFloat(getNumber2.exec(ob.price)[0]);
			bestSav = tmp;
			bestPercent = Math.round(tmp / (tmp2 + tmp)*100);
			extra = 'has simple price and simple savings';
		}		
	}

	cb(bestPercent, bestSav, extra);
}

app.get('/readLocalPartsSobeys', function (req, res){
	var latestFolder;
	fs.readdir('./sobeysFlyerPart/', function (err, folders){
		if (err) throw err;
		/** always gets the last folder in ./sobeys/
			because it sorts it by created date (or last mod prob)
			*/
		latestFolder = folders[folders.length -1];
		fs.readdir('./sobeysFlyerPart/' + latestFolder + '/', function (err2, folders2){
			if (err2) throw err2;
			console.log(latestFolder);
			/** this is each store's flyer */
			folders2.forEach(function (h){
				fs.readdir('./sobeysFlyerPart/'+latestFolder + '/' + h + '/', function (err3, folders3){
					if(err3)throw err3;
					/** this is each flyer part */
					var info = []
					, dateOb = {};
					async.map(folders3, function (flyerPart, complete) {
     					
     					fs.readFile('./sobeysFlyerPart/'+latestFolder + '/' + h + '/' + flyerPart, 'utf8', function (err4, data){
     						if (err4) throw err4;
							/** this is each 14 departments parts of a flyer 

								bakery = 49
								beverage = 56
								boxedMeats = 65
								candy = 62
								dairy = 61
								deli = 48
								floral = 54
								grocery = 51
								household = 58
								meat = 43
								pet = 59
								produce = 45
								seafood = 44
								spread = 57
							*/
							var name = ''
							, flyerDate = '';
							switch(flyerPart.split('.')[0]){
								case '49':
									name = 'bakery';
									break;
								case '56':
									name = 'beverages';
									break;
								case '65':
									name = 'boxedMeats';
									break;
								case '62':
									name = 'candy';
									break;
								case '61':
									name = 'dairy';
									break;
								case '48':
									name = 'deli';
									break;
								case '54':
									name = 'floral';
									break;
								case '51':
									name = 'grocery';
									break;
								case '58':
									name = 'household';
									break;
								case '43':
									name = 'meat';
									break;
								case '59':
									name = 'pet';
									break;
								case '45':
									name = 'produce';
									break;
								case '44':
									name = 'seafood';
									break;
								case '57':
									name = 'spread';
									break;
							}


							var $ = cheerio.load(data);

							if(flyerDate === ''){
								flyerArr = $('.container .site-section .site-section-content .fancy-heading .h3-editorial').toArray();
								if(flyerArr.length > 0){
									flyerDate = flyerArr[0].children[0].data;
									var dateSplit = flyerDate.split(' ');
									if(dateSplit.length > 2 && dateSplit[2] === ''){
										dateSplit.splice([2], 1);
									}
									if(dateSplit.length === 3){
										var tmp = dateSplit[2].split('-');
										dateOb.start = dateSplit[1] + " " + tmp[0];
										dateOb.end = dateSplit[1] + " " + tmp[1];
									}
									else if (dateSplit.length > 3){
										var tmp = dateSplit[2].split('-');
										//console.log(flyerDate);
										//console.log(dateSplit)
										//console.log(tmp)
										//console.log('\n');
										dateOb.start = dateSplit[1] + " " + tmp[0];
										dateOb.end = tmp[1] + " " + dateSplit[3];
									}
									else{
										dataOb.start = 'something off happened';
										dataOb.end = 'something off happened';
									}
									//console.log(dateOb);
								}
								else{
									dataOb.start = '';
									dataOb.end = '';
								}
							}

							if($('.card .card-plain .card-inset p').text().indexOf('No flyer information at this time') > -1 || !$('div').hasClass('toggle-last')) {
								console.log('no flyer at file: ' + flyerPart);
							}
							else {
								$('.container .toggle-last .one-third .flyer-card .card-top').each(function (a, html){
									var url = ''
									, price = ''
									, sav = ''
									, desc = ''
									, item = ''
									, bestSav = ''
									, bestPercent = ''
									, savings = ''
									, savings1 = ''
									, savings2 = '';
									for (var i = html.children.length - 1; i >= 0; i--) {

										if(html.children[i].type === 'tag') {
											var class1 = html.children[i];											
											/** this finds url specifically from selecting a chain of classes */
											if(class1.attribs.class === 'card-image'){
												url = class1.attribs.style.split(' ')[1].substr(5);
												url = url.substr(0, url.length -3);
											}
											else if (class1.attribs.class==='card-inset'){
												for (var j = class1.children.length - 1; j >= 0; j--) {
													var class2 = class1.children[j];
													if(class2.type === 'tag'){
														/** finds the desc */
														if (class2.name === 'p'){
															desc = class2.children[0].data;
															desc = desc.replace(/&amp;/g, '&');
															desc = desc.replace(/[^a-zA-Z 0-9+;():,.-\s*!%&\r\n\/]+/g,"'");
														}
														/** finds the item name */
														else if(class2.attribs.class.indexOf('h6') > -1){
															item = class2.children[0].data;
															item = item.replace(/&amp;/g, '&');
															item = item.replace(/[^a-zA-Z 0-9+;():,.-\s*!%&\r\n\/]+/g,"'");
														}
														/** finds the price and savings */
														else if (class2.attribs.class.indexOf('price')>-1){
															for (var k = class2.children.length - 1; k >= 0; k--) {
																var class3 = class2.children[k];
																if(class3.type === 'tag'){
																	if(class3.attribs.class.indexOf('price-amount')){
																		if(class3.children.length > 1 && class3.children[1].children.length > 0){
																			sav = class3.children[1].children[0].data;
																			sav = sav.replace(/&amp;/g, '&');
																			sav = sav.replace(/[^a-zA-Z0-9+;():,\.$-\s*!%&\r\n\/]+/g,"|");
																			var savSplit = sav.split(' ')
																			, tmp = ''
																			, count = 0;
																			for (var l = 0; l < savSplit.length; l++) {
																				if(savSplit[l].indexOf('|') > -1){
																					tmp += '$0.' + savSplit[l].replace('|', '') + ' ';
																					count++;
																				}
																				else if (!isNaN(savSplit[l]) && savSplit[l].indexOf('$') === -1 && count === 0){
																					tmp += '$'+savSplit[l] + ' ';
																					count++;
																				}
																				else if (savSplit[l].indexOf('/') > -1){
																					tmp += '$'+savSplit[l] + ' ';
																				}
																				else{
																					tmp += savSplit[l] + ' ';
																				}
																			};
																			sav = tmp
																			sav = sav.replace('100 g', '100g');
																			sav = sav.replace(' /100g', '/100g');
																			sav = sav.replace('lb ,ea', 'lb,ea');
																			sav = sav.replace('lb, ea', 'lb,ea');
																			sav = sav.replace('$$', '$');
																		}
																	}
																	else if (class3.attribs.class.indexOf('price-promos')) {
																		
																		if(class3.children.length > 1){

																			if(class3.children[1].children.length > 1){
																				savings = '$' + class3.children[0].data+'.';
																				savings1 = class3.children[1].children[0].data;
																				savings2 = class3.children[1].children[1].children[0].data;
																			}
																			else if (class3.children[0].data.indexOf('%') > -1){
																				savings = 'noPrice';
																				savings1 = class3.children[0].data;
																				savings2 = class3.children[1].children[0].data;
																			}
																			else if (class3.children[0].data.indexOf('/') === -1){
																				savings = '$0' + class3.children[0].data;
																				savings1 = class3.children[1].children[0].data;
																			}
																			else{
																				savings = class3.children[0].data + '.';
																				savings = savings.replace('/', '/$');
																				savings1 = class3.children[1].children[0].data;
																			}
																			var price = savings + savings1 + savings2;
																		}
																	}
																}
															};
														}
													}
												};
											}


											/** gets the best savings from the price */
											if(url !== '' && item !== ''){
												var priceSav = {};
												priceSav.price = price;
												priceSav.sav = sav;
												var listOfFrenchStores = ['34'];
												if(listOfFrenchStores.indexOf(h) === -1){
													getBest(priceSav, function (percent, sav2, extra){
														//console.log(name);
														/*var ob = {};
														ob.item = item;
														ob.price = price;
														ob.savings = sav;
														ob.url = url;
														ob.description = desc;
														ob.bestPercent = percent;
														ob.bestSav = sav2;
														ob.extra = extra;
														info.push(ob);*/

														Item.makeItem(item, price, sav, desc, url, extra, percent, sav2, name, h, function (errMakeItem){
															if(errMakeItem) throw errMakeItem;
														});
													});
												}
											}
										}
									};
								});
							}
							if(info.indexOf(name) === -1){
								info.push(name);
							}
							complete(err4, data);
						});
						}
						, function (err7, results){
							//console.log(info.sort());
							Store.addCategoryParts(h, info.sort(), dateOb, function (err6){

								if(err6) throw err6;
								
								if(h > 289)
									console.log('done');
								else{
									console.log(h.split('.')[0])
								}
							});
					});
				});
			});
		});
	});
});

app.get('/makeStoreSobeys', function (req, res){
	var url = 'https://www.sobeys.com/en/stores/'

	var z = 1;
	(function loop(){
		if(z < 200){
			var storename = ''
			, storeloc = ''
			, storenum = 0
			, urlnum = z
			, city = ''
			, postal = ''
			, hours = {}
			, interval = '';
			request(url+z, function (r, s, b){
				var $ = cheerio.load(b);
				var info = [];
				if(	$('body').find('.block').length == 0){
					$('.container .site-section .site-section-content .card .card-plain .card-inset').each(function (z, html){
						var count = 0;
						html.children.forEach(function (i){
							if(i.data !== '\n' && count > 1){
								var count3 = 0;
								i.children.forEach(function (j){
									if(j.data !== '\n'){
										if(j.attribs['class'].indexOf('grid__item') > -1){
											
											j.children.forEach(function (k){
												if(k.data !== '\n'){
													if(k.attribs['class'] === 'palm--hide'){
														var str = '';
														var count2 = 0;
														k.children.forEach(function (l){
															if(l.type !== 'tag'){
																var tmp = l.data.split('\n');
																tmp.forEach(function (m){
																	if(m !== ''){
																		str += m + ' ';
																		switch(count2){
																			case 0:
																				storeloc = m;
																				count2++;
																				break;
																			case 1:
																				city = m;
																				count2++;
																				break;
																			case 2:
																				postal = m;
																				count2++;
																				break;
																		}
																	}
																});
															}
														});
														count2 = 0;
													}
													if(count3 == 6){
														storenum = 	k.children[0].data.split('\n')[1];					
													}
													count3++;
												}
											});
										}										
									}
								});
								count3 = 0;
							}
							count++;
						});
					});
					$('.my-store-title div div h3').each(function (i, html){
						var tmp = html.children[0].data.split(' ');
						var tmp2 = '';
						for(var y = 0; y < tmp.length; y++){
							if(y > 1){
								tmp2 += tmp[y];
								if(y+1 < tmp.length)
									tmp2+=' ';
							}
						}
						tmp2 = tmp2.replace('&amp;', '&');
						storename = tmp2;
					});
					$('.push--desk--one-half table tbody tr').each(function (i, html){
						var prevDay = '';
						html.children.forEach(function (i){
							if(typeof(i.data.children) !== 'undefined' && i.data !== '\n' && i.data !== ''){
									
								var whole = i.children[0].data.split(' ');
								if(whole.length == 5){
									hours[prevDay] = i.children[0].data;
								}
								else if (whole.length == 1){
									prevDay = whole[0];
								}
								else if (whole.length > 1 && whole.length < 5){
									hours[prevDay] = i.children[0].data;
								}
							}
						});
					});
					var latLng = $('#map_location').text().split(', ');
					var lng = latLng[0].substr(1);
					var lat = latLng[1].substr(0,latLng[1].length -1);
					if(isEmptyObject(hours))
						hours.open = '24 hours';
					Store.makeStore('sobeys', storename, storeloc, storenum, urlnum, city, postal, hours, lat ,lng, function (err){
						if(err) throw err;
						console.log(z);
						z++;
						loop();
					});
				}
				else{
					z++;
					loop();
				}
			});
		}
	}());
});

app.get('/makeStoreSobeys2', function (req, res){
	var url = 'https://www.sobeys.com/en/stores/'

	var z = 200;
	(function loop(){
		if(z < 400){
			var storename = ''
			, storeloc = ''
			, storenum = 0
			, urlnum = z
			, city = ''
			, postal = ''
			, hours = {}
			, interval = '';
			request(url+z, function (r, s, b){
				var $ = cheerio.load(b);
				var info = [];
				if(	$('body').find('.block').length == 0){
					$('.container .site-section .site-section-content .card .card-plain .card-inset').each(function (z, html){
						var count = 0;
						html.children.forEach(function (i){
							if(i.data !== '\n' && count > 1){
								var count3 = 0;
								i.children.forEach(function (j){
									if(j.data !== '\n'){
										if(j.attribs['class'].indexOf('grid__item') > -1){
											
											j.children.forEach(function (k){
												if(k.data !== '\n'){
													if(k.attribs['class'] === 'palm--hide'){
														var str = '';
														var count2 = 0;
														k.children.forEach(function (l){
															if(l.type !== 'tag'){
																var tmp = l.data.split('\n');
																tmp.forEach(function (m){
																	if(m !== ''){
																		str += m + ' ';
																		switch(count2){
																			case 0:
																				storeloc = m;
																				count2++;
																				break;
																			case 1:
																				city = m;
																				count2++;
																				break;
																			case 2:
																				postal = m;
																				count2++;
																				break;
																		}
																	}
																});
															}
														});
														count2 = 0;
													}
													if(count3 == 6){
														storenum = 	k.children[0].data.split('\n')[1];					
													}
													count3++;
												}
											});
										}										
									}
								});
								count3 = 0;
							}
							count++;
						});
					});
					$('.my-store-title div div h3').each(function (i, html){
						var tmp = html.children[0].data.split(' ');
						var tmp2 = '';
						for(var y = 0; y < tmp.length; y++){
							if(y > 1){
								tmp2 += tmp[y];
								if(y+1 < tmp.length)
									tmp2+=' ';
							}
						}
						tmp2 = tmp2.replace('&amp;', '&');
						storename = tmp2;
					});
					$('.push--desk--one-half table tbody tr').each(function (i, html){
						var prevDay = '';
						html.children.forEach(function (i){
							if(typeof(i.data.children) !== 'undefined' && i.data !== '\n' && i.data !== ''){
									
								var whole = i.children[0].data.split(' ');
								if(whole.length == 5){
									hours[prevDay] = i.children[0].data;
								}
								else if (whole.length == 1){
									prevDay = whole[0];
								}
								else if (whole.length > 1 && whole.length < 5){
									hours[prevDay] = i.children[0].data;
								}
							}
						});
					});
					var latLng = $('#map_location').text().split(', ');
					var lng = latLng[0].substr(1);
					var lat = latLng[1].substr(0,latLng[1].length -1);
					if(isEmptyObject(hours))
						hours.open = '24 hours';
					Store.makeStore('sobeys', storename, storeloc, storenum, urlnum, city, postal, hours, lat ,lng, function (err){
						if(err) throw err;
						console.log(z);
						z++;
						loop();
					});
				}
				else{
					z++;
					loop();
				}
			});
		}
	}());
});

app.get('/makeFlyer', function (req, res){
	Store.getAllStores(function (err, stores){
		if(err) throw err;
		console.log(stores.length);
		var z = 0;
		(function loop(){
			if(z < stores.length){
				Item.getItemFromUrlNum(stores[z].urlNumber, function (err2, items){
					if(err2) throw err2;
					Store.makeFlyer(stores[z], items, function (err3){
						if(err3) throw err3;
						console.log(z);
						z++;
						loop();
					});
				});	
			}
			else{
				console.log('done');
				res.end();
			}
		}());
	});
});

var sortBestPercent = function (ob, cb){
	ob.sort(function (a,b){
		return b.bestPercent-a.bestPercent;
	});
	cb(ob);
}

var sortBestSav = function (ob, cb){
	ob.sort(function (a,b){
		return b.bestSav-a.bestSav;
	});
	cb(ob);
}

var addCategoriesToItem = function(categories, flyer, cb){
	var catKeys = Object.keys(categories);
	catKeys .splice(0, 1);
	for (var i = catKeys.length - 1; i >= 0; i--) {
		var foodObjectArray = categories[catKeys[i]];
		for (var j = foodObjectArray.length - 1; j >= 0; j--){
			var itemName = foodObjectArray[j].item;
			for (var k = flyer.length - 1; k >= 0; k--) {
				if(flyer[k].item ==itemName){
					flyer[k].categories = catKeys[i];
				}
			};
		};
	};
cb(flyer);
}

app.get('/getNearestStores/:elat/:elong/:maxD', function (req, res){
    var elat = req.params.elat;
    var elong = req.params.elong;
    

    var maxD = req.params.maxD/111;
    //maxD = 10/111
    console.log(elong+ " " + elat + " " + maxD);
	Store.getNearestStores( elong ,elat,maxD,function (err, flyer){
		if(err){
			console.log("there was an error");
		}
		else{
			console.log('result is: ')
			console.log(flyer.length);
			for (var i = flyer.length - 1; i >= 0; i--) {
				console.log(flyer[i].storeName);
			};
			/*var arr = [];
			for (var i = 0; i < flyer.length; i++) {
				var ob = {};
				ob.storeName = flyer[i].storeName;
				ob.storeLocation = flyer[i].storeLocation;
				ob.urlNumber = flyer[i].urlNumber;
				ob.city = flyer[i].city;
				ob.postalCode = flyer[i].postalCode;
				ob.storeHours = flyer[i].storeHours;
				ob.location = flyer[i].location;
				ob.currentInterval = flyer[i].currentInterval;
				ob.currFlyerDate = flyer[i].currFlyerDate;
				ob.categories = flyer[i].categories;
				addCategoriesToItem(flyer[i].categories,flyer[i].currFlyer, function(cb){
					ob.regularFlyer = cb;
				});

				/** here i have to give sortBestPercent a clone of the currFlyer or else
						sort will just mutate the original flyer which isn't good 
				sortBestPercent(ce.clone(flyer[i].currFlyer), function (cb){
					addCategoriesToItem(flyer[i].categories,cb, function(callback){
						ob.bestPercentFlyer = callback;
					});
				sortBestSav(ce.clone(flyer[i].currFlyer), function (cb2){
					addCategoriesToItem(flyer[i].categories,cb2, function(callback2){
						ob.bestSavFlyer = callback2;
					});
						arr.push(ob);

						//console.log(ob + i + '\n');
					});
					//console.log(cb);
					
				});


			};
			console.log('the flyers');
			res.send(arr);*/
			res.send(flyer);
		}
	});
});

app.get('/GetNearestByPostal/:postal/:maxD', function (req, res){
	
});

app.get('/viewFlyer/:url', function (req, res){
	Store.getStoreByUrlNum(req.params.url, function (err, store){
		var ob = {};
		ob.storeName = store.storeName;
		ob.storeLocation = store.storeLocation;
		ob.urlNumber = store.urlNumber;
		ob.city = store.city;
		ob.postalCode = store.postalCode;
		ob.storeHours = store.storeHours;
		ob.location = store.location;
		ob.currentInterval =store.currentInterval;
		ob.currFlyerDate = store.currFlyerDate;
		ob.regularFlyer = store.currFlyer;
		ob.categories = store.categories;
		/** here i have to give sortBestPercent a clone of the currFlyer or else
		sort will just mutate the original flyer which isn't good */
		sortBestPercent(ce.clone(store.currFlyer), function (cb){
			ob.bestPercentFlyer = cb;
			sortBestSav(ce.clone(store.currFlyer), function (cb2){
				ob.bestSavFlyer = cb2;
			});			
		});
		res.send(ob);
	});
});

app.get('/getAllStores', function (req, res){

	Store.getAllStores(function (err, flyer){
		if(err){
			console.log("there was an error");
		}
		else{
			console.log('this is the flyer');
			//console.log(flyer)
			res.send(flyer);
		}
	});
});


app.get('/getSobeyFlyer/:id', function (req, res){
	Store.getStoreByUrlNum(req.params.id, function (err, store){
	
		if (err) res.send(500, 'could not get store by number')
		else{
			res.send(store);
		}
	})
});

var test = [
	{'sav': 'save up to $3.97', 'price': '3/$20.00'}
	, {'sav': 'save up to $2.50/lb', 'price': '$8.99/lb'}
	, {'sav': 'save up to $0.9/lb', 'price': '$5.49/lb'}
	, {'sav': 'save up to $0.79', 'price': '2/$4.00'}
	, {'sav': 'save up to $0.97 on 3', 'price': '3/$5.00'}
	, {'sav': 'this week', 'price': '$9.99/ea.'}
	, {'sav': 'save up to $0.70/lb,ea', 'price': '$1.79/lb'}
	, {'sav': 'save $0.30', 'price': '$0.99/ea'}
	, {'sav': 'save up to $9.77 on 3', 'price': '3/$9.99'}
	, {'sav': 'save up to $3.00', 'price': '$12.99/ea'}
	, {'sav': 'save $0.20/100g', 'price': '$1.79/100g'}
	, {'sav': '', 'price': '$3.35/100g'}
	, {'sav': 'save up to $0.30', 'price': '$0.69/ea'}
	, {'sav': 'save this week', 'price': 'noPrice15%off'}
	]

app.get('/deal', function (req, res){
	var info = [];
	for (var y = test.length - 1; y>= 0; y--) {
		getBest(test[y], function (percent, sav, extra){
			var ob = {};
			ob.bestPercent = percent;
			ob.bestSav = sav;
			ob.extra = extra;
			info.push(ob);
		});
	};
	console.log('info is: ');
	console.log(info);
	res.end();
});

app.get('/getMetroStore', function (req, res){
	var url = 'http://www.metro.ca/find-a-store/details.en.html?id='

	var z = 1;
	(function loop(){
		if(z < 375){
			var storename = ''
			, storeloc = ''
			, storenum = -1
			, urlnum = z
			, city = ''
			, postal = ''
			, hours = {}
			, interval = ''
			, lng = ''
			, lat = '';
			request(url+z, function (r, s, b){
				var $ = cheerio.load(b);
				var info = [];

				if($('.main-container').find('.main-errors').length !== 0){
					console.log(z + " no metro here");
					z++;
					loop();
				}
				else{
					
					var latLong = $('.store-details .where .see-more')[0].attribs.href
					, pattern = /[0-9-,][0-9.]+/g
					, matches = latLong.match(pattern);
					lng = parseFloat(matches[0]);
					lat = parseFloat(matches[1]);

					storename = $('.store-details .left-middle .name')[0].children[0].data
					storeloc = $('.store-details .left-middle .text')[0].children[0].data
					postal = $('.store-details .left-middle .text')[0].children[4].data.replace(/(\r\n|\n|\r| )/gm,"")
					city = $('.store-details .left-middle .text')[0].children[2].data.replace(/(\r\n|\n|\r| )/gm,"")
					//console.log($('.store-details .right-middle .first .date')[0].children)
					if($('.store-details .right-middle .first .date').length !== 0)
						interval = $('.store-details .right-middle .first .date')[0].children[0].data.replace(/(\r\n|\n|\r)/gm,"")
					var hoursStr = $('.store-details .opening-hours ul li')

					for (var i = hoursStr.length - 1; i >= 0; i--) {
						var tmp = hoursStr[i].children[1].children[0].data
						, tmp2 = hoursStr[i].children[0].data.replace(/(\r\n|\n|\r|\t| )/gm,"")
						if (tmp2 === ''){
							var changeTmp = $('.store-details .opening-hours ul li b')
							hours[changeTmp[0].children[0].data] = changeTmp[0].children[1].children[0].data
						}
						else{
							hours[tmp2] = tmp
						}
					};

					//console.log(hours)
					//console.log(interval)
					//console.log(storeloc)
					//console.log(postal)
					//console.log(city)
					//console.log(storename)
					//console.log(lat + " " + lng);
					Store.makeStore('metro', storename, storeloc, storenum, urlnum, city, postal, hours, lat, lng, function (err){
						if(err) throw err;
						
						console.log(z);
						z++;
						loop();
					});
				}
			});
		}
	}());
});

app.get('/getMetroFlyer', function (req, res){
	var url = 'http://www.metro.ca/flyer/index.en.html?id='

	var z = 1;
	(function loop(){
		if(z < 360){
			var storename = ''
			, storeloc = ''
			, storenum = 0
			, urlnum = z
			, city = ''
			, postal = ''
			, hours = {}
			, interval = '';
			request(url+z, function (r, s, b){
				var $ = cheerio.load(b);
				var info = [];


				Item.makeItem(item, price, sav, desc, url, extra, percent*100, sav2, name, h, function (errMakeItem){
					if(errMakeItem) throw errMakeItem;
				});
			});
		}
	}());
});

http.createServer(app).listen(8000, function () {
	console.log("Express server listening on port " + app.get('port'));
});

