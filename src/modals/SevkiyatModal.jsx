import { useState } from 'react';
import { C, uid } from '../config/constants.js';
import { Modal, Btn } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';

export function SevkiyatModal({data, onClose, onKaydet, siparisler=[], musteriler=[]}){
  const isEdit = !!data?.id;
  const [f, setF] = useState({
    siparisId: data?.siparisId || "",
    musteriAd: data?.musteriAd || "",
    teslimatAdresi: data?.teslimatAdresi || "",
    nakliyeci: data?.nakliyeci || "",
    nakliyeTel: data?.nakliyeTel || "",
    nakliyeUcret: data?.nakliyeUcret || "",
    sevkTarihi: data?.sevkTarihi || new Date().toISOString().slice(0,10),
    notlar: data?.notlar || "",
    durum: data?.durum || "hazirlaniyor",
  });
  const up = (k,v) => setF(p=>({...p,[k]:v}));

  const INP = {background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,
    padding:"8px 10px",fontSize:13,color:C.text,width:"100%"};
  const SEL = {...INP, cursor:"pointer"};

  // Sipariş seçildiğinde müşteri adını otomatik doldur
  const handleSiparisChange = (spId) => {
    up("siparisId", spId);
    const sp = siparisler.find(s=>s.id===spId);
    if(sp){
      up("musteriAd", sp.musteri || "");
      const musteri = musteriler.find(m=>m.id===sp.musteriId);
      if(musteri?.adres) up("teslimatAdresi", musteri.adres);
    }
  };

  return(
    <Modal title={isEdit ? "🚚 Sevkiyat Düzenle" : "🚚 Sevkiyat Oluştur"} onClose={onClose} width={540} maxHeight="85vh">
      {/* Sipariş Seçimi */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Sipariş</div>
        <select value={f.siparisId} onChange={e=>handleSiparisChange(e.target.value)} style={SEL}>
          <option value="">— Sipariş seçin —</option>
          {siparisler.filter(s=>s.durum==="hazir"||s.durum==="uretimde"||s.durum==="tamamlandi")
            .map(s=>(
              <option key={s.id} value={s.id}>
                {s.siparisAdi||s.id} — {s.musteri||"—"}
              </option>
          ))}
        </select>
      </div>

      {/* Müşteri Bilgileri */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Müşteri Adı</div>
          <input value={f.musteriAd} onChange={e=>up("musteriAd",e.target.value)}
            placeholder="Müşteri adı" style={INP}/>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Sevk Tarihi</div>
          <input type="date" value={f.sevkTarihi} onChange={e=>up("sevkTarihi",e.target.value)} style={INP}/>
        </div>
      </div>

      {/* Teslimat Adresi */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Teslimat Adresi</div>
        <input value={f.teslimatAdresi} onChange={e=>up("teslimatAdresi",e.target.value)}
          placeholder="Teslimat adresi..." style={INP}/>
      </div>

      {/* Nakliye Bilgileri */}
      <div style={{background:"rgba(232,145,74,.04)",border:"1px solid rgba(232,145,74,.15)",
        borderRadius:10,padding:"10px 14px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:"#E8914A",letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          🚚 Nakliye
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliyeci</div>
            <input value={f.nakliyeci} onChange={e=>up("nakliyeci",e.target.value)}
              placeholder="Nakliyeci adı" style={INP}/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliye Tel</div>
            <input value={f.nakliyeTel} onChange={e=>up("nakliyeTel",e.target.value)}
              placeholder="0532..." style={INP}/>
          </div>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliye Ücreti (₺)</div>
          <input type="number" value={f.nakliyeUcret} onChange={e=>up("nakliyeUcret",e.target.value)}
            placeholder="0" style={{...INP,width:150}}/>
        </div>
      </div>

      {/* Notlar */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Notlar</div>
        <input type="text" value={f.notlar} onChange={e=>up("notlar",e.target.value)}
          placeholder="Sevkiyat notu..." style={INP}/>
      </div>

      {/* Butonlar */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"8px 16px",fontSize:12,color:C.muted,cursor:"pointer"}}>İptal</button>
        <button onClick={()=>{
          if(!f.siparisId && !f.musteriAd) return;

          onKaydet({
            id: isEdit ? data.id : "SVK-"+uid(),
            siparisId: f.siparisId,
            musteriAd: f.musteriAd,
            teslimatAdresi: f.teslimatAdresi,
            nakliyeci: f.nakliyeci,
            nakliyeTel: f.nakliyeTel,
            nakliyeUcret: parseFloat(f.nakliyeUcret)||0,
            sevkTarihi: f.sevkTarihi,
            notlar: f.notlar,
            durum: isEdit ? f.durum : "hazirlaniyor",
            olusturmaTarihi: isEdit ? data.olusturmaTarihi : new Date().toISOString(),
          });
          onClose();
        }} style={{background:`${C.cyan}20`,border:`1px solid ${C.cyan}40`,
          borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:700,color:C.cyan,cursor:"pointer"}}>
          ✓ Sevkiyat Oluştur
        </button>
      </div>
    </Modal>
  );
}
