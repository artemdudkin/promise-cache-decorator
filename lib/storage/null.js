const storage = {
    //@returns Promise
    save : (id, value) => {
        return Promise.resolve();
    },

    //@returns Promise
    load : (id) => {
        return Promise.resolve();
    },

    //@returns Promise
    remove : (id) => {
        return Promise.resolve();
    },
}

module.exports = storage;