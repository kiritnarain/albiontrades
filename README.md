# albiontrades
Marketplace trading tool for Albion Online MMO. See https://albiontrades.kiritnarain.com/ for the frontend interface.

Albion Trades consists of 2 parts:
1) A public, open source API to retrieve a JSON list of profitable trades between cities (root folder). This is built with NodeJS and Express.
2) A React frontend interface that uses the API (/frontend)

# API
Root domain of API: https://albionapi.kiritnarain.com
To build the API, run: node index.js (or: forever index.js)
To stop: forever stop [PID]. Use 'forever list' to list running processes.
The API uses the Albion Online Data Project (https://www.albion-online-data.com/) to retrieve pricing information for items at different cities. It then filters out out-of-date pricing and uses a Max-Heap Priority Queue to retrieve items where the price difference between two cities is the largest.

Supported commands:
- /trade/:buyCity/:sellCity/:maxInvestment/:maxItems
Returns a JSON list of profitable items to trade between buyCity and sellCity, sorted by profit.
- /trade/:buyCity/:maxInvestment/:maxItems
Returns a JSON list of profitable items to purchase at buyCity and sell at other cities.
- /sell/:sellCity/:maxInvestment/:maxItems
Returns a JSON list of items to purchase at other cities that can be sold for a profit at sellCity.
- /item/:itemID/:quality
JSON object about an item with given ID and given quality. The important parts of the Object are as follows:
{[cityName]: {
    'item_id': [itemID],
    'city': [cityName],
    'quality': [quality],
    'sell_price_min': [minimum sell order price],
    'sell_price_min_date': [datetime at which sell_price_min was captured],
    'buy_price_max': [maximum buy order price]
    'buy_price_max_date': [datetime at which buy_price_max was captured]
},
[cityName2]: ...
}

The /trade route produces an array of objects where each object has the following fields: "itemID", "buyCity","buyCityPrice", "sellCity", "sellCityPrice", "profit","quality","type","itemName","enchantment"