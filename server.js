// Allow iframing from Salesforce domains
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.salesforce.com https://*.force.com;");
    next();
});

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Set View Engine to EJS to render HTML
app.set('view engine', 'ejs');

// Middleware to parse the POST request from Salesforce
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. Home Route (To verify app is alive)
app.get('/', (req, res) => {
    res.send('Canvas App is running! Waiting for Salesforce POST...');
});

// 2. The Canvas Route (The endpoint Salesforce hits)
app.post('/canvas', (req, res) => {
    const signedRequest = req.body.signed_request;

    if (!signedRequest) {
        return res.status(400).send('Error: No signed_request found. Are you in Salesforce?');
    }

    // DECODING LOGIC (For POC only)
    // In Prod, you MUST verify the signature using your Consumer Secret.
    // Here, we just decode the Base64 payload to prove connection.
    const split = signedRequest.split('.');
    const encodedEnv = split[1];
    const jsonStr = Buffer.from(encodedEnv, 'base64').toString('utf8');
    const context = JSON.parse(jsonStr);

    // Render the page with data passed securely from Salesforce
    res.render('index', { 
        userName: context.context.user.fullName,
        email: context.context.user.email,
        orgId: context.context.organization.organizationId
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});
