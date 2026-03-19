import { useState } from 'react';
import { C, F, fmt } from '../config/constants.js';
import { Modal, Btn, SilButonu } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';

export function FasonHizmetModal({kalem, onClose, onSave, onDelete}){
  const isEdit=!!kalem?.id;
  const [f,setF]=useState(kalem||{kod:"",ad:"",tip:"fason",firma:"",tel:"",adres:"",birim:"adet",birimFiyat:0,kdv:20,sureGun:1,notlar:"",
    // Kapasite Bilgileri
    gunlukKapasite:0,
    oncedenHaberGun:3,
    minPartiBuyukluk:0,
  });
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const [hata,setHata]=useState("");
  const netTl=f.birimFiyat*(1+f.kdv/100);

  return(
    <Modal title={isEdit?"Fason Hizmet Duzenle":"Yeni Fason Hizmet"} onClose={onClose} width={540}>
      {/* Ust bilgi banner */}
      <div style={{background:"rgba(124,92,191,.08)",border:"1px solid rgba(124,92,191,.2)",borderRadius:10,
        padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🏭</span>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:C.lav}}>Fason / Dis Hizmet</div>
          <div style={{fontSize:11,color:C.muted}}>Disaridan satin alinan uretim hizmeti — firma ve fiyat bilgisi girilir</div>
        </div>
      </div>

      {/* Hizmet adi + kod */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
        <Field label="Hizmet Adi"><TextInp value={f.ad} onChange={v=>up("ad",v)} placeholder="Statik Boya, Lazer Kesim..."/></Field>
        <Field label="Kod"><TextInp value={f.kod} onChange={v=>up("kod",v)} placeholder="FS-001"/></Field>
      </div>

      {/* Firma bilgileri */}
      <div style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px 14px",marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>🏢 Hizmet Alinan Firma</div>
        <Field label="Firma Adi"><TextInp value={f.firma} onChange={v=>up("firma",v)} placeholder="Boya Atolyesi A, Metal Lazer B..."/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:0}}>
          <Field label="Telefon"><TextInp value={f.tel||""} onChange={v=>up("tel",v)} placeholder="0532 xxx xx xx"/></Field>
          <Field label="Adres / Not"><TextInp value={f.adres||""} onChange={v=>up("adres",v)} placeholder="Ikitelli OSB..."/></Field>
        </div>
      </div>

      {/* Fiyat ve sure */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginTop:12}}>
        <Field label="Birim">
          <select value={f.birim} onChange={e=>up("birim",e.target.value)}
            style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
            {["adet","mt","m2","kg","boy","set","plaka"].map(v=><option key={v} value={v} style={{background:C.s2}}>{v}</option>)}
          </select>
        </Field>
        <Field label="Birim Fiyat (₺)"><NumInp value={f.birimFiyat} onChange={v=>up("birimFiyat",v)} step={0.5} style={{width:"100%"}}/></Field>
        <Field label="KDV %">
          <select value={String(f.kdv)} onChange={e=>up("kdv",parseInt(e.target.value))}
            style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
            {["0","10","20"].map(v=><option key={v} value={v} style={{background:C.s2}}>%{v}</option>)}
          </select>
        </Field>
        <Field label="KDV'li Fiyat">
          <div style={{background:"rgba(124,92,191,.1)",border:"1px solid rgba(124,92,191,.22)",borderRadius:9,
            padding:"9px 10px",fontSize:14,fontWeight:700,color:C.lav}}>{fmt(netTl)}₺</div>
        </Field>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12}}>
        <Field label="Ortalama Bekleme (gun)"><NumInp value={f.sureGun} onChange={v=>up("sureGun",v)} step={0.5} style={{width:"100%"}}/></Field>
        <Field label="Not"><TextInp value={f.notlar} onChange={v=>up("notlar",v)} placeholder="Ozel notlar, odeme kosullari..."/></Field>
      </div>

      {/* Kapasite & Planlama Bilgileri */}
      <div style={{background:"rgba(124,92,191,.05)",border:"1px solid rgba(124,92,191,.18)",borderRadius:11,padding:"12px 14px",marginTop:8,marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:700,color:C.lav,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>📊 Kapasite & Planlama</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="Gunluk Kapasite (adet/gun)">
            <NumInp value={f.gunlukKapasite} onChange={v=>up("gunlukKapasite",v)} step={10} placeholder="720" style={{width:"100%"}}/>
          </Field>
          <Field label="Onceden Haber (gun)">
            <NumInp value={f.oncedenHaberGun} onChange={v=>up("oncedenHaberGun",v)} step={1} placeholder="3" style={{width:"100%"}}/>
          </Field>
          <Field label="Min Parti Buyuklugu">
            <NumInp value={f.minPartiBuyukluk} onChange={v=>up("minPartiBuyukluk",v)} step={10} placeholder="100" style={{width:"100%"}}/>
          </Field>
        </div>
        {/* Hesaplanmis ozet */}
        {f.gunlukKapasite>0&&(
          <div style={{marginTop:8,padding:"8px 10px",background:"rgba(124,92,191,.08)",borderRadius:8,
            display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:C.muted}}>Gunluk Kapasite</div>
              <div style={{fontSize:16,fontWeight:800,color:C.lav,fontFamily:F}}>{f.gunlukKapasite} <span style={{fontSize:10,fontWeight:400}}>adet/gun</span></div>
            </div>
            {f.oncedenHaberGun>0&&<div>
              <div style={{fontSize:9,color:C.muted}}>Planlama</div>
              <div style={{fontSize:11,color:C.gold}}>⏱ {f.oncedenHaberGun} gun onceden haber + {f.sureGun} gun bekleme</div>
            </div>}
            {f.birimFiyat>0&&<div>
              <div style={{fontSize:9,color:C.muted}}>Gunluk Maliyet</div>
              <div style={{fontSize:11,color:C.cyan}}>{fmt(f.gunlukKapasite*f.birimFiyat)}₺/gun</div>
            </div>}
          </div>
        )}
      </div>

      {hata&&<div style={{background:"rgba(220,60,60,.12)",border:"1px solid rgba(220,60,60,.3)",borderRadius:8,padding:"8px 14px",marginTop:6,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>⚠</span><span style={{fontSize:12,color:"#DC3C3C",fontWeight:500}}>{hata}</span></div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        {isEdit
          ?<SilButonu onDelete={()=>onDelete(f.id)} isim={f.ad}/>
          :<span/>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onClose}>Iptal</Btn>
          <Btn variant="primary" color={C.lav} onClick={()=>{if(!(f.ad||"").trim()){setHata("Hizmet adi zorunludur");return;}setHata("");onSave({...f,tip:"fason"});}}>{isEdit?"Kaydet":"Ekle"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
