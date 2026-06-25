import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import ConfirmModal from "../components/ConfirmModal";
import { deleteProduct, fetchProducts } from "../services/firestore";

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    fetchProducts()
      .then((items) => {
        if (!mounted) return;
        setProducts(items || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to fetch products");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // continue rendering the list; display any delete errors above the list

  return (
    <Container className="py-5">
      {deleteError && (
        <Alert variant="danger" className="mb-3">
          {deleteError}
        </Alert>
      )}
      <h2 className="mb-4">The Collection</h2>
      {products.length === 0 && (
        <Alert variant="info">No products available.</Alert>
      )}
      <Row className="g-4">
        {products.map((p) => (
          <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              className="h-100 shadow-sm product-list-card"
              onClick={() => navigate(`/products/${p.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/products/${p.id}`);
                }
              }}
            >
              <div
                className="product-image-container d-flex align-items-center justify-content-center"
                style={{ height: 200, overflow: "hidden" }}
              >
                <Card.Img
                  className="product-image"
                  variant="top"
                  src={p.image}
                  alt={p.title}
                  style={{
                    maxHeight: "100%",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6" title={p.title}>
                  {p.title}
                </Card.Title>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <div className="fw-bold">${p.price.toFixed(2)}</div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${p.id}`);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteError(null);
                        setSelectedDelete(p);
                        setShowDeleteModal(true);
                      }}
                      disabled={deletingIds.includes(p.id)}
                    >
                      {deletingIds.includes(p.id) ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <ConfirmModal
        show={showDeleteModal}
        title={
          selectedDelete
            ? `Delete product ${selectedDelete.title}`
            : "Delete product"
        }
        body={
          "Are you sure you want to delete this product from Firestore?"
        }
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedDelete(null);
        }}
        onConfirm={async () => {
          if (!selectedDelete) return;
          const id = selectedDelete.id;
          setDeleteError(null);
          setDeletingIds((s) => [...s, id]);
          try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((x) => x.id !== id));
            setShowDeleteModal(false);
            setSelectedDelete(null);
          } catch (err) {
            setDeleteError(err.message || "Failed to delete product");
          } finally {
            setDeletingIds((s) => s.filter((x) => x !== id));
          }
        }}
        loading={
          selectedDelete ? deletingIds.includes(selectedDelete.id) : false
        }
      />
    </Container>
  );
}
