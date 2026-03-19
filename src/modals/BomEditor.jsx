import { useState } from 'react';
import { C, F, uid, fmt, BIRIM_GRUPLARI } from '../config/constants.js';
import { bomKalemMaliyet, _netFiyat, boyUzunlukCmDuzelt } from '../engine/index.js';

export function BomEditor({bom = [], onChange, hamMaddeler = [], yarimamulList = [], hizmetler = [], kendisi=""}) {
  const [addTip,setAddTip]=useState(null);
  // Inline ekleme state'leri
  const [selId,setSelId]=useState("");
  const [selMiktar,setSelMiktar]=useState(1);
  const [selBirim,setSelBirim]=useState("adet");
  const [selFire,setSelFire]=useState(0);
  const [selNot,setSelNot]=useState("");

  const upd=(id,k,v)=>onChange(bom.map(r=>r.id===id?{...r,[k]:v}:r));
  const del=(id)=>onChange(bom.filter(r=>r.id!==id));

  // Tip degisince ilk kalemi sec
  const handleTipSec=(tip)=>{
    const liste=tip==="hammadde"?hamMaddeler:tip==="yarimamul"?yarimamulList.filter(y=>y.id!==kendisi):hizmetler;
    const ilk=liste[0];
    setSelId(ilk?.id||"");
    setSelBirim(ilk?.birim||"adet");
    setSelMiktar(1);
    setSelFire(0);
    setSelNot("");
    setAddTip(tip);
  };

  const handleEkle=()=>{
    if(!selId) return;
    onChange([...bom,{id:uid(),tip:addTip,kalemId:selId,miktar:selMiktar||1,birim:selBirim,fireTahmini:selFire||0,fireBirim:"%",not:selNot}]);
    setAddTip(null);
  };

  // Surukle-birak
  const onDragStart=(e,i)=>{e.dataTransfer.setData("bomIdx",String(i));e.currentTarget.style.opacity=".4";};
  const onDragEnd=(e)=>e.currentTarget.style.opacity="1";
  const onDrop=(e,to)=>{
    e.preventDefault();
    const from=parseInt(e.dataTransfer.getData("bomIdx"));
    if(from===to) return;
    const a=[...bom];const [m]=a.splice(from,1);a.splice(to,0,m);
    onChange(a);
  };

  return(
    <div>
      {/* BOM satirlari */}
      {bom.length===0&&!addTip&&(
        <div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:12}}>
          Henüz bileşen eklenmedi. Aşağıdan ekleyin.
        </div>
      )}
      {bom.map((row,ri)=>{
        const tc=row.tip==="hammadde"?C.sky:row.tip==="yarimamul"?C.cyan:C.lav;
        const tl=row.tip==="hammadde"?"HM":row.tip==="yarimamul"?"YM":"HİZ";
        const liste=row.tip==="hammadde"?hamMaddeler:row.tip==="yarimamul"?yarimamulList:hizmetler;
        const kalem=liste.find(x=>x.id===row.kalemId);
        const bgr=BIRIM_GRUPLARI[kalem?.birimGrup];
        const birimOps=bgr?bgr.birimler.map(b=>({value:b.id,label:b.label})):[{value:row.birim||"adet",label:row.birim||"adet"}];
        const satirMaliyet = kalem ? bomKalemMaliyet(kalem, row.miktar||0, row.birim||"adet", hamMaddeler, yarimamulList, hizmetler) : 0;
        const hmBirimAcik = kalem?.birimGrup==="uzunluk"
          ? (kalem.birim==="boy"?`₺/mt (1boy=${boyUzunlukCmDuzelt(kalem.boyUzunluk)}cm)`:`₺/${kalem.birim}`)
          : kalem?`₺/${kalem.birim||"adet"}`:"";
        return(
          <div key={row.id}
            draggable onDragStart={e=>onDragStart(e,ri)} onDragEnd={onDragEnd}
            onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,ri)}
            style={{borderRadius:9,marginBottom:4,background:"rgba(255,255,255,.018)",
              border:`1px solid ${C.border}`,animation:`row-in .2s ${ri*.03}s ease both`,
              overflow:"hidden",cursor:"grab",transition:"opacity .15s"}}>
            <div style={{display:"grid",gridTemplateColumns:"16px 38px 1fr 72px 76px 52px 22px",
              gap:6,alignItems:"center",padding:"7px 8px"}}>
              {/* Tutacak */}
              <span style={{color:C.muted,fontSize:13,textAlign:"center",opacity:.4,userSelect:"none"}}>⠿</span>
              <span style={{background:`${tc}14`,color:tc,border:`1px solid ${tc}22`,borderRadius:6,
                padding:"2px 0",fontSize:9,fontWeight:700,textAlign:"center"}}>{tl}</span>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:C.text,lineHeight:1.3}}>{kalem?.ad||"?"}</div>
                {hmBirimAcik&&<div style={{fontSize:9,color:C.muted,marginTop:1}}>{hmBirimAcik}</div>}
              </div>
              <input type="number" step={0.001} min={0} value={row.miktar??""} className="inp"
                onChange={e=>upd(row.id,"miktar",e.target.value===""?0:parseFloat(e.target.value))}
                style={{background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"5px 7px",fontSize:12,color:C.text,textAlign:"right",width:"100%"}}/>
              <select value={row.birim||""} className="inp" onChange={e=>upd(row.id,"birim",e.target.value)}
                style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"5px 7px",fontSize:11,color:C.text,width:"100%",cursor:"pointer"}}>
                {birimOps.map(o=><option key={o.value} value={o.value} style={{background:C.s2}}>{o.label}</option>)}
              </select>
              <div style={{position:"relative"}}>
                <input type="number" step={0.1} min={0} value={row.fireTahmini??""} className="inp"
                  onChange={e=>upd(row.id,"fireTahmini",e.target.value===""?0:parseFloat(e.target.value))}
                  style={{background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:7,
                    padding:"5px 18px 5px 5px",fontSize:10,color:C.gold,textAlign:"right",width:"100%"}}/>
                <span style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",
                  fontSize:7,color:C.muted,pointerEvents:"none"}}>fire</span>
              </div>
              <button onClick={()=>del(row.id)} style={{width:22,height:22,borderRadius:6,
                border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:13,
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,60,60,.15)";e.currentTarget.style.color=C.coral;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.muted;}}>×</button>
            </div>
            {satirMaliyet>0&&(()=>{
              const kdvOran  = kalem?.kdv||0;
              const listeNet = _netFiyat(kalem?.listeFiyat||kalem?.birimFiyat||0, kalem?.iskonto||0);
              const kdvliNet = listeNet*(1+kdvOran/100);
              const boyUzunlukCm2 = boyUzunlukCmDuzelt(kalem?.boyUzunluk); // 0 ise girilmemis

              // ── Birim fiyat gosterimi ─────────────────────────────────────
              // ALTIN KURAL: listeFiyat HER ZAMAN TL/mt -> kdvliNet = TL/mt
              // birim="boy" sadece stok sayim birimi, fiyat hesabini etkilemez
              const birimFiyatGoster = (()=>{
                if(kalem?.birimGrup!=="uzunluk")
                  return `${fmt(kdvliNet,2)}₺/${kalem?.birim||"adet"}${kdvOran>0?` (KDV%${kdvOran} dahil)`:""}`;
                // mt veya boy: kdvliNet = TL/mt her zaman
                if(kalem.birim==="mt")
                  return `${fmt(kdvliNet,2)}₺/mt${kdvOran>0?` (KDV%${kdvOran} dahil)`:""}`;
                // boy: kdvliNet = TL/mt -> sadece TL/mt goster
                if(kalem.birim==="boy") {
                  return `${fmt(kdvliNet,2)}₺/mt${kdvOran>0?` (KDV%${kdvOran} dahil)`:""}`;
                }
                if(kalem.birim==="cm")
                  return `${fmt(kdvliNet,2)}₺/cm${kdvOran>0?` (KDV%${kdvOran} dahil)`:""}`;
                return `${fmt(kdvliNet,2)}₺/${kalem?.birim||""}`;
              })();

              // ── Miktar donusum gosterimi (128.6cm = 1.286mt gibi) ────────
              const birimAcik = (()=>{
                if(kalem?.birimGrup!=="uzunluk") return "";
                const bm=row.birim, km=kalem?.birim;
                if(bm==="cm"  &&km==="mt")  return ` = ${fmt(row.miktar/100,3)}mt`;
                if(bm==="mm"  &&km==="mt")  return ` = ${fmt(row.miktar/1000,3)}mt`;
                if(bm==="mt"  &&km==="mt")  return ""; // ayni birim
                if(bm==="cm"  &&km==="boy"&&boyUzunlukCm2>0) return ` = ${fmt(row.miktar/boyUzunlukCm2,3)}boy`;
                if(bm==="mt"  &&km==="boy"&&boyUzunlukCm2>0) return ` = ${fmt(row.miktar*100/boyUzunlukCm2,3)}boy`;
                if(bm==="mm"  &&km==="boy"&&boyUzunlukCm2>0) return ` = ${fmt(row.miktar/10/boyUzunlukCm2,3)}boy`;
                if(bm==="boy" &&km==="boy") return ""; // ayni
                return "";
              })();
              return(
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,
                  padding:"3px 10px 4px",background:"rgba(255,255,255,.01)",borderTop:`1px solid ${C.border}`}}>
                  <span style={{fontSize:9,color:C.muted}}>{row.miktar} {row.birim}{birimAcik} ×</span>
                  <span style={{fontSize:9,color:C.sub}}>{birimFiyatGoster}</span>
                  <span style={{fontSize:9,color:C.muted}}>=</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.mint}}>{fmt(satirMaliyet)}₺</span>
                </div>
              );
            })()}
          </div>
        );
      })}

      {/* ── INLINE EKLEME PANELI ── */}
      {addTip&&(()=>{
        const tipRnk=addTip==="hammadde"?C.sky:addTip==="yarimamul"?C.cyan:C.lav;
        const tipLbl=addTip==="hammadde"?"Ham Madde":addTip==="yarimamul"?"Yarı Mamül":"Hizmet";
        const liste=addTip==="hammadde"?hamMaddeler:addTip==="yarimamul"?yarimamulList.filter(y=>y.id!==kendisi):hizmetler;
        const secK=liste.find(x=>x.id===selId);
        const bgr=BIRIM_GRUPLARI[secK?.birimGrup];
        const birimOps=bgr?bgr.birimler.map(b=>({value:b.id,label:b.label})):[{value:secK?.birim||"adet",label:secK?.birim||"adet"}];
        const onKalemDeg=(id)=>{
          const k=liste.find(x=>x.id===id);
          setSelId(id);
          setSelBirim(k?.birim||"adet");
        };
        const anlikMaliyet=secK?bomKalemMaliyet(secK,selMiktar||0,selBirim,hamMaddeler,yarimamulList,hizmetler):0;

        // Kalemler kategoriye gore grupla
        const katGroups=[...new Set(liste.map(x=>x.kategori||"Diğer"))].sort();
        return(
          <div style={{marginTop:8,background:`${tipRnk}08`,border:`1px solid ${tipRnk}30`,
            borderRadius:10,padding:"10px 12px",animation:"fade-up .2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,color:tipRnk}}>+ {tipLbl} Ekle</span>
              <button onClick={()=>setAddTip(null)}
                style={{background:"transparent",border:"none",color:C.muted,fontSize:16,cursor:"pointer",lineHeight:1}}>×</button>
            </div>

            {/* Kalem secimi — gruplu */}
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Kalem</div>
              <select value={selId} onChange={e=>onKalemDeg(e.target.value)}
                style={{width:"100%",background:C.s3,border:`1px solid ${tipRnk}40`,borderRadius:8,
                  padding:"8px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
                {katGroups.map(kat=>(
                  <optgroup key={kat} label={kat} style={{background:C.s2}}>
                    {liste.filter(x=>(x.kategori||"Diğer")===kat).map(x=>(
                      <option key={x.id} value={x.id} style={{background:C.s2}}>
                        {x.kod?`[${x.kod}] `:""}{x.ad}
                        {x.birimFiyat>0?` — ${fmt(x.birimFiyat*(1+(x.kdv||0)/100))}₺/${x.birim||"adet"}`:""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Miktar + Birim yan yana */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Miktar</div>
                <input type="number" step={0.001} min={0} value={selMiktar} className="inp"
                  onChange={e=>setSelMiktar(parseFloat(e.target.value)||0)}
                  style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${tipRnk}40`,
                    borderRadius:8,padding:"7px 10px",fontSize:13,color:C.text,textAlign:"right"}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Birim</div>
                <select value={selBirim} onChange={e=>setSelBirim(e.target.value)}
                  style={{width:"100%",background:C.s3,border:`1px solid ${tipRnk}40`,borderRadius:8,
                    padding:"7px 10px",fontSize:12,color:C.text,cursor:"pointer"}}>
                  {birimOps.map(o=><option key={o.value} value={o.value} style={{background:C.s2}}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Anlik maliyet goster */}
            {anlikMaliyet>0&&(
              <div style={{marginBottom:8,padding:"5px 10px",background:"rgba(255,255,255,.03)",
                borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                <span style={{fontSize:10,color:C.muted}}>
                  {selMiktar} {selBirim}
                  {secK?.birimGrup==="uzunluk"&&(()=>{
                    const boy=boyUzunlukCmDuzelt(secK.boyUzunluk);
                    if(secK.birim==="mt"&&selBirim==="cm") return ` = ${fmt(selMiktar/100,3)}mt`;
                    if(secK.birim==="boy"&&boy>0&&selBirim==="cm") return ` = ${fmt(selMiktar/boy,3)}boy`;
                    if(secK.birim==="boy"&&boy>0&&selBirim==="mt") return ` = ${fmt(selMiktar*100/boy,3)}boy`;
                    return "";
                  })()}
                </span>
                <span style={{fontSize:13,fontWeight:700,color:tipRnk}}>{fmt(anlikMaliyet)}₺</span>
              </div>
            )}

            {/* Butonlar */}
            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
              <button onClick={()=>setAddTip(null)}
                style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"5px 12px",fontSize:12,color:C.muted,cursor:"pointer"}}>İptal</button>
              <button onClick={handleEkle} disabled={!selId}
                style={{background:`${tipRnk}18`,border:`1px solid ${tipRnk}40`,borderRadius:7,
                  padding:"5px 14px",fontSize:12,fontWeight:700,color:tipRnk,cursor:selId?"pointer":"default",
                  opacity:selId?1:.5}}>✓ BOM'a Ekle</button>
            </div>
          </div>
        );
      })()}

      {/* Ekleme butonlari */}
      {!addTip&&(
        <div style={{display:"flex",gap:6,marginTop:8}}>
          {[["hammadde","+ Ham Madde",C.sky],["yarimamul","+ Yarı Mamül",C.cyan],["hizmet","+ İşçilik / Fason",C.lav]].map(([tip,lbl,col])=>(
            <button key={tip} onClick={()=>handleTipSec(tip)}
              style={{background:`${col}0D`,border:`1px solid ${col}22`,
              borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:600,color:col,cursor:"pointer"}}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}
