const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

mongoose.connect('mongodb://127.0.0.1:27017/test',{
    useNewUrlParser: true,
    useUnifiedTopology : true
})
.then(() => {
    console.log('db connected');
})
.catch((error) => {
    console.error('db connection error:', error);
});

const routes = require('./routes/routes')

app = express()

app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.use(express.json())

app.use('/api', routes)

app.listen(8000)