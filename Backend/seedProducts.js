const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/FPTCanteenDB");

const Product = require('./models/Product');
const Category = require('./models/Category');

const seedProducts = async () => {
  try {
    console.log('🌱 Seeding products...');

    // Get categories first
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('❌ No categories found. Please run seedData.js first.');
      return;
    }

    const products = [
      {
        name: 'Cơm gà xối mỡ',
        description: 'Cơm gà xối mỡ thơm ngon với gà ta tươi ngon',
        images: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        price: 35000,
        calories: 450,
        discount: 0,
        category: categories.find(c => c.name === 'Cơm')?._id,
        stock: 50,
        rating: 4.5,
        reviewCount: 12,
        isActive: true,
        isFeatured: true,
        addOns: [
          { name: 'Trứng cút', price: 5000, calories: 50 },
          { name: 'Rau xanh', price: 3000, calories: 20 }
        ],
        options: {
          sugar: ['0%', '50%', '100%'],
          ice: ['No Ice', 'Less Ice', 'Normal Ice']
        }
      },
      {
        name: 'Bún bò Huế',
        description: 'Bún bò Huế đặc trưng với nước dùng đậm đà',
        images: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        price: 40000,
        calories: 380,
        discount: 10,
        category: categories.find(c => c.name === 'Bún')?._id,
        stock: 30,
        rating: 4.8,
        reviewCount: 8,
        isActive: true,
        isFeatured: true,
        addOns: [
          { name: 'Chả lụa', price: 8000, calories: 120 },
          { name: 'Giá đỗ', price: 2000, calories: 15 }
        ],
        options: {
          sugar: ['0%', '50%', '100%'],
          ice: ['No Ice', 'Less Ice', 'Normal Ice']
        }
      },
      {
        name: 'Phở bò tái',
        description: 'Phở bò tái với nước dùng ngọt thanh',
        images: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        price: 45000,
        calories: 420,
        discount: 0,
        category: categories.find(c => c.name === 'Mì')?._id,
        stock: 25,
        rating: 4.6,
        reviewCount: 15,
        isActive: true,
        isFeatured: false,
        addOns: [
          { name: 'Bò viên', price: 10000, calories: 150 },
          { name: 'Gầu bò', price: 15000, calories: 200 }
        ],
        options: {
          sugar: ['0%', '50%', '100%'],
          ice: ['No Ice', 'Less Ice', 'Normal Ice']
        }
      },
      {
        name: 'Cà phê sữa đá',
        description: 'Cà phê sữa đá truyền thống Việt Nam',
        images: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        price: 25000,
        calories: 120,
        discount: 0,
        category: categories.find(c => c.name === 'Nước uống')?._id,
        stock: 100,
        rating: 4.3,
        reviewCount: 20,
        isActive: true,
        isFeatured: true,
        sizes: [
          { size: 'S', price: 20000, calories: 100 },
          { size: 'M', price: 25000, calories: 120 },
          { size: 'L', price: 30000, calories: 150 }
        ],
        options: {
          sugar: ['0%', '50%', '100%'],
          ice: ['No Ice', 'Less Ice', 'Normal Ice']
        }
      },
      {
        name: 'Chè hạt sen long nhãn',
        description: 'Chè hạt sen long nhãn ngọt thanh',
        images: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        price: 30000,
        calories: 280,
        discount: 15,
        category: categories.find(c => c.name === 'Tráng miệng')?._id,
        stock: 40,
        rating: 4.7,
        reviewCount: 6,
        isActive: true,
        isFeatured: false,
        addOns: [
          { name: 'Thêm hạt sen', price: 5000, calories: 50 },
          { name: 'Thêm long nhãn', price: 3000, calories: 30 }
        ],
        options: {
          sugar: ['0%', '50%', '100%'],
          ice: ['No Ice', 'Less Ice', 'Normal Ice']
        }
      }
    ];

    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name },
        product,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Products seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedProducts(); 