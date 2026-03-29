const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('qr service running');
});

app.listen(3000, () => {
  console.log('qr service running on port 3000');
});
