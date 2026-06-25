import React from "react";
import { useSelector } from "react-redux";
import {
  createHashRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";
import { Navbar, Nav, Container as RBContainer } from "react-bootstrap";
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function AppLayout() {
  const items = useSelector((state) => state.cart.items);
  const { user, logout } = useAuth();

  const count = items.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <>
      <Navbar
        expand="md"
        className="navbar-modern"
      >
        <RBContainer>
          <Navbar.Brand
            as={Link}
            to="/"
            className="brand-modern"
          >
            <span className="brand-letter">L</span>uxEcommerce
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" />

          <Navbar.Collapse id="main-nav" className="justify-content-end">
            <Nav className="nav-modern">
              <Nav.Link
                as={Link}
                to="/"
                className="nav-link-modern"
              >
                Home
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/products"
                className="nav-link-modern"
              >
                Products
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/add-product"
                className="nav-link-modern"
              >
                Add Product
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/cart"
                className="nav-link-modern"
              >
                Cart{" "}
                <span className="cart-count-modern">({count})</span>
              </Nav.Link>

              {user ? (
                <>
                  <Nav.Link as={Link} to="/orders" className="nav-link-modern">
                    Orders
                  </Nav.Link>
                  <Nav.Link as={Link} to="/profile" className="nav-link-modern">
                    Profile
                  </Nav.Link>
                  <Nav.Link as="button" className="nav-link-modern" onClick={() => logout()}>
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/auth" className="nav-link-modern">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/profile" className="nav-link-modern">
                    Profile
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </RBContainer>
      </Navbar>

      <Outlet />
    </>
  );
}

const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <ProductListing /> },
      { path: "add-product", element: <AddProduct /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "products/:id/edit", element: <EditProduct /> },
      { path: "cart", element: <Cart /> },
      { path: "orders", element: <Orders /> },
      { path: "profile", element: <Profile /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;