import React from 'react';
import './Toolbar.css';
class Toolbar extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="container-fluid toolbar">
            <div className="row">
                <div className="col-sm-1"><img src="icon.png" width="40px"/></div>
                <div className="col-sm-3"><h1>Albion Trades</h1></div>
                <div className="col-sm-5 offset-sm-3 tagline">Maximize your Albion Online Trading Profit</div>
            </div>
        </div>)
    }
}

export default Toolbar;