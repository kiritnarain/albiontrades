var fs = require('fs');
var parse = require('csv-parse');
const https = require('https');
PriorityNode = require("./PriorityNode");
PriorityQueue = require("./PriorityQueue");
const readline = require('readline');
var cors = require('cors');

const ITEM_FILE = 'items.txt';
const REQUEST_CHUNK_SIZE = 100;
const SELLPRIORITY_BUY_MAX = 'buy_price_max';
const SELLPRIORITY_SELL_MIN = 'sell_price_min';


var itemPrices = {}; //Map from item_id -> {item_name, city -> prices as defined in the albion online API}
const dataValidityTime = 24 * 3600000; //Hours * MILI in 1 hour
var csvData = [];

loadItems(ITEM_FILE);

const express = require('express');
const app = express();
const port = 5000;

app.use(cors()); // Use this after the variable declaration

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/trade/:buyCity/:sellCity/:maxInvestment/:maxItems', (req, res) => {
    var buyCity = req.params.buyCity;
    var sellCity = req.params.sellCity;
    var maxItems = req.params.maxItems;
    var result = findItems(buyCity, sellCity, SELLPRIORITY_SELL_MIN, maxItems, req.params.maxInvestment);
    res.send(JSON.stringify(result));
});

/*app.get('/tradepercent/:buyCity/:sellCity/:maxInvestment/:maxItems', (req, res) => {
    var buyCity = req.params.buyCity;
    var sellCity = req.params.sellCity;
    var maxItems = req.params.maxItems;
    var result = findItemsPercentage(buyCity, sellCity, SELLPRIORITY_SELL_MIN, maxItems);
    res.send(JSON.stringify(result));
});*/

app.get('/trade/:buyCity/:maxInvestment/:maxItems', (req, res) => {
    console.log('got global profit item request');
    var buyCity = req.params.buyCity;
    var maxItems = req.params.maxItems;
    var result = findGlobalProfitItems(buyCity, SELLPRIORITY_SELL_MIN, maxItems, req.params.maxInvestment);
    res.send(JSON.stringify(result));
});

app.get('/item/:itemID/:quality', (req, res) => {
    res.send(JSON.stringify(itemPrices[req.params.itemID][req.params.quality]));
});

app.listen(port, () => console.log(`AlbionTrades app listening at http://localhost:${port}`));


/*const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});*/

/*var recursivePrompt = function(){
    rl.question('Commands - trade, tradepercent, global, fetch: ', (command)=>{
        if(command==='trade'){
            rl.question('Enter buy city: ', (buyCity) => {
                rl.question('Enter sell city: ', (sellCity) => {
                    findItems(buyCity, sellCity, SELLPRIORITY_BUY_MAX, 20);
                    recursivePrompt();
                });
            });
        }else if(command==='tradepercent'){
            rl.question('Enter buy city: ', (buyCity) => {
                rl.question('Enter sell city: ', (sellCity) => {
                    findItemsPercentage(buyCity, sellCity, SELLPRIORITY_BUY_MAX, 20);
                    recursivePrompt();
                });
            });
        }
        else if(command==='global'){
            rl.question('Enter buy city: ', (buyCity) => {
                findGlobalProfitItems(buyCity, SELLPRIORITY_BUY_MAX, 30);
                recursivePrompt();
            });
        }else if(command==='fetch'){
            loadItems(ITEM_FILE);
        }
    });

};
recursivePrompt();*/


function loadItems(itemFile) {
    console.log('loading items');
    csvData = [];
    fs.createReadStream(itemFile)
        .pipe(parse({delimiter: '\t'}))
        .on('data', function (csvrow) {
            var parts = ('' + csvrow).split(':');
            var itemID = parts[1].trim();
            var itemName = '';
            if (parts.length >= 3) {
                itemName = parts[2].trim();
            }
            itemPrices[itemID] = {item_name: itemName};
            //console.log(`item: |${item}|`);
            //do something with csvrow
            //fetchPrices(item);
            csvData.push(itemID);
        })
        .on('end', function () {
            //do something with csvData
            //var itemsString = csvData.join('%2C');
            //console.log(itemsString);
            //fetchPrices(itemsString);
            console.log('Total Items Catalogued: ' + csvData.length);
            lazyFetchPrices();
            setInterval(lazyFetchPrices, 150000);
        });
}

