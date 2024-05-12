const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

//midlewere
app.use(express.json())
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://cardoctor-bd.web.app",
        "https://cardoctor-bd.firebaseapp.com",
    ],
    credentials: true,
}))


app.get('/', (req, res) => {
    res.send('Resturant Management Server is Running')
})

app.listen(port, () => {
    console.log(`Resturant Management Server listening on port ${port}`)
})