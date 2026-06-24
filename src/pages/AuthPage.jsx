import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { signup, login, signInWithGoogle } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        await login(email, password);
        setMessage("Logged in successfully.");
      } else {
        await signup(email, password, displayName);
        setMessage("Account created successfully.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");

    try {
      await signInWithGoogle();
      setMessage("Signed in with Google successfully.");
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: "500px" }}>
      <Card>
        <Card.Body>
          <h2 className="mb-4">{isLogin ? "Login" : "Create Account"}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            {!isLogin && (
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </Form>

          <div className="d-grid gap-2 mt-3">
            <Button variant="outline-danger" onClick={handleGoogleSignIn}>
              Continue with Google
            </Button>
          </div>

          <div className="text-center mt-3">
            <Button variant="link" onClick={() => setIsLogin((prev) => !prev)}>
              {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AuthPage;