function fetchPrices(itemString) {
    console.log('Fetching prices');
    https.get(`https://www.albion-online-data.com/api/v2/stats/Prices/${itemString}`, (res) => {
        console.log('statusCode:', res.statusCode);

        var data = '';

        res.on('data', (d) => {
            //process.stdout.write(d);
            data += d;

        });
        res.on('end', () => {
            parsePrices(data);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}

function lazyFetchPrices() {
    var itemsString = csvData[0];
    for (var i = 1; i < csvData.length; i++) {
        if (i % REQUEST_CHUNK_SIZE === 0) {
            fetchPrices(itemsString);
            itemsString = csvData[i];
        } else {
            itemsString += '%2C' + csvData[i];
        }
    }
    //console.log('item string: |'+itmStr+'|');
    fetchPrices(itemsString);
}


function parsePrices(data) {
    var jsonArray = JSON.parse(data);
    for (var i = 0; i < jsonArray.length; i++) {
        var snapshot = jsonArray[i];
        //console.log('quality: '+snapshot.quality);

        if (itemPrices[snapshot.item_id][snapshot.quality] === null || itemPrices[snapshot.item_id][snapshot.quality] === undefined) {
            itemPrices[snapshot.item_id][snapshot.quality] = {};
        }

        itemPrices[snapshot.item_id][snapshot.quality][snapshot.city] = snapshot;


        //console.log(snapshot.item_id+": "+itemPrices[snapshot.item_id][snapshot.city].sell_price_min);
    }
    //console.log(`${Object.keys(itemPrices).length} total items received`);
}

//sellProperty -> either sell_price_min or buy_price_max
function findItems(buyCity, sellCity, sellProperty, maxItems, maxInvestment) {
    var pq = new PriorityQueue();
    for (const [itemID, obj] of Object.entries(itemPrices)) {
        for (const [quality, obj2] of Object.entries(itemPrices[itemID])) {
            if (quality === 'item_name') {
                continue;
            }
            const isSuitable = itemPrices[itemID][quality][buyCity] != null && itemPrices[itemID][quality][buyCity] !== undefined && itemPrices[itemID][quality][buyCity].sell_price_min !== 0 &&
                itemPrices[itemID][quality][sellCity] != null && itemPrices[itemID][quality][sellCity] !== undefined && itemPrices[itemID][quality][sellCity][sellProperty] !== 0;
            if (isSuitable && isDateValid(itemPrices[itemID][quality][buyCity].sell_price_min_date) && isDateValid(itemPrices[itemID][quality][sellCity].sell_price_min_date) && itemPrices[itemID][quality][buyCity].sell_price_min <= maxInvestment) {
                let price = itemPrices[itemID][quality][sellCity][sellProperty];
                if (sellCity === 'Black Market') {
                    price = itemPrices[itemID][quality][sellCity].buy_price_max;
                }
                var pn = new PriorityNode(itemID, buyCity, itemPrices[itemID][quality][buyCity].sell_price_min, sellCity, price, quality);
                if (pn.profit > 0) {
                    pq.add(pn);
                }

            }
        }

    }
    return getItems(pq, maxItems);

}

//Items with higher percentage
//sellProperty -> either sell_price_min or buy_price_max
/*function findItemsPercentage(buyCity, sellCity, sellProperty, maxItems, maxInvestment) {
    var pq = new PriorityQueue();
    for (const [itemID, obj] of Object.entries(itemPrices)) {
        const isSuitable = itemPrices[itemID][buyCity] != null && itemPrices[itemID][buyCity] !== undefined && itemPrices[itemID][buyCity].sell_price_min !== 0 &&
            itemPrices[itemID][sellCity] != null && itemPrices[itemID][sellCity] !== undefined && itemPrices[itemID][sellCity][sellProperty] !== 0;
        if (isSuitable ) {

            var pn = new PriorityNode(itemID, buyCity, itemPrices[itemID][buyCity].sell_price_min, sellCity, itemPrices[itemID][sellCity][sellProperty]);
            pn.salePercentage();
            pq.add(pn);
        }
    }
    return getItems(pq, maxItems);

}*/


/**
 * Helper function to print items in the priority queue
 * @param pq
 * @param maxItems
 */
function getItems(pq, maxItems) {
    var i = 0;
    var result = [];
    while (!pq.isEmpty()) {
        var node = pq.remove();
        addItemMeta(node);
        //console.log(`${i}th most profitable item (profit +${node.profit}: ${node.itemID}. Buy from ${node.buyCity}(${node.buyCityPrice}), sell at ${node.sellCity}(${node.sellCityPrice})`);
        result.push(node);
        console.log('displaying: ' + node.itemID);
        if (i >= maxItems) {
            break;
        }
        i++;
    }
    return result;
}

function addItemMeta(itemNode) {
    itemNode.itemName = itemPrices[itemNode.itemID].item_name;
    itemNode.enchantment = fetchEnchantment(itemNode.itemID);
}

function fetchEnchantment(itemID){
    let atIndex = itemID.lastIndexOf('@');
    if(atIndex===-1){
        return 0;
    }
    return parseInt(itemID.charAt(atIndex+1));
}

function findGlobalProfitItems(buyCity, sellProperty, maxItems, maxInvestment) {
    var pq = new PriorityQueue();
    for (const [itemID, obj] of Object.entries(itemPrices)) {
        for (const [quality, obj2] of Object.entries(itemPrices[itemID])) {
            if (quality === 'item_name') {
                continue;
            }
            const isSuitable = itemPrices[itemID][quality][buyCity] != null && itemPrices[itemID][quality][buyCity] !== undefined && itemPrices[itemID][quality][buyCity].sell_price_min !== 0;
            if (isSuitable && isDateValid(itemPrices[itemID][quality][buyCity].sell_price_min_date) && itemPrices[itemID][quality][buyCity].sell_price_min <= maxInvestment) {
                //console.log('node is suitable');
                var totalPrice = 0;
                var numMarkets = 0;
                var maxPrice = 0;
                var maxCity = '';
                var minPrice = null;
                for (const [city, obj3] of Object.entries(itemPrices[itemID][quality])) {
                    //console.log('iterating on city: '+city);
                    if (city !== buyCity) {
                        var price = itemPrices[itemID][quality][city][sellProperty];
                        if (city === 'Black Market') {
                            price = itemPrices[itemID][quality][city].buy_price_max;
                        }
                        //Try filtering old listings
                        let sellPriceDate = Date.parse(itemPrices[itemID][quality][city].sell_price_min_date);


                        if (price !== 0 && (Date.now() - sellPriceDate) < dataValidityTime) {
                            totalPrice += price;
                            numMarkets++;
                            maxPrice = Math.max(maxPrice, price);
                            if (minPrice !== null) {
                                minPrice = Math.min(minPrice, price);
                            } else {
                                minPrice = price;
                            }
                            if (maxPrice === price) {
                                maxCity = city;
                            }
                        }

                    }

                }

                //Remove outlier
                /*if(maxPrice!==0){
                    totalPrice-=maxPrice;
                    numMarkets--;
                }*/

                var pn = new PriorityNode(itemID, buyCity, itemPrices[itemID][quality][buyCity].sell_price_min, maxCity, maxPrice, quality);
                //Using minimum profit
                pn.sellGlobal(minPrice - itemPrices[itemID][quality][buyCity].sell_price_min);
                if (pn.profit > 0) {
                    //console.log('node is profitable');
                    pq.add(pn);
                }

            }
        }

    }
    return getItems(pq, maxItems);
}

function isDateValid(dateStr) {
    return (Date.now() - Date.parse(dateStr) < dataValidityTime);
}


