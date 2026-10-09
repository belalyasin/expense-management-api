const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const listen = server.listen(port,()=>{
    console.log(`App Running on Port${port}`);
});