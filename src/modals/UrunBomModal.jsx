import { useState } from 'react';
import { C, F, uid, fmt } from '../config/constants.js';
import { bomKalemMaliyet } from '../engine/index.js';
import { Modal, Btn, SilButonu } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';
import { BomEditor } from './BomEditor.jsx';

export function UrunBomModal({kalem, hamMaddeler = [], yarimamulList = [], hizmetler = [], onClose, onSave, onDelete, onKopya}) {
  const isEdit=!!kalem?.id;
  const [f,setF]=useState(kalem||{kod:"",ad:"",kategori:"",birim:"adet",miktar:0,minStok:0,satisKdvDahil:0,satisKdv:10,notlar:"",bom:[]});
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const malBom=f.bom.reduce((s,b)=>{
    const liste=[...hamMaddeler,...yarimamulList,...hizmetler];
    const k=liste.find(x=>x.id===b.kalemId);
    if(!k) return s;
    return s + bomKalemMaliyet(k, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetler);
  },0);
  const saleNet=f.satisKdvDahil/(1+f.satisKdv/100);
  const kar=saleNet-malBom, marj=saleNet>0?(kar/saleNet)*100:0;
  return(
    <Modal title={isEdit?"Ürün Düzenle":f._kopya?"Ürün Kopyası":"Yeni Ürün"} onClose={onClose} width={680}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Ürün Kodu"><TextInp value={f.kod} onChange={v=>up("kod",v)} placeholder="UR-001"/></Field>
        <Field label="Kategori"><TextInp value={f.kategori} onChange={v=>up("kategori",v)} placeholder="Tabure, Sandalye..."/></Field>
      </div>
      <Field label="Ürün Adı"><TextInp value={f.ad} onChange={v=>up("ad",v)} placeholder="Trio Tabure"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Field label="Satış Fiyatı (KDV dahil ₺)"><NumInp value={f.satisKdvDahil} onChange={v=>up("satisKdvDahil",v)} step={1} style={{width:"100%"}}/></Field>
        <Field label="Satış KDV %">
          <select value={String(f.satisKdv)} onChange={e=>up("satisKdv",parseInt(e.target.value))}
            style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
            {["0","10","20"].map(v=><option key={v} value={v} style={{background:C.s2}}>%{v}</option>)}
          </select>
        </Field>
        <Field label="Stok (adet)"><NumInp value={f.miktar} onChange={v=>up("miktar",v)} style={{width:"100%"}}/></Field>
      </div>
      {malBom>0&&f.satisKdvDahil>0&&(
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {[["Maliyet",`${fmt(malBom)}₺`,C.coral],["Net Satış",`${fmt(saleNet)}₺`,C.text],["Kâr",`${fmt(kar)}₺`,kar>0?C.mint:C.coral],["Marj",`%${fmt(marj,1)}`,marj>20?C.mint:marj>10?C.gold:C.coral]].map(([l,v,c],i)=>(
            <div key={i} style={{background:`${c}0D`,border:`1px solid ${c}1A`,borderRadius:9,padding:"6px 12px",textAlign:"center",flex:1,minWidth:70}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:F}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>⚙ Ürün Reçetesi</div>
        <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px"}}>
          <BomEditor bom={f.bom} onChange={bom=>up("bom",bom)} hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} kendisi={f.id}/>
        </div>
      </div>
      <Field label="Not"><TextInp value={f.notlar} onChange={v=>up("notlar",v)}/></Field>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <div style={{display:"flex",gap:6}}>
          {isEdit&&<SilButonu onDelete={()=>onDelete(f.id)} isim={f.ad}/>}
          {isEdit&&onKopya&&<button onClick={()=>onKopya(f)}
            style={{background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 13px",fontSize:12,color:C.sub,cursor:"pointer"}}>📋 Kopyasını Oluştur</button>}
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={onClose}>İptal</Btn><Btn variant="primary" color={C.mint} onClick={()=>onSave(f)}>{isEdit?"Kaydet":"Ekle"}</Btn></div>
      </div>
    </Modal>
  );
}
