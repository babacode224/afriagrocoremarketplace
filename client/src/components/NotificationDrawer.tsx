import { useState, useEffect } from "react";
import {
  Bell, X, CheckCheck, Truck, Warehouse, ShoppingBag,
  Leaf, Package, AlertCircle, Info, Star, Clock,
  ChevronRight, Trash2,
} from "lucide-react";

export type NotificationRole = "farmer" | "buyer" | "logistics" | "storage";

interface Notification {
  id: string;
  type: "order" | "request" | "payment" | "alert" | "info" | "review";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  action?: string;
}

// ── Role-specific mock notifications ─────────────────────────────────────────
const NOTIFICATIONS: Record<NotificationRole, Notification[]> = {
  farmer: [
    { id: "f1", type: "order", title: "New Order Received", message: "Kwame Mensah ordered 50 kg of Tomatoes. Confirm within 24 hours.", time: "2 min ago", read: false, icon: ShoppingBag, iconColor: "text-orange-600", iconBg: "bg-orange-50", action: "View Order" },
    { id: "f2", type: "payment", title: "Payment Confirmed", message: "$340.00 has been credited to your wallet for Order #ORD-2041.", time: "1 hr ago", read: false, icon: Package, iconColor: "text-green-600", iconBg: "bg-green-50", action: "View Wallet" },
    { id: "f3", type: "review", title: "New Review", message: "Ama Boateng left a 5-star review on your Yam listing.", time: "3 hrs ago", read: false, icon: Star, iconColor: "text-yellow-500", iconBg: "bg-yellow-50", action: "View Review" },
    { id: "f4", type: "alert", title: "Listing Expiring Soon", message: "Your 'Fresh Maize – 100 kg' listing expires in 2 days. Renew to keep it visible.", time: "5 hrs ago", read: true, icon: AlertCircle, iconColor: "text-red-500", iconBg: "bg-red-50", action: "Renew Listing" },
    { id: "f5", type: "info", title: "Profile Verified", message: "Your farmer profile has been verified. You now have a verified badge.", time: "Yesterday", read: true, icon: Leaf, iconColor: "text-green-600", iconBg: "bg-green-50" },
    { id: "f6", type: "order", title: "Order Delivered", message: "Order #ORD-2038 for Plantains was successfully delivered to the buyer.", time: "2 days ago", read: true, icon: Truck, iconColor: "text-teal-600", iconBg: "bg-teal-50" },
  ],
  buyer: [
    { id: "b1", type: "order", title: "Order Shipped", message: "Your order #ORD-2041 (Tomatoes, 50 kg) has been picked up by SwiftHaul Logistics.", time: "15 min ago", read: false, icon: Truck, iconColor: "text-teal-600", iconBg: "bg-teal-50", action: "Track Order" },
    { id: "b2", type: "alert", title: "Price Drop Alert", message: "Maize prices dropped by 12% in your area. Check the marketplace now.", time: "1 hr ago", read: false, icon: AlertCircle, iconColor: "text-orange-500", iconBg: "bg-orange-50", action: "Shop Now" },
    { id: "b3", type: "payment", title: "Wallet Topped Up", message: "$500.00 has been added to your wallet successfully.", time: "2 hrs ago", read: false, icon: Package, iconColor: "text-green-600", iconBg: "bg-green-50" },
    { id: "b4", type: "order", title: "Order Delivered", message: "Order #ORD-2039 has been delivered. How was your experience?", time: "Yesterday", read: true, icon: CheckCheck, iconColor: "text-green-600", iconBg: "bg-green-50", action: "Leave Review" },
    { id: "b5", type: "info", title: "New Farmers Near You", message: "5 new verified farmers in East Africa region just joined the platform.", time: "2 days ago", read: true, icon: Info, iconColor: "text-blue-500", iconBg: "bg-blue-50", action: "Browse" },
  ],
  logistics: [
    { id: "l1", type: "request", title: "New Delivery Request", message: "Buyer Ama Boateng needs delivery from Nairobi to Accra — 200 kg of Yam. Respond within 2 hrs.", time: "5 min ago", read: false, icon: Truck, iconColor: "text-teal-600", iconBg: "bg-teal-50", action: "View Request" },
    { id: "l2", type: "request", title: "Delivery Request", message: "Kwame Asante needs pickup from Tamale to Nairobi — 500 kg of Maize.", time: "30 min ago", read: false, icon: Truck, iconColor: "text-teal-600", iconBg: "bg-teal-50", action: "View Request" },
    { id: "l3", type: "payment", title: "Payment Received", message: "$620.00 received for completed delivery #DEL-0891.", time: "2 hrs ago", read: false, icon: Package, iconColor: "text-green-600", iconBg: "bg-green-50" },
    { id: "l4", type: "review", title: "New Review", message: "You received a 5-star rating from Buyer Kofi Agyeman for delivery #DEL-0890.", time: "4 hrs ago", read: true, icon: Star, iconColor: "text-yellow-500", iconBg: "bg-yellow-50" },
    { id: "l5", type: "alert", title: "Document Expiring", message: "Your vehicle insurance expires in 14 days. Please upload a renewed copy.", time: "Yesterday", read: true, icon: AlertCircle, iconColor: "text-red-500", iconBg: "bg-red-50", action: "Upload" },
  ],
  storage: [
    { id: "s1", type: "request", title: "New Storage Request", message: "Farmer Yaw Darko wants to store 3 tonnes of Maize starting March 1. Review and confirm.", time: "10 min ago", read: false, icon: Warehouse, iconColor: "text-purple-600", iconBg: "bg-purple-50", action: "View Request" },
    { id: "s2", type: "request", title: "Storage Request", message: "Buyer Akosua Mensah needs cold storage for 1.5 tonnes of Tomatoes for 7 days.", time: "45 min ago", read: false, icon: Warehouse, iconColor: "text-purple-600", iconBg: "bg-purple-50", action: "View Request" },
    { id: "s3", type: "payment", title: "Payment Received", message: "$252.00 received for 3-tonne Maize storage (7 days) — Booking #STR-0412.", time: "3 hrs ago", read: false, icon: Package, iconColor: "text-green-600", iconBg: "bg-green-50" },
    { id: "s4", type: "alert", title: "Capacity Alert", message: "Your facility is at 85% capacity. Consider updating your available capacity listing.", time: "Yesterday", read: true, icon: AlertCircle, iconColor: "text-orange-500", iconBg: "bg-orange-50", action: "Update Listing" },
    { id: "s5", type: "info", title: "Certification Renewed", message: "Your cold storage certification has been renewed and is valid until Dec 2026.", time: "3 days ago", read: true, icon: Info, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
  ],
};

// ── Accent colours per role ───────────────────────────────────────────────────
const ROLE_ACCENT: Record<NotificationRole, string> = {
  farmer: "bg-green-600",
  buyer: "bg-[#E85D04]",
  logistics: "bg-teal-600",
  storage: "bg-purple-600",
};

const ROLE_RING: Record<NotificationRole, string> = {
  farmer: "ring-green-500",
  buyer: "ring-orange-500",
  logistics: "ring-teal-500",
  storage: "ring-purple-500",
};

interface Props {
  role: NotificationRole;
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ role, open, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS[role]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Reset to role-specific notifications when role changes
  useEffect(() => {
    setNotifications(NOTIFICATIONS[role]);
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const clearAll = () => setNotifications([]);

  const accentClass = ROLE_ACCENT[role];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className={`${accentClass} p-5 text-white`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="font-bold text-lg">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/70 text-xs capitalize">{role} notifications</p>
        </div>

        {/* Filter tabs + actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "unread" ? `Unread (${unreadCount})` : "All"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-sm text-gray-400">
                {filter === "unread" ? "You're all caught up!" : "We'll notify you of important updates here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayed.map((notification) => {
                const Icon = notification.icon ?? Info;
                return (
                  <div
                    key={notification.id}
                    className={`relative flex gap-3 px-4 py-4 hover:bg-gray-50 transition-colors group ${
                      !notification.read ? "bg-blue-50/40" : ""
                    }`}
                    onClick={() => markRead(notification.id)}
                  >
                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}

                    {/* Icon */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notification.iconBg ?? "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${notification.iconColor ?? "text-gray-500"}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notification.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" /> {notification.time}
                        </span>
                        {notification.action && (
                          <button className={`text-[10px] font-bold flex items-center gap-0.5 ${
                            role === "farmer" ? "text-green-600" :
                            role === "buyer" ? "text-orange-600" :
                            role === "logistics" ? "text-teal-600" :
                            "text-purple-600"
                          }`}>
                            {notification.action} <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>
    </>
  );
}

// ── Bell button helper ────────────────────────────────────────────────────────
interface BellButtonProps {
  role: NotificationRole;
  onClick: () => void;
  unreadCount?: number;
}

export function NotificationBell({ role, onClick, unreadCount = 0 }: BellButtonProps) {
  const ringClass = ROLE_RING[role];
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 ${ringClass}`}
      aria-label="Open notifications"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
