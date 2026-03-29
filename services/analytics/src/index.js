const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('analytics service running');
});

app.listen(3000, () => {
  console.log('analytics service running on port 3000');
});
