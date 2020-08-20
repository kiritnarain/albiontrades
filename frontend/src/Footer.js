import React from 'react';
import './Footer.css';
class Footer extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="container footerContainer">
                <div className="row">
                    <div className="col-sm-12 center">
                        <p>Developed by <a href="https://kiritnarain.com">Kirit Narain</a> under the MIT License. To use the API see <a href="https://github.com/kiritnarain/albiontrades">https://github.com/kiritnarain/albiontrades</a></p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Footer;