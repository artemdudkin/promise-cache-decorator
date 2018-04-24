import React, { Component }   from 'react';
import autobind from 'autobind-decorator';

import './styles.css';

@autobind
export class Forecast extends Component {

	renderItem(item){
/*
0	tornado
1	tropical storm
2	hurricane
3	severe thunderstorms
4	thunderstorms
5	mixed rain and snow
6	mixed rain and sleet
7	mixed snow and sleet
8	freezing drizzle
9	drizzle
10	freezing rain
11	showers
12	showers
13	snow flurries
14	light snow showers
15	blowing snow
16	snow
17	hail
18	sleet
19	dust
20	foggy
21	haze
22	smoky
23	blustery
24	windy
25	cold
26	cloudy
27	mostly cloudy (night)
28	mostly cloudy (day)
29	partly cloudy (night)
30	partly cloudy (day)
31	clear (night)
32	sunny
33	fair (night)
34	fair (day)
35	mixed rain and hail
36	hot
37	isolated thunderstorms
38	scattered thunderstorms
39	scattered thunderstorms
40	scattered showers
41	heavy snow
42	scattered snow showers
43	heavy snow
44	partly cloudy
45	thundershowers
46	snow showers
47	isolated thundershowers
3200	not available
*/
//console.log("item", item);
		const { code, high, day, date } = item;

		var cls = '';
		if (['31','32','33','34','36'].indexOf(code)!=-1) cls='sun';
		if (['19','20','21','22','23','24','25','26','27','28','29','30','44'].indexOf(code)!=-1) cls='clouds';
		if (['5','6','7','8','9','10','11','12','35','39','40','45'].indexOf(code)!=-1) cls ='rain' ;
		if (['13','14','15','16','17','18','41','42','43','46'].indexOf(code)!=-1) cls='snow';
		if (['0','1','2','3','4','37','38','47'].indexOf(code)!=-1) cls='storm';

		return (
			<td style={{ verticalAlign:"bottom"}} key={date}>
    			<table>
				<tbody>
					<tr><td><div >{high}</div></td></tr>
			        <tr><td><div className={cls + " icon"}>&nbsp;</div></td></tr>
        			<tr><td>{day}</td></tr>
    			</tbody>
				</table>
			</td>
		)
	}


	render() {
		let { data } = this.props;
		if (!(data instanceof Array)) data = [];

		return (
			<table><tbody><tr>
				{data.map(_=>{
					return this.renderItem(_)
				})}
			</tr></tbody></table>	
		);
	}
}

export default Forecast;
