const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

let qrCodes = {
    "123ABC": "valid",
    "456DEF": "sold",
    "789GHI": "reserved"
};

app.post('/api/validate-qrcode', (req, res) => {
    const { code } = req.body;
    if (qrCodes[code]) {
        return res.json({ valid: true, status: qrCodes[code] });
    }
    res.json({ valid: false });
});

app.listen(3000, () => console.log('Server running on port 3000'));
