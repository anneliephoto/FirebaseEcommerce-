import React from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, updateUserProfile, deleteUserAccount } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState(profile?.displayName || user?.displayName || "");
  const [address, setAddress] = React.useState(profile?.address || "");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  React.useEffect(() => {
    setDisplayName(profile?.displayName || user?.displayName || "");
    setAddress(profile?.address || "");
  }, [profile, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await updateUserProfile(displayName, address);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await deleteUserAccount();
      navigate("/auth");
    } catch (err) {
      setError(err.message || "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <h2 className="mb-4">My Profile</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSave}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={user.email || ""} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Save Profile"}
        </Button>
      </Form>

      <hr className="my-4" />

      <Button variant="danger" onClick={handleDelete} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Delete Account"}
      </Button>
    </Container>
  );
}
