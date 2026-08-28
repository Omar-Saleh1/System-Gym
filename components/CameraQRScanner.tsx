'use client';

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface CameraQRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const CameraQRScanner: React.FC<CameraQRScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [error, setError] = useState("");
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        } else {
          setError("لا توجد كاميرا متاحة");
        }
      })
      .catch(() => setError("تعذر الوصول للكاميرا. تأكد من السماح باستخدامها."));

    return () => {
      if (html5QrRef.current) html5QrRef.current.stop().catch(() => {});
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) return;
    setError("");
    try {
      const html5Qr = new Html5Qrcode("qr-reader-modal");
      html5QrRef.current = html5Qr;
      await html5Qr.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        (decodedText) => {
          html5Qr.stop().catch(() => {});
          setScanning(false);
          onScan(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError("فشل تشغيل الكاميرا: " + err);
    }
  };

  const stopScanning = async () => {
    if (html5QrRef.current) await html5QrRef.current.stop().catch(() => {});
    setScanning(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 500, padding: "20px",
    }}>
      <div style={{
        background: "#1c1c1e", border: "1px solid #2a2a2c",
        borderRadius: "16px", padding: "24px", width: "100%",
        maxWidth: "420px", textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>📷 سكان QR بالكاميرا</h3>
          <button onClick={() => { stopScanning(); onClose(); }}
            style={{ background: "transparent", border: "1px solid #444", color: "#aaa", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
            ✕ إغلاق
          </button>
        </div>

        {cameras.length > 1 && (
          <select value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ width: "100%", marginBottom: "16px", padding: "8px", background: "#2a2a2c", border: "1px solid #444", borderRadius: "8px", color: "#fff" }}>
            {cameras.map((cam) => (
              <option key={cam.id} value={cam.id}>{cam.label || `كاميرا ${cam.id}`}</option>
            ))}
          </select>
        )}

        <div id="qr-reader-modal" style={{
          width: "100%", minHeight: "280px", borderRadius: "12px", overflow: "hidden",
          background: "#000", marginBottom: "16px",
          border: scanning ? "2px solid #ff5746" : "2px solid #333",
        }} />

        {error && (
          <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px", background: "rgba(239,68,68,0.1)", padding: "8px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        {!scanning ? (
          <button onClick={startScanning} style={{
            width: "100%", background: "#ff5746", color: "#fff", border: "none",
            borderRadius: "10px", padding: "14px", fontSize: "16px",
            fontWeight: "bold", fontFamily: "Cairo, sans-serif", cursor: "pointer",
          }}>
            📷 تشغيل الكاميرا
          </button>
        ) : (
          <div>
            <div style={{ color: "#22c55e", fontSize: "14px", marginBottom: "12px", fontWeight: "bold" }}>
              🟢 الكاميرا شغالة — وجّهها على الـ QR
            </div>
            <button onClick={stopScanning} style={{
              width: "100%", background: "#333", color: "#aaa", border: "1px solid #444",
              borderRadius: "10px", padding: "10px", fontSize: "14px",
              fontFamily: "Cairo, sans-serif", cursor: "pointer",
            }}>
              ⏹ إيقاف الكاميرا
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraQRScanner;
