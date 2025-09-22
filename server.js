const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.log('MongoDB connection error:', err.message));

// Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// CORREGIDO: Endpoint POST en /api/shorturl (no /api/shorturl/new)
app.post('/api/shorturl', async function(req, res) {
  const { url } = req.body;

  console.log('Received URL:', url); // Debug

  if (!url) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.json({ error: 'invalid url' });
    }
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  // DNS validation
  dns.lookup(parsedUrl.hostname, async (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    try {
      // Check if URL already exists
      const existingUrl = await Url.findOne({ original_url: url });
      if (existingUrl) {
        return res.json({
          original_url: existingUrl.original_url,
          short_url: existingUrl.short_url
        });
      }

      // Get count to generate sequential short_url
      const count = await Url.countDocuments();
      const short_url = count + 1;

      // Create new URL entry
      const newUrl = new Url({
        original_url: url,
        short_url: short_url
      });

      await newUrl.save();

      res.json({
        original_url: url,
        short_url: short_url
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      res.json({ error: 'invalid url' });
    }
  });
});

// GET endpoint - Redirect
app.get('/api/shorturl/:short_url', async function(req, res) {
  const short_url = parseInt(req.params.short_url);

  console.log('Redirect request for short_url:', short_url); // Debug

  if (isNaN(short_url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlData = await Url.findOne({ short_url: short_url });
    if (urlData) {
      return res.redirect(urlData.original_url);
    } else {
      return res.json({ error: 'invalid url' });
    }
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
});

// Health check endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Listener
app.listen(port, function() {
  console.log('Server listening on port ' + port);
});