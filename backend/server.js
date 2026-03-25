const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/bins - Add a new bin
app.post('/api/bins', async (req, res) => {
  try {
    const { location, type } = req.body;
    if (!location || !type) {
      return res.status(400).json({ error: 'Location and type are required' });
    }
    const newBin = {
      location,
      type,
      fillLevel: 0,
      status: 'Empty', // Empty, Moderate, Full
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('bins').add(newBin);
    res.status(201).json({ id: docRef.id, ...newBin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bins - Retrieve all bins
app.get('/api/bins', async (req, res) => {
  try {
    const snapshot = await db.collection('bins').get();
    const bins = [];
    snapshot.forEach(doc => {
      // Ignore invalid or empty docs if any
      if (doc.data().location) {
        bins.push({ id: doc.id, ...doc.data() });
      }
    });
    res.status(200).json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/bins/:id - Update bin fillLevel, location, or type
app.patch('/api/bins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fillLevel, location, type } = req.body;
    
    let updates = { updatedAt: new Date().toISOString() };
    
    if (fillLevel !== undefined) {
      if (fillLevel < 0 || fillLevel > 100) {
        return res.status(400).json({ error: 'Valid fillLevel (0-100) is required' });
      }
      let status = 'Empty';
      if (fillLevel > 80) status = 'Full';
      else if (fillLevel > 30) status = 'Moderate';
      
      updates.fillLevel = fillLevel;
      updates.status = status;
    }
    
    if (location) updates.location = location;
    if (type) updates.type = type;

    await db.collection('bins').doc(id).update(updates);
    
    const updatedBin = await db.collection('bins').doc(id).get();
    res.status(200).json({ id: updatedBin.id, ...updatedBin.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/bins/:id - Delete a bin
app.delete('/api/bins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('bins').doc(id).delete();
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analyze-image - Hackathon mock AI detection
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is missing' });
    
    const nameData = filename.toLowerCase();
    let result = 'Dry Waste'; // default
    
    // Keyword heuristics
    if (nameData.includes('food') || nameData.includes('banana') || nameData.includes('fruit') || nameData.includes('apple') || nameData.includes('wet') || nameData.includes('peel')) {
      result = 'Wet Waste';
    } else if (nameData.includes('plastic') || nameData.includes('bottle') || nameData.includes('paper') || nameData.includes('dry') || nameData.includes('cardboard')) {
      result = 'Dry Waste';
    } else {
      // Random fallback
      result = Math.random() > 0.5 ? 'Wet Waste' : 'Dry Waste';
    }
    
    // Simulate real AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
