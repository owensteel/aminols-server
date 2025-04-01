const express = require('express');
const app = express();

// Set common CORS headers for HTTP routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// A simple API route (you can extend as needed)
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the Game API' });
});

module.exports = app;
