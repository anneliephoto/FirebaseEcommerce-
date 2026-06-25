import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { addToCart } from "../store/cartSlice";
import { fetchProducts } from "../services/firestore";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";

function fetchCategories() {
  return fetchProducts().then((products = []) => [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ]);
}

function fetchProductsByCategory(category) {
  return fetchProducts().then((products = []) =>
    products.filter((product) => product.category === category),
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
  } = useQuery({
    queryKey:
      selectedCategory === "all"
        ? ["products", "all"]
        : ["products", "category", selectedCategory],
    queryFn: () =>
      selectedCategory === "all"
        ? fetchProducts()
        : fetchProductsByCategory(selectedCategory),
  });

  return (
    <div className="home-hero">
      <Container className="py-5">
        <Row className="justify-content-center mb-4">
          <Col lg={10}>
            <h1 className="mb-3">Luxecommerce Collection</h1>
            <p className="mb-3">
              Browse products stored in Firestore and add them to your shopping cart.
            </p>

            <Form.Group className="mb-4" controlId="categoryFilter">
              <Form.Label>Filter by Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {categoriesError && (
              <Alert variant="danger" className="mb-4">
                {categoriesErrorObj?.message || "Failed to load categories."}
              </Alert>
            )}

            {productsLoading && (
              <div className="text-center py-4">
                <Spinner animation="border" role="status" />
              </div>
            )}

            {productsError && (
              <Alert variant="danger">
                {productsErrorObj?.message || "Failed to load products."}
              </Alert>
            )}

            {!productsLoading && !productsError && (
              <Row className="g-4">
                {products.map((product) => (
                  <Col key={product.id} xs={12} sm={6} lg={4}>
                    <Card className="h-100 shadow-sm">
                      <div
                        className="product-image-container d-flex align-items-center justify-content-center p-3"
                        style={{ height: 220 }}
                      >
                        <Card.Img
                          className="product-image"
                          variant="top"
                          src={product.image}
                          alt={product.title}
                          style={{ maxHeight: "100%", objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6" title={product.title}>
                          {product.title}
                        </Card.Title>
                        <Card.Text className="mb-1">
                          <strong>Category:</strong> {product.category}
                        </Card.Text>
                        <Card.Text className="mb-1">
                          <strong>Price:</strong> ${Number(product.price || 0).toFixed(2)}
                        </Card.Text>
                        <Card.Text className="small text-muted mb-3">
                          {product.description}
                        </Card.Text>
                        <Button
                          className="mt-auto"
                          variant="primary"
                          onClick={() =>
                            dispatch(
                              addToCart({
                                id: product.id,
                                title: product.title,
                                price: product.price,
                                image: product.image,
                              }),
                            )
                          }
                        >
                          Add to Cart
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
