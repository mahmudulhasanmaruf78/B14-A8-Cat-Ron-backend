const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

const createBooksRouter = (db) => {
  const router = express.Router();
  const booksCollection = db.collection("books");

  // GET /books - Retrieve all books
  router.get("/", async (req, res) => {
    try {
      const { category, search, limit, sort, email } = req.query;
      const query = {};

      if (category && category !== "All") {
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ];
      }

      if (email) {
        query.userEmail = email;
      }

      let cursor = booksCollection.find(query);

      // Sorting
      if (sort === "newest" || !sort) {
        cursor = cursor.sort({ createdAt: -1, _id: -1 });
      } else if (sort === "oldest") {
        cursor = cursor.sort({ createdAt: 1, _id: 1 });
      } else if (sort === "copies-desc") {
        cursor = cursor.sort({ totalCopies: -1 });
      } else if (sort === "copies-asc") {
        cursor = cursor.sort({ totalCopies: 1 });
      }

      // Limit
      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          cursor = cursor.limit(parsedLimit);
        }
      }

      const books = await cursor.toArray();
      res.status(200).json({ success: true, count: books.length, data: books });
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ success: false, message: "Failed to fetch books", error: error.message });
    }
  });

  // GET /books/:id - Retrieve a book by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid book ID format" });
      }

      const book = await booksCollection.findOne({ _id: new ObjectId(id) });
      if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      res.status(200).json({ success: true, data: book });
    } catch (error) {
      console.error("Error fetching book details:", error);
      res.status(500).json({ success: false, message: "Failed to fetch book details", error: error.message });
    }
  });

  // POST /books - Add a new book
  router.post("/", verifyToken, async (req, res) => {
    try {
      const { title, author, category, image, description, userName, userEmail, totalCopies } = req.body;

      if (!title || !author || !category || !image || !description) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields (title, author, category, image, description)",
        });
      }

      const copies = parseInt(totalCopies, 10);
      const parsedCopies = isNaN(copies) || copies < 0 ? 1 : copies;

      // Ensure valid URL or image string
      const sanitizedImage = image.trim();
      if (!sanitizedImage.startsWith("http://") && !sanitizedImage.startsWith("https://") && !sanitizedImage.startsWith("data:image/")) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid image URL for the book cover",
        });
      }

      const newBook = {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        image: image.trim(),
        description: description.trim(),
        userName: userName || req.user.name || "Anonymous",
        userEmail: userEmail || req.user.email,
        totalCopies: parsedCopies,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await booksCollection.insertOne(newBook);
      res.status(201).json({
        success: true,
        message: "Book added successfully to BookNook",
        data: { _id: result.insertedId, ...newBook },
      });
    } catch (error) {
      console.error("Error adding book:", error);
      res.status(500).json({ success: false, message: "Failed to add book", error: error.message });
    }
  });

  // PATCH /books/:id - Update book details
  router.patch("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid book ID format" });
      }

      const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });
      if (!existingBook) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      const { title, author, category, image, description, totalCopies } = req.body;
      const updateDoc = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateDoc.title = title.trim();
      if (author !== undefined) updateDoc.author = author.trim();
      if (category !== undefined) updateDoc.category = category.trim();
      if (image !== undefined) updateDoc.image = image.trim();
      if (description !== undefined) updateDoc.description = description.trim();
      if (totalCopies !== undefined) {
        const copies = parseInt(totalCopies, 10);
        updateDoc.totalCopies = isNaN(copies) || copies < 0 ? 0 : copies;
      }

      const result = await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ success: false, message: "Failed to update book", error: error.message });
    }
  });

  // DELETE /books/:id - Delete a book
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid book ID format" });
      }

      const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Book not found or already deleted" });
      }

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ success: false, message: "Failed to delete book", error: error.message });
    }
  });

  return router;
};

module.exports = createBooksRouter;
