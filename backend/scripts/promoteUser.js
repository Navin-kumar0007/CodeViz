/**
 * Script to promote a user to instructor role
 * Run with: node scripts/promoteUser.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('❌ Usage: node scripts/promoteUser.js <email>');
        console.log('   Example: node scripts/promoteUser.js test@example.com');
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
            { $set: { role: 'instructor' } },
            { returnDocument: 'after' }
        );

        if (result) {
            console.log(`✅ User "${result.name}" (${result.email}) is now an INSTRUCTOR!`);
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

promoteUser();
