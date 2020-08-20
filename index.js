var fs = require('fs');
var parse = require('csv-parse');
const https = require('https');
PriorityNode = require("./PriorityNode");
PriorityQueue = require("./PriorityQueue");
const readline = require('readline');
var cors = require('cors');
const OneSignal = require('onesignal-node');
var onesignal_key = require('./onesignal_key.json'); //Add your notification credentials to this file


const ITEM_FILE = 'items.txt';
const REQUEST_CHUNK_SIZE = 100;
const SELLPRIORITY_BUY_MAX = 'buy_price_max';
const SELLPRIORITY_SELL_MIN = 'sell_price_min';
const priceUpdateMili = 3*60000; //Fetch new prices
const watchlistUpdateMili = 5*60000; //Update watchlist (send notifications).

var watchList = {}; //Map from 'itemID/quality' -> Priority Node of items with exceedingly good trading profits.
const WATCHLIST_MIN_PROFIT = 500000; //Minimum profit for items to be put on the watch list
setInterval(function () {
    watchList = {}; //Clear watchlist every 12 hours.
}, 12*3600000);


var itemPrices = {}; //Map from item_id -> {item_name, quality -> {city -> prices as defined in the albion online API}}
const dataValidityTime = 24 * 3600000; //Hours * MILI in 1 hour
var csvData = [];

loadItems(ITEM_FILE);

const express = require('express');
const app = express();
const port = 5000;

app.use(cors()); // Use this after the variable declaration

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/trade/:maxInvestment/:maxItems', (req, res) => {
    console.log('Got any to any request');
    let result = findAnyItems(SELLPRIORITY_BUY_MAX, req.params.maxItems, req.params.maxInvestment);
    res.send(JSON.stringify(result));
});

app.get('/trade/:buyCity/:sellCity/:maxInvestment/:maxItems', (req, res) => {
    var buyCity = req.params.buyCity;
    var sellCity = req.params.sellCity;
    var maxItems = req.params.maxItems;
    console.log(`Got ${buyCity} to ${sellCity} request.`);
    var result = findItems(buyCity, sellCity, SELLPRIORITY_BUY_MAX, maxItems, req.params.maxInvestment);
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
    console.log(`Got ${buyCity} to any request`);
    var result = findGlobalProfitItems(buyCity, SELLPRIORITY_BUY_MAX, maxItems, req.params.maxInvestment);
    res.send(JSON.stringify(result));
});

app.get('/sell/:sellCity/:maxInvestment/:maxItems', (req, res) => {
    console.log(`Got any to ${req.params.sellCity} request`);
    var result = findSellItems(req.params.sellCity, SELLPRIORITY_BUY_MAX, req.params.maxItems, req.params.maxInvestment);
    res.send(JSON.stringify(result));
});

app.get('/item/:itemID/:quality', (req, res) => {
    //console.log(`Got item information request`);
    res.send(JSON.stringify(itemPrices[req.params.itemID][req.params.quality]));
});


app.get('/reload', (req, res) => {
    console.log('Got reload request');
    lazyFetchPrices();
    res.send('ok');
});

app.listen(port, () => console.log(`AlbionTrades app listening at http://localhost:${port}`));


const client = new OneSignal.Client(onesignal_key['appID'], onesignal_key['apiKey']);

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
            setInterval(lazyFetchPrices, priceUpdateMili);
            setInterval(generateWatchList, watchlistUpdateMili);
        });
}

