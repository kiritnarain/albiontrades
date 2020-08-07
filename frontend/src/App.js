import React from 'react';
import logo from './logo.svg';
import './App.css';
import Picker from "./Picker";
import ItemListing from "./ItemListing";

class App extends React.Component{
    constructor(props) {
        super(props);
        var maxInvestment = localStorage.getItem('maxInvestment');
        if(maxInvestment===undefined || maxInvestment==null){
            maxInvestment = 10000000; //Default Maximum investment
        }


        this.state = {
            API: 'http://139.162.48.23:5000',
            maxItems: 30,
            maxInvestment: maxInvestment,
            buyCity: '',
            sellCity: '',
            cities: ['Bridgewatch', 'Lymhurst', 'Thetford', 'Fort Sterling', 'Martlock', 'Caerleon', 'Black Market']
        }
    }

    buyCitySelected = (event) => {
        this.setState({
            buyCity: event.target.value
        });
    };

    sellCitySelected = (event) => {
        this.setState({
            sellCity: event.target.value
        });
    };

    maxItemsChanged = (event) => {
      this.setState({
         maxItems: parseInt(event.target.value)
      });
    };

    maxInvestmentChanged = (event) => {
        localStorage.setItem('maxInvestment', event.target.value);
        this.setState({
            maxInvestment: parseInt(event.target.value)
        });

    };



    render(){
        return (
            <div>
                <Picker buyCity={this.state.buyCity} onBuyCity={this.buyCitySelected} sellCity={this.state.sellCity} onSellCity={this.sellCitySelected} maxItems={this.state.maxItems} onMaxItems={this.maxItemsChanged} cities={this.state.cities} maxInvestment={this.state.maxInvestment} onMaxInvestment={this.maxInvestmentChanged}/>
                <ItemListing API={this.state.API} buyCity={this.state.buyCity} sellCity={this.state.sellCity} maxItems={this.state.maxItems} cities={this.state.cities} maxInvestment={this.state.maxInvestment}/>
            </div>
        )
    }
}

export default App;
