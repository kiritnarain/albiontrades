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
            if(Date.now() - Date.parse(this.state.itemMarket[city].sell_price_min_date) > this.PRICE_VALIDITY){
                sellColor = 'expiredColor';
            }
            if(Date.now() - Date.parse(this.state.itemMarket[city].buy_price_max_date) > this.PRICE_VALIDITY){
                buyColor = 'expiredColor';
            }
            return (
                <tr>
                    <td>{city}</td>
                    <td className={sellColor}>{this.state.itemMarket[city].sell_price_min}</td>
                    <td className={buyColor}>{this.state.itemMarket[city].buy_price_max}</td>
                    <td>{this.state.itemMarket[city].sell_price_min_date}</td>
                    <td>{this.state.itemMarket[city].buy_price_max_date}</td>
                </tr>
            )
        }
    };

    render(){
        var combined= [];
        for(var i=0; i<this.props.cities.length; i++){
            var marketRow = this.marketRow(this.props.cities[i]);
            combined.push(marketRow);
        }

        return(
            <div>
                <table>
                    <tbody>
                    <tr>
                        <th>City</th>
                        <th>Sell Order Price</th>
                        <th>Buy Order Price</th>
                        <th>Sell Order Price Date</th>
                        <th>Buy Order Price Date</th>
                    </tr>
                    {combined}
                    </tbody>
                </table>
            </div>
        )
    }
}
export default ItemMarkets;