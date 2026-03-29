const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('iam service running');
});

app.listen(3000, () => {
  console.log('iam service running on port 3000');
});
