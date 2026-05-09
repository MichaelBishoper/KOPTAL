const express = require('express');
const app = express();
const port = process.env.PORT || 3006;

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(port, () => console.log(`rating-service listening on ${port}`));

module.exports = app;
