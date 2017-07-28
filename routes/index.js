var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var app = express();
app.use(cookieParser());
app.use(expressSession({secret: 'awesome'}));
app.use(router);
/* GET home page. */
var MongoClient = mongodb.MongoClient;
app.get('/', function(req, res, next) {
	console.log('Cookies: ', req.cookies)
	var loginstatus = checkLoginStatus(req);
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("vehicles");
			collection.count({"type":"New"},function(err,result1) {
				if (err) {
					console.log(err);
				} else {
					collection.count({"type":"Used"},function(err,result2) {
						if (err) {
							console.log(err);
						} else {
							res.render("index",{
								"title": "Awesome Honda",
								"amountnew": result1,
								"amountused": result2,
								"loginstatus": loginstatus
							})
						}
						db.close();
					})
				}				
			});
		}
	})
});
app.get('/new', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("vehicles");
			collection.find({}).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else {
					var cheapprice = 0;
					var expensiveprice = 0;
					var oldyear = 0;
					var newyear = 0;
					for (var i = 0; i < result.length; i++) {
						if (i == 0) {
							cheapprice = result[i].msrp;
							expensiveprice = result[i].msrp;
							oldyear = result[i].year;
							newyear = result[i].year;
							continue;
						}
						if (result[i].msrp > expensiveprice) {
							expensiveprice = result[i].msrp;
						} else if (result[i].msrp < cheapprice) {
							cheapprice = result[i].msrp;
						}
						if (result[i].year > newyear) {
							newyear = result[i].year;
						} else if (result[i].year < oldyear) {
							oldyear = result[i].year;
						}						
					}
					res.render("new", {
						"cheapprice" : cheapprice,
						"expensiveprice" : expensiveprice,
						"oldyear" : oldyear,
						"newyear" : newyear,
						"loginstatus" : loginstatus
					});
				}
				db.close();
			})
		}
	})
});
app.get('/aboutus', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	res.render("aboutus", {
		"loginstatus" : loginstatus
	});
});
app.get('/save', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("users");
			collection.find({"username":req.session.loginemail}).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else {
					if (result[0] == "") {
						// TO DO
					} else {
						var vehicles = result[0].saves;
						vehicles = vehicles.split(",");
						var query = {"vin":{$in:vehicles}};
						var collection1 = db.collection("vehicles");
						collection1.find(query).toArray(function(err, result1) {
							if (err) {
								res.send(err);
							} else {
								res.render("save",{
									"loginstatus" : loginstatus,
									"savesresult" : result1,
									"username" : req.session.loginemail
								})
							}
							db.close();
						});												
					}
				}
			})
		}
	})
});
app.post('/getsavevehicles', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("users");
			collection.find({"username":req.session.loginemail,"usertype":req.session.usertype}).toArray(function(err, result) {
				console.log("sssssssss");
				if (err) {
					res.send(err);
				} else {
					if (result[0] == "") {
						// TO DO
					} else {
						if (loginstatus) {
							res.json(result[0].saves);
						} else {
							res.json(result[0]);
						}	
					}
				}
				db.close();
			})
		}
	})
});
app.get('/compared/:vins', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("vehicles");
			var vins = req.params.vins;
			var vehicles = vins.split("|");
			console.log(vins);
			var query = {"vin":{$in:vehicles}};
			collection.find(query).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.render("compared", {
						"loginstatus" : loginstatus,
						"comparedVins" : result
					});
				}
				db.close();
			});				
		}
	})
});
app.get('/manage', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("vehicles");
			collection.find({}).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.render("manage", {
						"loginstatus" : loginstatus,
						"vehicles" : result,
						"usertype" : req.session.usertype
					});
				}
				db.close();
			});				
		}
	})
});
app.post('/getsavedvehicles', function(req, res, next) {
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("users");
			collection.find({"username":req.session.loginemail,"usertype":req.session.usertype}).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else {
					if (result == null || result == "") {
						// TO DO
						res.json("");
					} else {
						var vehicles = result[0].saves;
						vehicles = vehicles.split(",");
						var query = {"vin":{$in:vehicles}};
						var collection1 = db.collection("vehicles");
						collection1.find(query).toArray(function(err, result1) {
							if (err) {
								res.send(err);
							} else {
								res.json(result1);
							}
							db.close();
						});												
					}
				}
			})
		}
	})
});
app.get('/srp', function(req, res, next){
	var loginstatus = checkLoginStatus(req);	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";

	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("Unable to connect to the database", err);
		} else {
			console.log("Success!");
			var collection = db.collection("vehicles");
			collection.find({}).sort({"year": 1}).toArray(function(err, result) {
				if (err) {
					res.send(err);
				} else if (result.length) {
					var filterResult = [];
					var filterType = {};				
					var filterYear = {};
					var filterModel = {};
					var filterBody = {};				
					var filterTrim = {};
					for (var i = 0; i < result.length; i++) {
						if (filterType.hasOwnProperty(result[i].type)) {
							filterType[result[i].type] += 1;
						} else {
							filterType[result[i].type] = 1;
						}						
						if (filterYear.hasOwnProperty(result[i].year)) {
							filterYear[result[i].year] += 1;
						} else {
							filterYear[result[i].year] = 1;
						}
						if (filterModel.hasOwnProperty(result[i].model)) {
							filterModel[result[i].model] += 1;
						} else {
							filterModel[result[i].model] = 1;
						}
						if (filterBody.hasOwnProperty(result[i].bodystyle)) {
							filterBody[result[i].bodystyle] += 1;
						} else {
							filterBody[result[i].bodystyle] = 1;
						}						
						if (filterTrim.hasOwnProperty(result[i].trim)) {
							filterTrim[result[i].trim] += 1;
						} else {
							filterTrim[result[i].trim] = 1;
						}											
					}
					var resultFirst12 = [];
					var loadmoreFlag = 0;
					for (var i = 0; i < 12; i++) {
						resultFirst12.push(result[i]);
					}
					console.log("resultFirst12: "+resultFirst12.length);
					if (resultFirst12.length < result.length) {
						loadmoreFlag = 1;
					}
					res.render("srp", {
						"loadmoreFlag" : loadmoreFlag,
						"loadResultLength" : 12,
						"srpfilter" : result,
						"total" : result.length,
						"srp" : resultFirst12,
						"srpfiltertype": filterType,
						"srpfilteryear": filterYear,
						"srpfiltermodel": filterModel,
						"srpfilterbodystyle": filterBody,
						"srpfiltertrim": filterTrim,
						"loginstatus" : loginstatus
					});
					db.close();
				} else {
					res.send("No found");
					db.close();
				}
			})
		}
	})
});

