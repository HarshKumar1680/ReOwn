const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Maxi Skirt',
    description: 'Elegant maxi skirt, perfect for all occasions. Size: M. Free shipping available.',
    price: 899,
    originalPrice: 1799,
    image: '/public/images/maxi-skirt.jpg',
    category: 'clothing',
    size: 'M',
    condition: 'good',
    brand: 'Fashion Brand',
    stock: 5
  },
  {
    name: "Men's Fashion",
    description: 'Trendy men\'s fashion for every season. Size: L. Free shipping available.',
    price: 1399,
    originalPrice: 2499,
    image: '/public/images/mens-fashion.jpeg',
    category: 'clothing',
    size: 'L',
    condition: 'like-new',
    brand: 'Men\'s Style',
    stock: 3
  },
  {
    name: 'Silt Dress',
    description: 'Chic silt dress, comfortable and stylish. Size: S. Free shipping available.',
    price: 1099,
    originalPrice: 2099,
    image: '/public/images/silt-dress.jpg',
    category: 'clothing',
    size: 'S',
    condition: 'good',
    brand: 'Elegant Wear',
    stock: 4
  },
  {
    name: "Men's Formal",
    description: 'Classic men\'s formal wear. Size: XL. Free shipping available.',
    price: 1599,
    originalPrice: 2999,
    image: '/public/images/mens-formal.jpg',
    category: 'formal',
    size: 'XL',
    condition: 'new',
    brand: 'Formal Collection',
    stock: 2
  },
  {
    name: "Women's Formal",
    description: 'Elegant women\'s formal dress. Size: M. Free shipping available.',
    price: 1299,
    originalPrice: 2599,
    image: '/public/images/womens-formal.jpg',
    category: 'formal',
    size: 'M',
    condition: 'like-new',
    brand: 'Professional Look',
    stock: 6
  },
  {
    name: 'Bridal Attire',
    description: 'Beautiful bridal attire for your special day. Size: Custom. Free shipping available.',
    price: 2499,
    originalPrice: 4999,
    image: '/public/images/bridal-attire.jpeg',
    category: 'bridal',
    size: 'Custom',
    condition: 'new',
    brand: 'Bridal Collection',
    stock: 1
  },
  {
    name: 'Coat',
    description: 'Warm and stylish coat for winter. Size: L. Free shipping available.',
    price: 1199,
    originalPrice: 2199,
    image: '/public/images/coat.jpg',
    category: 'clothing',
    size: 'L',
    condition: 'good',
    brand: 'Winter Wear',
    stock: 3
  },
  {
    name: 'Heels',
    description: 'Fashionable heels for every occasion. Size: 7. Free shipping available.',
    price: 799,
    originalPrice: 1599,
    image: '/public/images/heels.jpg',
    category: 'shoes',
    size: '7',
    condition: 'like-new',
    brand: 'Footwear Plus',
    stock: 4
  },
  {
    name: 'Leather Blazers',
    description: 'Premium leather blazers. Size: L. Free shipping available.',
    price: 1899,
    originalPrice: 2999,
    image: '/public/images/leather-blazer.jpg',
    category: 'clothing',
    size: 'L',
    condition: 'good',
    brand: 'Leather Craft',
    stock: 2
  },
  {
    name: 'Dark Denim',
    description: 'Classic dark denim. Size: 32. Free shipping available.',
    price: 999,
    originalPrice: 1999,
    image: '/public/images/dark-denim.jpg',
    category: 'clothing',
    size: '32',
    condition: 'good',
    brand: 'Denim World',
    stock: 7
  },
  {
    name: 'Cozy Knits',
    description: 'Soft and cozy knits. Size: M. Free shipping available.',
    price: 799,
    originalPrice: 1499,
    image: '/public/images/cozy-knit.jpeg',
    category: 'clothing',
    size: 'M',
    condition: 'like-new',
    brand: 'Cozy Comfort',
    stock: 5
  },
  {
    name: 'Black Boots',
    description: 'Stylish black boots. Size: 8. Free shipping available.',
    price: 1499,
    originalPrice: 2499,
    image: '/public/images/black-boots.jpg',
    category: 'shoes',
    size: '8',
    condition: 'good',
    brand: 'Boot Collection',
    stock: 3
  },
  {
    name: 'Vintage Denim Jacket',
    description: 'Classic blue denim, lightly worn. Size: M. Free shipping available.',
    price: 1299,
    originalPrice: 2499,
    image: '/public/images/dark-denim.jpg',
    category: 'clothing',
    size: 'M',
    condition: 'good',
    brand: 'Vintage Collection',
    stock: 2
  },
  {
    name: 'Floral Summer Dress',
    description: 'Beautiful floral summer dress. Size: S. Free shipping available.',
    price: 899,
    originalPrice: 1799,
    image: '/public/images/silt-dress.jpg',
    category: 'clothing',
    size: 'S',
    condition: 'like-new',
    brand: 'Summer Style',
    stock: 4
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${products.length} products successfully`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts(); 