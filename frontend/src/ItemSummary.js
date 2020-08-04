import React from 'react';
import './ItemSummary.css';
class ItemSummary extends React.Component{
    constructor(props) {
        super(props);
    }

    remove = () => {
        this.props.onRemove(this.props.item);
    }

    render() {
        return(
            <div className="summaryDiv">
                <span className="summaryName">{this.props.item.itemName}</span><br />
                <span>Quality: {this.props.item.quality} | Enchantment: {this.props.item.enchantment}</span><br />
                <span>Profit: <span className="profit">+{this.props.item.profit}</span></span><br />
                <span>Buy {this.props.item.buyCity}(<b>{this.props.item.buyCityPrice}</b>)</span><br />
                <span>Sell {this.props.item.sellCity}(<b>{this.props.item.sellCityPrice}</b>)</span><br />
                <button onClick={this.remove}>Remove</button>
            </div>
            )

    }
}
export default ItemSummary;