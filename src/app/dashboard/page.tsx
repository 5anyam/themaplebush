"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import {
  Package, Clock, CheckCircle, XCircle, Truck, LogOut,
  User, Mail, RefreshCw, AlertCircle, ShoppingBag,
  ChevronDown, ChevronUp, X, RotateCcw, Phone,
  MapPin, Edit2, Save, Loader2, CreditCard, Circle,
} from "lucide-react";
import Link from "next/link";

/**
 * Everything here goes through /api/account/*, which reads the signed-in
 * customer from an httpOnly session cookie. The browser never holds WooCommerce
 * keys and never tells the server which customer it is — so one shopper cannot
 * read another's orders by editing anything client-side.
 */

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

interface LineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  slug: string;
  image: string;
}

interface TimelineEvent {
  key: string;
  label: string;
  description: string;
  date: string;
}

interface Order {
  id: number;
  number: string;
  status: string;
  total: string;
  subtotal: string;
  shipping_total: string;
  discount_total: string;
  payment_method_title: string;
  date_created: string;
  item_count: number;
  can_cancel: boolean;
  line_items: LineItem[];
  billing?: Record<string, string>;
  shipping?: Record<string, string>;
  timeline?: TimelineEvent[];
}

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed:  'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  'on-hold':  'bg-orange-100 text-orange-800 border-orange-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
  failed:     'bg-red-100 text-red-800 border-red-200',
  refunded:   'bg-purple-100 text-purple-800 border-purple-200',
};

function StatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    completed:  <CheckCircle className="w-3 h-3" />,
    processing: <Truck className="w-3 h-3" />,
    pending:    <Clock className="w-3 h-3" />,
    'on-hold':  <Clock className="w-3 h-3" />,
    cancelled:  <XCircle className="w-3 h-3" />,
    failed:     <XCircle className="w-3 h-3" />,
    refunded:   <RotateCcw className="w-3 h-3" />,
  };

  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const icon = icons[status] || <Package className="w-3 h-3" />;
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>
      {icon}{label}
    </span>
  );
}

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

const money = (v: string | number) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

/* ── Order timeline ──────────────────────────────────────────────────────
   Milestones come from the order itself; the "Update" rows are the shop's
   customer-visible order notes, so tracking numbers show up here too. */
