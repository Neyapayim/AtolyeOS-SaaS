import { useState } from 'react';
import { C, F, FB, fmt } from '../config/constants.js';
import { snGoster } from '../engine/index.js';
import { Modal, Btn, SilButonu } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';

export function IscilikModal({kalem, istasyonlar, calisanlar, onClose, onSave, onDelete}){
  const isEdit=!!kalem?.id;
  const [f,setF]=useState(kalem||{kod:"",ad:"",tip:"ic",istasyon:"",calisan:"",birim:"adet",sureDkAdet:0,birimFiyat:0,kdv:0,notlar:""});
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  // sureDkAdet = saniye cinsinden islem suresi
  // Saatlik ucret hesabi: birimFiyat / (sureDkAdet / 3600)
  const saatUcret = f.sureDkAdet>0 ? (f.birimFiyat / (f.sureDkAdet/3600)) : null;
  const icIstasyonlar=(istasyonlar||[]).filter(x=>x.tip==="ic"||!x.tip);
  const icCalisanlar=(calisanlar||[]).filter(x=>x.durum==="aktif");
  const [saatModu,setSaatModu]=useState(false);
  const [saatUcretGiris,setSaatUcretGiris]=useState(
    f.sureDkAdet>0 ? fmt(f.birimFiyat/(f.sureDkAdet/3600),0) : ""
  );
  const [manuelIstasyon,setManuelIstasyon]=useState("");
  const handleSaatUcret=(v)=>{
    setSaatUcretGiris(v);
    // saatlik ucret x (sn / 3600) = birim ucret
    if(f.sureDkAdet>0&&v>0) up("birimFiyat", Math.round(v*(f.sureDkAdet/3600)*100)/100);
  };

  return(
    <Modal title={isEdit?"Iscilik Duzenle":"Yeni Iscilik Tanimi"} onClose={onClose} width={560}>
      {/* Ust bilgi banner */}
      <div style={{background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,
        padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>👷</span>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:C.gold}}>Ic Iscilik</div>
          <div style={{fontSize:11,color:C.muted}}>Atolye icinde yapilan uretim adimi — istasyon ve sure eslesmesi yapilir</div>
        </div>
      </div>

      {/* Islem adi + kod */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
        <Field label="Islem Adi"><TextInp value={f.ad} onChange={v=>up("ad",v)} placeholder="Doseme, Montaj, Kumas Kesim..."/></Field>
        <Field label="Kod"><TextInp value={f.kod} onChange={v=>up("kod",v)} placeholder="IC-001"/></Field>
      </div>

      {/* Istasyon + Calisan eslesmesi */}
      <div style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px 14px",marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>⚙ Istasyon & Calisan Eslesmesi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Istasyon">
            <select value={f.istasyon} onChange={e=>up("istasyon",e.target.value)}
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:f.istasyon?C.text:C.muted,cursor:"pointer"}}>
              <option value="" style={{background:C.s2}}>— Secin —</option>
              {icIstasyonlar.map(ist=><option key={ist.id} value={ist.ad} style={{background:C.s2}}>{ist.ad}</option>)}
              <option value="__manuel__" style={{background:C.s2}}>+ Manuel gir</option>
            </select>
          </Field>
          <Field label="Sorumlu Calisan">
            <select value={f.calisan} onChange={e=>up("calisan",e.target.value)}
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:f.calisan?C.text:C.muted,cursor:"pointer"}}>
              <option value="" style={{background:C.s2}}>— Secin —</option>
              {icCalisanlar.map(c=><option key={c.id} value={c.ad} style={{background:C.s2}}>{c.ad}</option>)}
            </select>
          </Field>
        </div>
        {f.istasyon==="__manuel__"&&(
          <div style={{marginTop:8}}>
            <Field label="Istasyon Adi (manuel)"><TextInp value={manuelIstasyon} onChange={v=>{setManuelIstasyon(v);}} placeholder="Istasyon adi..."/></Field>
          </div>
        )}
      </div>

      {/* Sure ve ucret */}
      <div style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px 14px",marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>⏱ Sure & Ucret</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:10}}>
          <Field label="Islem Suresi (saniye)" hint="Orn: 2700 = 45 dakika">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <NumInp value={f.sureDkAdet} onChange={v=>{
                const sn=Math.round(v||0);
                up("sureDkAdet",sn);
                if(saatModu&&saatUcretGiris>0) up("birimFiyat",Math.round(saatUcretGiris*(sn/3600)*100)/100);
              }} step={30} min={0} style={{flex:1}}/>
              {f.sureDkAdet>0&&<span style={{fontSize:11,color:C.gold,whiteSpace:"nowrap",minWidth:60}}>{snGoster(f.sureDkAdet)}</span>}
            </div>
          </Field>
          <Field label="Birim">
            <select value={f.birim} onChange={e=>up("birim",e.target.value)}
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
              {["adet","mt","m2","set"].map(v=><option key={v} value={v} style={{background:C.s2}}>{v}</option>)}
            </select>
          </Field>
        </div>
        {/* Ucret giris modu toggle */}
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          {[["adet","Birim basina (₺/adet)"],["saat","Saatlik ucret (₺/saat)"]].map(([m,l])=>(
            <button key={m} onClick={()=>setSaatModu(m==="saat")} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${(saatModu===(m==="saat"))?C.gold+"50":C.border}`,
              background:(saatModu===(m==="saat"))?`${C.gold}10`:"rgba(255,255,255,.02)",
              color:(saatModu===(m==="saat"))?C.gold:C.muted,fontSize:11,fontFamily:FB,transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        {!saatModu?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <Field label="Birim Ucret (₺)"><NumInp value={f.birimFiyat} onChange={v=>up("birimFiyat",v)} step={0.5} style={{width:"100%"}}/></Field>
            <Field label="KDV %">
              <select value={String(f.kdv)} onChange={e=>up("kdv",parseInt(e.target.value))}
                style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
                {["0","10","20"].map(v=><option key={v} value={v} style={{background:C.s2}}>%{v}</option>)}
              </select>
            </Field>
            {saatUcret&&(
              <Field label="≈ Saatlik Ucret">
                <div style={{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.22)",borderRadius:9,
                  padding:"9px 12px",fontSize:13,fontWeight:700,color:C.gold}}>{fmt(saatUcret)}₺/sa</div>
              </Field>
            )}
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <Field label="Saatlik Ucret (₺)"><NumInp value={saatUcretGiris} onChange={handleSaatUcret} step={5} style={{width:"100%"}}/></Field>
            <Field label="KDV %">
              <select value={String(f.kdv)} onChange={e=>up("kdv",parseInt(e.target.value))}
                style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
                {["0","10","20"].map(v=><option key={v} value={v} style={{background:C.s2}}>%{v}</option>)}
              </select>
            </Field>
            <Field label="≈ Birim Ucret">
              <div style={{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.22)",borderRadius:9,
                padding:"9px 12px",fontSize:13,fontWeight:700,color:C.gold}}>{fmt(f.birimFiyat)}₺/{f.birim}</div>
            </Field>
          </div>
        )}
        {f.sureDkAdet>0&&(
          <div style={{marginTop:8,display:"flex",gap:12,fontSize:11,color:C.muted}}>
            <span>📊 {Math.floor(28800/f.sureDkAdet)} adet/gun kapasitesi (8 saatlik vardiya)</span>
            {f.birimFiyat>0&&<span>· {fmt(f.birimFiyat*(28800/f.sureDkAdet))}₺/gun uretim maliyeti</span>}
          </div>
        )}
      </div>

      <Field label="Not"><TextInp value={f.notlar} onChange={v=>up("notlar",v)} placeholder="Ozel notlar..."/></Field>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        {isEdit
          ?<SilButonu onDelete={()=>onDelete(f.id)} isim={f.ad}/>
          :<span/>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onClose}>Iptal</Btn>
          <Btn variant="primary" color={C.gold} onClick={()=>onSave({...f,tip:"ic",istasyon:f.istasyon==="__manuel__"?manuelIstasyon:f.istasyon})}>{isEdit?"Kaydet":"Ekle"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
