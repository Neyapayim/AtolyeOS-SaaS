import React from 'react';
import { uid } from '../config/constants.js';
import { topluUEOlustur } from '../engine/index.js';
import { IstasyonModal } from './IstasyonModal.jsx';
import { CalisanModal } from './CalisanModal.jsx';
import { FasonModal } from './FasonModal.jsx';
import { MusteriModal } from './MusteriModal.jsx';
import { SiparisModal } from './SiparisModal.jsx';
import { UretimEmriModal } from './UretimEmriModal.jsx';
import { HamMaddeModal } from './HamMaddeModal.jsx';
import { YariMamulModal } from './YariMamulModal.jsx';
import { UrunBomModal } from './UrunBomModal.jsx';
import { TedarikSiparisModal } from './TedarikSiparisModal.jsx';
import { TedarikGirisModal } from './TedarikGirisModal.jsx';
import { SevkiyatModal } from './SevkiyatModal.jsx';
import { TopluUEOnizleme } from './TopluUEOnizleme.jsx';
import { FasonHizmetModal } from './FasonHizmetModal.jsx';
import { IscilikModal } from './IscilikModal.jsx';
import { OtomatikKodModal } from './OtomatikKodModal.jsx';

/**
 * ModalDispatch: Modal router. modal.type'a göre doğru modal'ı render eder.
 * Tüm modal'lar app.jsx'ten taşındı.
 */
