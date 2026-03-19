import { useState } from 'react';
import { C, uid, fmt } from '../config/constants.js';
import { bomKalemMaliyet } from '../engine/index.js';
import { Modal, Btn, SilButonu } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';
import { BomEditor } from './BomEditor.jsx';

export function YariMamulModal({kalem, hamMaddeler = [], yarimamulList = [], hizmetler = [], onClose, onSave, onDelete, onKopya}) {
  const isEdit=!!kalem?.id;
  const [f,setF]=useState(kalem||{kod:"",ad:"",kategori:"",birim:"adet",miktar:0,minStok:0,notlar:"",bom:[]});
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const [hata,setHata]=useState("");
  const malBom=f.bom.reduce((s,b)=>{
    const liste=[...hamMaddeler,...yarimamulList,...hizmetler];
    const k=liste.find(x=>x.id===b.kalemId);
    if(!k) return s;
    return s + bomKalemMaliyet(k, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetler);
  },0);
  return(
    <Modal title={isEdit?"Yarı Mamül Düzenle":f._kopya?"Yarı Mamül Kopyası":"Yeni Yarı Mamül"} onClose={onClose} width={680}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Kod"><TextInp value={f.kod} onChange={v=>up("kod",v)} placeholder="YM-001"/></Field>
        <Field label="Kategori">
          <div style={{position:"relative"}}>
            <input value={f.kategori} onChange={e=>up("kategori",e.target.value)}
              list="ym-kat-list" placeholder="Metal, Kumaş, İskelet..."
              className="inp" style={{width:"100%",background:"rgba(255,255,255,.04)",
              border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text}}/>
            <datalist id="ym-kat-list">
              {[...new Set([...hamMaddeler.map(x=>x.kategori),...yarimamulList.map(x=>x.kategori)].filter(Boolean))].map(k=>(
                <option key={k} value={k}/>
              ))}
            </datalist>
          </div>
        </Field>
      </div>
      <Field label="Yarı Mamül Adı"><TextInp value={f.ad} onChange={v=>up("ad",v)} placeholder="TT-001 Boyalı İskelet"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Field label="Birim"><TextInp value={f.birim} onChange={v=>up("birim",v)} placeholder="adet"/></Field>
        <Field label="Mevcut Miktar"><NumInp value={f.miktar} onChange={v=>up("miktar",v)} style={{width:"100%"}}/></Field>
        <Field label="Min Stok"><NumInp value={f.minStok} onChange={v=>up("minStok",v)} style={{width:"100%"}}/></Field>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:.6}}>⚙ Üretim Reçetesi</div>
          {malBom>0&&<div style={{background:"rgba(232,145,74,.1)",border:`1px solid rgba(232,145,74,.25)`,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700,color:C.cyan}}>Birim Maliyet: {fmt(malBom)}₺</div>}
        </div>
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
        <div style={{display:"flex",gap:8}}><Btn onClick={onClose}>Iptal</Btn><Btn variant="primary" onClick={()=>{if(!(f.ad||"").trim()){setHata("Yari mamul adi zorunludur");return;}setHata("");onSave(f);}}>{ isEdit?"Kaydet":"Ekle"}</Btn></div>
      </div>
      {hata&&<div style={{background:"rgba(220,60,60,.12)",border:"1px solid rgba(220,60,60,.3)",borderRadius:8,padding:"8px 14px",marginTop:8,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>⚠</span><span style={{fontSize:12,color:"#DC3C3C",fontWeight:500}}>{hata}</span></div>}
    </Modal>
  );
}
