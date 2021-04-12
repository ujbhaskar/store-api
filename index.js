import express from "express";
import bodyParser from 'body-parser';
import userRoutes from './routes/users.js';
const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Content-Type','application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/users', userRoutes);
app.get('/', (req, res) => {
    let response = {
        'greetings' : 'Hello!!'
    }
    console.log(response);
    res.send(response);
});


app.listen(port, function() {
    console.log(`Server is running on http://localhost:${port}`);
})
