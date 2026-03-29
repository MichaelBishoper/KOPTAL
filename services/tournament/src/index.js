const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('tournament service running');
});

app.listen(3000, () => {
  console.log('tournament service running on port 3000');
});
