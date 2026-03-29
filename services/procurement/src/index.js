const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('procurement service running');
});

app.listen(3000, () => {
  console.log('procurement service running on port 3000');
});
