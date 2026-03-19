import { useState } from 'react';
import { C, F, FB, uid } from '../config/constants.js';
import { Modal } from '../components/Modal.jsx';
import { Btn } from '../components/Btn.jsx';
import { SilButonu } from '../components/SilButonu.jsx';

export function IstasyonModal({ data, onClose, setIstasyonlar, isEdit }) {
  const [ad, setAd] = useState(data?.ad || "");
  const [tip, setTip] = useState(data?.tip || "ic");
  const [kapasite, setKapasite] = useState(data?.kapasite || "");
  const [calisan, setCalisan] = useState(data?.calisan || "");
  const [notlar, setNotlar] = useState(data?.notlar || "");

  const kaydet = () => {
    if (!ad.trim()) return;
    const kayit = { id: isEdit ? data.id : uid(), ad, tip, kapasite, calisan, durum: tip === "fason" ? "fason" : "aktif", notlar };
    setIstasyonlar(p => isEdit ? p.map(x => x.id === data.id ? { ...x, ...kayit } : x) : [...p, kayit]);
    onClose();
  };

  const inp = { width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB };

  return (
    <Modal title={isEdit ? "İstasyon Düzenle" : "Yeni İstasyon"} onClose={onClose}
      footer={<>
        {isEdit && <SilButonu onDelete={() => { setIstasyonlar(p => p.filter(x => x.id !== data.id)); onClose(); }} isim={data.ad} />}
        <Btn onClick={onClose}>İptal</Btn>
        <Btn variant="primary" onClick={kaydet}>Kaydet</Btn>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>İstasyon Adı</div>
          <input value={ad} onChange={e => setAd(e.target.value)} className="inp" style={inp} placeholder="Kesim Masası" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Tip</div>
          <select value={tip} onChange={e => setTip(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            <option value="ic">İç (Atölye)</option>
            <option value="fason">Fason</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Kapasite</div>
          <input value={kapasite} onChange={e => setKapasite(e.target.value)} className="inp" style={inp} placeholder="8 saat/gün" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Çalışan</div>
          <input value={calisan} onChange={e => setCalisan(e.target.value)} className="inp" style={inp} placeholder="Ahmet Usta" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Notlar</div>
          <textarea value={notlar} onChange={e => setNotlar(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>
      </div>
    </Modal>
  );
}
