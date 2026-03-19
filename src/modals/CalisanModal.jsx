import { useState } from 'react';
import { C, F, FB, uid } from '../config/constants.js';
import { Modal } from '../components/Modal.jsx';
import { Btn } from '../components/Btn.jsx';
import { SilButonu } from '../components/SilButonu.jsx';

export function CalisanModal({ data, onClose, setCalisanlar, isEdit }) {
  const [ad, setAd] = useState(data?.ad || "");
  const [rol, setRol] = useState(data?.rol || "");
  const [tel, setTel] = useState(data?.tel || "");
  const [istasyon, setIstasyon] = useState(data?.istasyon || "");
  const [durum, setDurum] = useState(data?.durum || "aktif");

  const kaydet = () => {
    if (!ad.trim()) return;
    const kayit = { id: isEdit ? data.id : uid(), ad, rol, tel, istasyon, durum };
    setCalisanlar(p => isEdit ? p.map(x => x.id === data.id ? { ...x, ...kayit } : x) : [...p, kayit]);
    onClose();
  };

  const inp = { width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB };

  return (
    <Modal title={isEdit ? "Çalışan Düzenle" : "Yeni Çalışan"} onClose={onClose}
      footer={<>
        {isEdit && <SilButonu onDelete={() => { setCalisanlar(p => p.filter(x => x.id !== data.id)); onClose(); }} isim={data.ad} />}
        <Btn onClick={onClose}>İptal</Btn>
        <Btn variant="primary" onClick={kaydet}>Kaydet</Btn>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Ad Soyad</div>
          <input value={ad} onChange={e => setAd(e.target.value)} className="inp" style={inp} placeholder="Ahmet Usta" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Rol</div>
          <input value={rol} onChange={e => setRol(e.target.value)} className="inp" style={inp} placeholder="Döşemeci / Kesimci" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Telefon</div>
          <input value={tel} onChange={e => setTel(e.target.value)} className="inp" style={inp} placeholder="0532 xxx xx xx" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>İstasyon</div>
          <input value={istasyon} onChange={e => setIstasyon(e.target.value)} className="inp" style={inp} placeholder="Döşeme Tezgahı" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Durum</div>
          <select value={durum} onChange={e => setDurum(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
