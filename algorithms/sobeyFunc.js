var veggieFruit = ['apple', 'apricot', 'artichoke', 'asparagus', 'aubergine', 'avocado', 'banana', 'beetroot', 'bean', 'broccoli', 'brussel', 'carrot', 'cherry', 'clementine', 'courgette', 'date', 'elderberry', 'endive', 'fennel', 'fig', 'garlic', 'grape', 'guava', 'kiwi', 'leek', 'lemon', 'lettuce', 'mango', 'melon', 'mushroom', 'nectarine', 'nut', 'olive', 'orange', 'pea', 'peanut', 'pear', 'pepper', 'pineapple', 'plum', 'potato', 'pumpkin', 'quince', 'radish', 'raisin', 'rhubarb', 'satsuma', 'sprout', 'squash', 'strawberry', 'tomato', 'turnip', 'ugli', 'watercress', 'watermelon', 'yam'];

var almightyOb = {
	/* veggies and fruits	*/
	'apple':6, 'apricot': 6, 'artichoke': 6, 'asparagus': 6, 'aubergine': 6, 'avocado': 6, 'banana': 6, 'beetroot': 6, 'bean': 6, 'broccoli': 6, 'brussel': 6, 'cabbage':6,'cantaloupe':6, 'carrot': 6, 'cherry': 6, 'clementine': 6, 'courgette': 6,'craisin':6,'cranberry':6, 'cucumber':6, 'date': 6, 'elderberry': 6, 'endive': 6, 'fennel': 6, 'fig': 6, 'garlic': 6, 'grape': 6,'grapefruit':6, 'guava': 6, 'kiwi': 6, 'leek': 6, 'lemon': 6, 'lettuce': 6, 'mango': 6, 'melon': 6, 'mushroom': 6, 'nectarine': 6, 'nut': 6, 'olive': 6,'onion':6, 'orange': 6, 'pea': 6, 'peanut': 6, 'pear': 6, 'pepper': 6,'pickle':6, 'pineapple': 6, 'plum': 6, 'potato': 6, 'pumpkin': 6, 'quince': 6, 'radish': 6, 'raisin': 6, 'rhubarb': 6, 'satsuma': 6,'spinach':6, 'sprout': 6, 'squash': 6, 'strawberry': 6,'tangerine':6, 'tomato': 6, 'turnip': 6, 'ugli': 6, 'watercress': 6, 'watermelon': 6, 'yam':6, 'zucchini':6,

	'apples':6, 'apricots': 6, 'artichokes': 6, 'aubergines': 6, 'avocados': 6, 'bananas': 6, 'beetroots': 6, 'beans': 6, 'brussel': 6,'cantaloupes':6, 'carrots': 6, 'cherries': 6, 'clementines': 6, 'courgettes': 6,'craisins':6,'cranberries':6, 'cucumbers':6, 'dates': 6, 'elderberries': 6, 'endives': 6, 'fennels': 6, 'figs': 6, 'grapes': 6, 'guavas': 6, 'kiwis': 6, 'leeks': 6, 'lemons': 6, 'mangoes': 6, 'mangos':6, 'melons': 6, 'mushrooms': 6, 'nectarines': 6, 'nuts': 6, 'olives': 6,'onions':6, 'oranges': 6, 'peas': 6, 'peanuts': 6, 'pears': 6, 'peppers': 6,'pickles':6, 'pineapples': 6, 'plums': 6, 'potatoes': 6, 'potatos':6, 'pumpkins': 6, 'quinces': 6, 'radishes': 6,'radishs':6, 'raisins': 6, 'rhubarbs': 6, 'satsumas': 6, 'sprouts': 6, 'squashes': 6,'squashs':6, 'strawberries': 6,'tangerines':6, 'tomatoes': 6,'tomatos':6, 'turnips': 6, 'uglies': 6, 'watercresses': 6, 'watermelons': 6, 'yams':6, 'zucchinis':6,'zucchinies':6
	/* grain */

	/* meat */

	/* dairy */

}

