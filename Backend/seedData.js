const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/FPTCanteenDB");

const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Tag = require('./models/Tag');

const seedData = async () => {
  try {
    console.log('🌱 Seeding data...');

    // Seed Categories
    const categories = [
      { name: 'Cơm', description: 'Các món cơm' },
      { name: 'Bún', description: 'Các món bún' },
      { name: 'Mì', description: 'Các món mì' },
      { name: 'Nước uống', description: 'Các loại nước uống' },
      { name: 'Tráng miệng', description: 'Các món tráng miệng' },
      { name: 'Chay', description: 'Các món chay' },
    ];

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories seeded');

    // Seed Brands
    const brands = [
      { name: 'FPT Canteen', description: 'Thương hiệu chính' },
      { name: 'Highland Coffee', description: 'Cà phê Highland' },
      { name: 'Phúc Long', description: 'Trà & Cà phê Phúc Long' },
    ];

    for (const brand of brands) {
      await Brand.findOneAndUpdate(
        { name: brand.name },
        brand,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Brands seeded');

    // Seed Tags
    const tags = [
      { name: 'Spicy', description: 'Cay', color: '#E74C3C' },
      { name: 'Vegetarian', description: 'Chay', color: '#27AE60' },
      { name: 'Popular', description: 'Phổ biến', color: '#F39C12' },
      { name: 'New', description: 'Mới', color: '#3498DB' },
      { name: 'Healthy', description: 'Tốt cho sức khỏe', color: '#9B59B6' },
    ];

    for (const tag of tags) {
      await Tag.findOneAndUpdate(
        { name: tag.name },
        tag,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Tags seeded');

    console.log('🎉 All data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData(); 