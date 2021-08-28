const app = require('./app');
const dotenv = require('dotenv');

//handle error uncaught expection
process.on('uncaughtException', err=>{
    console.log(`Error: ${err.message}`);
    console.log('Server has shutted down currently due uncaught exception error..!');
    process.exit(1);
})

// setting up config file 
dotenv.config({path: 'backend/configs/config.env'});

const connectDatabase = require('./configs/db');
// connect to db
connectDatabase();

const port = process.env.PORT;
const server = app.listen(port, ()=>{
    console.log(`server is running on port: ${port} in ${process.env.NODE_ENV} mode.`);
})

process.on('unhandledRejection', err =>{
    console.log(`Error: ${err.message}`);
    console.log('Server has shut down currently due unhandle promise rejection..!');
    server.close(()=>{
        process.exit(1);
    })
})
