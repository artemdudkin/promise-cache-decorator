const { AsyncStorage } = require('react-native');

function save(id, value){
    AsyncStorage.setItem("cache-" + id, value);
}

//@returns Promise
function load_all(){
    return AsyncStorage.getAllKeys()
    .then( keys => {
        return AsyncStorage.multiGet(
            key.filter(_=>{ 
                return (_.indexOf("cache-") == 0)
            })
        );
    })
    .then( items => {
        var o = {}
        items.forEach(_=>{
            o[_[0]] = _[1]
        })
        return o;
    })
}

module.exports = {
    save,
    load_all
}