var categories = function (arrOfObs, arr1, arr2, arr3, arr4, arr5, arr6){
	console.time("dbsave");
	for (var i = arrOfObs.length - 1; i >= 0; i--) {
		var item = arrOfObs[i].item.split(' ')
		, rank = 0
		, index = -1;
		for (var j = item.length-1; j >= 0; j--) {
			var num = almightyOb[item[j].toLowerCase()];
			//console.log(num);
			if(!isNaN(num) && (rank == 0 || num < rank)){
				rank = num;
				index = j;
				//console.log('rank: ' + rank + ", index: "+index);
			}
			if(rank == 1) break;
		};
		if(index > -1){
			switch(rank){
				case 1:
					arr1.push(arrOfObs[i]);
					break;
				case 2:
					arr2.push(arrOfObs[i]);
					break;
				case 3:
					arr3.push(arrOfObs[i]);
					break;
				case 4:
					arr4.push(arrOfObs[i]);
					break;
				case 5:
					arr5.push(arrOfObs[i]);
					break;
				case 6:
					arr6.push(arrOfObs[i]);
					break;
			}
		}
	};
	console.timeEnd("dbsave");
	//console.log(arr6);
	//console.log(veggieAndFruit);

}


var findBuy1Get1Free = function (arrOfObs, arr, option){
	for (var i = arrOfObs.length - 1; i >= 0; i--) {
		if(option && arrOfObs[i].price.toLowerCase().indexOf('buy') > -1 && arrOfObs[i].price.toLowerCase().indexOf('get') > -1 && arrOfObs[i].price.toLowerCase().indexOf('free') > -1){
			arr.push(arrOfObs[i]);
		}
		else if (!option) arr.push(arrOfObs[i]);
	};
	return arr;
}

var filterNoSave = function (arrOfObs, arr){
	for (var i = arrOfObs.length - 1; i >= 0; i--) {
		var ob = {}
		, sav = arrOfObs[i].savings
		, pr = arrOfObs[i].price
		, it = arrOfObs[i].item
		, finalSav = 0
		, finalPercent = 0;

		if(sav.indexOf('%') == -1 && isNaN(sav)){
			var filter = sav.match(/(\d[\d\.]*)/g);

			if (filter === null){
				console.log('no savings');
			}
			else if(filter.length > 1){
				var f = +filter[0]
				, p = +pr
				, fNum = f/100;
				if(f[0] === '0'){
					console.log('less than a dollar');
					f /= 100;
				}

				if(filter[0].indexOf('.') > -1){
					console.log('dot found');
					console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					finalSav = f;
					finalPercent = (f / (f+p) )*100;
					console.log('best %age is: ' + (f / (f+p) )*100+ '\n');
				}
				else{
					finalSav = f;
					finalPercent = (fNum / (fNum+p) )*100;
					console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					console.log('best %age is: ' + (fNum / (fNum+p) )*100+ '\n');
				}
			}
			else{
				var f = +filter[0]
				, p = +pr
				, fNum = f/100;
				if(f[0] === '0'){
					console.log('less than a dollar');
					f/= 100;
				}
				if(filter[0].indexOf('.') > -1){
					finalSav = f;
					finalPercent = (f / (f+p) )*100;
					console.log('dot found');
					console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					console.log('best %age is: ' + (f / (f+p) )*100+ '\n');
				}
				else{
					finalSav = f;
					finalPercent = (fNum / (fNum+p) )*100;
					console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					console.log('best %age is: ' + (fNum / (fNum + p))*100  + '\n');
				}
			}
		}
	};
}

