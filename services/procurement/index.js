const express = require('express');
const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(port, () => console.log(`procurement-service listening on ${port}`));

module.exports = app;
