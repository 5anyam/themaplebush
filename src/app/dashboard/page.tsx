"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import { Package, Clock, CheckCircle, XCircle, Truck, LogOut, User, Mail } from "lucide-react";
import Link from "next/link";

interface Order {
  id: number;
  order_key: string;
  status: string;
  total: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
  payment_method_title: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch orders with proper debugging
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        // ✅ Debug: Check user ID
        console.log('🔍 Fetching orders for user:', {
          id: user.id,
          email: user.email,
          username: user.username
        });

        // ✅ Check if user ID exists
        if (!user.id || user.id === 0) {
          throw new Error('Invalid user ID. Please login again.');
        }

        const apiUrl = `https://cms.kdbookbazaar.com/wp-json/wc/v3/orders`;
        const auth = btoa(
          `${process.env.NEXT_PUBLIC_CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7'}:${process.env.NEXT_PUBLIC_CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848'}`
        );

        console.log('📡 API URL:', `${apiUrl}?customer=${user.id}`);

        const response = await fetch(
          `${apiUrl}?customer=${user.id}&per_page=50&order=desc`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Orders fetched:', data.length, 'orders');
        console.log('Orders data:', data);

        setOrders(data);
      } catch (err) {
        console.error('💥 Fetch error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load orders. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Truck className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e734d] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light text-[#2d2416] mb-2">
                Welcome, {user.first_name || user.username}!
              </h1>
              <p className="text-gray-600 text-sm">Manage your orders and account</p>
              {/* ✅ Debug info */}
              <p className="text-xs text-gray-400 mt-1">User ID: {user.id}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-6 py-2 border-2 border-[#9e734d] text-[#2d2416] rounded-lg hover:bg-[#9e734d]/10 transition-all text-sm font-medium"
              >
                Continue Shopping
              </Link>
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-[#fdf6e9] border border-[#9e734d]/20 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#2d2416] mb-4">Account Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9e734d]/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#9e734d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-[#2d2416]">
                  {user.first_name} {user.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9e734d]/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#9e734d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-[#2d2416]">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9e734d]/10 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-[#9e734d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-sm font-medium text-[#2d2416]">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#2d2416] mb-6">Your Orders</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e734d] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-gray-500 mb-4">Check browser console for details</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#9e734d] text-white rounded-lg hover:bg-[#8a6342] transition-all"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No orders yet</p>
              <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-gradient-to-r from-[#9e734d] to-[#b8834f] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-[#9e734d]/50 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#2d2416]">
                          Order #{order.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.date_created)}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-semibold text-[#9e734d]">
                        ₹{parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[#2d2416] mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.line_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{parseFloat(item.total).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/order-confirmation?wcOrderId=${order.id}`}
                      className="px-4 py-2 bg-[#9e734d] text-white rounded-lg hover:bg-[#8a6342] transition-all text-sm font-medium inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
