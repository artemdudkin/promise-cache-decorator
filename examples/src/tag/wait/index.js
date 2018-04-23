import React, {Component} from 'react';

import './styles.css';
import oval47 from './img/Oval47.png';
import oval96 from './img/Oval96.png';
import oval192 from './img/Oval192.png';

export default class Wait extends Component {

    constructor(props) {
        super(props);
        this.state={}
    } 
    
    renderLoader() { 
        var {size} = this.props;
        return (
        	<div className='wait2'>
				{size<=0 && <img src={oval47} width='20' height='20' />}
				{size==1 && <img src={oval47}  />}
				{size==2 && <img src={oval96}  />}
				{size>=3 && <img src={oval192} />}
			</div>
		)
    }

    render() {
        var {type} = this.props;

        if (type=='cover' || type=='fixed') {
		const cn = "wait2__o1_color " + ("fixed" ? "wait2__o1_fixed" : "wait2__o1");
	        return (
				<div className={cn}>
					<div className="wait2__o2">
						{this.renderLoader()}
					</div>
				</div>
			)
		} else {
			return this.renderLoader()
		}
    }
}
