const mongoose = require('mongoose');

const db_url = process.env.DB_URL;

const connectDatabase = ()=>{
    mongoose.connect(
        db_url, 
        {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true
        }
    );
    
    const db = mongoose.connection;
    db.on('error', ()=>{ console.log('cannot connect to db...')});
    db.once('open', function() {
       console.log('connected db successfully...')
    });
}

module.exports = connectDatabase;
