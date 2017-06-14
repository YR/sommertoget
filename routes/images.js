var express = require('express');
var router = express.Router();

router.get('/images', (request, response) => {
    response.setHeader('Content-Type', 'image/svg.xml');
    response.sendFile(path.join/__dirname, request.url);
});

module.exports = router;