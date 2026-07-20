const express = require('express')
const cors = require('cors')
const path = require('path')
const {conneDB} = require('./config/db')
require('dotenv').config()
const app = express()
const userRouter = require('./routes/userRoute')
const brandRouter = require('./routes/brandRoute')
const categoryRouter = require('./routes/categoryRoute')
const productRouter= require('./routes/productRoute')
const cartRouter= require('./routes/cartRoute')
const orderRouter= require('./routes/orderRoute')
const wishlistRouter=require('./routes/wishlistRoute')

const port = process.env.PORT || 5003

app.use(express.json())
//app.use(cors())
// Allow requests from your specific frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL,
   credentials: true,
}));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'))

app.use('/user', userRouter)
app.use('/brand', brandRouter)
app.use('/brand', brandRouter)
app.use('/category',categoryRouter)
app.use('/product',productRouter)
app.use('/cart',cartRouter)
app.use('/order',orderRouter)
app.use('/wishlist',wishlistRouter)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
