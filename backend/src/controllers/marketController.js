// src/controllers/marketController.js
const Market = require('../models/Market');
const User = require('../models/User');
const Skin = require('../models/Skin');
const Transaction = require('../models/Transaction');

exports.listActive = async (req, res) => {
  try {
    const items = await Market.find({ status: 'active' }).populate('sellerId skinId');
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myListings = async (req, res) => {
  try {
    const userId = req.userId;
    const items = await Market.find({ sellerId: userId }).populate('skinId');
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const userId = req.userId;
    const { skinId, price } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // check user has the skin
    const idx = user.inventory.findIndex(it => String(it.skinId) === String(skinId));
    if (idx === -1) return res.status(400).json({ message: 'Skin not in inventory' });

    // remove from inventory
    user.inventory.splice(idx, 1);
    await user.save();

    const listing = await Market.create({ sellerId: userId, skinId, price, status: 'active' });
    await Transaction.create({ userId, type: 'marketplace', details: { listingId: listing._id }, amount: 0 });

    res.json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.buyListing = async (req, res) => {
  try {
    const buyerId = req.userId;
    const { listingId } = req.body;
    const listing = await Market.findById(listingId).populate('sellerId skinId');
    if (!listing || listing.status !== 'active') return res.status(404).json({ message: 'Listing not available' });

    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    if (buyer.balance < listing.price) return res.status(400).json({ message: 'Insufficient balance' });

    buyer.balance -= listing.price;
    buyer.inventory.push({ skinId: listing.skinId._id });
    await buyer.save();

    const seller = await User.findById(listing.sellerId._id);
    // seller receives money
    seller.balance += listing.price;
    await seller.save();

    listing.status = 'sold';
    await listing.save();

    await Transaction.create({ userId: buyerId, type: 'marketplace', details: { listingId: listing._id }, amount: -listing.price });
    await Transaction.create({ userId: seller._id, type: 'marketplace', details: { listingId: listing._id }, amount: listing.price });

    res.json({ listing, buyerBalance: buyer.balance, sellerBalance: seller.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelListing = async (req, res) => {
  try {
    const userId = req.userId;
    const { listingId } = req.body;
    const listing = await Market.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.sellerId) !== String(userId)) return res.status(403).json({ message: 'Not allowed' });

    listing.status = 'cancelled';
    await listing.save();

    // return skin to seller
    const seller = await User.findById(userId);
    seller.inventory.push({ skinId: listing.skinId });
    await seller.save();

    res.json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// new helper to create listing from inventory (sellSkin)
exports.sellSkin = async (req, res) => {
  try {
    const userId = req.userId;
    const { skinId, price } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.inventory.findIndex(it => String(it.skinId) === String(skinId));
    if (idx === -1) return res.status(400).json({ message: 'Skin not in inventory' });

    user.inventory.splice(idx,1);
    await user.save();

    const listing = await Market.create({ sellerId: userId, skinId, price, status: 'active' });
    await Transaction.create({ userId, type: 'marketplace', details: { listingId: listing._id }, amount: 0 });

    res.json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