export function ModalDispatch({ modal, setModal, ...props }) {
  if (!modal) return null;
  const close = () => setModal(null);
  const { type, data } = modal;

  // ─ Müşteri ─
  if (type === "yeniMusteri" || type === "musteriDetay") {
    const isEdit = type === "musteriDetay" && !!data?.id;
    return <MusteriModal data={isEdit ? data : { ...data }} onClose={close}
      onSave={m => { props.setMusteriler(p => isEdit ? p.map(x => x.id === m.id ? m : x) : [...p, m]); close(); }}
      onDelete={id => { props.setMusteriler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Sipariş ─
  if (type === "yeniSiparis" || type === "siparisDuzenle") {
    return <SiparisModal data={data} onClose={close} setSiparisler={props.setSiparisler}
      isEdit={type === "siparisDuzenle"} urunler={props.urunler} musteriler={props.musteriler}
      hamMaddeler={props.hamMaddeler} yarimamulList={props.yarimamulList} siparisler={props.siparisler} />;
  }

  // ─ Sipariş Durum Değişikliği ─
  if (type === "siparisDurum") {
    const SiparisDurumInline = () => {
      const [durum, setDurum] = React.useState(data?.durum || "bekliyor");
      const [notlar, setNotlar] = React.useState(data?.notlar || "");
      const durumlar = [
        { v: "bekliyor", l: "Bekliyor" }, { v: "hazir", l: "Hazır" },
        { v: "uretimde", l: "Üretimde" }, { v: "bloke", l: "Bloke" },
        { v: "sevk_edildi", l: "Sevk Edildi" }, { v: "tamamlandi", l: "Tamamlandı" },
        { v: "iptal", l: "İptal" },
      ];
      return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)" }}>
          <div style={{ background: "#151927", borderRadius: 16, padding: 28, minWidth: 360, border: "1px solid rgba(255,255,255,.08)" }}>
            <h3 style={{ color: "#EDE8DF", marginBottom: 16 }}>Sipariş Durumu: {data?.siparisAdi || data?.id}</h3>
            <select value={durum} onChange={e => setDurum(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 8, background: "#0D0D11", color: "#EDE8DF", border: "1px solid rgba(255,255,255,.1)", marginBottom: 12 }}>
              {durumlar.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
            </select>
            <textarea value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Notlar..."
              style={{ width: "100%", padding: 10, borderRadius: 8, background: "#0D0D11", color: "#EDE8DF", border: "1px solid rgba(255,255,255,.1)", minHeight: 60, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={close} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: "#9CA3AF", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer" }}>İptal</button>
              <button onClick={() => { props.setSiparisler(p => p.map(s => s.id === data.id ? { ...s, durum, notlar } : s)); close(); }}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#E8914A", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>Kaydet</button>
            </div>
          </div>
        </div>
      );
    };
    return <SiparisDurumInline />;
  }

  // ─ Ürün (UrunBomModal olarak) ─
  if (type === "yeniUrun" || type === "urunDuzenle") {
    const isEdit = type === "urunDuzenle" && !!data?.id;
    return <UrunBomModal kalem={isEdit ? data : data?._kopya ? data : null}
      hamMaddeler={props.hamMaddeler} yarimamulList={props.yarimamulList}
      hizmetler={props.hizmetler} onClose={close}
      onSave={f => {
        props.setUrunler(p => isEdit
          ? p.map(x => x.id === f.id ? { ...x, ...f } : x)
          : [...p, { ...f, id: uid(), satisKdvDahil: f.satisKdvDahil || 0, satisKdv: f.satisKdv || 10, gelirVergisi: 30, aktif: true, stok: 0, minStok: 0 }]
        );
        close();
      }}
      onKopya={f => { setModal({ type: "yeniUrunBom", data: { ...f, id: null, kod: f.kod + "-K", ad: f.ad + " - Kopya", stok: 0, _kopya: true, bom: (f.bom || []).map(b => ({ ...b, id: uid() })) } }); }}
      onDelete={id => { props.setUrunler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Toplu UE Önizleme ─
  if (type === "topluUEOnizleme") {
    return <TopluUEOnizleme data={data} onClose={close}
      urunler={props.urunler} hamMaddeler={props.hamMaddeler}
      yarimamulList={props.yarimamulList} hizmetler={props.hizmetler}
      uretimEmirleri={props.uretimEmirleri} siparisler={props.siparisler}
      setUretimEmirleri={props.setUretimEmirleri} setSiparisler={props.setSiparisler} />;
  }

  // ─ Üretim Emri ─
  if (type === "yeniUretimEmri" || type === "ueDetay") {
    const duzenleme = type === "ueDetay";
    const init = duzenleme ? data : {
      id: uid(), kod: "UE-" + String((props.uretimEmirleri || []).length + 1).padStart(3, "0"),
      urunId: (data || {}).urunId || "", urunAd: ((data || {}).urunId ? (props.urunler || []).find(x => x.id === (data || {}).urunId) : null)?.ad || (data || {}).urunAd || "",
      adet: (data || {}).uretilecek || (data || {}).adet || 1, durum: "bekliyor",
      sipNo: (data || {}).sipNo || "", termin: (data || {}).termin || "",
      notlar: (data || {}).sipNo ? ("Sipariş: " + (data || {}).sipNo) : "",
      asamalar: [],
      olusturmaTarihi: new Date().toISOString()
    };
    return <UretimEmriModal init={init} duzenleme={duzenleme} onClose={close}
      urunler={props.urunler} urunBomList={props.urunBomList} calisanlar={props.calisanlar}
      hizmetler={props.hizmetler} yarimamulList={props.yarimamulList}
      hamMaddeler={props.hamMaddeler}
      setUretimEmirleri={props.setUretimEmirleri} setAktifUE={props.setAktifUE} />;
  }

  // ─ Ham Madde ─
  if (type === "yeniStokKalem" || type === "duzenleHam" || type === "yeniHam") {
    const isEdit = type === "duzenleHam" && !!data?.id;
    return <HamMaddeModal kalem={isEdit ? data : data?._kopya ? data : null}
      hamMaddeler={props.hamMaddeler} yarimamulList={props.yarimamulList}
      hizmetler={props.hizmetler || []}
      onClose={close}
      onSave={f => { props.setHamMaddeler(p => isEdit ? p.map(x => x.id === f.id ? f : x) : [...p, { ...f, id: uid() }]); close(); }}
      onKopya={f => { setModal({ type: "yeniHam", data: { ...f, id: null, kod: f.kod + "-K", ad: f.ad + " - Kopya", miktar: 0, _kopya: true } }); }}
      onDelete={id => { props.setHamMaddeler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Yarı Mamül ─
  if (type === "duzenleYM" || type === "yeniYM") {
    const isEdit = type === "duzenleYM" && !!data?.id;
    return <YariMamulModal kalem={isEdit ? data : data?._kopya ? data : null}
      hamMaddeler={props.hamMaddeler} yarimamulList={props.yarimamulList}
      hizmetler={props.hizmetler} onClose={close}
      onSave={f => { props.setYM(p => isEdit ? p.map(x => x.id === f.id ? f : x) : [...p, { ...f, id: uid() }]); close(); }}
      onKopya={f => { setModal({ type: "yeniYM", data: { ...f, id: null, kod: f.kod + "-K", ad: f.ad + " - Kopya", miktar: 0, _kopya: true, bom: (f.bom || []).map(b => ({ ...b, id: uid() })) } }); }}
      onDelete={id => { props.setYM(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Ürün BOM ─
  if (type === "duzenleUrunBom" || type === "yeniUrunBom") {
    const isEdit = type === "duzenleUrunBom" && !!data?.id;
    return <UrunBomModal kalem={isEdit ? data : data?._kopya ? data : null}
      hamMaddeler={props.hamMaddeler} yarimamulList={props.yarimamulList}
      hizmetler={props.hizmetler} onClose={close}
      onSave={f => {
        props.setUrunler(p => isEdit
          ? p.map(x => x.id === f.id ? { ...x, ...f } : x)
          : [...p, { ...f, id: uid(), satisKdvDahil: f.satisKdvDahil || 0, satisKdv: f.satisKdv || 10, gelirVergisi: 30, aktif: true, stok: 0, minStok: 0 }]
        );
        close();
      }}
      onKopya={f => { setModal({ type: "yeniUrunBom", data: { ...f, id: null, kod: f.kod + "-K", ad: f.ad + " - Kopya", stok: 0, _kopya: true, bom: (f.bom || []).map(b => ({ ...b, id: uid() })) } }); }}
      onDelete={id => { props.setUrunler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Fason Hizmet ─
  if (type === "yeniFasonHizmet" || type === "duzenleFasonHizmet") {
    const isEdit = type === "duzenleFasonHizmet";
    return <FasonHizmetModal kalem={isEdit ? data : null} onClose={close}
      onSave={f => { props.setHizmetler(p => isEdit ? p.map(x => x.id === f.id ? f : x) : [...p, { ...f, id: uid(), tip: "fason" }]); close(); }}
      onDelete={id => { props.setHizmetler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ İç İşçilik ─
  if (type === "yeniIscilikHizmet" || type === "duzenleIscilikHizmet") {
    const isEdit = type === "duzenleIscilikHizmet";
    return <IscilikModal kalem={isEdit ? data : null} istasyonlar={props.istasyonlar} calisanlar={props.calisanlar} onClose={close}
      onSave={f => { props.setHizmetler(p => isEdit ? p.map(x => x.id === f.id ? f : x) : [...p, { ...f, id: uid(), tip: "ic" }]); close(); }}
      onDelete={id => { props.setHizmetler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Eski tip (geriye dönük uyumluluk) ─
  if (type === "duzenleHizmet") {
    if (data?.tip === "ic") return <IscilikModal kalem={data} istasyonlar={props.istasyonlar} calisanlar={props.calisanlar} onClose={close}
      onSave={f => { props.setHizmetler(p => p.map(x => x.id === f.id ? f : x)); close(); }}
      onDelete={id => { props.setHizmetler(p => p.filter(x => x.id !== id)); close(); }} />;
    return <FasonHizmetModal kalem={data} onClose={close}
      onSave={f => { props.setHizmetler(p => p.map(x => x.id === f.id ? f : x)); close(); }}
      onDelete={id => { props.setHizmetler(p => p.filter(x => x.id !== id)); close(); }} />;
  }

  // ─ Tedarik Sipariş ─
  if (type === "tedarikSiparis") {
    return <TedarikSiparisModal m={data} onClose={close} onKaydet={props.onTedarikKaydet}
      hamMaddeler={props.hamMaddeler} hizmetler={props.hizmetler} />;
  }

  // ─ Tedarik Giriş ─
  if (type === "tedarikGiris") {
    return <TedarikGirisModal m={data} onClose={close} onKaydet={props.onTedarikGirisKaydet}
      hamMaddeler={props.hamMaddeler} hizmetler={props.hizmetler}
      tedarikSiparisleri={props.tedarikSiparisleri} />;
  }

  // ─ Sevkiyat ─
  if (type === "yeniSevkiyat" || type === "sevkiyatDuzenle") {
    return <SevkiyatModal data={data || {}} onClose={close} onKaydet={props.onSevkiyatKaydet}
      siparisler={props.siparisler} musteriler={props.musteriler} />;
  }

  // ─ İstasyon ─
  if (type === "yeniIstasyon" || type === "istasyonDuzenle") {
    return <IstasyonModal data={data} onClose={close} setIstasyonlar={props.setIstasyonlar} isEdit={type === "istasyonDuzenle"} />;
  }

  // ─ Çalışan ─
  if (type === "yeniCalisan" || type === "calisanDuzenle") {
    return <CalisanModal data={data} onClose={close} setCalisanlar={props.setCalisanlar} isEdit={type === "calisanDuzenle"} />;
  }

  // ─ Fason Firma ─
  if (type === "yeniFason" || type === "fasonDuzenle") {
    return <FasonModal data={data} onClose={close} setFasonFirmalar={props.setFasonFirmalar} isEdit={type === "fasonDuzenle"} />;
  }

  // ─ Fason İş Emri (Manuel) ─
  if (type === "yeniFasonIs") {
    const YeniFasonIsInline = () => {
      const [form, setForm] = React.useState({
        firmaId: "", firmaAd: "", aciklama: "", durum: "bekliyor",
      });
      const firmalar = props.fasonFirmalar || [];
      return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)" }}>
          <div style={{ background: "#151927", borderRadius: 16, padding: 28, minWidth: 380, border: "1px solid rgba(255,255,255,.08)" }}>
            <h3 style={{ color: "#EDE8DF", marginBottom: 16 }}>Yeni Fason Is Emri</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Fason Firma</div>
              <select value={form.firmaId} onChange={e => {
                const f = firmalar.find(x => x.id === e.target.value);
                setForm(p => ({ ...p, firmaId: e.target.value, firmaAd: f?.ad || "" }));
              }}
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "#0D0D11", color: "#EDE8DF", border: "1px solid rgba(255,255,255,.1)" }}>
                <option value="">Firma Sec...</option>
                {firmalar.map(f => <option key={f.id} value={f.id}>{f.ad}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Aciklama</div>
              <textarea value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))}
                placeholder="Is detayi..."
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "#0D0D11", color: "#EDE8DF", border: "1px solid rgba(255,255,255,.1)", minHeight: 60 }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={close} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: "#9CA3AF", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer" }}>Iptal</button>
              <button onClick={() => {
                if (!form.firmaId) return;
                props.setFasonIsler?.(p => [...(p || []), {
                  id: uid(), ...form, olusturmaTarihi: new Date().toISOString(),
                }]);
                close();
              }}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#E8914A", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>Olustur</button>
            </div>
          </div>
        </div>
      );
    };
    return <YeniFasonIsInline />;
  }

  // ─ Otomatik Kod ─
  if (type === "otomatikKod") {
    return <OtomatikKodModal
      urunler={props.urunler} hamMaddeler={props.hamMaddeler}
      yarimamulList={props.yarimamulList} hizmetler={props.hizmetler}
      urunBomList={props.urunBomList}
      onClose={close}
      onApply={(kodMap) => {
        props.setHamMaddeler(p => p.map(x => kodMap[x.id] ? { ...x, kod: kodMap[x.id] } : x));
        props.setYM(p => p.map(x => kodMap[x.id] ? { ...x, kod: kodMap[x.id] } : x));
        props.setUrunBomList && props.setUrunBomList(p => p.map(x => kodMap[x.id] ? { ...x, kod: kodMap[x.id] } : x));
        props.setHizmetler(p => p.map(x => kodMap[x.id] ? { ...x, kod: kodMap[x.id] } : x));
        props.setUrunler(p => p.map(x => kodMap[x.id] ? { ...x, kod: kodMap[x.id] } : x));
        close();
      }}
    />;
  }

  return null;
}
