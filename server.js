const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({path : './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>' , process.env.DATABASE_PASSWORD)

const DB_LOCAL = process.env.DATABASE_LOCAL

mongoose.connect(DB , {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((doc)=>{
    console.log('Connect DB successfull')
})

const port = process.env.PORT || 5000
app.listen(port , () => {
    console.log(`app is running on port ${port}`)
})