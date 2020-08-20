import React from 'react';
import ItemSummary from "./ItemSummary";
import './TradeSummary.css';
class TradeSummary extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            totalCost: 0,
            totalProfit: 0
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.tradeSummary !== this.props.tradeSummary){
            var totalCost = 0;
            var totalProfit = 0;
            for(var i=0; i<this.props.tradeSummary.length; i++){
                const item = this.props.tradeSummary[i];
                totalCost+=item.buyCityPrice;
                totalProfit+=item.profit;
            }
            this.setState({
                totalCost: totalCost,
                totalProfit: totalProfit
            })
        }

    }


    render() {
        var listing = [];
        for(var i=0; i<this.props.tradeSummary.length; i++){
            var item = this.props.tradeSummary[i];
            listing.push(<ItemSummary key={'summary/'+item.itemID+'/'+item.quality} item={item} onRemove={this.props.onRemove}/>);
        }

        return (
            <div className="container-fluid summaryContainer">
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Trade Summary</h3>
                        <h4 >Expected cost: {this.state.totalCost}</h4>
                        <h4>Expected profit: {this.state.totalProfit}</h4>
                    </div>
                </div>
                {listing}
            </div>
        )
    }
}
export default TradeSummary;