const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('products service running');
});

app.listen(3000, () => {
  console.log('products service running on port 3000');
});