var getSav = function (option, num){
	var ob = {}
	, sav = num.savings
	, pr = num.price
	, finalSav = 0
	, finalPercent = 0;
	if(isNaN(sav)){
		var filter = sav.match(/(\d[\d\.]*)/g);
		if(sav.indexOf('%') == -1){
			if (filter === null || filter === ''){
				console.log('no savings');
			}
			else if(filter.length > 1){
				var f = +filter[0]
				, p = +pr
				, fNum = f/100;
				if(f[0] === '0'){
					//console.log('less than a dollar');
					f /= 100;
				}

				if(filter[0].indexOf('.') > -1){
					//console.log('dot found');
					//console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					finalSav = f;
					finalPercent = (f / (f+p) )*100;
					//console.log('best %age is: ' + (f / (f+p) )*100+ '\n');
				}
				else{
					finalSav = fNum;
					finalPercent = (fNum / (fNum+p) )*100;
					//console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					//console.log('best %age is: ' + (fNum / (fNum+p) )*100+ '\n');
				}
			}
			else{
				var f = +filter[0]
				, p = +pr
				, fNum = f/100;
				if(f[0] === '0'){
					//console.log('less than a dollar');
					f/= 100;
				}
				if(filter[0].indexOf('.') > -1){
					finalSav = f;
					finalPercent = (f / (f+p) )*100;
					//console.log('dot found');
					//console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					//console.log('best %age is: ' + (f / (f+p) )*100+ '\n');
				}
				else{
					finalSav = fNum;
					finalPercent = (fNum / (fNum+p) )*100;
					//console.log('f: %s, p: %s, fNum: %s', f, p, fNum);
					//console.log('best %age is: ' + (fNum / (fNum + p))*100  + '\n');
				}
				/*console.log(filter);
				console.log(pr);
				console.log(finalSav + " " + finalPercent);*/
			}
		}
		else{
			if (filter === null){
				console.log('no savings');
			}
			else{
				/** if sav has a % in it, just get the number, that is the finalPercent
					finalSav is still 0. */
				finalPercent = +filter[0];
			}
		}
		
	}
	//console.log('sav: '+finalSav+', %: ' + finalPercent);
	return option ? finalSav : finalPercent
}


var findBestDollarDeal = function (arrOfObs){
	var result = []
	, rest = [];
	
	for (var i = arrOfObs.length - 1; i >= 0; i--) {
		var sav = arrOfObs[i].savings;

		if(sav !== '' && isNaN(sav)){
			var filter = sav.match(/(\d[\d\.]*)/g);
			if (filter !== null){
				arrOfObs[i]['sav'] = getSav(true, arrOfObs[i]);
				result.push(arrOfObs[i]);
			}
			else{
				rest.push(arrOfObs[i]);
			}
		}
		else{
			rest.push(arrOfObs[i]);
		}
	};
	//console.log(result);
	result.sort(function (a,b){
		var c = getSav(true, a)
		, d = getSav(true, b);
		
		return d-c;
	});
	//console.log(result);
	console.log('done savings');
	return result.concat(rest);
}

var findBestPercentageDeal = function (arrOfObs){
	var result = []
	, rest = [];
	
	for (var i = arrOfObs.length - 1; i >= 0; i--) {
		var sav = arrOfObs[i].savings;

		if(sav !== '' && isNaN(sav)){
			var filter = sav.match(/(\d[\d\.]*)/g);
			if (filter !== null){
				arrOfObs[i]['percent'] = Math.round(getSav(false, arrOfObs[i]) * 100) / 100;
				result.push(arrOfObs[i]);
			}
			else{
				rest.push(arrOfObs[i]);
			}
		}
		else{
			rest.push(arrOfObs[i]);
		}
	};

	result.sort(function (a,b){
		var c = getSav(false, a)
		, d = getSav(false, b);
		return d-c;
	});
	//console.log(result);
	console.log('done percent');

	return result.concat(rest);
}



module.exports.categories = categories;
module.exports.findBuy1Get1Free = findBuy1Get1Free;
module.exports.findBestDollarDeal = findBestDollarDeal;
module.exports.findBestPercentageDeal = findBestPercentageDeal;