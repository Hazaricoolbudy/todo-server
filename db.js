const mongoose = require('mongoose')
const connection_url = `mongodb://localhost:27017/todomernapp`
const connectToMongo = () => {
    mongoose.connect(connection_url, {

    }).then(() => {
        console.log(`connection sucessful`)
    }).catch((err) => {
        throw err
    })
}

module.exports = connectToMongo;