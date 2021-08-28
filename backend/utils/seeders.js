const Product = require('../models/product');

const dotevn = require('dotenv');
dotevn.config({path: 'backend/configs/config.env'});
const connectDatabase = require('../configs/db');

const products = require('../data/data.json');

connectDatabase();

const seedProducts = async ()=>{
    try{
        const deleteproducts = await Product.deleteMany();
        if(!deleteproducts){
            console.log('there no produce leave')

        }
        console.log('products are deleted');
        const insertproducts = await Product.insertMany(products);
        if(!insertproducts){
            console.log('cannot inserts products');
        }
        console.log('products are inserted')
        process.exit();
    }catch(e ){
        console.log(e.message);
        process.exit();
    }
}
seedProducts();