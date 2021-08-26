if( process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}
const  stripesSecretKey = process.env.STRIPE_SECRET_KEY  
const  stripesPublicKey = process.env.STRIPE_PUBLIC_KEY 
console.log(stripesSecretKey)
const express = require("express")
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripesSecretKey)

app.set('c=view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

app.get('/store', function(req,res){
 fs.readFile('items.json', function(error,data){
     if (error){
         res.status(500).end()
     }else {
         res.render('store.ejs', {
             stripesPublicKey: stripesPublicKey,
             items: JSON.parse(data)
         })
     }
})
})

app.post('/purchase', function(req,res){
    fs.readFile('items.json', function(error,data){
        if (error){
            res.status(500).end()
        }else {
           const itemsJson = JSON.parse(data)
           const itemsArray = itemsJson.music.concat(itemsJson.merch)
           let total = 0
           req.body.items.forEach(function(item){
               const itemJson = itemsArray.find(function(i){
                   return i.id = item.id
               })
               total = total + itemJson.price * item.quantity
           })
           stripe.charges.create({
               amount: total,
               source: req.body.stripeTokenId,
               currency: 'usd'
           }).then(function() {
               console.log('charge Successful')
               res.json({ 
                   message: 'Successfuly purchased items'
               })
           }).catch(function(){
               console.log('charge Fail')
               res.status(500).end()
           })
        }
   })
   })
app.listen(3000)