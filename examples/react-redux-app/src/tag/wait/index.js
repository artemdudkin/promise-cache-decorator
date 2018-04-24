import React, {Component} from 'react';

import './styles.css';

export default class Wait extends Component {

    constructor(props) {
        super(props);
        this.state={}
    } 
    
    render() {
		//icons from https://icons8.com/cssload/en/spinners/4
	    return (
			<div className="cssload-container">
				<div className="cssload-double-torus"></div>
			</div>
		)
    }
}
