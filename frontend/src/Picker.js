import React from 'react';
import './Picker.css';

class Picker extends React.Component{
    constructor(props) {
        super(props);
    }


    render(){
        return(
            <div className="container" style={{marginTop: 15}}>
                <div className="row">
                    <div className="col-md-3">
                        <span>Buy From City</span><br />
                        <select name="buyCity" id="buyCity" value={this.props.buyCity} onChange={this.props.onBuyCity} className="form-control form-control-sm citySelect">
                            <option value="">ANY</option>
                            <option value="Bridgewatch">Bridgewatch</option>
                            <option value="Lymhurst">Lymhurst</option>
                            <option value="Thetford">Thetford</option>
                            <option value="Fort Sterling">Fort Sterling</option>
                            <option value="Martlock">Martlock</option>
                            <option value="Caerleon">Caerleon</option>
                        </select>
                    </div>
                    <div className="col-md-3 offset-md-1">
                        <span>Sell To City</span><br />
                        <select name="sellCity" id="sellCity" value={this.props.sellCity} onChange={this.props.onSellCity} className="form-control form-control-sm citySelect">
                            <option value="">ANY</option>
                            <option value="Bridgewatch">Bridgewatch</option>
                            <option value="Lymhurst">Lymhurst</option>
                            <option value="Thetford">Thetford</option>
                            <option value="Fort Sterling">Fort Sterling</option>
                            <option value="Martlock">Martlock</option>
                            <option value="Caerleon">Caerleon</option>
                            <option value="Black Market">Black Market</option>
                        </select>
                    </div>
                    <div className="col-md-3 offset-md-1">
                        <span>Max Investment (Silver)</span><br/>
                        <input type="number" id="maxInvestment" name="maxInvestment" defaultValue={this.props.maxInvestment} onInput={this.props.onMaxInvestment} className="form-control form-control-sm citySelect"/>
                    </div>
                </div>
                {/*<label htmlFor="maxItems">Display Items: </label>
                <select name="maxItems" id="maxItems" value={this.props.maxItems} onChange={this.props.onMaxItems}>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                </select>*/}

            </div>
        )
    }


}

export default Picker;