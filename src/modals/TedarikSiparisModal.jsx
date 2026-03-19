import { useState } from 'react';
import { C, F, uid, fmt } from '../config/constants.js';
import { Modal, Btn } from '../components/index.js';
import { Field, NumInp } from '../components/FormElements.jsx';

export function TedarikSiparisModal({m, onClose, onKaydet, hamMaddeler=[], hizmetler=[]}){
  const hmKalem = hamMaddeler.find(h=>h.id===m?.id);
  const [f, setF] = useState({
    miktar: m ? String(m.toplamEksik) : "",
    siparisYontemi: "telefon",
    sevkiyatYontemi: hmKalem?.sevkiyatYontemi || "tedarikci_getirir",
    nakliyeci: hmKalem?.nakliye?.varsayilanNakliyeci || "",
    nakliyeTel: hmKalem?.nakliye?.nakliyeTel || "",
    nakliyeUcret: "",
    nakliyeNot: "",
    beklenenTarih: "",
    teslimatYeri: hmKalem?.fasona_gider_mi ? "fason" : "depo",
    fasonFirmaId: hmKalem?.fasonHedefId || "",
    not: "",
  });
  const up = (k,v) => setF(p=>({...p,[k]:v}));

  // Tahmini teslim tarihi hesapla
  const tahminiGun = hmKalem?.tahminiTeslimGun || 0;
  const bugun = new Date();
  const tahminiTarih = tahminiGun > 0
    ? new Date(bugun.getTime() + tahminiGun * 86400000).toISOString().slice(0,10)
    : "";

  // Fason firma bilgisi
  const fasonFirma = hizmetler.find(h=>h.id===f.fasonFirmaId);

  if(!m) return null;
  const INP = {background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,
    padding:"8px 10px",fontSize:13,color:C.text,width:"100%"};
  const SEL = {...INP, cursor:"pointer"};

  return(
    <Modal title="🛒 Tedarik Siparişi Oluştur" onClose={onClose} width={540} maxHeight="85vh">
      {/* Tedarikçi başlık */}
      <div style={{background:"rgba(62,123,212,.06)",border:"1px solid rgba(62,123,212,.2)",
        borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>📦</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{m.tedarikci||"Tedarikçi Belirtilmemiş"}</div>
          <div style={{fontSize:11,color:C.muted}}>{m.ad}</div>
        </div>
      </div>

      {/* Sipariş Kalemleri */}
      <div style={{background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          Sipariş Kalemleri
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"8px 10px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{m.ad}</div>
            <div style={{fontSize:10,color:C.muted}}>
              {m.ueListesi?.map(ue=>ue.ueKod).join(", ")||"—"}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="number" value={f.miktar} onChange={e=>up("miktar",e.target.value)} step="0.001"
              style={{...INP,width:90,textAlign:"right",padding:"6px 8px"}}/>
            <span style={{fontSize:11,color:C.muted}}>{m.birim}</span>
          </div>
        </div>
        <div style={{fontSize:9,color:C.muted,marginTop:4,paddingLeft:10}}>
          Eksik: {fmt(m.toplamEksik)} {m.birim}
          {hmKalem?.minSiparisMiktar>0&&<span style={{color:C.gold}}> · Min sipariş: {hmKalem.minSiparisMiktar} {m.birim}</span>}
        </div>
      </div>

      {/* Sipariş Yöntemi */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Sipariş Yöntemi</div>
          <select value={f.siparisYontemi} onChange={e=>up("siparisYontemi",e.target.value)} style={SEL}>
            <option value="telefon">📞 Telefon</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="email">✉️ E-posta</option>
            <option value="portal">🌐 Portal</option>
          </select>
        </div>
        <div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Beklenen Teslim</div>
          <input type="date" value={f.beklenenTarih||tahminiTarih}
            onChange={e=>up("beklenenTarih",e.target.value)} style={INP}/>
          {tahminiGun>0&&!f.beklenenTarih&&(
            <div style={{fontSize:9,color:C.sky,marginTop:2}}>⏱ ~{tahminiGun} gün (otomatik)</div>
          )}
        </div>
      </div>

      {/* Sevkiyat */}
      <div style={{background:"rgba(232,145,74,.04)",border:"1px solid rgba(232,145,74,.15)",
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:"#E8914A",letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          🚚 Sevkiyat
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Sevkiyat Yöntemi</div>
            <select value={f.sevkiyatYontemi} onChange={e=>up("sevkiyatYontemi",e.target.value)} style={SEL}>
              <option value="tedarikci_getirir">🏪 Tedarikçi getiriyor</option>
              <option value="ben_alirim">🏃 Ben alıyorum</option>
              <option value="nakliye">🚚 Nakliye</option>
              <option value="kargo">📦 Kargo</option>
            </select>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Teslimat Yeri</div>
            <select value={f.teslimatYeri} onChange={e=>up("teslimatYeri",e.target.value)} style={SEL}>
              <option value="depo">🏠 Depoya</option>
              <option value="fason">🏭 Direkt Fasona</option>
            </select>
          </div>
        </div>

        {/* Nakliye detayları */}
        {f.sevkiyatYontemi==="nakliye"&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliyeci</div>
                <input value={f.nakliyeci} onChange={e=>up("nakliyeci",e.target.value)}
                  placeholder="Ahmet Nakliyat" style={INP}/>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliye Ücreti (₺)</div>
                <input type="number" value={f.nakliyeUcret} onChange={e=>up("nakliyeUcret",e.target.value)}
                  placeholder="500" style={INP}/>
              </div>
            </div>
          </div>
        )}

        {/* Fason yönlendirme */}
        {f.teslimatYeri==="fason"&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Fason Firma</div>
            <select value={f.fasonFirmaId} onChange={e=>up("fasonFirmaId",e.target.value)} style={SEL}>
              <option value="">— Fason firma seçin —</option>
              {hizmetler.filter(h=>h.tip==="fason").map(h=>(
                <option key={h.id} value={h.id}>{h.ad}{h.firma?` — ${h.firma}`:""}</option>
              ))}
            </select>
            {fasonFirma&&(
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <span style={{fontSize:9,background:`${C.lav}12`,color:C.lav,borderRadius:4,padding:"2px 6px"}}>
                  🏭 {fasonFirma.firma||fasonFirma.ad}
                </span>
                {fasonFirma.sureGun>0&&<span style={{fontSize:9,background:`${C.gold}12`,color:C.gold,borderRadius:4,padding:"2px 6px"}}>
                  ⏱ ~{fasonFirma.sureGun} gün
                </span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Not */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Not</div>
        <input type="text" value={f.not} onChange={e=>up("not",e.target.value)}
          placeholder="Fiyat, tedarikçi notu..." style={INP}/>
      </div>

      {/* Ödeme vadesi bilgisi */}
      {hmKalem?.odemeVadesi>0&&(
        <div style={{fontSize:10,color:C.muted,marginBottom:12,padding:"6px 10px",
          background:"rgba(255,255,255,.02)",borderRadius:7}}>
          💳 Ödeme vadesi: <strong style={{color:C.gold}}>{hmKalem.odemeVadesi} gün</strong>
        </div>
      )}

      {/* Butonlar */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"8px 16px",fontSize:12,color:C.muted,cursor:"pointer"}}>İptal</button>
        <button onClick={()=>{
          const miktar2 = parseFloat(String(f.miktar).replace(",","."))||0;
          if(miktar2<=0) return;

          // Tedarik siparişi objesi oluştur
          const siparis = {
            id: "ts-" + Date.now() + "-" + Math.random().toString(36).slice(2,6),
            durum: "siparis_verildi",
            olusturmaAt: new Date().toISOString(),
            kalemler: [{
              hamMaddeId: m.id,
              ad: m.ad,
              miktar: miktar2,
              birim: m.birim,
              birimFiyat: hmKalem?.listeFiyat||0,
              toplamFiyat: null,
              ueListesi: m.ueListesi?.map(ue=>ue.ueKod)||[],
            }],
            tedarikci: m.tedarikci||"",
            tedarikciTel: "",
            siparisYontemi: f.siparisYontemi,
            sevkiyatYontemi: f.sevkiyatYontemi,
            nakliyeci: f.nakliyeci,
            nakliyeUcret: parseFloat(f.nakliyeUcret)||0,
            nakliyeNot: "",
            siparisVerildiAt: new Date().toISOString(),
            beklenenTeslimAt: f.beklenenTarih||tahminiTarih||null,
            teslimAlindiAt: null,
            fasonYonlendirme: f.teslimatYeri==="fason" ? {
              gidecekMi: true,
              fasonFirmaId: f.fasonFirmaId,
              fasonFirmaAd: fasonFirma?.ad||"",
              gonderimAt: null,
              teslimAt: null,
              fasonNot: "",
            } : {gidecekMi:false},
            not: f.not,
            faturaNo: "",
            faturaAt: null,
            vadeTarih: hmKalem?.odemeVadesi ? new Date(Date.now()+hmKalem.odemeVadesi*86400000).toISOString().slice(0,10) : null,
            odendiMi: false,
          };

          onKaydet(siparis);
          onClose();
        }} style={{background:`${C.cyan}20`,border:`1px solid ${C.cyan}40`,
          borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:700,color:C.cyan,cursor:"pointer"}}>
          ✓ Siparişi Oluştur
        </button>
      </div>
    </Modal>
  );
}
