// src/controllers/skinController.js
const Skin = require('../models/Skin');

exports.listSkins = async (req, res) => {
  try {
    const skins = await Skin.find({});
    res.json({ skins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSkin = async (req, res) => {
  try {
    const skin = await Skin.findById(req.params.id);
    if (!skin) return res.status(404).json({ message: 'Skin not found' });
    res.json({ skin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
