import { useState, useMemo } from 'react';
import { C, F, FB, uid, fmt } from '../config/constants.js';
import { siparisKalemAnalizleri } from '../engine/index.js';
import { Modal, Btn } from '../components/index.js';
import { Field, TextInp, NumInp, Select } from '../components/FormElements.jsx';

export function SiparisModal({ data, onClose, setSiparisler, isEdit, urunler = [], musteriler = [], hamMaddeler = [], yarimamulList = [], siparisler = [] }) {
  const [siparisAdi, setSiparisAdi] = useState(data.siparisAdi || data.urun || "");
  const [musteriId, setMusteriId] = useState(data.musteriId || "");
  const [musteri, setMusteri] = useState(data.musteri || "");
  const [kalemler, setKalemler] = useState(() => {
    if (data.kalemler?.length) return data.kalemler.map(k => ({ ...k, _id: k._id || uid() }));
    if (data.urunId) return [{ _id: uid(), urunId: data.urunId, adet: data.adet || 1, altMusteriAd: "" }];
    return [{ _id: uid(), urunId: "", adet: 1, altMusteriAd: "" }];
  });
  const [termin, setTermin] = useState(data.termin || "");
  const [durum, setDurum] = useState(data.durum || "bekliyor");
  const [notlar, setNotlar] = useState(data.notlar || "");

  const musteriObj = musteriler.find(m => m.id === musteriId);
  const isDistributor = musteriObj?.tip === "bayi";
  const altMusteriler = isDistributor ? (musteriObj?.altMusteriler || musteriObj?.bayiler || []) : [];

  const handleMusteriSec = (mId) => {
    const m = musteriler.find(x => x.id === mId);
    setMusteriId(mId);
    setMusteri(m?.ad || "");
  };

  const kalemEkle = () => setKalemler(p => [...p, { _id: uid(), urunId: "", adet: 1, altMusteriAd: "" }]);
  const kalemSil = (_id) => setKalemler(p => p.length > 1 ? p.filter(k => k._id !== _id) : p);
  const kalemGuncelle = (_id, field, val) => setKalemler(p => p.map(k => k._id === _id ? { ...k, [field]: val } : k));

  const analizler = useMemo(() => {
    return siparisKalemAnalizleri(
      kalemler.filter(k => k.urunId && k.adet > 0),
      siparisler, isEdit ? data.id : null,
      urunler, hamMaddeler, yarimamulList
    );
  }, [kalemler, siparisler, urunler, hamMaddeler, yarimamulList]);

  const gecerliKalemler = kalemler.filter(k => k.urunId && k.adet > 0);

  const uretimOzeti = useMemo(() => {
    const map = {};
    gecerliKalemler.forEach((k, i) => {
      const a = analizler?.[i];
      if (!a) return;
      if (!map[k.urunId]) map[k.urunId] = { urunId: k.urunId, toplamAdet: 0, toplamStok: 0, toplamUretim: 0 };
      map[k.urunId].toplamAdet += (k.adet || 0);
      map[k.urunId].toplamStok += (a.stokKarsilanan || 0);
      map[k.urunId].toplamUretim += (a.uretilecek || 0);
    });
    return Object.values(map);
  }, [gecerliKalemler, analizler]);

  const toplamAdet = kalemler.reduce((s, k) => s + (k.adet || 0), 0);

  const save = () => {
    if (!siparisAdi.trim()) return;
    if (!musteri.trim() && !musteriId) return;
    if (gecerliKalemler.length === 0) return;

    const spKalemler = gecerliKalemler.map((k, i) => {
      const a = analizler?.[i] || {};
      const ur = urunler.find(x => x.id === k.urunId);
      return {
        urunId: k.urunId, urunAd: ur?.ad || "", adet: k.adet,
        altMusteriAd: k.altMusteriAd || "",
        stokKarsilanan: a.stokKarsilanan || 0,
        uretilecek: a.uretilecek || 0,
        eksikHamMaddeler: a.eksikHamMaddeler || [],
      };
    });

    const hedefDurum = isEdit ? durum : "bekliyor";

    if (isEdit) {
      setSiparisler(p => p.map(s => s.id === data.id ? {
        ...s, siparisAdi, musteri, musteriId, kalemler: spKalemler,
        adet: toplamAdet, termin, durum: hedefDurum, notlar,
      } : s));
    } else {
      setSiparisler(p => [...p, {
        id: `SP-${uid().toUpperCase().slice(0, 5)}`,
        siparisAdi, musteri, musteriId, kalemler: spKalemler,
        adet: toplamAdet, termin, durum: hedefDurum, notlar,
        asamalar: [], olusturmaTarihi: new Date().toISOString(),
      }]);
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Sipariş Düzenle" : "Yeni Sipariş"} onClose={onClose} width={680} maxHeight="90vh">
      <Field label="SİPARİŞ ADI">
        <TextInp value={siparisAdi} onChange={setSiparisAdi} placeholder="Örn: Anpa Ocak Siparişi" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="MÜŞTERİ" style={{ marginBottom: 0 }}>
          <select value={musteriId} onChange={e => handleMusteriSec(e.target.value)}
            style={{ width: "100%", background: C.s3, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, cursor: "pointer" }}>
            <option value="">— Müşteri seçin —</option>
            {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}{m.tip === "bayi" ? " (Distribütör)" : ""}</option>)}
          </select>
          {!musteriId && <input value={musteri} onChange={e => setMusteri(e.target.value)}
            placeholder="veya manuel yazın..."
            style={{ marginTop: 4, width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, color: C.text }} />}
        </Field>
        <Field label="TERMİN" style={{ marginBottom: 0 }}>
          <input type="date" value={termin} onChange={e => setTermin(e.target.value)}
            style={{ width: "100%", background: C.s3, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, colorScheme: "dark" }} />
        </Field>
      </div>

      {isDistributor && <div style={{ background: `${C.lav}0C`, border: `1px solid ${C.lav}25`, borderRadius: 8, padding: "6px 12px", marginBottom: 12, fontSize: 11, color: C.lav, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>🏪</span> Distribütör müşteri — kalem bazında alt müşteri seçebilirsiniz
        <span style={{ background: `${C.lav}20`, borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, marginLeft: "auto" }}>{altMusteriler.length} alt müşteri</span>
      </div>}

      {/* Kalemler */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: .5 }}>ÜRÜN KALEMLERİ ({kalemler.length})</span>
          <button onClick={kalemEkle} style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}25`, borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: C.cyan, cursor: "pointer" }}>+ Kalem Ekle</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {kalemler.map((k, ki) => {
            const gecerliIdx = gecerliKalemler.findIndex(gk => gk._id === k._id);
            const analiz = gecerliIdx >= 0 ? analizler?.[gecerliIdx] : null;
            return (
              <div key={k._id} style={{ background: "rgba(255,255,255,.025)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "10px 12px", animation: "fade-up .2s ease" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {isDistributor && altMusteriler.length > 0 && (
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 9, color: C.lav, fontWeight: 600, marginBottom: 3 }}>Alt Müşteri</div>
                      <select value={k.altMusteriAd || ""} onChange={e => kalemGuncelle(k._id, "altMusteriAd", e.target.value)}
                        style={{ width: "100%", background: C.s3, border: `1px solid ${C.lav}30`, borderRadius: 7, padding: "6px 8px", fontSize: 11, color: C.text, cursor: "pointer" }}>
                        <option value="">— Genel —</option>
                        {altMusteriler.map((am, ai) => <option key={ai} value={am.ad}>{am.ad}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, marginBottom: 3 }}>Ürün</div>
                    <select value={k.urunId} onChange={e => kalemGuncelle(k._id, "urunId", e.target.value)}
                      style={{ width: "100%", background: C.s3, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 8px", fontSize: 12, color: C.text, cursor: "pointer" }}>
                      <option value="">— Ürün seçin —</option>
                      {urunler.map(u => <option key={u.id} value={u.id}>{u.ad} {u.stok > 0 ? `(stok: ${u.stok})` : ""}</option>)}
                    </select>
                  </div>
                  <div style={{ width: 80 }}>
                    <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, marginBottom: 3 }}>Adet</div>
                    <input type="number" min={1} value={k.adet} onChange={e => kalemGuncelle(k._id, "adet", parseInt(e.target.value) || 1)}
                      style={{ width: "100%", background: C.s3, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 8px", fontSize: 13, color: C.text, textAlign: "center" }} />
                  </div>
                  {kalemler.length > 1 && (
                    <button onClick={() => kalemSil(k._id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.coral, fontSize: 16, lineHeight: 1, marginTop: 16, padding: "0 4px" }}>×</button>
                  )}
                </div>

                {analiz && k.urunId && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: C.muted }}>Kullanılabilir stok: <strong style={{ color: C.text }}>{analiz.stokMiktar}</strong></span>
                      {analiz.stokKarsilanan > 0 && <span style={{ fontSize: 9, background: `${C.mint}12`, color: C.mint, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>✓ Stoktan {analiz.stokKarsilanan}</span>}
                      {analiz.uretilecek > 0 && <span style={{ fontSize: 9, background: `${C.gold}12`, color: C.gold, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>🏭 Üretilecek {analiz.uretilecek}</span>}
                      {analiz.stokYeterli && <span style={{ fontSize: 9, color: C.mint }}>✅ Tamam</span>}
                    </div>
                    {analiz.eksikHamMaddeler?.filter(m => !m.yeterli).length > 0 && (
                      <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {analiz.eksikHamMaddeler.filter(m => !m.yeterli).slice(0, 3).map((m, mi) => (
                          <span key={mi} style={{ fontSize: 9, background: `${C.coral}10`, color: C.coral, borderRadius: 4, padding: "1px 6px" }}>⚠ {m.ad}: -{Number(m.eksik).toFixed(1)} {m.birim}</span>
                        ))}
                        {analiz.eksikHamMaddeler.filter(m => !m.yeterli).length > 3 && (
                          <span style={{ fontSize: 9, color: C.muted }}>+{analiz.eksikHamMaddeler.filter(m => !m.yeterli).length - 3} daha</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Üretim Özeti */}
      {uretimOzeti.length > 0 && (
        <div style={{ background: "rgba(255,255,255,.02)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: .5, marginBottom: 6 }}>ÜRETİM ÖZETİ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {uretimOzeti.map((o, i) => {
              const ur = urunler.find(x => x.id === o.urunId);
              const pct = o.toplamAdet > 0 ? Math.round(o.toplamStok / o.toplamAdet * 100) : 0;
              return (
                <div key={i} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", minWidth: 130 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ur?.ad || "?"}</div>
                  <div style={{ height: 3, borderRadius: 2, background: C.border, marginBottom: 3 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: pct === 100 ? C.mint : C.gold, transition: "width .3s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4, fontSize: 9 }}>
                    <span style={{ color: C.text, fontWeight: 700 }}>{o.toplamAdet} adet</span>
                    {o.toplamStok > 0 && <span style={{ color: C.mint }}>stok {o.toplamStok}</span>}
                    {o.toplamUretim > 0 && <span style={{ color: C.gold }}>üretim {o.toplamUretim}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isEdit && (
        <Field label="DURUM">
          <Select value={durum} onChange={setDurum} options={[
            { value: "bekliyor", label: "Bekliyor" }, { value: "hazir", label: "Sevkiyata Hazır" },
            { value: "uretimde", label: "Üretimde" }, { value: "bloke", label: "Bloke" },
            { value: "sevk_edildi", label: "Sevk Edildi" }, { value: "tamamlandi", label: "Tamamlandı" },
            { value: "iptal", label: "İptal" }]} />
        </Field>
      )}

      <Field label="NOTLAR">
        <textarea value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Notlar..." rows={2}
          style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, resize: "vertical", fontFamily: FB }} />
      </Field>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <div style={{ fontSize: 11, color: C.muted }}>
          {toplamAdet} adet · {gecerliKalemler.length} kalem
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>İptal</Btn>
          <Btn variant="primary" onClick={save}>
            {isEdit ? "Kaydet" : "Oluştur"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
