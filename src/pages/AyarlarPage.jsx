import { useState } from 'react';
import { C, F, FB } from '../config/constants.js';
import { PageHeader, Btn } from '../components/index.js';

export default function AyarlarPage({ genelAyar, setGenelAyar }) {
  const ayar = genelAyar || { firmaAd: "", vergNo: "", tel: "", adres: "", notlar: "" };
  const [toast, setToast] = useState(null);

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .4, display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </div>
  );

  // --- VERİ YÖNETİMİ (YEDEKLE & İÇE AKTAR) ---

  // Eski sistem key → yeni sistem key eşleştirme tablosu
  const ESKİ_KEY_MAP = {
    "AtolyemOS_Siparisler": "atolye_siparisler",
    "AtolyemOS_HamMadde": "atolye_hamMadde",
    "AtolyemOS_HamMaddeler": "atolye_hamMadde",
    "AtolyemOS_YariMamul": "atolye_yarimamul",
    "AtolyemOS_YariMamuller": "atolye_yarimamul",
    "AtolyemOS_Hizmetler": "atolye_hizmetler",
    "AtolyemOS_Urunler": "atolye_urunler",
    "AtolyemOS_Istasyonlar": "atolye_istasyonlar",
    "AtolyemOS_Calisanlar": "atolye_calisanlar",
    "AtolyemOS_Fason": "atolye_fason",
    "AtolyemOS_FasonFirmalar": "atolye_fason",
    "AtolyemOS_UretimEmirleri": "atolye_uretimEmirleri",
    "AtolyemOS_Musteriler": "atolye_musteriler",
    "AtolyemOS_TedarikSiparisleri": "atolye_tedarikSiparisleri",
    "AtolyemOS_Sevkiyatlar": "atolye_sevkiyatlar",
    "AtolyemOS_FasonIsler": "atolye_fasonIsler",
    "AtolyemOS_NakliyeKayitlari": "atolye_nakliyeKayitlari",
    "AtolyemOS_GenelAyar": "atolye_genelAyar",
    "AtolyemOS_StokHareketleri": "atolye_stokHareketleri",
    "AtolyemOS_WorkLogs": "atolye_workLogs",
  };

  const normalizeKey = (key) => {
    // 1) Direkt eşleştirme tablosunda varsa kullan
    if (ESKİ_KEY_MAP[key]) return ESKİ_KEY_MAP[key];
    // 2) Zaten yeni formatta
    if (key.startsWith("atolye_")) return key;
    // 3) AtolyemOS_ prefix — tabloda yoksa genel dönüşüm
    if (key.startsWith("AtolyemOS_")) {
      return "atolye_" + key.replace("AtolyemOS_", "").charAt(0).toLowerCase() + key.replace("AtolyemOS_", "").slice(1);
    }
    // 4) Prefix'siz key
    return "atolye_" + key;
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("atolye_")) {
        const val = localStorage.getItem(key);
        try { data[key] = JSON.parse(val); } catch { data[key] = val; }
      }
    }
    const keyCount = Object.keys(data).length;
    if (keyCount === 0) {
      setToast("Yedeklenecek veri bulunamadı.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AtolyeOS_Yedek_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${keyCount} veri bloku yedeklendi.`);
    setTimeout(() => setToast(null), 3000);
  };

  const [importInfo, setImportInfo] = useState(null); // { name, size, count }

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const entries = Object.entries(data);
        if (entries.length === 0) {
          setToast("Dosya bos veya gecersiz.");
          setTimeout(() => setToast(null), 3000);
          return;
        }
        let count = 0;
        for (const [key, val] of entries) {
          const strVal = typeof val === "string" ? val : JSON.stringify(val);
          const finalKey = normalizeKey(key);
          localStorage.setItem(finalKey, strVal);
          count++;
        }
        setImportInfo(null);
        setToast(`${count} veri bloku ice aktarildi! Sayfa yenileniyor...`);
        setTimeout(() => window.location.reload(), 2000);
      } catch {
        setToast("Gecersiz JSON dosyasi! Lutfen gecerli bir yedek dosyasi secin.");
        setTimeout(() => setToast(null), 4000);
      }
    };
    reader.readAsText(file);
    setImportInfo({ name: file.name, size: (file.size / 1024).toFixed(1) });
    // input'u sıfırla ki aynı dosya tekrar seçilebilsin
    e.target.value = "";
  };
  // ------------------------------------------

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
    borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB,
    transition: "all .15s", boxSizing: "border-box",
  };

  return (
    <div style={{ animation: "fade-up .35s ease", maxWidth: 560 }}>
      <PageHeader title="Genel Ayarlar" />
      <div style={{
        background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 22,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 16 }}>Firma Bilgileri</div>
        <Field label="Firma / Atölye Adı">
          <input value={ayar.firmaAd || ""} onChange={e => setGenelAyar?.(p => ({ ...p, firmaAd: e.target.value }))}
            className="inp" style={inputStyle} />
        </Field>
        <Field label="Vergi Numarası">
          <input value={ayar.vergNo || ""} onChange={e => setGenelAyar?.(p => ({ ...p, vergNo: e.target.value }))}
            placeholder="123 456 789 0" className="inp" style={inputStyle} />
        </Field>
        <Field label="Telefon">
          <input value={ayar.tel || ""} onChange={e => setGenelAyar?.(p => ({ ...p, tel: e.target.value }))}
            placeholder="0212 xxx xx xx" className="inp" style={inputStyle} />
        </Field>
        <Field label="Adres">
          <textarea value={ayar.adres || ""} onChange={e => setGenelAyar?.(p => ({ ...p, adres: e.target.value }))}
            placeholder="Atölye adresi..." rows={3}
            style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <Field label="Notlar">
          <textarea value={ayar.notlar || ""} onChange={e => setGenelAyar?.(p => ({ ...p, notlar: e.target.value }))}
            placeholder="Ek notlar..." rows={2}
            style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={() => { setToast("Ayarlar kaydedildi ✓"); setTimeout(() => setToast(null), 2500); }}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer",
              background: C.cyan, color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: F,
            }}>Kaydet</button>
        </div>
      </div>

      {/* VERİ YÖNETİMİ PANELİ */}
      <div style={{
        marginTop: 28,
        background: `linear-gradient(135deg, rgba(56,189,248,0.04) 0%, rgba(167,139,250,0.04) 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 24,
        position: "relative", overflow: "hidden",
      }}>
        {/* Dekoratif accent line */}
        <div style={{
          position: "absolute", top: 0, left: 24, right: 24, height: 2,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.lav})`,
          borderRadius: "0 0 2px 2px", opacity: 0.6,
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>{"🗄️"}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F }}>Veri Yonetimi</span>
        </div>
        <p style={{ color: C.sub, fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
          Eski sisteminizdeki JSON yedeklerini tek tikla ice aktarin veya mevcut verilerinizi bilgisayariniza indirin.
          Eski format anahtarlari (AtolyemOS_) otomatik donusturulur.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* İçe Aktar */}
          <label style={{
            flex: 1, minWidth: 180, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
            background: "rgba(52,211,153,0.08)", border: `1px solid rgba(52,211,153,0.25)`,
            color: C.mint, fontWeight: 600, fontSize: 13, fontFamily: FB,
            textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,0.15)"; e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(52,211,153,0.08)"; e.currentTarget.style.borderColor = "rgba(52,211,153,0.25)"; }}
          >
            <input type="file" accept=".json,.txt" onChange={handleImport} style={{ display: "none" }} />
            <span style={{ fontSize: 16 }}>{"📥"}</span> Veri Ice Aktar (JSON)
          </label>

          {/* Dışa Aktar */}
          <button onClick={handleExport} style={{
            flex: 1, minWidth: 180, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
            background: "rgba(56,189,248,0.08)", border: `1px solid rgba(56,189,248,0.25)`,
            color: C.sky, fontWeight: 600, fontSize: 13, fontFamily: FB,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.15)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.08)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.25)"; }}
          >
            <span style={{ fontSize: 16 }}>{"📤"}</span> Tum Veriyi Yedekle
          </button>
        </div>

        {/* Dosya bilgisi gösterimi */}
        {importInfo && (
          <div style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
            fontSize: 12, color: C.sub, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{"📄"}</span>
            <span style={{ color: C.text, fontWeight: 600 }}>{importInfo.name}</span>
            <span>({importInfo.size} KB) yukleniyor...</span>
          </div>
        )}
      </div>
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          background: toast.includes("Gecersiz") || toast.includes("bulunamadi") ? C.coral : C.mint,
          color: "#fff", padding: "14px 24px", borderRadius: 12,
          fontWeight: 600, fontSize: 13, fontFamily: FB,
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
          animation: "fade-up .3s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>{toast.includes("Gecersiz") || toast.includes("bulunamadi") ? "⚠️" : "✅"}</span>
          {toast}
        </div>
      )}
    </div>
  );
}
