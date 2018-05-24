# promise-cache-decorator

Two-level cache for functions returning promise (i.e. it memoizes promises), with "wait-a-little" event, adjustable persistence and cache invalidation strategies.

[![Coverage Status](https://coveralls.io/repos/github/artemdudkin/promise-cache-decorator/badge.svg?branch=master)](https://coveralls.io/github/artemdudkin/promise-cache-decorator?branch=master) [![Build Status](https://api.travis-ci.org/artemdudkin/promise-cache-decorator.svg?branch=master)](https://api.travis-ci.org/artemdudkin/promise-cache-decorator.svg?branch=master)

## ES6 notation
```js
import * as cache from 'promise-cache-decorator';
import axios from 'axios';

class API {

    @cache({
      type:"once-a-day",
      time:"14:00",
      tardy:"loader" //will call this.loader() if requests lasts more then 1 second
    })
    getMoscowWeather(){
      return axios.get('http://apidev.accuweather.com/locations/v1/search?q=Moscow,%20RU&apikey=hoArfRosT1215');
    }
    
    loader(){
      console.log("loading...");
    }
}
```

## More Examples (ES5)

```js
const cache = require('promise-cache-decorator');

const p = (url) => require('axios').get(url);

const cached_forever = cache()(p);

const cached_by_5_mins = cache({type:"age", maxAge:5*60*1000})(p)

const cached_by_5_mins_showing_loader_on_slow_requests = cache({
  type:"age", 
  maxAge:5*60*1000,//5 minutes
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


## Persistance

Implemented (1) browser's localStorage and (2) React-Native AsyncStorage by now.

```js
const cache = require('promise-cache-decorator');
const storage = require('promise-cache-decorator/lib/storage/asyncStorage');

cache.setSettings({storage});

//1. will try to load() item from storage if cache's get() returns undefined
//2. will call save() if promise resolves
//3. will call remove() if item invalidated (including removing just after load if item is invalid)

```
You can implement and use your own storage - just look at lib/storage folder for examples.

## Cache invalidation

There are three strategies by default: (1) keep forever, (2) invalidate by timeout (see example above) and (3) update 'once-a-day' after given time of day (see tests for example).

But you can add your own strategy:

```js
const cache = require('promise-cache-decorator');

cache.validator.register("always-miss", function invalid(item, opt){
               // 'item' is cache item (like {value:3, ts:1523047229332})
               // 'opt' is first argument at cache() call (i.e. it is parameters of cache)
               // (see example with 'tardy' handler)
  return true; // 'true' mean that cache item is invalid
});

const p = (url) => require('axios').get(url);

const cached_never = cache("always-miss")(p);

```
