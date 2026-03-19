import { useState } from 'react';
import { C, F, FB, uid } from '../config/constants.js';
import { Modal } from '../components/Modal.jsx';
import { Btn } from '../components/Btn.jsx';
import { SilButonu } from '../components/SilButonu.jsx';

export function FasonModal({ data, onClose, setFasonFirmalar, isEdit }) {
  const [ad, setAd] = useState(data?.ad || "");
  const [tip, setTip] = useState(data?.tip || "");
  const [tel, setTel] = useState(data?.tel || "");
  const [adres, setAdres] = useState(data?.adres || "");
  const [sureGun, setSureGun] = useState(data?.sureGun || 2);
  const [birimFiyat, setBirimFiyat] = useState(data?.birimFiyat || 0);
  const [kdv, setKdv] = useState(data?.kdv || 20);
  const [notlar, setNotlar] = useState(data?.notlar || "");

  const [hata, setHata] = useState("");
  const kaydet = () => {
    if (!ad.trim()) { setHata("Firma adi zorunludur"); return; }
    setHata("");
    const kayit = { id: isEdit ? data.id : uid(), ad, tip, tel, adres, sureGun, birimFiyat, kdv, notlar };
    setFasonFirmalar(p => isEdit ? p.map(x => x.id === data.id ? { ...x, ...kayit } : x) : [...p, kayit]);
    onClose();
  };

  const inp = { width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB };

  return (
    <Modal title={isEdit ? "Fason Firma Düzenle" : "Yeni Fason Firma"} onClose={onClose}
      footer={<div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
        {isEdit && <SilButonu onDelete={() => { setFasonFirmalar(p => p.filter(x => x.id !== data.id)); onClose(); }} isim={data.ad} />}
        {hata&&<span style={{fontSize:11,color:"#DC3C3C",flex:1}}>⚠ {hata}</span>}
        {!hata&&<span style={{flex:1}}/>}
        <Btn onClick={onClose}>Iptal</Btn>
        <Btn variant="primary" onClick={kaydet}>Kaydet</Btn>
      </div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Firma Adı</div>
          <input value={ad} onChange={e => setAd(e.target.value)} className="inp" style={inp} placeholder="Boya Atölyesi A" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>İş Tipi</div>
          <input value={tip} onChange={e => setTip(e.target.value)} className="inp" style={inp} placeholder="Elektrostatik Boya" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Süre (gün)</div>
            <input type="number" value={sureGun} onChange={e => setSureGun(Number(e.target.value))} className="inp" style={{ ...inp, textAlign: "right" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Birim Fiyat (₺)</div>
            <input type="number" value={birimFiyat} onChange={e => setBirimFiyat(Number(e.target.value))} className="inp" style={{ ...inp, textAlign: "right" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>KDV %</div>
            <input type="number" value={kdv} onChange={e => setKdv(Number(e.target.value))} className="inp" style={{ ...inp, textAlign: "right" }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Telefon</div>
          <input value={tel} onChange={e => setTel(e.target.value)} className="inp" style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Notlar</div>
          <textarea value={notlar} onChange={e => setNotlar(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>
      </div>
    </Modal>
  );
}
