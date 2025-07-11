const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/FPTCanteenDB");

const User = require('./models/User');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...');
    console.log('----------------------------------------');
    
    // Find all users with admin role
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in database');
      console.log('💡 Create admin account with email ending @admin.fpt.edu.vn');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    }
    
    // Find all users
    const allUsers = await User.find({}).select('-password');
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Show users with @admin.fpt.edu.vn email
    const adminEmailUsers = allUsers.filter(user => user.email.endsWith('@admin.fpt.edu.vn'));
    if (adminEmailUsers.length > 0) {
      console.log('\n📧 Users with admin email pattern:');
      adminEmailUsers.forEach(user => {
        console.log(`- ${user.email} (role: ${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAdminUsers(); 