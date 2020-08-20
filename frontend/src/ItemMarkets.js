import React from 'react';
import css from './ItemMarkets.css';
class ItemMarkets extends React.Component{
    PRICE_VALIDITY = 24*3600000; //Hours * MILI in hours. Time validity of market price. Used for highlighting cells.
    constructor(props) {
        super(props);
        this.state = {
            itemMarket: null
        }
    }

    componentDidMount() {
        this.fetchItemMarkets();
    }

    fetchItemMarkets(){
        const request = `${this.props.API}/item/${this.props.itemID}/${this.props.quality}`;
        console.log('send request: '+request);
        fetch(request)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        itemMarket: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            )
    }

    marketRow(city){
        if(this.state.itemMarket===undefined || this.state.itemMarket==null){
            return (<tr><td>{city}</td></tr>);
        }else{
            //console.log('Rendering market for city: '+city);
            let sellColor = 'activeColor';
            let buyColor = 'activeColor';
            const sellPriceDate = Date.parse(this.state.itemMarket[city].sell_price_min_date+'Z');
            const sellPriceDateDiff = Date.now()-  sellPriceDate;
            const buyPriceDate =   Date.parse(this.state.itemMarket[city].buy_price_max_date+'Z');
            const buyPriceDateDiff = Date.now() - buyPriceDate;
            if(sellPriceDateDiff> this.PRICE_VALIDITY){
                sellColor = 'expiredColor';
            }
            if(buyPriceDateDiff > this.PRICE_VALIDITY){
                buyColor = 'expiredColor';
            }
            return (
                <tr align="center">
                    <td className="cityRow">{city}</td>
                    <td className={sellColor}>{this.getReadablePrice(this.state.itemMarket[city].sell_price_min)}</td>
                    <td className={buyColor}>{this.getReadablePrice(this.state.itemMarket[city].buy_price_max)}</td>
                    <td className={sellColor}>{this.getReadableTimeDiff(sellPriceDateDiff)}</td>
                    <td className={buyColor}>{this.getReadableTimeDiff(buyPriceDateDiff)}</td>
                </tr>
            )
        }
    };

    //Returns a string containing the number of minutes represented by dateDiff(miliseconds) if <1 hour,
    //Otherwise returns number of hours represented by dateDiff
    getReadableTimeDiff(dateDiff){
        if(dateDiff<3600000){
            //Less than 1 hour, returns number of minutes
            const min = Math.floor(dateDiff/60000);
            return `${min} min`;
        }else if(dateDiff<86400000){ //less than 1 day
            //Returns number of hours
            const hours = Math.floor(dateDiff/3600000);
            if(hours===1){
                return `${hours} hour`;
            }
            return `${hours} hours`;
        }else if(dateDiff<63732700800000){ //Maximum valid timediff
            const days = Math.floor(dateDiff/86400000);
            if(days===1){
                return `${days} day`;
            }
            return `${days} days`;
        }
        return `-`; //Invalid date

    }

    getReadablePrice(price){
        if(price===0){
            return '-';
        }
        return `${price}`;
    }

    render(){
        var combined= [];
        for(var i=0; i<this.props.cities.length; i++){
            var marketRow = this.marketRow(this.props.cities[i]);
            combined.push(marketRow);
        }

        return(
            <div className="container-fluid marketContainer">
                <div className="row">
                    <div className="col-sm-12">
                        <table>
                            <tbody>
                            <tr align="center">
                                <th>City</th>
                                <th>Sell</th>
                                <th>Buy</th>
                                <th>Sell Updated</th>
                                <th>Buy Updated</th>
                            </tr>
                            {combined}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}
export default ItemMarkets;