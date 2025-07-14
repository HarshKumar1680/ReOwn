const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  // --- Main Products ---
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
  },
  // --- Accessories ---
  {
    name: 'Trendy Bag',
    image: '/public/images/bag.jpg',
    category: 'accessories',
    price: 999,
    originalPrice: 1499,
    stock: 10,
    description: 'A stylish and trendy bag for all occasions.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'M',
    isActive: true
  },
  {
    name: 'Sneakers',
    image: '/public/images/sneakers.jpg',
    category: 'accessories',
    price: 1299,
    originalPrice: 1799,
    stock: 15,
    description: 'Comfortable and fashionable sneakers.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: '8',
    isActive: true
  },
  {
    name: 'Scarf',
    image: '/public/images/scarf.jpg',
    category: 'accessories',
    price: 499,
    originalPrice: 899,
    stock: 20,
    description: 'Soft and cozy scarf for chilly days.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'One Size',
    isActive: true
  },
  {
    name: 'Hat',
    image: '/public/images/hat.jpg',
    category: 'accessories',
    price: 599,
    originalPrice: 999,
    stock: 12,
    description: 'Stylish hat to complete your look.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'One Size',
    isActive: true
  },
  {
    name: 'Watch',
    image: '/public/images/watch.jpg',
    category: 'accessories',
    price: 1999,
    originalPrice: 2999,
    stock: 8,
    description: 'Elegant watch for every occasion.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'One Size',
    isActive: true
  },
  {
    name: 'Belt',
    image: '/public/images/belt.jpg',
    category: 'accessories',
    price: 399,
    originalPrice: 699,
    stock: 18,
    description: 'Classic belt for a perfect fit.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'M',
    isActive: true
  },
  {
    name: 'Earrings',
    image: '/public/images/earrings.jpg',
    category: 'accessories',
    price: 299,
    originalPrice: 599,
    stock: 25,
    description: 'Beautiful earrings to enhance your style.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'One Size',
    isActive: true
  },
  {
    name: 'Sunglasses',
    image: '/public/images/sunglasses.jpg',
    category: 'accessories',
    price: 799,
    originalPrice: 1299,
    stock: 14,
    description: 'Trendy sunglasses for sunny days.',
    brand: 'Fashion Brand',
    condition: 'new',
    size: 'One Size',
    isActive: true
  }
];

const seedAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harsh:harsh9999hk@cluster0.5ub14.mongodb.net/reown?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products (including accessories) successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedAllProducts(); 