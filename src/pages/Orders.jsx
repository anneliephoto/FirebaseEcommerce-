import React from "react";
import { Container, Card, Alert, ListGroup } from "react-bootstrap";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function parsePrice(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getUnitPrice(item, order) {
  const directPrice = parsePrice(item.price);
  if (directPrice > 0) {
    return directPrice;
  }

  const lineTotal = parsePrice(item.lineTotal);
  if (lineTotal > 0) {
    const quantity = Number(item.quantity || 1);
    return quantity > 0 ? lineTotal / quantity : 0;
  }

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalQuantity = orderItems.reduce((sum, entry) => sum + Number(entry.quantity || 1), 0);

  if (!totalQuantity) {
    return 0;
  }

  return parsePrice(order.total) / totalQuantity;
}

function getLineTotal(item, order) {
  const quantity = Number(item.quantity || 1);
  const directPrice = parsePrice(item.price);

  if (directPrice > 0) {
    return directPrice * quantity;
  }

  const lineTotal = parsePrice(item.lineTotal);
  if (lineTotal > 0) {
    return lineTotal;
  }

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalQuantity = orderItems.reduce((sum, entry) => sum + Number(entry.quantity || 1), 0);

  if (!totalQuantity) {
    return 0;
  }

  return (parsePrice(order.total) / totalQuantity) * quantity;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const items = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((order) => {
          const orderUserEmail = order.userEmail?.toLowerCase();
          const currentUserEmail = user.email?.toLowerCase();
          const orderUserId = order.userId;
          const currentUserId = user.uid;

          return (
            (orderUserEmail && currentUserEmail && orderUserEmail === currentUserEmail) ||
            (orderUserId && currentUserId && orderUserId === currentUserId)
          );
        })
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });

      setOrders(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to view your order history.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Orders</h2>

      {loading ? (
        <Alert variant="info">Loading your orders...</Alert>
      ) : orders.length === 0 ? (
        <Alert variant="info">You have no orders yet.</Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">Order #{order.id.slice(0, 8)}</h5>
                    <div className="text-muted">
                      Customer: {order.userName || order.userEmail || "Customer"}
                    </div>
                    <div className="text-muted">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : "Recently placed"}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">Total</div>
                    <div className="fw-bold">${(order.total || 0).toFixed(2)}</div>
                  </div>
                </div>

                <ListGroup variant="flush">
                  {(order.items || []).map((item, index) => {
                    const unitPrice = getUnitPrice(item, order);
                    const lineTotal = getLineTotal(item, order);

                    return (
                      <ListGroup.Item key={`${order.id}-${index}`} className="px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div>{item.title} × {item.quantity || 1}</div>
                            <div className="text-muted small">
                              ${unitPrice.toFixed(2)} each
                            </div>
                          </div>
                          <div className="text-end fw-bold">
                            ${lineTotal.toFixed(2)}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
