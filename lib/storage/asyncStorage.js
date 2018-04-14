const { AsyncStorage } = require('react-native');

const storage = {
    //@returns Promise
    save : (id, value) => {
        return AsyncStorage.setItem("cache-" + id, value);
    },

    //@returns Promise
    load : (id) => {
        return AsyncStorage.getItem("cache-" + id);
    },

    //@returns Promise
    delete : (id) => {
        return AsyncStorage.removeItem("cache-" + id);
    },
}

module.exports = storage;