"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed as app)
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check query params (?app=1, ?install=1, ?download=1) or first mobile visit
    const urlParams = new URLSearchParams(window.location.search);
    const forcePrompt = urlParams.has("app") || urlParams.has("install") || urlParams.has("download");
    const hasSeenModal = localStorage.getItem("gauchi_app_welcome_seen");

    // Detect mobile devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobile = isIosDevice || /android|mobile/.test(userAgent);
    setIsIos(isIosDevice);

    if (forcePrompt || (!hasSeenModal && isMobile)) {
      setShowWelcomeModal(true);
    }

    // Check if user previously dismissed banner in this session
    const dismissed = sessionStorage.getItem("gauchi_app_banner_dismissed");
    if (!dismissed) {
      setShowBanner(true);
    }

    // Android / Chrome PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    setShowWelcomeModal(false);
    localStorage.setItem("gauchi_app_welcome_seen", "true");

    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("gauchi_app_welcome_seen", "true");
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("gauchi_app_banner_dismissed", "true");
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Sleek Luxury App Download Bar */}
      <div className="bg-[#0F0F0F] text-white border-b border-[#C5A059]/40 py-2.5 px-4 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/images/gauchi-gold-logo.png"
              alt="Gauchi App"
              className="w-6 h-6 object-contain shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-white">Get the GAUCHI App</span>
              <span className="text-[#C5A059] ml-1.5 hidden sm:inline">• Fast 1-tap ordering & order tracking</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#0F0F0F] font-semibold text-[11px] uppercase tracking-luxury rounded-sm flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-[#8C827A] hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* First-Visit / Shared Link Mobile App Welcome Gate */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FAF8F5] border border-[#C5A059] rounded-lg max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
            <button
              onClick={handleCloseWelcome}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 text-[#8C827A] hover:text-[#0F0F0F]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Golden Emblem */}
            <div className="flex flex-col items-center">
              <img
                src="/images/gauchi-gold-logo.png"
                alt="Gauchi Emblem"
                className="w-14 h-14 object-contain mb-2 drop-shadow-sm"
              />
              <span className="font-serif-luxury text-2xl tracking-widest-luxury text-[#0F0F0F]">
                GAUCHI
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-medium">
                HAUTE PARFUMERIE
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif-luxury text-base text-[#0F0F0F]">
                Experience GAUCHI in App Format
              </h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Add the official Gauchi app to your phone for instant order tracking, private flacon drops, and seamless 1-tap checkout.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#0F0F0F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest-luxury font-medium rounded-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Download className="w-4 h-4 text-[#C5A059]" />
                <span>Download & Install App</span>
              </button>

              <button
                onClick={handleCloseWelcome}
                className="w-full py-2.5 text-xs text-[#7A7A7A] hover:text-[#0F0F0F] font-medium transition-colors"
              >
                Continue in Web Browser ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-xl sm:rounded-lg max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#C5A059] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6 text-[#C5A059]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Install Gauchi on iPhone</h3>
              <p className="text-xs text-[#7A7A7A]">Follow these 2 quick steps to add the app to your home screen:</p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-[#FAF8F5] p-3.5 rounded-sm border border-[#EBE7DF]">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Tap the <strong>Share</strong> button at the bottom of Safari (<Share className="w-3.5 h-3.5 inline text-[#C5A059]" />).</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors rounded-sm"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
