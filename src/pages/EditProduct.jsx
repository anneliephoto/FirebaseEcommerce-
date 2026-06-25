import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { fetchProductById, updateProduct } from "../services/firestore";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductById(id)
      .then((product) => {
        if (!mounted) return;
        if (!product) {
          setError("Product not found.");
          return;
        }
        setTitle(product.title || "");
        setPrice(product.price != null ? String(product.price) : "");
        setDescription(product.description || "");
        setCategory(product.category || "");
        setImageUrl(product.image || "");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load product");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

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

    setSaving(true);
    try {
      await updateProduct(id, payload);
      setSuccess(`Product updated (id: ${id}).`);
      setTimeout(() => navigate(`/products/${id}`), 1000);
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <h2 className="mb-4">Edit Product</h2>

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
            disabled={saving}
            className="me-2"
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
}
