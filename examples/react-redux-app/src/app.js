import React, { Component }   from 'react';
import autobind from 'autobind-decorator';
import get from 'lodash.get';


import { getWeather } from './api';

import Wait from './tag/wait';	
import Forecast from './tag/forecast';	

import './styles.css';

@autobind
export class App extends Component {
	constructor(){
		super();
		this.state={
			locked:true,
			data:{}
		}
	}

	componentWillMount(){
		getWeather()
		.then(res=>{
			this.setState({data:res.data, locked:false});
		})
		.catch(err=>{
			this.setState({err:err, locked:false});
		})
	}

	parseErr(err){
		return  (err instanceof Error ? err.toString() : err);
	}

	render() {
		const { locked, data, err } = this.state;
		const forecast = get(data, "query.results.channel.item.forecast", []);

		return (
		<div>
			{locked &&
				<Wait/>}
			{!locked && err && 
				<div>ERROR: {this.parseErr(err)}</div> 
			}

			{!locked && !err && 
				<div>
				{forecast && forecast.length > 0 
					? <Forecast data={forecast}/>
					: <div>ERROR: cannot get forecast - yahoo response changed</div>
				}
				</div>
			}
		</div>	
		);
	}
}

export default App;
