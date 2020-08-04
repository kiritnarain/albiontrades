import React from 'react';
import css from './SingleItem.css';
import ItemMarkets from "./ItemMarkets";
class SingleItem extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            qualityStr: this.qualityToString(props.item.quality)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.item.itemID!==this.props.item.itemID || prevProps.item.quality !== this.props.item.quality){
            this.setState({
                qualityStr: this.qualityToString(this.props.item.quality)
            });
        }
    }

    qualityToString(quality){
        switch (parseInt(quality)) {
            case 1:
                return 'Normal';
            case 2:
                return 'Good';
            case 3:
                return 'Outstanding';
            case 4:
                return 'Excellent';
            case 5:
                return 'Masterpiece'

        }
    }



    addToSummary = () => {
        this.props.onAddToSummary(this.props.item);
    };


    render() {
        return(
            <div>
                <div>
                    <h2>{this.props.item.itemName}</h2>
                    <h3>Quality: {this.state.qualityStr}</h3>
                    <h3>Enchantment: {this.props.item.enchantment}</h3>
                    <h3>{this.props.item.itemID} | <button onClick={this.addToSummary}>Add to Trade Summary</button></h3>
                    <p>Profit: <span className="profit">+{this.props.item.profit} ({Math.floor((this.props.item.profit/this.props.item.buyCityPrice)*100)}%)</span>: Buy at {this.props.item.buyCity}(<b>{this.props.item.buyCityPrice}</b>), Sell at {this.props.item.sellCity}(<b>{this.props.item.sellCityPrice}</b>)</p>
                </div>
                <ItemMarkets key={this.props.item.itemID} itemID={this.props.item.itemID} quality={this.props.item.quality} API={this.props.API} cities={this.props.cities}/>
            </div>
        )

    }
}
export default SingleItem;