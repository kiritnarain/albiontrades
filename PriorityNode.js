//Represents a single element to use with the PriorityQueue for finding the maximum trading profit item between two cities.
class PriorityNode {

    /**
     * @param itemID -> ID of item being traded
     * @param buyCity -> city where items will be bought from
     * @param buyCityPrice -> Sell price of items in buyCity
     * @param sellCity -> City where items will be sold to
     * @param sellCityPrice -> Either highest buy order price or lowest sell order price in sellCity
     * @param quality -> Item Quality
     */
    constructor(itemID, buyCity, buyCityPrice, sellCity, sellCityPrice, quality) {
        this.itemID = itemID;
        this.buyCity = buyCity;
        this.buyCityPrice = buyCityPrice;
        this.sellCity = sellCity;
        this.sellCityPrice = sellCityPrice;
        this.profit = this.sellCityPrice -this.buyCityPrice;
        this.quality = quality;
        this.type = 'trade';
    }


    //Make average profits across cities the priority
    sellGlobal(averagePrice){
        this.profit = averagePrice - this.buyCityPrice;
        this.type = 'global';
    }

    //Make percentage profit the priority
    salePercentage(){
        this.profit = this.sellCityPrice/this.buyCityPrice;
        this.type ='tradepercent';
    }

}
module.exports = PriorityNode;