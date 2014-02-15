/*Instantiate */
var Router = Backbone.Router.extend({
	routes:{
		"":"index"
		, "nearestStores":"nearestStores"
		, "nearestStoresByPostal/:postalCode":"postalStores"
		, "storeInfo/:id": "storeInfo"
		, "viewFlyer/:id": "viewFlyer"
		, "storeToLocal": "store"
	}
});

/* START ROUTER */
var app_router = new Router();


/* Actions */
app_router.on('route:index', function (){
	console.log("Router is taking you to index page");
	index.render();
});

app_router.on('route:nearestStores', function (){
	console.log("Router is taking you to nearestStores page");
	nearestStores.render();
});

app_router.on('route:postalStores', function (postalCode){
	console.log("Router is taking you to nearestStoresByPostal page");
	postalStores.render(postalCode);
});

app_router.on('route:storeInfo', function (id){
	console.log("Router is taking you to storeInfo page with id: "+id);
	storeInfo.render(id);
});

app_router.on('route:viewFlyer', function (id){
	console.log("Router is taking you to viewFlyer page with id: "+id);
	viewFlyer.render(id);
	$(document).on("click", "#menu-toggle",function(ev){
        	ev.preventDefault();
        	$("#wrapper").toggleClass("active");
    	});
	$(document).on("click", ".selection",function(ev) {
        	ev.preventDefault();
        	$("#wrapper").toggleClass("active");
    	});

	
});

app_router.on('route:store', function (id){
	console.log('storing...');
	
});