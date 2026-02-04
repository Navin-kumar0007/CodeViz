/**
 * Script to promote a user to admin role
 * Run with: node scripts/promoteToAdmin.js <email>
 */

require('dotenv').config({ path: '/Users/navin/CodeViz/backend/.env' });
const mongoose = require('mongoose');

const promoteToAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('❌ Usage: node scripts/promoteToAdmin.js <email>');
        console.log('   Example: node scripts/promoteToAdmin.js test@example.com');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get the users collection directly
        const User = mongoose.connection.collection('users');

        // Find and update the user
        const result = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: { role: 'admin' } },
            { returnDocument: 'after' }
        );

        if (result) {
            console.log(`✅ User "${result.name}" (${result.email}) is now an ADMIN!`);
            console.log('👉 Please log out and log back in to refresh your session.');
        } else {
            console.log(`❌ No user found with email: ${email}`);

            // List available users
            const users = await User.find({}).toArray();
            console.log('\n📋 Available users:');
            users.forEach(u => {
                console.log(`   - ${u.email} (${u.role || 'student'})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

promoteToAdmin();
