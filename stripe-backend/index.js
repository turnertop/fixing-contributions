const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51LFT8VFx7cVi7R5BHLRWfcmG7mkdDCj7pnEZATirgsUhcH8od5D8gCImd0xWbo3RGZLIpp3t53PTNOFD3Pckqy8E00v7C6rzkh"); // switch this to env format 
const uuid = require("uuid"); // "uuid/v4" has errors and doesn't launch, so i changed to uuid


const app = express();

//middleware
app.use(express.json())
app.use(cors())

//routes
app.get("/", (req, res) => {
    res.send("IT WORKS")
})

app.post("/payment", (req, res) => {

    const {product, token} = req.body;
    console.log("PRODUCT", product);
    console.log("PRICE", product.price);
    const idempontencyKey = uuid() // makes sure customer isn't double charged, generates unique id code for a purchase

    return stripe.customers.create({ // this creates a customer
        email: token.email,
        source: token.id,
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100, // stripe is in cents, so multiply by 100 so that it would be 10 dollars
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: product.name, // 'purchase of ${product.name}'
            shipping: {
                name: token.card.name, // stripe card borrowing their object
                address: { // stripe borrowing their object
                    country: token.card.address_country
                }
            }
        }, {idempontencyKey})
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err) )
})



//listen (port 8282 can be any port)
app.listen(8282, () => console.log("LISTENING AT PORT 8282"))
