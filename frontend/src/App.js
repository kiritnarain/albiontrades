import React from 'react';
import logo from './logo.svg';
import './App.css';
import Picker from "./Picker";
import ItemListing from "./ItemListing";
import OneSignal from 'react-onesignal';
import Toolbar from "./Toolbar";
import Footer from "./Footer";


class App extends React.Component{
    constructor(props) {
        super(props);
        var maxInvestment = localStorage.getItem('maxInvestment');
        if(maxInvestment===undefined || maxInvestment==null){
            maxInvestment = 10000000; //Default Maximum investment
        }


        this.state = {
            API: 'https://albionapi.kiritnarain.com',
            maxItems: 50,
            maxInvestment: maxInvestment,
            buyCity: '',
            sellCity: '',
            cities: ['Bridgewatch', 'Lymhurst', 'Thetford', 'Fort Sterling', 'Martlock', 'Caerleon', 'Black Market']
        }
    }

    componentDidMount() {
        /*OneSignal.initialize('ea87dcb7-5f82-4927-b918-5009c36821ad', {
            requiresUserPrivacyConsent: false,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
                enable: true,
                size: 'small',
                position: 'bottom-right'
            }
        });*/
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
                <Toolbar />
                <Picker buyCity={this.state.buyCity} onBuyCity={this.buyCitySelected} sellCity={this.state.sellCity} onSellCity={this.sellCitySelected} maxItems={this.state.maxItems} onMaxItems={this.maxItemsChanged} cities={this.state.cities} maxInvestment={this.state.maxInvestment} onMaxInvestment={this.maxInvestmentChanged}/>
                <ItemListing API={this.state.API} buyCity={this.state.buyCity} sellCity={this.state.sellCity} maxItems={this.state.maxItems} cities={this.state.cities} maxInvestment={this.state.maxInvestment}/>
                <Footer />
            </div>
        )
    }
}

export default App;
