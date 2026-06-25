import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import ConfirmModal from "../components/ConfirmModal";
import { addToCart } from "../store/cartSlice";
import { deleteProduct, fetchProductById } from "../services/firestore";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductById(id)
      .then((item) => {
        if (!mounted) return;
        setProduct(item);
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

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );

  if (error)
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  if (!product) return null;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
        <div>
          <Button
            variant="danger"
            className="me-2"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              dispatch(
                addToCart({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                }),
              );
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      {added && (
        <div className="mb-3">
          <Alert variant="success">Added to cart</Alert>
        </div>
      )}

      <Card className="shadow-sm">
        <div className="row g-0">
          <div
            className="col-md-4 d-flex align-items-center justify-content-center p-3"
            style={{ minHeight: 250 }}
          >
            <img
              className="product-image"
              src={product.image}
              alt={product.title}
              style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
          <div className="col-md-8">
            <Card.Body>
              <Card.Title>{product.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Category: {product.category}
              </Card.Subtitle>
              <Card.Text>{product.description}</Card.Text>
              <div className="d-flex align-items-center justify-content-between">
                <div className="fs-4 fw-bold">${product.price.toFixed(2)}</div>
              </div>
              {deleteError && (
                <Alert variant="danger" className="mt-3">
                  {deleteError}
                </Alert>
              )}
            </Card.Body>
          </div>
        </div>
      </Card>
      <ConfirmModal
        show={showDeleteModal}
        title={`Delete product ${product.title}`}
        body={
          "Are you sure you want to delete this product from Firestore?"
        }
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setDeleteError(null);
          setDeleting(true);
          try {
            await deleteProduct(id);
            setShowDeleteModal(false);
            navigate("/products");
          } catch (err) {
            setDeleteError(err.message || "Failed to delete product");
          } finally {
            setDeleting(false);
            setShowDeleteModal(false);
          }
        }}
        loading={deleting}
      />
    </Container>
  );
}
