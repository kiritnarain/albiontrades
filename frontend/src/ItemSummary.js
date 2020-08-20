import React from 'react';
import './ItemSummary.css';
import {qualityToString} from "./Util";

class ItemSummary extends React.Component{
    constructor(props) {
        super(props);
    }

    remove = () => {
        this.props.onRemove(this.props.item);
    };

    render() {
        return(
            <div className="summaryDiv">
                <button className="nostyle removeButton" onClick={this.remove}>&#10007;</button>
                <span className="summaryName">{this.props.item.itemName}</span><br />
                <span className="fullWhite">{qualityToString(this.props.item.quality)} | Enchantment: {this.props.item.enchantment}</span><br />
                <span className="green">Profit: +{this.props.item.profit}</span><br />
                <span className="">Buy {this.props.item.buyCity}(<b>{this.props.item.buyCityPrice}</b>)</span><br />
                <span className="">Sell {this.props.item.sellCity}(<b>{this.props.item.sellCityPrice}</b>)</span><br />


            </div>
            )

    }
}
export default ItemSummary;