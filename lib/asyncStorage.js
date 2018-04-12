const { AsyncStorage } = require('react-native');

function save(id, value){
    return AsyncStorage.setItem("cache-" + id, value);
}

//@returns Promise
function load(id){
    return AsyncStorage.getItem("cache-" + id);
}

module.exports = {
    save,
    load
}