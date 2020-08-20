import React from 'react';
import css from './SingleItem.css';
import ItemMarkets from "./ItemMarkets";
import {getReadableTimeDiffFromNow, qualityToString} from "./Util";
class SingleItem extends React.Component{
    constructor(props) {
        super(props);
        //console.log('Using: '+props.item.buyCityPriceDate);
        this.state = {
            qualityStr: qualityToString(props.item.quality),
            buyCityPriceDateDiff: getReadableTimeDiffFromNow(props.item.buyCityPriceDate),
            sellCityPriceDateDiff: getReadableTimeDiffFromNow(props.item.sellCityPriceDate),
            marketVisible: false
        }
    }



    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.item.itemID!==this.props.item.itemID || prevProps.item.quality !== this.props.item.quality){
            this.setState({
                qualityStr: qualityToString(this.props.item.quality),
                buyCityPriceDateDiff: getReadableTimeDiffFromNow(this.props.item.buyCityPriceDate),
                sellCityPriceDateDiff: getReadableTimeDiffFromNow(this.props.item.sellCityPriceDate)
            });
        }
    }






    addToSummary = () => {
        this.props.onAddToSummary(this.props.item);
    };

    toggleMarket = () => {
        this.setState({
            marketVisible: !this.state.marketVisible
        });
    };


    render() {
        let marketClass = 'col hidden';
        let colSize = 'col-lg-4';
        if(this.state.marketVisible){
            marketClass='col';
            colSize = 'col-lg-8';
        }

        return(
            <div className={colSize}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col nopadding">
                            <div className="container itemContainer">
                                <div className="row profit">
                                    <div className="col-sm-2"><button className="nostyle" onClick={this.addToSummary} title="Add to Item Summary">+</button></div>
                                    <div className="col-sm-8 nopadding" style={{textAlign: "center"}}>
                                        +{this.props.item.profit} ({Math.floor((this.props.item.profit/this.props.item.buyCityPrice)*100)}%) Profit
                                    </div>
                                    <div className="col-sm-2" style={{textAlign: "right"}}><button className="nostyle" title="Show All Market Prices" onClick={this.toggleMarket}>&rArr;</button></div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="container itemInfoContainer">
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <h2>{this.props.item.itemName}</h2>
                                                </div>

                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <h3>{this.state.qualityStr}</h3>
                                                    <span>Quality</span>
                                                </div>
                                                <div className="col-sm-6">
                                                    <h3>{this.props.item.enchantment}</h3>
                                                    <span>Enchantment</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="row">
                                    <div className="col-sm-12 nopadding">
                                        <div className="container-fluid itemPriceContainer">
                                            <div className="row">
                                                <div className="col-sm-5 nopadding">
                                                    <span className="city">{this.props.item.buyCity}</span><br /><span className="subtext">Buy for <b>{this.props.item.buyCityPrice}</b></span>
                                                    <br /><span className="updateTime">({this.state.buyCityPriceDateDiff} ago)</span>
                                                </div>
                                                <div className="col-sm-2 nopadding">&rarr;</div>
                                                <div className="col-sm-5 nopadding">
                                                    <span className="city">{this.props.item.sellCity}</span><br /><span className="price">Sell for <b>{this.props.item.sellCityPrice}</b></span>
                                                    <br /><span className="updateTime">({this.state.sellCityPriceDateDiff} ago)</span>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className={marketClass}>
                            <ItemMarkets key={this.props.item.itemID} itemID={this.props.item.itemID} quality={this.props.item.quality} API={this.props.API} cities={this.props.cities}/>
                        </div>
                    </div>
                </div>
        </div>
        )
    }
}
export default SingleItem;