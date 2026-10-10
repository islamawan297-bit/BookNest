const db = require('../config/db');

// Get all books (with optional category and search query)
exports.getAllBooks = async (req, res) => {
    try {
        const { category, search } = req.query;
        let sql = 'SELECT * FROM books WHERE 1=1';
        let params = [];

        if (category && category !== 'All') {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        sql += ' ORDER BY id DESC';

        const books = await db.allAsync(sql, params);
        res.json({ success: true, count: books.length, books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve books.' });
    }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await db.getAsync('SELECT * FROM books WHERE id = ?', [id]);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found.' });
        }

        res.json({ success: true, book });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve book.' });
    }
};

// Create a new book (Admin only)
exports.createBook = async (req, res) => {
    try {
        const { title, author, category, price, stock, cover_image, description, rating } = req.body;

        if (!title || !author || !category || price === undefined || !description) {
            return res.status(400).json({ success: false, message: 'Title, Author, Category, Price, and Description are required.' });
        }

        const defaultCover = cover_image && cover_image.trim() !== '' 
            ? cover_image 
            : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

        const result = await db.runAsync(
            `INSERT INTO books (title, author, category, price, stock, rating, cover_image, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                author.trim(),
                category.trim(),
                parseFloat(price),
                stock ? parseInt(stock) : 10,
                rating ? parseFloat(rating) : 4.5,
                defaultCover.trim(),
                description.trim()
            ]
        );

        const newBook = await db.getAsync('SELECT * FROM books WHERE id = ?', [result.lastID]);

        res.status(201).json({
            success: true,
            message: 'Book created successfully!',
            book: newBook
        });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ success: false, message: 'Failed to create book.' });
    }
};

// Update a book (Admin only)
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, category, price, stock, cover_image, description, rating } = req.body;

        const existingBook = await db.getAsync('SELECT * FROM books WHERE id = ?', [id]);
        if (!existingBook) {
            return res.status(404).json({ success: false, message: 'Book not found.' });
        }

        await db.runAsync(
            `UPDATE books 
             SET title = ?, author = ?, category = ?, price = ?, stock = ?, rating = ?, cover_image = ?, description = ? 
             WHERE id = ?`,
            [
                title ? title.trim() : existingBook.title,
                author ? author.trim() : existingBook.author,
                category ? category.trim() : existingBook.category,
                price !== undefined ? parseFloat(price) : existingBook.price,
                stock !== undefined ? parseInt(stock) : existingBook.stock,
                rating !== undefined ? parseFloat(rating) : existingBook.rating,
                cover_image ? cover_image.trim() : existingBook.cover_image,
                description ? description.trim() : existingBook.description,
                id
            ]
        );

        const updatedBook = await db.getAsync('SELECT * FROM books WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Book updated successfully!',
            book: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ success: false, message: 'Failed to update book.' });
    }
};

// Delete a book (Admin only)
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existingBook = await db.getAsync('SELECT * FROM books WHERE id = ?', [id]);
        if (!existingBook) {
            return res.status(404).json({ success: false, message: 'Book not found.' });
        }

        await db.runAsync('DELETE FROM books WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Book deleted successfully!'
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ success: false, message: 'Failed to delete book.' });
    }
};
