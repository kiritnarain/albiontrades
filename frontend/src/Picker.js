import React from 'react';

class Picker extends React.Component{
    constructor(props) {
        super(props);
    }


    render(){
        return(
            <div>
                <label htmlFor="buyCity">Choose buy city: </label>
                <select name="buyCity" id="buyCity" value={this.props.buyCity} onChange={this.props.onBuyCity}>
                    <option value="Bridgewatch">Bridgewatch</option>
                    <option value="Lymhurst">Lymhurst</option>
                    <option value="Thetford">Thetford</option>
                    <option value="Fort Sterling">Fort Sterling</option>
                    <option value="Martlock">Martlock</option>
                    <option value="Caerleon">Caerleon</option>
                    <option value="Black Market">Black Market</option>
                </select>
                <label htmlFor="sellCity">Choose sell city: </label>
                <select name="sellCity" id="sellCity" value={this.props.sellCity} onChange={this.props.onSellCity}>
                    <option value="">ANY</option>
                    <option value="Bridgewatch">Bridgewatch</option>
                    <option value="Lymhurst">Lymhurst</option>
                    <option value="Thetford">Thetford</option>
                    <option value="Fort Sterling">Fort Sterling</option>
                    <option value="Martlock">Martlock</option>
                    <option value="Caerleon">Caerleon</option>
                    <option value="Black Market">Black Market</option>
                </select>
                <br />
                <label htmlFor="maxItems">Display Items: </label>
                <select name="maxItems" id="maxItems" value={this.props.maxItems} onChange={this.props.onMaxItems}>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                </select>
                <label htmlFor="maxInvestment">Max Investment (Albion Silver): </label>
                <input type="number" id="maxInvestment" name="maxInvestment" defaultValue={this.props.maxInvestment} onInput={this.props.onMaxInvestment}/>
            </div>
        )
    }


}

export default Picker;