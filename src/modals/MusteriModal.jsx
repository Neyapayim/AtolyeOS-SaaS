import { useState } from 'react';
import { C, F, FB, uid } from '../config/constants.js';
import { Modal } from '../components/Modal.jsx';
import { Btn } from '../components/Btn.jsx';
import { SilButonu } from '../components/SilButonu.jsx';

const NAKLIYECI_SECENEKLER = [
  "Müşteri kendisi alır", "Kendi aracımız", "Ambar kargo",
  "Kurye", "Nakliyeci", "Anlaşmalı kargo", "Belirtilmemiş"
];
const TESLIMAT_GUNLERI = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Her gün", "Randevuya göre"
];

export function MusteriModal({ data, onClose, onSave, onDelete }) {
  const isEdit = !!data?.id;
  const [f, setF] = useState({
    ad: data?.ad || "",
    tip: data?.tip || "direkt",
    yetkili: data?.yetkili || "",
    tel: data?.tel || "",
    email: data?.email || "",
    whatsapp: data?.whatsapp || "",
    vergiNo: data?.vergiNo || "",
    bayiAdi: data?.bayiAdi || "",
    adres: data?.adres || "",
    notlar: data?.notlar || "",
    altMusteriler: data?.altMusteriler || [],
    subeler: data?.subeler || [],
  });
  const [altForm, setAltForm] = useState(null); // { idx, ad, yetkili, adres, il, tel, nakliyeciTercihi, teslimatGunu, randevuGerekli, notlar }

  const up = (k, v) => setF(p => ({ ...p, [k]: v }));
  const listKey = f.tip === "bayi" ? "altMusteriler" : "subeler";
  const listLabel = f.tip === "bayi" ? "Alt Müşteriler" : "Şubeler / Teslimat Noktaları";
  const [hata, setHata] = useState("");

  const kaydet = () => {
    if (!f.ad.trim()) { setHata("Musteri adi zorunludur"); return; }
    setHata("");
    onSave?.({ ...f, id: isEdit ? data.id : uid() });
  };

  // Alt form kaydet
  const altKaydet = () => {
    if (!altForm || !altForm.ad?.trim()) return;
    const entry = { ...altForm, id: altForm.id || uid() };
    delete entry.idx;
    const list = [...(f[listKey] || [])];
    if (altForm.idx != null) {
      list[altForm.idx] = entry;
    } else {
      list.push(entry);
    }
    up(listKey, list);
    setAltForm(null);
  };

  const altSil = (idx) => {
    up(listKey, (f[listKey] || []).filter((_, i) => i !== idx));
  };

  const inp = {
    width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
    borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB,
    boxSizing: "border-box",
  };

  const Lbl = ({ children }) => (
    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{children}</div>
  );

  return (
    <Modal title={isEdit ? "Müşteri Düzenle" : "Yeni Müşteri"} onClose={onClose}
      footer={<div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
        {isEdit && <SilButonu onDelete={() => onDelete?.(data.id)} isim={data.ad} />}
        {hata&&<span style={{fontSize:11,color:"#DC3C3C",flex:1}}>⚠ {hata}</span>}
        {!hata&&<span style={{flex:1}}/>}
        <Btn onClick={onClose}>Iptal</Btn>
        <Btn variant="primary" onClick={kaydet}>Kaydet</Btn>
      </div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Temel bilgiler */}
        <div>
          <Lbl>Müşteri Adı *</Lbl>
          <input value={f.ad} onChange={e => up("ad", e.target.value)} className="inp" style={inp} placeholder="Firma / Kişi adı" />
        </div>
        <div>
          <Lbl>Tip</Lbl>
          <select value={f.tip} onChange={e => up("tip", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            <option value="direkt">Direkt Müşteri</option>
            <option value="bayi">Bayi / Distribütör</option>
            <option value="kurumsal">Kurumsal / İhale</option>
          </select>
        </div>
        {f.tip === "bayi" && (
          <div>
            <Lbl>Bayi Adı</Lbl>
            <input value={f.bayiAdi} onChange={e => up("bayiAdi", e.target.value)} className="inp" style={inp} />
          </div>
        )}
        <div>
          <Lbl>Yetkili Kişi</Lbl>
          <input value={f.yetkili} onChange={e => up("yetkili", e.target.value)} className="inp" style={inp} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <Lbl>Telefon</Lbl>
            <input value={f.tel} onChange={e => up("tel", e.target.value)} className="inp" style={inp} />
          </div>
          <div>
            <Lbl>E-posta</Lbl>
            <input value={f.email} onChange={e => up("email", e.target.value)} className="inp" style={inp} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <Lbl>WhatsApp</Lbl>
            <input value={f.whatsapp} onChange={e => up("whatsapp", e.target.value)} className="inp" style={inp} placeholder="5xx xxx xx xx" />
          </div>
          <div>
            <Lbl>Vergi No</Lbl>
            <input value={f.vergiNo} onChange={e => up("vergiNo", e.target.value)} className="inp" style={inp} />
          </div>
        </div>
        <div>
          <Lbl>Adres</Lbl>
          <textarea value={f.adres} onChange={e => up("adres", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>
        <div>
          <Lbl>Notlar</Lbl>
          <textarea value={f.notlar} onChange={e => up("notlar", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>

        {/* Alt Müşteriler / Şubeler */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F }}>{listLabel}</span>
            <button onClick={() => setAltForm({ ad: "", yetkili: "", adres: "", il: "", tel: "", nakliyeciTercihi: "Belirtilmemiş", teslimatGunu: "Her gün", randevuGerekli: false, notlar: "" })}
              style={{ fontSize: 11, color: C.cyan, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              + Ekle
            </button>
          </div>

          {(f[listKey] || []).length === 0 && !altForm && (
            <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 12 }}>
              Henüz {f.tip === "bayi" ? "alt müşteri" : "şube"} eklenmedi
            </div>
          )}

          {(f[listKey] || []).map((alt, idx) => (
            <div key={alt.id || idx} style={{
              background: "rgba(255,255,255,.025)", borderRadius: 10, padding: "8px 12px",
              marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{alt.ad}</div>
                {alt.il && <span style={{ fontSize: 11, color: C.muted }}>{alt.il}</span>}
                {alt.tel && <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{alt.tel}</span>}
              </div>
              <button onClick={() => setAltForm({ ...alt, idx })}
                style={{ fontSize: 11, color: C.cyan, background: "none", border: "none", cursor: "pointer" }}>Düzenle</button>
              <button onClick={() => altSil(idx)}
                style={{ fontSize: 11, color: C.coral, background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
          ))}

          {/* Alt Form */}
          {altForm && (
            <div style={{
              background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 14,
              border: `1px solid ${C.cyan}33`, marginTop: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.cyan, marginBottom: 10 }}>
                {altForm.idx != null ? "Düzenle" : "Yeni Ekle"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <Lbl>Ad *</Lbl>
                  <input value={altForm.ad} onChange={e => setAltForm(p => ({ ...p, ad: e.target.value }))} className="inp" style={inp} />
                </div>
                <div>
                  <Lbl>Yetkili</Lbl>
                  <input value={altForm.yetkili || ""} onChange={e => setAltForm(p => ({ ...p, yetkili: e.target.value }))} className="inp" style={inp} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <Lbl>Adres</Lbl>
                  <input value={altForm.adres || ""} onChange={e => setAltForm(p => ({ ...p, adres: e.target.value }))} className="inp" style={inp} />
                </div>
                <div>
                  <Lbl>İl</Lbl>
                  <input value={altForm.il || ""} onChange={e => setAltForm(p => ({ ...p, il: e.target.value }))} className="inp" style={inp} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <Lbl>Telefon</Lbl>
                  <input value={altForm.tel || ""} onChange={e => setAltForm(p => ({ ...p, tel: e.target.value }))} className="inp" style={inp} />
                </div>
                <div>
                  <Lbl>Nakliyeci Tercihi</Lbl>
                  <select value={altForm.nakliyeciTercihi || "Belirtilmemiş"} onChange={e => setAltForm(p => ({ ...p, nakliyeciTercihi: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                    {NAKLIYECI_SECENEKLER.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <Lbl>Teslimat Günü</Lbl>
                  <select value={altForm.teslimatGunu || "Her gün"} onChange={e => setAltForm(p => ({ ...p, teslimatGunu: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                    {TESLIMAT_GUNLERI.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                  <label style={{ fontSize: 12, color: C.text, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={altForm.randevuGerekli || false}
                      onChange={e => setAltForm(p => ({ ...p, randevuGerekli: e.target.checked }))} />
                    Randevu Gerekli
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <Lbl>Notlar</Lbl>
                <input value={altForm.notlar || ""} onChange={e => setAltForm(p => ({ ...p, notlar: e.target.value }))} className="inp" style={inp} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setAltForm(null)}
                  style={{ padding: "6px 14px", borderRadius: 8, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 12 }}>İptal</button>
                <button onClick={altKaydet}
                  style={{ padding: "6px 14px", borderRadius: 8, background: C.cyan, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Kaydet</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
