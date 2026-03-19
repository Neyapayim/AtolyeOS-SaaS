import { useState } from 'react';
import { C, uid, fmt } from '../config/constants.js';
import { Modal, Btn } from '../components/index.js';

export function TedarikGirisModal({m, onClose, onKaydet, hamMaddeler=[], hizmetler=[], tedarikSiparisleri=[]}){
  const hmKalem = hamMaddeler.find(h=>h.id===m?.id);
  // İlgili tedarik siparişini bul
  const ilgiliSiparis = tedarikSiparisleri.find(ts=>
    ts.durum==="siparis_verildi"&&ts.kalemler?.some(k=>k.hamMaddeId===m?.id)
  );

  const [f, setF] = useState({
    miktar: m ? String(m.toplamEksik) : "",
    beklenenTarih: m?.beklenenTarih||"",
    // Nakliye kaydı
    nakliyeci: ilgiliSiparis?.nakliyeci || hmKalem?.nakliye?.varsayilanNakliyeci || "",
    nakliyeTel: hmKalem?.nakliye?.nakliyeTel || "",
    nakliyeUcret: ilgiliSiparis?.nakliyeUcret ? String(ilgiliSiparis.nakliyeUcret) : "",
    // Yönlendirme
    yonlendirme: hmKalem?.fasona_gider_mi ? "fason" : "depo",
    fasonFirmaId: hmKalem?.fasonHedefId || "",
    // Fatura
    faturaNo: "",
    vadeGun: hmKalem?.odemeVadesi ? String(hmKalem.odemeVadesi) : "",
  });
  const up = (k,v) => setF(p=>({...p,[k]:v}));

  if(!m) return null;
  const INP = {background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,
    padding:"8px 10px",fontSize:13,color:C.text,width:"100%"};
  const gelenMiktar = parseFloat(String(f.miktar).replace(",",".")) || 0;
  const kalanEksik  = Math.max(0, m.toplamEksik - gelenMiktar);
  const nakliyeUcretNum = parseFloat(f.nakliyeUcret)||0;
  const birimNakliye = nakliyeUcretNum>0&&gelenMiktar>0 ? (nakliyeUcretNum/gelenMiktar) : 0;
  const fasonFirma = hizmetler.find(h=>h.id===f.fasonFirmaId);

  return(
    <Modal title="📥 Teslim Alma" onClose={onClose} width={540} maxHeight="85vh">
      {/* Başlık */}
      <div style={{background:"rgba(61,184,138,.06)",border:"1px solid rgba(61,184,138,.2)",
        borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>📥</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{m.ad}</div>
          <div style={{fontSize:11,color:C.muted}}>{m.tedarikci||"—"}
            {ilgiliSiparis&&<span style={{color:C.sky}}> · {ilgiliSiparis.id}</span>}
          </div>
        </div>
      </div>

      {/* Gelen Kalemler */}
      <div style={{background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          Gelen Kalemler
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",
          padding:"8px 10px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{m.ad}</div>
            <div style={{display:"flex",gap:10,fontSize:10,color:C.muted,marginTop:2}}>
              <span>Stok: <strong style={{color:C.text}}>{fmt(m.mevcut)} {m.birim}</strong></span>
              <span>Gerek: <strong style={{color:C.gold}}>{fmt(m.toplamGereken)} {m.birim}</strong></span>
              <span style={{color:C.coral}}>Eksik: <strong>{fmt(m.toplamEksik)} {m.birim}</strong></span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:C.muted}}>Gelen:</span>
            <input type="number" value={f.miktar} onChange={e=>up("miktar",e.target.value)} step="0.001"
              style={{...INP,width:90,textAlign:"right",padding:"6px 8px",fontWeight:700}}/>
            <span style={{fontSize:11,color:C.muted}}>{m.birim}</span>
          </div>
        </div>
        {gelenMiktar>0&&<div style={{fontSize:10,marginTop:6,paddingLeft:10,
          color:kalanEksik<=0?C.mint:C.gold,fontWeight:600}}>
          {kalanEksik<=0 ? "✅ Tüm eksik karşılanacak"
            : `⚡ Kısmi giriş — ${fmt(kalanEksik)} ${m.birim} hâlâ eksik kalacak`}
        </div>}
      </div>

      {/* Nakliye Kaydı */}
      <div style={{background:"rgba(232,145,74,.04)",border:"1px solid rgba(232,145,74,.15)",
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:"#E8914A",letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          🚚 Nakliye Kaydı
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Nakliyeci</div>
            <input value={f.nakliyeci} onChange={e=>up("nakliyeci",e.target.value)}
              placeholder="Ahmet Nakliyat" style={INP}/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Ücret (₺)</div>
            <input type="number" value={f.nakliyeUcret} onChange={e=>up("nakliyeUcret",e.target.value)}
              placeholder="500" style={INP}/>
          </div>
        </div>
        {birimNakliye>0&&(
          <div style={{marginTop:6,fontSize:11,color:"#E8914A",fontWeight:600}}>
            → {birimNakliye.toFixed(2)}₺/{m.birim} (otomatik hesap)
          </div>
        )}
      </div>

      {/* Yönlendirme */}
      <div style={{background:f.yonlendirme==="fason"?"rgba(124,92,191,.06)":"rgba(255,255,255,.02)",
        border:`1px solid ${f.yonlendirme==="fason"?"rgba(124,92,191,.2)":C.border}`,
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          📍 Yönlendirme
        </div>
        <div style={{display:"flex",gap:8,marginBottom:f.yonlendirme==="fason"?10:0}}>
          {[["depo","🏠 Depoya koy (stoka ekle)"],["fason","🏭 Direkt fasona gönder"]].map(([v,l])=>(
            <button key={v} onClick={()=>up("yonlendirme",v)} style={{
              flex:1,padding:"8px 10px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${f.yonlendirme===v?(v==="fason"?C.lav:C.mint)+"50":C.border}`,
              background:f.yonlendirme===v?`${v==="fason"?C.lav:C.mint}10`:"rgba(255,255,255,.02)",
              color:f.yonlendirme===v?(v==="fason"?C.lav:C.mint):C.muted,
              fontSize:11,fontWeight:f.yonlendirme===v?600:400,transition:"all .15s"
            }}>{l}</button>
          ))}
        </div>
        {f.yonlendirme==="fason"&&(
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Fason Firma</div>
            <select value={f.fasonFirmaId} onChange={e=>up("fasonFirmaId",e.target.value)}
              style={{...INP,cursor:"pointer"}}>
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

      {/* Fatura (opsiyonel) */}
      <div style={{background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,
        borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
          🧾 Fatura (opsiyonel)
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Fatura No</div>
            <input value={f.faturaNo} onChange={e=>up("faturaNo",e.target.value)}
              placeholder="F-2024-0341" style={INP}/>
          </div>
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Vade (gün)</div>
            <input type="number" value={f.vadeGun} onChange={e=>up("vadeGun",e.target.value)}
              placeholder="30" style={INP}/>
          </div>
        </div>
      </div>

      {/* Kalan için beklenen tarih */}
      {kalanEksik>0&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Kalan için Beklenen Tarih</div>
          <input type="date" value={f.beklenenTarih} onChange={e=>up("beklenenTarih",e.target.value)} style={INP}/>
        </div>
      )}

      {/* Butonlar */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"8px 16px",fontSize:12,color:C.muted,cursor:"pointer"}}>İptal</button>
        <button onClick={()=>{
          if(gelenMiktar<=0) return;

          // Nakliye kaydı oluştur
          const nakliyeKaydi = (f.nakliyeci||nakliyeUcretNum>0) ? {
            id: "nk-" + Date.now() + "-" + Math.random().toString(36).slice(2,6),
            tarih: new Date().toISOString().slice(0,10),
            nakliyeci: f.nakliyeci,
            nakliyeciTel: f.nakliyeTel,
            ucret: nakliyeUcretNum,
            kalemler: [{hamMaddeId:m.id, ad:m.ad, miktar:gelenMiktar, birim:m.birim}],
            nereden: m.tedarikci||"Tedarikçi",
            nereye: f.yonlendirme==="fason" ? (fasonFirma?.ad||"Fason") : "Atölye",
            tedarikSiparisId: ilgiliSiparis?.id||null,
            not: "",
          } : null;

          onKaydet({
            gelenMiktar,
            kalanEksik,
            beklenenTarih: kalanEksik>0?f.beklenenTarih:"",
            yonlendirme: f.yonlendirme,
            fasonFirmaId: f.fasonFirmaId,
            fasonFirmaAd: fasonFirma?.ad||"",
            nakliyeKaydi,
            faturaNo: f.faturaNo,
            vadeGun: parseInt(f.vadeGun)||0,
            ilgiliSiparisId: ilgiliSiparis?.id||null,
          });
          onClose();
        }} style={{background:`${C.mint}20`,border:`1px solid ${C.mint}40`,
          borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:700,color:C.mint,cursor:"pointer"}}>
          ✓ Teslim Al
        </button>
      </div>
    </Modal>
  );
}
