const http= require('http');
const app= require('./app');

const server= http.createServer(app);

server.listen(3001,()=>{
    console.log("User service is runing on 3001");
});