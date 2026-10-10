const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'bookhub.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath);

console.log('Connecting to SQLite database at:', dbPath);

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

db.exec(schemaSql, async (err) => {
    if (err) {
        console.error('Error executing schema:', err);
        process.exit(1);
    }
    console.log('Database schema applied successfully.');

    try {
        await seedUsers();
        await seedBooks();
        await seedMessages();
        await seedOrders();
        console.log('Database seeding complete!');
        db.close();
    } catch (error) {
        console.error('Seeding error:', error);
        db.close();
    }
});

function seedUsers() {
    return new Promise(async (resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
            if (err) return reject(err);
            if (row.count > 0) {
                console.log('Users already exist, skipping user seed.');
                return resolve();
            }

            const adminPass = await bcrypt.hash('admin123', 10);
            const userPass = await bcrypt.hash('user123', 10);

            const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            stmt.run("System Admin", "admin@bookhub.com", adminPass, "admin");
            stmt.run("John Doe", "john@example.com", userPass, "user");
            stmt.run("Jane Smith", "jane@example.com", userPass, "user");
            stmt.finalize((err) => {
                if (err) reject(err);
                else {
                    console.log('Default users created.');
                    resolve();
                }
            });
        });
    });
}

function seedBooks() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
            if (err) return reject(err);
            if (row.count > 0) {
                console.log('Books already exist, skipping book seed.');
                return resolve();
            }

            const books = [
                {
                    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                    author: "Robert C. Martin",
                    category: "Tech & Science",
                    price: 34.99,
                    stock: 15,
                    rating: 4.8,
                    cover_image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
                    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn't have to be that way."
                },
                {
                    title: "The Pragmatic Programmer: Your Journey to Mastery",
                    author: "Andrew Hunt & David Thomas",
                    category: "Tech & Science",
                    price: 42.50,
                    stock: 20,
                    rating: 4.9,
                    cover_image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
                    description: "The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process--taking a requirement and producing working, maintainable code."
                },
                {
                    title: "Atomic Habits",
                    author: "James Clear",
                    category: "Non-Fiction",
                    price: 18.99,
                    stock: 30,
                    rating: 4.9,
                    cover_image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
                    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master tiny behaviors."
                },
                {
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    category: "Fiction",
                    price: 12.99,
                    stock: 25,
                    rating: 4.6,
                    cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
                    description: "Set in Jazz Age New York, the novel tells the tragic story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan, a wealthy young woman whom he loved in his youth."
                },
                {
                    title: "Dune",
                    author: "Frank Herbert",
                    category: "Fantasy",
                    price: 22.00,
                    stock: 18,
                    rating: 4.8,
                    cover_image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
                    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange."
                },
                {
                    title: "Steve Jobs",
                    author: "Walter Isaacson",
                    category: "Biography",
                    price: 24.50,
                    stock: 12,
                    rating: 4.7,
                    cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
                    description: "Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur."
                },
                {
                    title: "Thinking, Fast and Slow",
                    author: "Daniel Kahneman",
                    category: "Business",
                    price: 19.99,
                    stock: 14,
                    rating: 4.6,
                    cover_image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                    description: "In the international bestseller, Thinking, Fast and Slow, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think."
                },
                {
                    title: "To Kill a Mockingbird",
                    author: "Harper Lee",
                    category: "Fiction",
                    price: 14.25,
                    stock: 22,
                    rating: 4.9,
                    cover_image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80",
                    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill A Mockingbird became an instant bestseller and a critical success when it was first published in 1960."
                },
                {
                    title: "Designing Data-Intensive Applications",
                    author: "Martin Kleppmann",
                    category: "Tech & Science",
                    price: 49.99,
                    stock: 8,
                    rating: 5.0,
                    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
                    description: "Data is at the center of many challenges in system design today. Difficult issues such as scalability, consistency, reliability, efficiency, and maintainability need to be figured out. This book helps you navigate this diverse landscape."
                },
                {
                    title: "The Hobbit",
                    author: "J.R.R. Tolkien",
                    category: "Fantasy",
                    price: 16.50,
                    stock: 25,
                    rating: 4.8,
                    cover_image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
                    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any further than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of thirteen dwarves arrive on his doorstep."
                }
            ];

            const stmt = db.prepare("INSERT INTO books (title, author, category, price, stock, rating, cover_image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            books.forEach(b => {
                stmt.run(b.title, b.author, b.category, b.price, b.stock, b.rating, b.cover_image, b.description);
            });
            stmt.finalize((err) => {
                if (err) reject(err);
                else {
                    console.log('Sample books seeded.');
                    resolve();
                }
            });
        });
    });
}

function seedMessages() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM messages", (err, row) => {
            if (err) return reject(err);
            if (row.count > 0) {
                console.log('Messages already exist, skipping message seed.');
                return resolve();
            }

            const stmt = db.prepare("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
            stmt.run("Alice Williams", "alice@example.com", "Bulk Order Inquiry", "Hello, I would like to inquire about discount rates for ordering 50 copies of Clean Code for my tech team.");
            stmt.run("Robert Taylor", "robert@example.com", "Website Feedback", "Loving the user interface! Quick question: will you be adding audiobook selections soon?");
            stmt.finalize((err) => {
                if (err) reject(err);
                else {
                    console.log('Sample messages seeded.');
                    resolve();
                }
            });
        });
    });
}

function seedOrders() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
            if (err) return reject(err);
            if (row.count > 0) {
                console.log('Orders already exist, skipping order seed.');
                return resolve();
            }

            const stmt = db.prepare("INSERT INTO orders (user_id, book_id, quantity, total_price, shipping_address, status) VALUES (?, ?, ?, ?, ?, ?)");
            stmt.run(2, 1, 1, 34.99, "123 Main Street, Suite 400, NY 10001", "Completed");
            stmt.run(2, 3, 2, 37.98, "123 Main Street, Suite 400, NY 10001", "Processing");
            stmt.finalize((err) => {
                if (err) reject(err);
                else {
                    console.log('Sample orders seeded.');
                    resolve();
                }
            });
        });
    });
}
