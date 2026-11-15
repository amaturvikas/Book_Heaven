const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');
const User = require('../models/User');
const Book = require('../models/Book');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookheaven';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Connected. Seeding initial data...');

    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        name: process.env.ADMIN_NAME || 'Book Heaven Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin'
      });
      console.log(`[Seed] Admin created: ${admin.email}`);
    } else {
      console.log(`[Seed] Admin already exists: ${admin.email}`);
    }

    // 2. Seed Delivery Boys
    const deliveryBoysData = [
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@bookheaven.com',
        phone: '9811223344',
        employeeId: 'DB-101',
        password: 'Delivery@123',
        address: 'Sector 15, Rohini, New Delhi - 110085',
        vehicleDetails: { vehicleType: 'Bike', vehicleNumber: 'DL-01-AB-1234' },
        status: 'Active'
      },
      {
        name: 'Amit Verma',
        email: 'amit@bookheaven.com',
        phone: '9822334455',
        employeeId: 'DB-102',
        password: 'Delivery@123',
        address: 'Mayur Vihar Phase 1, New Delhi - 110091',
        vehicleDetails: { vehicleType: 'Scooter', vehicleNumber: 'DL-04-XY-5678' },
        status: 'Active'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@bookheaven.com',
        phone: '9833445566',
        employeeId: 'DB-103',
        password: 'Delivery@123',
        address: 'Lajpat Nagar 4, New Delhi - 110024',
        vehicleDetails: { vehicleType: 'Electric Scooter', vehicleNumber: 'DL-07-EV-9900' },
        status: 'Active'
      }
    ];

    for (const dbData of deliveryBoysData) {
      const exists = await DeliveryBoy.findOne({ email: dbData.email });
      if (!exists) {
        await DeliveryBoy.create(dbData);
        console.log(`[Seed] Delivery Boy created: ${dbData.name} (${dbData.employeeId})`);
      }
    }

    // 3. Seed Sample Customer
    const customerEmail = 'customer@example.com';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = await User.create({
        name: 'Priya Sharma',
        email: customerEmail,
        password: 'Customer@123',
        phone: '9876543210',
        addresses: [{
          street: 'Flat 402, Green Valley Apartments, Janakpuri',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110058',
          country: 'India',
          isDefault: true
        }]
      });
      console.log(`[Seed] Customer created: ${customer.email}`);
    }

    // 4. Seed Diverse Book Catalogue
    const booksCount = await Book.countDocuments();
    if (booksCount < 10) {
      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          category: 'Fiction',
          description: 'A classic 1925 novel following the mysterious Jay Gatsby and his obsessive quest for the beautiful Daisy Buchanan.',
          purchasePrice: 399,
          rentalPricePerDay: 15,
          totalStock: 25,
          availableStock: 25,
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
          isbn: '9780743273565',
          isFeatured: true
        },
        {
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          category: 'Romance',
          description: 'The celebrated romantic comedy of manners depicting turbulent relationships among the gentry of Regency England.',
          purchasePrice: 299,
          rentalPricePerDay: 12,
          totalStock: 20,
          availableStock: 20,
          coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
          isbn: '9780141439518',
          isFeatured: true
        },
        {
          title: 'The Da Vinci Code',
          author: 'Dan Brown',
          category: 'Mystery',
          description: 'A gripping mystery thriller following symbologist Robert Langdon as he investigates a murder in Paris Louvre Museum.',
          purchasePrice: 450,
          rentalPricePerDay: 20,
          totalStock: 18,
          availableStock: 18,
          coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
          isbn: '9780307474278',
          isFeatured: true
        },
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          category: 'Fantasy',
          description: 'The enchanting prelude to The Lord of the Rings, following Bilbo Baggins on an epic quest to reclaim the Lonely Mountain.',
          purchasePrice: 499,
          rentalPricePerDay: 25,
          totalStock: 30,
          availableStock: 30,
          coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&q=80&w=600',
          isbn: '9780547928227',
          isFeatured: true
        },
        {
          title: 'Dune',
          author: 'Frank Herbert',
          category: 'Science Fiction',
          description: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides and the battle for the universes most vital resource.',
          purchasePrice: 599,
          rentalPricePerDay: 30,
          totalStock: 22,
          availableStock: 22,
          coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600',
          isbn: '9780441013593',
          isFeatured: true
        },
        {
          title: 'Sapiens: A Brief History of Humankind',
          author: 'Yuval Noah Harari',
          category: 'History',
          description: 'Explores how an insignificant ape became the ruler of planet Earth, covering cognition, agricultural evolution, and technology.',
          purchasePrice: 499,
          rentalPricePerDay: 20,
          totalStock: 35,
          availableStock: 35,
          coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
          isbn: '9780062316097',
          isFeatured: true
        },
        {
          title: 'Steve Jobs',
          author: 'Walter Isaacson',
          category: 'Biography',
          description: 'The exclusive biography based on more than forty interviews with Steve Jobs conducted over two years.',
          purchasePrice: 650,
          rentalPricePerDay: 30,
          totalStock: 15,
          availableStock: 15,
          coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd9?auto=format&fit=crop&q=80&w=600',
          isbn: '9781451648539',
          isFeatured: false
        },
        {
          title: 'Zero to One',
          author: 'Peter Thiel',
          category: 'Business',
          description: 'Notes on startups, building the future, and how to create new value in business and modern entrepreneurship.',
          purchasePrice: 380,
          rentalPricePerDay: 18,
          totalStock: 25,
          availableStock: 25,
          coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
          isbn: '9780804139298',
          isFeatured: true
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          category: 'Technology',
          description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Master software craft.',
          purchasePrice: 799,
          rentalPricePerDay: 35,
          totalStock: 20,
          availableStock: 20,
          coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
          isbn: '9780132350884',
          isFeatured: true
        },
        {
          title: 'Atomic Habits',
          author: 'James Clear',
          category: 'Self-Help',
          description: 'An easy and proven way to build good habits and break bad ones. Practical strategies that teach you exactly how to form good habits.',
          purchasePrice: 450,
          rentalPricePerDay: 20,
          totalStock: 40,
          availableStock: 40,
          coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600',
          isbn: '9780735211292',
          isFeatured: true
        },
        {
          title: 'The Little Prince',
          author: 'Antoine de Saint-Exupéry',
          category: 'Children',
          description: 'A poetic tale of a young prince who visits various planets in space, addressing themes of loneliness, friendship, love, and loss.',
          purchasePrice: 249,
          rentalPricePerDay: 10,
          totalStock: 15,
          availableStock: 15,
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          isbn: '9780156012195',
          isFeatured: false
        },
        {
          title: 'Watchmen',
          author: 'Alan Moore',
          category: 'Comics',
          description: 'A groundbreaking graphic novel that deconstructs the superhero concept and examines power, ethics, and human nature.',
          purchasePrice: 899,
          rentalPricePerDay: 40,
          totalStock: 12,
          availableStock: 12,
          coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600',
          isbn: '9781401245252',
          isFeatured: false
        }
      ];

      await Book.insertMany(sampleBooks);
      console.log(`[Seed] Seeded ${sampleBooks.length} sample books across multiple categories.`);
    }

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