app.post("/validate", function(req, res, next) {
	req.session.loginemail = req.body.loginemail;
	req.session.usertype = req.body.loginusertype;	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection");
		} else {
			console.log("Connected");
			var usertype = formatedData(req,"loginusertype");
			var username = formatedData(req,"loginemail");
			var password = formatedData(req,"loginpassword");
			var collection = db.collection("users");
			var total = {usertype,username,password}; 			
			collection.find({"username":req.body.loginemail,"password":req.body.loginpassword,"usertype":req.body.loginusertype}).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {
					if (req.body.loginusertype == "dealer") {
						res.json("dealer");
					} else {
						res.json(result);
					}										
				}
				db.close();
			})						
		}
	})
});
app.post("/query", function(req, res, next) {	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection");
		} else {
			console.log("Connected");
			var collection = db.collection("vehicles");	
			var dd = formatedData(req, "type");	
			var aa = formatedData(req, "year");		
			var bb = formatedData(req, "model");	
			var cc = formatedData(req, "bodystyle");
			var ee = formatedData(req, "trim");		
			var sort = formatedSortData(req);
			var skip = req.body.skip;
		    var total = {$and:[{$or:aa},{$or:bb},{$or:cc},{$or:dd},{$or:ee}]}; 
			collection.find(total).sort(sort).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {				
					res.json(result);									
				}
				db.close();
			})						
		}
	})
});
app.post("/logout", function(req, res, next) {	
	req.session.loginemail = undefined;
	res.json(true);
});
app.post("/loadmore/:skip", function(req, res, next) {	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection");
		} else {
			console.log("Connected");
			var skip = req.params.skip
			var collection = db.collection("vehicles");
			var dd = formatedData(req, "type");	
			var aa = formatedData(req, "year");		
			var bb = formatedData(req, "model");	
			var cc = formatedData(req, "bodystyle");
			var ee = formatedData(req, "trim");		
			var sort = formatedSortData(req);	
			var total = {$and:[{$or:aa},{$or:bb},{$or:cc},{$or:dd},{$or:ee}]}; 		
			collection.find(total).sort(sort).toArray(function(err, result){
				if(err) {
					console.log("wrong");
				} else {			
					var resultFilter = [];
					for (var i = parseInt(skip); i < parseInt(skip)+12; i++) {
						if (i < result.length) {
							resultFilter.push(result[i]);
						}
					}
					res.json(resultFilter);		
				}
				db.close();				
			})			
		}
	})
});
app.get("/vdp/:vin", function(req, res, next) {
	var loginstatus = checkLoginStatus(req);
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection!");
		} else {
			console.log("Connected!");
			var collection = db.collection("vehicles");	
	        var total = {'vin': req.params.vin}
			collection.find(total).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {	
					collection.find({"model":result[0].model,"trim":result[0].trim}).toArray(function(err, result1) {
						if (err) {
							console.log();
						} else {
							res.render("vdp", {
								"vehicledetails" : result,
								"similar" : result1.length,
								"interest" : result1,
								"loginstatus" : loginstatus
							});
						}
						db.close();
					})					
				}
			})				
		}
	})
});
app.post("/save/:vin", function(req, res, next) {
	var loginstatus = checkLoginStatus(req);
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection!");
		} else {
			var vinNumber = req.params.vin;
			console.log("Connected!");
			var collection = db.collection("users");	
			collection.find({"username":req.session.loginemail}).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {	
					console.log("connected");
					var emptyflag;
					if (result == "") {
						emptyflag = true;
					} else {
						emptyflag = false;
						var vehicles = result[0].saves;
						if (vehicles == null || vehicles == "") {
							vehicles = vinNumber;
						} else {
							if (vehicles.includes(vinNumber)) {

							} else {
								vehicles += ","+vinNumber;
							}
						}
						collection.update({"username":req.session.loginemail},{$set:{"saves": vehicles}},function(err, result){
							res.json(emptyflag);
							db.close();
						})						
					}		
				}
			})				
		}
	})
});
app.post("/delete/:vin", function(req, res, next) {
	var loginstatus = checkLoginStatus(req);
	var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection!");
		} else {
			var vinNumber = req.params.vin;
			console.log("Connected!");
			console.log("deleting...");
			var collection = db.collection("users");	
			collection.find({"username":req.session.loginemail}).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {	
					console.log("connected");
					var emptyflag;
					if (result == "") {
						emptyflag = true;
					} else {
						emptyflag = false;
						var vehicles = result[0].saves;
						if (vehicles == null) {
							// TO DO
						} else {
							if (vehicles.includes(vinNumber)) {
								vehicles = vehicles.replace(vinNumber,'');
								vehicles = vehicles.replace(",,",",");
								var first = vehicles.indexOf(",");
								var last = vehicles.lastIndexOf(",");
								var length = vehicles.length;
								if (first == 0) {
									vehicles = vehicles.substring(1,vehicles.length);
								}
								if (last == length - 1) {
									vehicles = vehicles.substring(0, vehicles.length - 1);
								}
							}
						}
						collection.update({"username":req.session.loginemail},{$set:{"saves": vehicles}},function(err, result) {
							res.json(emptyflag);
							db.close();
						})					
					}		
				}
			})				
		}
	})
});
app.post("/similar/:vin", function(req, res, next) {	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection");
		} else {
			var target = req.params.vin;
			console.log("Connected");
			var collection = db.collection("vehicles");	
			collection.find({"vin":target}).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {				
					collection.find({"model":result[0].model}).toArray(function(err, result1) {
						res.json(result1);
						db.close();
					})									
				}
			})				
		}
	})
});
app.post("/search/:keywords", function(req, res, next) {	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log("No Connection");
		} else {
			console.log("Connected");
			var collection = db.collection("vehicles");	
			collection.find(total).sort(sort).toArray(function(err, result) {
				if(err) {
					console.log("wrong");
				} else {				
					res.json(result);									
				}
				db.close();
			})				
		}
	})
});
app.post("/homepagequery/:method", function(req, res, next) {	
	// var MongoClient = mongodb.MongoClient;
	var url = "mongodb://127.0.0.1:27017/awesome";
	MongoClient.connect(url, function(err, db){
		var limitAmount = 3;
		var query = "";
		switch(req.params.method) {
			case 'bestdeal':
				query = '{"internetprice":1}';
				break;
			case 'popular':
				query = '{"msrp":-1}';
				break;
			case 'newarrival':
				query = '{"year":-1}';
				break;
			default:
				break;
		}
		JSON.parse(query);
		if (err) {
			console.log("No Connection");
		} else {
			console.log("Connected");
			var collection = db.collection("vehicles");	 
			collection.find({"type":"New"}).sort(JSON.parse(query)).limit(limitAmount).toArray(function(err, result1) {
				if(err) {
					console.log("wrong1");
				} else {				
					collection.find({"type":"Used"}).sort(JSON.parse(query)).limit(limitAmount).toArray(function(err, result2) {
						if(err) {
							console.log("wrong2");
						} else {				
							var result = new Object();
							result.new = result1;
							result.used = result2;
							res.json(result);								
						}
						db.close();
					})									
				}
			})						
		}
	})
});
function formatedData(req, name) {
	var splitData;
	var formatedData;
	if (req.body[name] != null) {
		splitData = req.body[name].split(",");
		for (var i=0;i<splitData.length;i++) {
			if (i == 0) {
				formatedData = "[";
			}
			var elem = '{"'+name+'":"'+splitData[i]+'"}';
			formatedData += elem;
			if (i!=splitData.length - 1) {
				formatedData += ",";
			}
			if (i==splitData.length - 1) {
				formatedData += "]";
			}
		}	
		formatedData = JSON.parse(formatedData);				
	}	
	return formatedData;
}
function formatedSortData(req) {
	var splitSortData = req.body["sort"].split(",");			
	var formattedSortData = '{"'+splitSortData[0]+'":'+splitSortData[1]+'}';	
	return JSON.parse(formattedSortData);
}
function checkLoginStatus(req) {
	var loginstatus
	if (req.session.loginemail == undefined) {
		loginstatus = false;
	} else {
		loginstatus = true;
	}
	return loginstatus;
}
module.exports = app;
