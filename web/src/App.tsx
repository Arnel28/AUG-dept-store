import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

import { useAuth } from "./store/auth";

function NotFound() {
  return (
    <div className="wrap py-32 text-center">
      <p className="font-display text-6xl tracking-tightest">404</p>
      <p className="mt-4 text-muted">We couldn't find that page.</p>
      <Link to="/shop" className="btn-primary mt-8">
        Back to the shop
      </Link>
    </div>
  );
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      {/* Admin Protected Console */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Main Storefront Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