function fetchPrices(itemString) {
    //console.log('Fetching prices');
    https.get(`https://www.albion-online-data.com/api/v2/stats/Prices/${itemString}`, (res) => {
        //console.log('statusCode:', res.statusCode);

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
    console.log('Fetching ' + csvData.length + ' items');
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
        //console.log('Added item: '+snapshot.item_id);
    }

    //console.log(`${Object.keys(itemPrices).length} total items received`);
}

function findAnyItems(sellProperty, maxItems, maxInvestment) {
    let pq = generateAnyItemsQueue(sellProperty);
    return getItems(pq, maxItems, maxInvestment);
}

function generateAnyItemsQueue(sellProperty) {
    //console.log('itemPrices: '+JSON.stringify(itemPrices));
    var pq = new PriorityQueue();
    //console.log(Object.keys(itemPrices));
    for (const itemID in itemPrices) {
        for (var [quality, obj2] of Object.entries(itemPrices[itemID])) {
            if (quality === 'item_name') {
                continue;
            }

            let buyCity = null;
            let buyPrice = 0;
            let sellCity = null;
            let sellPrice = 0;

            for (const [city, obj3] of Object.entries(itemPrices[itemID][quality])) {
                //Update buyPrice
                if (city !== 'Black Market' && isDateValid(itemPrices[itemID][quality][city].sell_price_min_date) && (buyCity == null || itemPrices[itemID][quality][city].sell_price_min < buyPrice)) {
                    buyCity = city;
                    buyPrice = itemPrices[itemID][quality][city].sell_price_min;
                }

                //Update sellPrice
                let sellDate;
                if (sellProperty === SELLPRIORITY_BUY_MAX) {
                    sellDate = itemPrices[itemID][quality][city].buy_price_max_date;
                } else {
                    sellDate = itemPrices[itemID][quality][city].sell_price_min_date;
                }
                if (isDateValid(sellDate) && (sellCity == null || itemPrices[itemID][quality][city][sellProperty] > sellPrice)) {
                    sellCity = city;
                    sellPrice = itemPrices[itemID][quality][city][sellProperty];
                }
            }


            if (buyCity !== null && sellCity !== null) {
                let price = itemPrices[itemID][quality][sellCity][sellProperty];
                if (sellCity === 'Black Market') {
                    price = itemPrices[itemID][quality][sellCity].buy_price_max;
                }
                var pn = new PriorityNode(itemID, buyCity, itemPrices[itemID][quality][buyCity].sell_price_min, sellCity, price, quality);
                //console.log(`Checking ${itemID}: Buy: ${itemPrices[itemID][quality][buyCity].sell_price_min}. Sell: ${price}`);
                if (pn.profit > 0) {
                    //console.log('Adding node');
                    pq.add(pn);
                }

            }
        }


    }

    return pq;
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

function findSellItems(sellCity, sellProperty, maxItems, maxInvestment) {
    var pq = new PriorityQueue();
    for (const [itemID, obj] of Object.entries(itemPrices)) {
        for (const [quality, obj2] of Object.entries(itemPrices[itemID])) {
            if (quality === 'item_name' || !isDateValid(itemPrices[itemID][quality][sellCity].sell_price_min_date)) {
                continue;
            }
            let buyCity = null;
            let buyPrice = 0;
            for (const [city, obj3] of Object.entries(itemPrices[itemID][quality])) {
                if (city !== sellCity && city !== 'Black Market') {
                    if (itemPrices[itemID][quality][city].sell_price_min !== 0 && isDateValid(itemPrices[itemID][quality][city].sell_price_min_date) && (buyCity == null || itemPrices[itemID][quality][city].sell_price_min < buyPrice)) {
                        buyPrice = itemPrices[itemID][quality][city].sell_price_min;
                        buyCity = city;
                    }
                }
            }
            if (buyCity !== null && buyPrice !== 0 && buyPrice <= maxInvestment) {
                let price = itemPrices[itemID][quality][sellCity][sellProperty];
                if (sellCity === 'Black Market') {
                    price = itemPrices[itemID][quality][sellCity].buy_price_max;
                }
                var pn = new PriorityNode(itemID, buyCity, buyPrice, sellCity, price, quality);
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
 * Helper function to print items in the priority queue. This also populates the watchList
 * @param pq
 * @param maxItems
 */
function getItems(pq, maxItems, maxInvestment = Number.MAX_SAFE_INTEGER) {
    var i = 0;
    var result = [];
    while (!pq.isEmpty()) {
        var node = pq.remove();
        if (node.buyCityPrice <= maxInvestment) {
            addItemMeta(node);
            //console.log(`${i}th most profitable item (profit +${node.profit}: ${node.itemID}. Buy from ${node.buyCity}(${node.buyCityPrice}), sell at ${node.sellCity}(${node.sellCityPrice})`);
            result.push(node);
            if (i >= maxItems) {
                break;
            }
            i++;
        }

    }
    return result;
}

/**
 * Callback when data finished updated
 */

/*function dataUpdated(){
    generateWatchList(SELLPRIORITY_BUY_MAX);
}*/

function generateWatchList() {

    let pq = generateAnyItemsQueue(SELLPRIORITY_BUY_MAX); //Invariant: pq sorted descending by highest profit
    //console.log('Generated Items: ' + pq.size);
    while (!pq.isEmpty()) {
        var node = pq.remove();
        if (node.profit <= WATCHLIST_MIN_PROFIT) {
            break;
        }
        addItemMeta(node);
        //console.log(`${i}th most profitable item (profit +${node.profit}: ${node.itemID}. Buy from ${node.buyCity}(${node.buyCityPrice}), sell at ${node.sellCity}(${node.sellCityPrice})`);
        addToWatchList(node);
    }
}

/**
 *
 * @param node - Priority Node of item traded
 */
function addToWatchList(node) {
    let id = node.itemID + '/' + node.quality;
    if (watchList[id] === null || watchList[id] === undefined) {
        watchList[id] = node;
        //Notify
        console.log(`Adding ${id} to watchlist: +${node.profit}`);
        sendWatchlistItemNotification(node);
    }
}

//Warning: Assumes using buy order price (BUY_PRICE_MAX)
function addItemMeta(itemNode) {
    itemNode.itemName = itemPrices[itemNode.itemID].item_name;
    itemNode.enchantment = fetchEnchantment(itemNode.itemID);
    itemNode.buyCityPriceDate = itemPrices[itemNode.itemID][itemNode.quality][itemNode.buyCity].sell_price_min_date;
    itemNode.sellCityPriceDate = itemPrices[itemNode.itemID][itemNode.quality][itemNode.sellCity].buy_price_max_date;
}

function fetchEnchantment(itemID) {
    let atIndex = itemID.lastIndexOf('@');
    if (atIndex === -1) {
        return 0;
    }
    return parseInt(itemID.charAt(atIndex + 1));
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
                            price = itemPrices[itemID][quality][city]['buy_price_max'];
                        }
                        let sellPriceDate;
                        //Try filtering old listings
                        if (sellProperty === SELLPRIORITY_BUY_MAX || city === 'Black Market') {
                            sellPriceDate = Date.parse(itemPrices[itemID][quality][city].buy_price_max_date);
                        } else {
                            sellPriceDate = Date.parse(itemPrices[itemID][quality][city].sell_price_min_date);
                        }

                        /*if (city === 'Black Market') { //Always use buy order price for Black Market
                            price = itemPrices[itemID][quality][city].buy_price_max;
                            sellPriceDate = Date.parse(itemPrices[itemID][quality][city].buy_price_max_date);
                        }*/


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
                //Using maximum profit
                //pn.sellGlobal(maxPrice - itemPrices[itemID][quality][buyCity].sell_price_min);
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

async function sendWatchlistItemNotification(node){
    const notification = {
        contents: {
            'en': `${node.itemID}/${node.quality} trading for +${node.profit}`,
        },
        headings: {
            'en': `Trade ${node.buyCity} to ${node.sellCity}`
        },
        included_segments: ['Subscribed Users'],
    };


// or you can use promise style:
    client.createNotification(notification)
        .then(response => {})
        .catch(e => {
            console.log(e);
        });
}