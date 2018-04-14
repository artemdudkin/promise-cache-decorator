# promise-cache-decorator

Memoizes async functions (i.e. caches promises), with persistance and defferent cache invalidation strategies and loader ability

[![Coverage Status](https://coveralls.io/repos/github/artemdudkin/promise-cache-decorator/badge.svg?branch=master)](https://coveralls.io/github/artemdudkin/promise-cache-decorator?branch=master) [![Build Status](https://api.travis-ci.org/artemdudkin/promise-cache-decorator.svg?branch=master)](https://api.travis-ci.org/artemdudkin/promise-cache-decorator.svg?branch=master)

## Example (and loader)

```js
const {cache} = require('promise-cache-decorator');

const p = (url) => require('axios').get(url);

const cached_forever = cache()(p);

const cached_by_5_mins = cache({type:"age", maxAge:5*60*1000})(p)

const cached_by_5_mins_showing_loader_on_slow_requests = cache({
  type:"age", 
  maxAge:5*60*1000, 
  tardy : show_loader // will call this handler in 1 second 
                      //(if Promise was not resolved earlier)
})(p);

//will request the weather from openweathermap 
//(with loader if needed) for the first time,
//but will get data from cache for the second time 
//(nevertheless after 5 mins will send request to update data)

cached_by_5_mins_showing_loader_on_slow_requests('http://apidev.accuweather.com/locations/v1/search?q=Moscow,%20RU&apikey=hoArfRosT1215')
.then(res => {
  show_the_weather(res);
})
.catch(err => {
  show_the_error(err);
})
```

## ES6 notation
```js
import {cache} from 'promise-cache-decorator';
import axios from 'axios';

class API {

    @cache({
      type:"once-a-day",
      time:"14:00",
      tardy:"loader"
    })
    getMoscowWeather(){
      return axios.get('http://apidev.accuweather.com/locations/v1/search?q=Moscow,%20RU&apikey=hoArfRosT1215');
    }
    
    loader(){
      console.log("loading...");
    }
}
```


## Persistance

Implemented only React-Native AsyncStorage by now.

```js
const {cache, setStorage} = require('promise-cache-decorator');
const storage = require('promise-cache-decorator/lib/storage/asyncStorage');

setStorage(storage);

//1. you can do all things from previous example
//2. also will try to load item from AsyncStorage on cache "get" if not exists
//3. also will call save() on promise resolves (to save item to AsyncStorage)

```

## Cache invalidation

There are three strategies by default: (1) keep forever, (2) invalidate by timeout (see example above) and (3) update 'once-a-day' after given time of day (see tests for example).
But you can add your own strategy:

```js
const {cache, register_validator} = require('promise-cache-decorator');

register_validator("always-miss", function invalid(item, opt){
               // 'item' is cache item (like {value:3, ts:1523047229332})
               // 'opt' is (optional) second parameter in cache call 
               // (see example with 'tardy' handler)
  return true; // 'true' mean that cache item is invalid
});

const p = (url) => require('axios').get(url);

const cached_never = cache("always-miss")(p);

```
