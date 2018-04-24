import React, { Component }   from 'react';
import { connect } from 'react-redux';
import autobind from 'autobind-decorator';
import get from 'lodash.get';

import { injectAsyncReducer } from '../../store';

import {
	load,
} from './_actions';

import Wait from '../wait';	
import Forecast from '../forecast';	

import './styles.css';

@autobind
export class App extends Component {
	constructor(){
		super();
		this.state={}
	}

	componentWillMount(){
		this.props.load();
	}

	parseErr(err){
		return  (err instanceof Error ? err.toString() : err);
	}

	render() {
		const { locked, data, error } = this.props;

		return (
		<div>
			{locked &&
				<Wait/>}

			{!locked && error && 
				<div>ERROR: {this.parseErr(error)}</div> 
			}

			{!locked && !error && 
				<div>
				{data && data.length > 0 
					? <Forecast data={data}/>
					: <div></div>
				}
				</div>
			}
		</div>	
		);
	}
}

const mapStateToProps = state => ({
    locked : state.app.locked,
    error  : state.app.error,
	data   : state.app.data,
});

const mapDispatchToProps = {
	load,
}

injectAsyncReducer('app', require('./_reducer').default);

export default connect(mapStateToProps, mapDispatchToProps)(App);
