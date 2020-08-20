import React from 'react';
import SingleItem from "./SingleItem";
import TradeSummary from "./TradeSummary";

class ItemListing extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            itemsList: null,
            tradeSummary: []
        }
    }

    componentDidMount() {
        this.fetchListings();
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(this.props.buyCity !== prevProps.buyCity || this.props.sellCity !== prevProps.sellCity || this.props.maxItems !== prevProps.maxItems || this.props.maxInvestment !== prevProps.maxInvestment){
            this.fetchListings();
        }
    }

    addToSummary = (item) => {
        this.setState({
            tradeSummary: this.state.tradeSummary.concat(item)
        });
    };

    removeFromSummary = (item) => {
        this.setState({
           tradeSummary: this.state.tradeSummary.filter(el => (el.itemID !== item.itemID || el.quality !== item.quality))
        });
    };

    fetchListings() {
        //console.log('Called fetchListing');
        var sellSection = '/';
        let request;
        if(this.props.buyCity!==undefined && this.props.buyCity!=='' && this.props.sellCity!==undefined && this.props.sellCity!==''){
            //City to city trade
            request = `${this.props.API}/trade/${this.props.buyCity}/${this.props.sellCity}/${this.props.maxInvestment}/${this.props.maxItems}`;
        }else if(this.props.buyCity!==undefined && this.props.buyCity!== ''){
            //City to any trade
            request = `${this.props.API}/trade/${this.props.buyCity}/${this.props.maxInvestment}/${this.props.maxItems}`;
        }else if(this.props.sellCity!==undefined && this.props.sellCity!==''){
            //Any to city trade
            request = `${this.props.API}/sell/${this.props.sellCity}/${this.props.maxInvestment}/${this.props.maxItems}`;
        }else{
            //Any to any trade
            request = `${this.props.API}/trade/${this.props.maxInvestment}/${this.props.maxItems}`;
        }
        console.log('request: '+request);
        fetch(request)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        itemsList: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error)
                }
            )
    }

    render(){
        if(this.state.itemsList==null){
            return (<div></div>);
        }

        var combinedElements = [];
        //console.log('itemsList type '+typeof(this.state.itemsList));
        for (var item in this.state.itemsList) {
            //console.log('rendering: '+this.state.itemsList[item].itemID);
            combinedElements.push(<SingleItem key={this.state.itemsList[item].itemID+'/'+this.state.itemsList[item].quality} item={this.state.itemsList[item]} API={this.props.API} cities={this.props.cities} onAddToSummary={this.addToSummary}/>);
        }
        return(
            <div className="container-fluid" style={{marginTop: 40}}>
                <div className="row">
                    <div className="col-md-9 offset-md-1">
                        <div className="container-fluid">
                            <div className="row">
                                {combinedElements}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 nopadding">
                        <TradeSummary tradeSummary={this.state.tradeSummary} onRemove={this.removeFromSummary}/>
                    </div>
                </div>


            </div>
        )
    }
}
export default ItemListing;