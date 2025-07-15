// const mongoose = require('mongoose');
// const Order = require('./models/Order');
// const OrderItem = require('./models/OrderItem');
// const User = require('./models/User');
// const Product = require('./models/Product');
// require('dotenv').config();

// const connectDB = require('./config/database');

// const sampleOrders = [
//   {
//     user: null, // Will be set to actual user ID
//     items: [], // Will be populated with order items
//     totalAmount: 35000,
//     shippingFee: 0,
//     tax: 3500,
//     finalAmount: 38500,
//     paymentMethod: 'cash',
//     deliveryMethod: 'pickup',
//     shippingAddress: 'Căng tin A - Tầng 1',
//     status: 'delivered',
//     notes: 'Không cay',
//     createdAt: new Date('2024-06-01T10:00:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 40000,
//     shippingFee: 5000,
//     tax: 4000,
//     finalAmount: 49000,
//     paymentMethod: 'momo',
//     deliveryMethod: 'delivery',
//     shippingAddress: 'Phòng học A101',
//     status: 'delivering',
//     notes: 'Giao nhanh',
//     createdAt: new Date('2024-06-01T09:30:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 30000,
//     shippingFee: 0,
//     tax: 3000,
//     finalAmount: 33000,
//     paymentMethod: 'cash',
//     deliveryMethod: 'pickup',
//     shippingAddress: 'Căng tin B - Tầng 2',
//     status: 'preparing',
//     notes: '',
//     createdAt: new Date('2024-06-01T11:00:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 25000,
//     shippingFee: 0,
//     tax: 2500,
//     finalAmount: 27500,
//     paymentMethod: 'cash',
//     deliveryMethod: 'pickup',
//     shippingAddress: 'Căng tin A - Tầng 1',
//     status: 'delivered',
//     notes: '',
//     createdAt: new Date('2024-05-31T12:00:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 45000,
//     shippingFee: 5000,
//     tax: 4500,
//     finalAmount: 54500,
//     paymentMethod: 'momo',
//     deliveryMethod: 'delivery',
//     shippingAddress: 'Ký túc xá',
//     status: 'cancelled',
//     notes: 'Hủy do hết món',
//     createdAt: new Date('2024-05-31T13:00:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 28000,
//     shippingFee: 0,
//     tax: 2800,
//     finalAmount: 30800,
//     paymentMethod: 'cash',
//     deliveryMethod: 'pickup',
//     shippingAddress: 'Căng tin B - Tầng 2',
//     status: 'delivered',
//     notes: '',
//     createdAt: new Date('2024-05-30T10:30:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 32000,
//     shippingFee: 0,
//     tax: 3200,
//     finalAmount: 35200,
//     paymentMethod: 'cash',
//     deliveryMethod: 'pickup',
//     shippingAddress: 'Căng tin A - Tầng 1',
//     status: 'delivered',
//     notes: '',
//     createdAt: new Date('2024-05-30T11:45:00Z')
//   },
//   {
//     user: null,
//     items: [],
//     totalAmount: 38000,
//     shippingFee: 5000,
//     tax: 3800,
//     finalAmount: 46800,
//     paymentMethod: 'momo',
//     deliveryMethod: 'delivery',
//     shippingAddress: 'Phòng học B205',
//     status: 'delivering',
//     notes: 'Giao trước 12h',
//     createdAt: new Date('2024-06-01T08:00:00Z')
//   }
// ];

// const seedOrders = async () => {
//   try {
//     await connectDB();
    
//     // Clear existing orders
//     await Order.deleteMany({});
//     await OrderItem.deleteMany({});
    
//     console.log('Cleared existing orders and order items');
    
//     // Get a user and products for reference
//     const user = await User.findOne({});
//     const products = await Product.find({});
    
//     if (!user) {
//       console.log('No user found. Please seed users first.');
//       return;
//     }
    
//     if (products.length === 0) {
//       console.log('No products found. Please seed products first.');
//       return;
//     }
    
//     console.log(`Found ${products.length} products and user: ${user.email}`);
    
//     // Create orders with proper references
//     for (let i = 0; i < sampleOrders.length; i++) {
//       const orderData = sampleOrders[i];
      
//       // Create order items for each order
//       const orderItems = [];
//       const product = products[i % products.length]; // Cycle through products
      
//       const orderItem = await OrderItem.create({
//         product: product._id,
//         quantity: Math.floor(Math.random() * 3) + 1, // 1-3 items
//         itemPrice: product.price,
//         size: 'M',
//         addOns: [],
//         sugarLevel: '100%',
//         iceLevel: 'Normal Ice'
//       });
      
//       orderItems.push(orderItem._id);
      
//       // Create the order
//       const order = await Order.create({
//         ...orderData,
//         user: user._id,
//         items: orderItems,
//         orderNumber: `ORDER-${Date.now()}-${i + 1}`
//       });
      
//       console.log(`Created order ${i + 1}: ${order._id}`);
//     }
    
//     console.log('✅ Orders seeded successfully!');
//     console.log(`Created ${sampleOrders.length} orders`);
    
//     // Show some statistics
//     const totalOrders = await Order.countDocuments();
//     const totalRevenue = await Order.aggregate([
//       { $group: { _id: null, total: { $sum: '$finalAmount' } } }
//     ]);
    
//     console.log(`Total orders: ${totalOrders}`);
//     console.log(`Total revenue: ${totalRevenue[0]?.total || 0} VND`);
    
//   } catch (error) {
//     console.error('Error seeding orders:', error);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// seedOrders(); 