function OrderTimeline({ events, status }: { events: TimelineEvent[]; status: string }) {
  if (!events.length) {
    return (
      <p className="text-xs" style={{ color: 'rgba(42,10,34,.45)' }}>
        No updates yet. We&apos;ll post here as your order moves.
      </p>
    );
  }

  const tone = (key: string) =>
    key === 'cancelled' || key === 'refunded'
      ? { dot: '#b3261e', ring: 'rgba(179,38,30,.16)' }
      : { dot: '#E11D74', ring: 'rgba(225,29,116,.14)' };

  return (
    <ol className="relative">
      {events.map((event, i) => {
        const last = i === events.length - 1;
        const { dot, ring } = tone(event.key);
        // The newest event is where the order stands right now.
        const current = last && !['cancelled', 'refunded', 'completed'].includes(status);

        return (
          <li key={`${event.key}-${event.date}-${i}`} className="flex gap-3 pb-5 last:pb-0 relative">
            {/* Connector */}
            {!last && (
              <span
                className="absolute left-[7px] top-4 bottom-0 w-px"
                style={{ background: '#FFE9DD' }}
                aria-hidden
              />
            )}

            <span
              className="relative z-10 mt-1 w-[15px] h-[15px] rounded-full grid place-items-center flex-shrink-0"
              style={{ background: ring }}
            >
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-[13px] font-bold" style={{ color: '#2A0A22' }}>{event.label}</p>
                {current && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: '#FFE9DD', color: '#E11D74' }}>
                    Now
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: 'rgba(42,10,34,.65)' }}>
                  {event.description}
                </p>
              )}
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(42,10,34,.4)' }}>
                {formatDateTime(event.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrderId = Number(searchParams.get('order') || 0);
  const { user, loading: authLoading, logout, refresh } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(newOrderId || null);

  /** Full order payloads (line items, addresses, timeline), fetched on expand. */
  const [details, setDetails] = useState<Record<number, Order>>({});
  const [detailLoading, setDetailLoading] = useState<number | null>(null);

  const newOrderRef = useRef<HTMLDivElement>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    first_name: '', last_name: '', phone: '',
    address_1: '', city: '', state: '', postcode: '',
  });

  const [cancelFor, setCancelFor] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Not signed in → send to login and come back here afterwards.
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/dashboard');
  }, [authLoading, user, router]);

  // Seed the profile form from the session user.
  useEffect(() => {
    if (!user) return;
    const b = user.billing || {};
    setProfileForm({
      first_name: user.first_name || b.first_name || '',
      last_name: user.last_name || b.last_name || '',
      phone: b.phone || '',
      address_1: b.address_1 || '',
      city: b.city || '',
      state: b.state || '',
      postcode: b.postcode || '',
    });
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await fetch('/api/account/orders', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not load your orders.');
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Could not load your orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchOrders();
  }, [user, fetchOrders]);

  /** Load the full order the first time a card is opened. */
  const loadDetail = useCallback(async (id: number) => {
    if (details[id]) return;
    setDetailLoading(id);
    try {
      const res = await fetch(`/api/account/orders/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.order) {
        setDetails((prev) => ({ ...prev, [id]: data.order as Order }));
      }
    } catch {
      /* the summary stays visible; the detail just won't expand */
    } finally {
      setDetailLoading(null);
    }
  }, [details]);

  const toggleOrder = (id: number) => {
    const next = expandedOrder === id ? null : id;
    setExpandedOrder(next);
    if (next) void loadDetail(next);
  };

  // Auto-open and scroll to the order just placed.
  useEffect(() => {
    if (!ordersLoading && newOrderId) {
      void loadDetail(newOrderId);
      const t = setTimeout(() => {
        newOrderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [ordersLoading, newOrderId, loadDetail]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await fetch('/api/account/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not save your details.');
      setProfileSuccess('Saved.');
      setEditingProfile(false);
      await refresh();
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save your details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelFor) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/account/orders/${cancelFor}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not cancel this order.');

      const updated = data.order as Order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setDetails((prev) => ({ ...prev, [updated.id]: updated }));
      setCancelFor(null);
      setCancelReason('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not cancel this order.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6EF' }}>
        <div className="w-10 h-10 border-2 border-[#FFE9DD] border-t-[#E11D74] rounded-full animate-spin" />
      </main>
    );
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">My Account</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(42,10,34,.5)' }}>
              Welcome back, {displayName}
            </p>
          </div>
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[13px] font-semibold transition-colors hover:bg-[#FFE9DD]"
            style={{ borderColor: '#FFE9DD' }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        {/* ── PROFILE ── */}
        <section className="bg-white rounded-2xl border p-5 sm:p-6" style={{ borderColor: '#FFE9DD' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#E11D74' }} /> Details
            </h2>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
                style={{ color: '#E11D74' }}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {profileError && (
            <p className="mb-3 text-[13px] flex items-center gap-1.5 text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{profileError}
            </p>
          )}
          {profileSuccess && (
            <p className="mb-3 text-[13px] flex items-center gap-1.5 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />{profileSuccess}
            </p>
          )}

          {editingProfile ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {([
                ['first_name', 'First name'], ['last_name', 'Last name'],
                ['phone', 'Phone'], ['address_1', 'Address'],
                ['city', 'City'], ['postcode', 'PIN code'],
              ] as const).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(42,10,34,.5)' }}>{label}</span>
                  <input
                    value={profileForm[key]}
                    onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 text-sm focus:outline-none focus:border-[#E11D74] transition-colors"
                    style={{ borderColor: '#FFE9DD', background: '#FFF6EF' }}
                  />
                </label>
              ))}
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(42,10,34,.5)' }}>State</span>
                <select
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 text-sm focus:outline-none focus:border-[#E11D74] transition-colors"
                  style={{ borderColor: '#FFE9DD', background: '#FFF6EF' }}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="mag-btn text-[14px] px-6 py-3 disabled:opacity-60"
                >
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {profileSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingProfile(false); setProfileError(''); }}
                  className="px-6 py-3 rounded-full border-2 text-[14px] font-semibold"
                  style={{ borderColor: '#FFE9DD' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={profileForm.phone || '—'} />
              <InfoRow
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Address"
                value={[profileForm.address_1, profileForm.city, profileForm.state, profileForm.postcode].filter(Boolean).join(', ') || '—'}
              />
            </div>
          )}
        </section>

        {/* ── ORDERS ── */}
        <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#FFE9DD' }}>
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b" style={{ borderColor: '#FFE9DD' }}>
            <h2 className="font-serif text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" style={{ color: '#E11D74' }} /> Orders
            </h2>
            <button
              onClick={() => void fetchOrders()}
              disabled={ordersLoading}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold disabled:opacity-50"
              style={{ color: '#E11D74' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div className="py-14 grid place-items-center">
              <div className="w-8 h-8 border-2 border-[#FFE9DD] border-t-[#E11D74] rounded-full animate-spin" />
            </div>
          ) : ordersError ? (
            <div className="py-10 px-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: '#E11D74' }} />
              <p className="text-sm mb-4" style={{ color: 'rgba(42,10,34,.6)' }}>{ordersError}</p>
              <button onClick={() => void fetchOrders()} className="mag-btn text-[14px] px-6 py-3">Try again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: '#FFE9DD' }}>
                <Package className="w-6 h-6" style={{ color: '#E11D74' }} />
              </div>
              <h3 className="font-serif text-lg font-bold mb-1">No orders yet</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(42,10,34,.5)' }}>
                Once you order something, it&apos;ll show up here with live updates.
              </p>
              <Link href="/collections" className="mag-btn text-[14px] px-7 py-3.5">Start shopping</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#FFE9DD' }}>
              {orders.map((order) => {
                const open = expandedOrder === order.id;
                const detail = details[order.id];

                return (
                  <div
                    key={order.id}
                    ref={order.id === newOrderId ? newOrderRef : undefined}
                    style={order.id === newOrderId ? { background: 'rgba(255,233,221,.35)' } : undefined}
                  >
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="w-full px-5 sm:px-6 py-4 text-left hover:bg-[#FFF6EF] transition-colors"
                      aria-expanded={open}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-[14px]">Order #{order.number}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-[12px]" style={{ color: 'rgba(42,10,34,.5)' }}>
                            {formatDate(order.date_created)} · {order.item_count} item{order.item_count === 1 ? '' : 's'} · {money(order.total)}
                          </p>
                        </div>
                        <span className="flex-shrink-0 mt-1" style={{ color: 'rgba(42,10,34,.4)' }}>
                          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </div>
                    </button>

                    {open && (
                      <div className="px-5 sm:px-6 pb-6 -mt-1">
                        {detailLoading === order.id && !detail ? (
                          <div className="py-8 grid place-items-center">
                            <div className="w-6 h-6 border-2 border-[#FFE9DD] border-t-[#E11D74] rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Items + totals */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(42,10,34,.45)' }}>
                                Items
                              </h4>
                              <ul className="space-y-2.5 mb-4">
                                {(detail?.line_items || order.line_items || []).map((item) => (
                                  <li key={item.id} className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#FFE9DD' }}>
                                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      {item.slug ? (
                                        <Link href={`/product/${item.slug}`} className="text-[13px] font-semibold leading-snug line-clamp-2 hover:text-[#E11D74] transition-colors">
                                          {item.name}
                                        </Link>
                                      ) : (
                                        <p className="text-[13px] font-semibold leading-snug line-clamp-2">{item.name}</p>
                                      )}
                                      <p className="text-[11.5px]" style={{ color: 'rgba(42,10,34,.45)' }}>Qty {item.quantity}</p>
                                    </div>
                                    <span className="text-[13px] font-bold whitespace-nowrap">{money(item.total)}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="rounded-xl p-3.5 space-y-1.5 text-[12.5px]" style={{ background: '#FFF6EF' }}>
                                {detail && (
                                  <>
                                    <Row label="Subtotal" value={money(detail.subtotal)} />
                                    {Number(detail.discount_total) > 0 && (
                                      <Row label="Discount" value={`− ${money(detail.discount_total)}`} />
                                    )}
                                    <Row label="Shipping" value={Number(detail.shipping_total) > 0 ? money(detail.shipping_total) : 'Free'} />
                                  </>
                                )}
                                <div className="flex items-center justify-between pt-1.5 border-t font-bold" style={{ borderColor: '#FFE9DD' }}>
                                  <span>Total</span><span>{money(order.total)}</span>
                                </div>
                                {order.payment_method_title && (
                                  <p className="flex items-center gap-1.5 pt-1" style={{ color: 'rgba(42,10,34,.5)' }}>
                                    <CreditCard className="w-3.5 h-3.5" />{order.payment_method_title}
                                  </p>
                                )}
                              </div>

                              {detail?.billing && (
                                <div className="mt-4">
                                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(42,10,34,.45)' }}>
                                    Delivering to
                                  </h4>
                                  <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(42,10,34,.65)' }}>
                                    {[detail.billing.first_name, detail.billing.last_name].filter(Boolean).join(' ')}<br />
                                    {[detail.billing.address_1, detail.billing.address_2].filter(Boolean).join(', ')}<br />
                                    {[detail.billing.city, detail.billing.state, detail.billing.postcode].filter(Boolean).join(', ')}
                                    {detail.billing.phone && <><br />{detail.billing.phone}</>}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Timeline */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(42,10,34,.45)' }}>
                                Timeline
                              </h4>
                              {detail
                                ? <OrderTimeline events={detail.timeline || []} status={detail.status} />
                                : <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(42,10,34,.45)' }}>
                                    <Circle className="w-3 h-3" /> Loading updates…
                                  </p>
                              }

                              {(detail?.can_cancel ?? order.can_cancel) && (
                                <button
                                  onClick={() => { setCancelFor(order.id); setActionError(''); setCancelReason(''); }}
                                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-[13px] font-semibold transition-colors hover:bg-red-50"
                                  style={{ borderColor: '#f3c9c7', color: '#b3261e' }}
                                >
                                  <XCircle className="w-4 h-4" /> Cancel this order
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── CANCEL CONFIRMATION ── */}
      {cancelFor !== null && (
        <div
          className="fixed inset-0 z-[1000] grid place-items-center px-4"
          style={{ background: 'rgba(42,10,34,.55)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel order"
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-serif text-lg font-bold">Cancel order #{cancelFor}?</h3>
              <button onClick={() => setCancelFor(null)} aria-label="Close" style={{ color: 'rgba(42,10,34,.4)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(42,10,34,.6)' }}>
              This can&apos;t be undone. If you already paid, the refund is processed
              separately within 5–7 business days.
            </p>

            <label className="block mb-4">
              <span className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(42,10,34,.5)' }}>
                Reason (optional)
              </span>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Changed my mind, ordered the wrong size…"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 text-sm focus:outline-none focus:border-[#E11D74] transition-colors"
                style={{ borderColor: '#FFE9DD', background: '#FFF6EF' }}
              />
            </label>

            {actionError && (
              <p className="mb-3 text-[13px] flex items-center gap-1.5 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{actionError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white text-[14px] font-bold disabled:opacity-60"
                style={{ background: '#b3261e' }}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLoading ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
              <button
                onClick={() => setCancelFor(null)}
                className="px-5 py-3 rounded-full border-2 text-[14px] font-semibold"
                style={{ borderColor: '#FFE9DD' }}
              >
                Keep order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'rgba(42,10,34,.5)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0" style={{ color: '#E11D74' }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(42,10,34,.45)' }}>{label}</p>
        <p className="text-[13.5px] break-words">{value}</p>
      </div>
    </div>
  );
}
