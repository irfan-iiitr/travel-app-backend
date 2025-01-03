const http= require('http');
const app= require('./app');

const server= http.createServer(app);

server.listen(3002,()=>{
    console.log("captain service is runing on 3002");
});