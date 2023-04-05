const mongoose = require('mongoose');
const schema = mongoose.Schema;

/********************************************************
 MongoDB User Collection Schema
********************************************************/
const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  mobile: { type: String },
  emailId: { type: String },
  password: { type: String },
  isDeleted: { type: Boolean, default: false },
  status: { type: Boolean, default: true }
}, {
  timestamps: true
});
const Users = mongoose.model('Users', userSchema);

/********************************************************
 MongoDB Authtoken Collection Schema
********************************************************/
const AuthtokenSchema = new mongoose.Schema({
  userId: { type: schema.Types.ObjectId, ref: 'Users' },
  accessToken: { type: String },
  tokenExpiryTime: { type: Date },
  ipAddress: { type: String }
}, {
  timestamps: true
});
const Authtokens = mongoose.model('Authtokens', AuthtokenSchema);

/********************************************************
 MongoDB Category Collection Schema
********************************************************/
const CategorySchema = new mongoose.Schema({
  title: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
const Category = mongoose.model('Category', CategorySchema);

/********************************************************
 MongoDB Item Collection Schema
********************************************************/
const ItemSchema = new mongoose.Schema({
  title: { type: String },
  image: { type: String },
  categoryId: { type: schema.Types.ObjectId, ref: 'Category' },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
const Items = mongoose.model('Items', ItemSchema);

module.exports = {
  Users,
  Authtokens,
  Category,
  Items
}