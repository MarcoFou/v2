/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const validURL = require('valid-url');
const shortID = require('shortid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB and mongoose connect
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.log('Server will continue running but database features will be unavailable');
});

// Database schema
const urlSchema = new mongoose.Schema({
  originalURL: String,
  shortURL: Number,
});

// Counter for generating sequential short URLs
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const URL = mongoose.model('URL', urlSchema);

// App middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function (req, res) {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// Function to get next sequence number
async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Response for POST request
app.post('/api/shorturl/new', async (req, res) => {
  const { url } = req.body;
  console.log(validURL.isUri(url));
  if (validURL.isWebUri(url) === undefined) {
    res.json({
      error: 'invalid url',
    });
  } else {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database connection unavailable. Please check MongoDB Atlas network access settings.',
      });
    }
    
    try {
      let findOne = await URL.findOne({
        originalURL: url,
      });
      if (findOne) {
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      } else {
        try {
          const shortURL = await getNextSequence('urlid');
          findOne = new URL({
            originalURL: url,
            shortURL,
          });
          await findOne.save();
          res.json({
            original_url: findOne.originalURL,
            short_url: findOne.shortURL,
          });
        } catch (seqErr) {
          console.log('Sequence error:', seqErr);
          res.status(500).json({ error: 'Server error generating short URL' });
        }
      }
    } catch (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Redirect shortened URL to Original URL
app.get('/api/shorturl/:shortURL?', async (req, res) => {
  // Check if mongoose is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection unavailable. Please check MongoDB Atlas network access settings.',
    });
  }
  
  try {
    const urlParams = await URL.findOne({
      shortURL: req.params.shortURL,
    });
    if (urlParams) {
      return res.redirect(urlParams.originalURL);
    }
    return res.status(404).json('No URL found');
  } catch (err) {
    console.log(err);
    res.status(500).json('Server error..');
  }
});
// Listens for connections
app.listen(port, '0.0.0.0', function () {
  console.log(`Node.js listening on port ${port}...`);
});
