import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { createProduct } from "../services/firestore";

export default function AddProduct() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !price || !description.trim() || !category.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      price: parseFloat(price),
      description: description.trim(),
      category: category.trim(),
      image: imageUrl.trim() || "https://via.placeholder.com/150",
    };

    setLoading(true);
    try {
      const createdProduct = await createProduct(payload);
      setSuccess(`Product created (id: ${createdProduct.id || "n/a"}).`);
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImageUrl("");
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <h2 className="mb-4">Add Product</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Product Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="imageUrl">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </Form.Group>

        <div className="d-flex">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="me-2"
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/products")}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
}
