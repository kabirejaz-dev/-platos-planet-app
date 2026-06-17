const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/planet', (req, res) => {
  res.json({
    name: "Plato's Planet",
    description: "A tiny demo app for exploring ideas and dialogues.",
    features: ["Thought experiments", "Dialogues", "Sandbox"]
  });
});

app.listen(port, () => {
  console.log(`Plato's Planet running on http://localhost:${port}`);
});
