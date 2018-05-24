import axios from 'axios';
import delayed from 'delay-promise-func';

const getWeather = (town, country) => {
         return axios({
            url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22"+town+"%2C%20"+country+"%22)&format=json",
            method:'get',
            responseType: 'json',
        })
}


export default {
    // additional 3 seconds delay
    getWeather : delayed(getWeather, 3000)
}
