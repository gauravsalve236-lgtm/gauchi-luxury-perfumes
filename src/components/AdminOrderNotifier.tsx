"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Volume2, VolumeX } from "lucide-react";

export default function AdminOrderNotifier() {
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const lastKnownOrderId = useRef<string | null>(null);

  // Synthesize a crystal-clear cash register / luxury chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const now = audioCtx.currentTime;
      // Tone 1: 587.33 Hz (D5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Tone 2: 880 Hz (A5 - High chime)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);

      // Mobile vibration
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 300]);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  };

  // Request browser push notification permissions
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsAllowed(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          setNotificationsAllowed(perm === "granted");
        });
      }
    }
  }, []);

  // Poll for new orders every 12 seconds
  useEffect(() => {
    let isMounted = true;

    async function checkNewOrders() {
      try {
        const res = await fetch("/api/orders?page=1&limit=1");
        if (!res.ok) return;
        const data = await res.json();
        const newest = data.orders?.[0];

        if (!newest) return;

        // On first load, record initial latest order without firing alert
        if (lastKnownOrderId.current === null) {
          lastKnownOrderId.current = newest.id;
          return;
        }

        // Detect new order arrival
        if (newest.id !== lastKnownOrderId.current) {
          lastKnownOrderId.current = newest.id;

          if (isMounted) {
            setLatestOrder(newest);
            playChime();

            // Native OS Phone / Desktop Notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🔔 New GAUCHI Order: " + newest.orderNumber, {
                body: `${newest.guestName || "Client"} placed an order for ₹${newest.total}`,
                icon: "/images/gauchi-gold-logo.png",
              });
            }

            // Auto dismiss toast after 8 seconds
            setTimeout(() => {
              if (isMounted) setLatestOrder(null);
            }, 8000);
          }
        }
      } catch (err) {
        console.error("Order polling error:", err);
      }
    }

    checkNewOrders();
    const interval = setInterval(checkNewOrders, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  return (
    <>
      {/* Toast popup when new order is received */}
      {latestOrder && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F0F0F] text-white border border-[#C5A059] p-4 rounded-lg shadow-2xl max-w-sm w-full animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5A059] text-[#0F0F0F] flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-luxury text-[#C5A059] font-semibold">
                  New Order Received!
                </span>
                <span className="text-xs font-semibold text-white">
                  ₹{latestOrder.total}
                </span>
              </div>
              <p className="text-xs font-medium text-white truncate mt-0.5">
                {latestOrder.orderNumber} • {latestOrder.guestName || "Customer"}
              </p>
              <p className="text-[11px] text-[#A0A0A0] truncate">
                {latestOrder.items?.map((i: any) => `${i.productName} (${i.variantSize})`).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
