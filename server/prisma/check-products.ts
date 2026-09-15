import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('Checking product database consistency...');
    
    // Get total count
    const totalCount = await prisma.product.count();
    console.log(`Total products in database: ${totalCount}`);
    
    // Get products for admin view (most recent first)
    const adminProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`Admin view products count: ${adminProducts.length}`);
    
    // Get products for public view (oldest first)
    const publicProducts = await prisma.product.findMany({
      orderBy: { createdAt: "asc" },
    });
    console.log(`Public view products count: ${publicProducts.length}`);
    
    // Check if they're identical
    if (adminProducts.length === publicProducts.length) {
      console.log('✅ Product counts match between admin and public views');
    } else {
      console.log('❌ Product counts differ between admin and public views');
    }
    
    // Show first few products from each view
    console.log('\nFirst 3 products (Admin view):');
    adminProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price / 100}`);
    });
    
    console.log('\nFirst 3 products (Public view):');
    publicProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price / 100}`);
    });
    
    // Show database file size
    const fs = require('fs');
    const dbPath = './dev.db';
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`\nDatabase file size: ${stats.size} bytes`);
    }
    
  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts().catch(console.error);