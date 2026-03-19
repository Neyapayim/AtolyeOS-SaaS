import { useState, useMemo } from 'react';
import { C, F, uid, fmt } from '../config/constants.js';
import { bomMalzemeListesi, terminHesaplaEngine, ekleIsGunuEngine, isGunuFarkiEngine } from '../engine/index.js';
import { Modal, Btn } from '../components/index.js';
import { Field, NumInp } from '../components/FormElements.jsx';

export function UretimEmriModal({init,duzenleme,onClose,urunler,urunBomList,yarimamulList,hamMaddeler,calisanlar,hizmetler,setUretimEmirleri,setAktifUE}){
  const [ue,setUE]=useState({strateji:"gunluk",...init});
  const [silOnay,setSilOnay]=useState(false);
  const upUE=(k,v)=>setUE(p=>({...p,[k]:v}));

  // malzemeKontrol: engine'e bağlandı — tek kaynak
  const malzemeKontrol = useMemo(()=>{
    const urun = [...(urunler||[]),...(urunBomList||[])].find(x=>x.id===ue.urunId);
    if(!urun?.bom) return {liste:[],debugLog:[]};
    const liste = bomMalzemeListesi(urun, ue.adet||1, hamMaddeler||[], yarimamulList||[], urunler||[]);
    return {liste, debugLog:[]};
  },[ue.urunId, ue.adet, hamMaddeler, urunler, yarimamulList]);
  const malzemeListesi = malzemeKontrol?.liste || [];
  const malzemeDebug  = malzemeKontrol?.debugLog || [];

  const eksikVar = malzemeListesi.some(m=>!m.yeterli);

  // BOM'dan aşamaları otomatik oluştur
  const bomdenAsamaOlustur = (urun, adet=1) => {
    if(!urun?.bom?.length) return [];
    const tumHizmetler = hizmetler||[];
    const asamalar = [];
    // Rekürsif: YM içindeki fason+iç işçilikleri topla
    const hizmetTopla = (bom, derinlik=0) => {
      if(derinlik>6) return;
      (bom||[]).forEach(b=>{
        if(b.tip==="hizmet"){
          const hz = tumHizmetler.find(x=>x.id===b.kalemId);
          if(hz) asamalar.push({
            id:uid(), ad:hz.ad, durum:"bekliyor",
            calisan: hz.calisan||"",
            sureDk: hz.sureDkAdet||0,
            fason: hz.tip==="fason",
            hizmetId: hz.id
          });
        } else if(b.tip==="yarimamul"){
          const ym = (yarimamulList||[]).find(x=>x.id===b.kalemId)
                  || (urunler||[]).find(x=>x.id===b.kalemId)
                  || (urunBomList||[]).find(x=>x.id===b.kalemId);
          hizmetTopla(ym?.bom||[], derinlik+1);
        }
      });
    };
    // Önce YM içlerini tara
    urun.bom.forEach(b=>{
      if(b.tip==="yarimamul"){
        const ym = (yarimamulList||[]).find(x=>x.id===b.kalemId)
                || (urunler||[]).find(x=>x.id===b.kalemId)
                || (urunBomList||[]).find(x=>x.id===b.kalemId);
        hizmetTopla(ym?.bom||[], 1);
      } else if(b.tip==="hizmet"){
        const hz = tumHizmetler.find(x=>x.id===b.kalemId);
        if(hz) asamalar.push({
          id:uid(), ad:hz.ad, durum:"bekliyor",
          calisan:hz.calisan||"",
          sureDk:hz.sureDkAdet||0,
          fason:hz.tip==="fason",
          hizmetId:hz.id
        });
      }
    });
    // Tekrar edenleri temizle (aynı ad)
    const tekSiz = [];
    const goruldu = new Set();
    asamalar.forEach(a=>{
      if(!goruldu.has(a.ad)){goruldu.add(a.ad);tekSiz.push(a);}
    });
    return tekSiz;
  };

  // Termin hesaplama
  const ekleIsGunu = ekleIsGunuEngine;
  const isGunuFarki = isGunuFarkiEngine;
  const terminHesapla = terminHesaplaEngine;

  const secilenUrun = [...(urunler||[]),...(urunBomList||[])].find(x=>x.id===ue.urunId);
  const tahmin = ue.asamalar?.length>0 ? terminHesapla(ue.asamalar, ue.adet||1) : null;
  const terminStr = tahmin?.termin ? tahmin.termin.toISOString().slice(0,10) : "";

  const handleUrunSec = (urunId) => {
    const u = [...(urunler||[]),...(urunBomList||[])].find(x=>x.id===urunId);
    if(!u){setUE(p=>({...p,urunId:"",urunAd:"",asamalar:[]}));return;}
    const asamalar = bomdenAsamaOlustur(u, ue.adet||1);
    const tahminYeni = asamalar.length>0 ? terminHesapla(asamalar, ue.adet||1) : null;
    setUE(p=>({...p,
      urunId, urunAd:u.ad,
      asamalar,
      termin: tahminYeni?.termin ? tahminYeni.termin.toISOString().slice(0,10) : p.termin
    }));
  };

  const handleAdetDegis = (adet) => {
    const tahminYeni = ue.asamalar?.length>0 ? terminHesapla(ue.asamalar, adet) : null;
    setUE(p=>({...p, adet,
      termin: tahminYeni?.termin ? tahminYeni.termin.toISOString().slice(0,10) : p.termin
    }));
  };

  const handleSave=()=>{
    if(!ue.urunAd?.trim()) return;
    // Eksik malzemeleri UE'ye kaydet (tedarik takibi için)
    const ueKayit = {...ue, eksikMalzemeler: malzemeListesi.filter(m=>!m.yeterli)};
    if(duzenleme){
      setUretimEmirleri(p=>p.map(e=>e.id===ue.id?ueKayit:e));
    } else {
      setUretimEmirleri(p=>[...p,ueKayit]);
      setAktifUE&&setAktifUE(ue.id);
    }
    onClose();
  };

  const handleSil = () => {
    if(silOnay){setUretimEmirleri(p=>p.filter(e=>e.id!==ue.id));onClose();}
    else{setSilOnay(true);setTimeout(()=>setSilOnay(false),3000);}
  };

  const INP = {width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text};

  return(
    <Modal title={duzenleme?"Üretim Emri Düzenle":"Yeni Üretim Emri"} onClose={onClose} width={620} maxHeight="85vh">

      {/* Üst grid: kod + adet */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Field label="Emir Kodu">
          <input value={ue.kod} onChange={e=>upUE("kod",e.target.value)} style={INP}/>
        </Field>
        <Field label="Üretim Adeti">
          <NumInp value={ue.adet} onChange={handleAdetDegis} min={1} style={{width:"100%"}}/>
        </Field>
      </div>

      {/* Ürün seçimi */}
      <Field label="Ürün" style={{marginBottom:12}}>
        <select value={ue.urunId} onChange={e=>handleUrunSec(e.target.value)}
          style={{...INP,cursor:"pointer"}}>
          <option value="">— Ürün seçin (aşamalar otomatik gelir)</option>
          {(urunler||[]).map(u=><option key={u.id} value={u.id}>{u.kod?u.kod+" — ":""}{u.ad}</option>)}
        </select>
      </Field>

      {/* Sipariş No */}
      <Field label="Sipariş No (opsiyonel)" style={{marginBottom:12}}>
        <input value={ue.sipNo} onChange={e=>upUE("sipNo",e.target.value)}
          placeholder="SP-001..." style={INP}/>
      </Field>

      {/* Termin — çift yönlü: tarih ↔ gün */}
      <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,
        borderRadius:12,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,
          textTransform:"uppercase",marginBottom:10}}>📅 Termin</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:10}}>
          {/* Tarih seç */}
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Termin Tarihi</div>
            <input type="date" value={ue.termin||""} onChange={e=>{
              upUE("termin",e.target.value);
            }} style={INP}/>
          </div>
          <div style={{textAlign:"center",color:C.muted,fontSize:14,paddingTop:20}}>⇄</div>
          {/* Gün gir */}
          <div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>veya Gün Sayısı Gir</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <NumInp value={ue.termin ? isGunuFarki(new Date(), ue.termin) : ""}
                onChange={v=>{
                  if(v>0){
                    const t = ekleIsGunu(new Date(), Math.round(v));
                    upUE("termin", t.toISOString().slice(0,10));
                  }
                }} step={1} min={1} style={{flex:1}}/>
              <span style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>iş günü</span>
            </div>
          </div>
        </div>

        {/* Durum + öneri */}
        {tahmin&&(
          <div style={{fontSize:11,borderTop:`1px solid ${C.border}`,paddingTop:8}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",color:C.muted,marginBottom:4}}>
              <span>🏭 Atölye: <strong style={{color:C.text}}>{tahmin.atolyeGun} iş günü</strong></span>
              {tahmin.fasonGun>0&&<span>🏢 Fason: <strong style={{color:C.lav}}>+{tahmin.fasonGun} gün</strong></span>}
              <span>📆 Min. süre: <strong style={{color:C.gold}}>{tahmin.toplamGun} gün</strong></span>
              <span style={{color:C.cyan}}>En erken: <strong>{terminStr}</strong></span>
            </div>
            {!ue.termin&&(
              <button onClick={()=>upUE("termin",terminStr)}
                style={{background:`${C.cyan}15`,border:`1px solid ${C.cyan}30`,borderRadius:7,
                padding:"4px 12px",fontSize:11,color:C.cyan,cursor:"pointer"}}>
                → Otomatik termini uygula ({terminStr})
              </button>
            )}
            {ue.termin&&ue.termin<terminStr&&(()=>{
              const mevcutGun = isGunuFarki(new Date(), ue.termin);
              const gerekliSn = tahmin.toplamSn;
              const mevcutSn  = mevcutGun * 28800;
              const acikSn    = Math.max(0, gerekliSn - mevcutSn);
              const gundeEkstraSn = mevcutGun>0 ? Math.ceil(acikSn/mevcutGun) : 0;
              const gundeEkstraSaat = (gundeEkstraSn/3600).toFixed(1);
              return (
                <div style={{color:C.coral}}>
                  <div style={{fontWeight:700,marginBottom:4}}>
                    ⚠ Termin kısa! {mevcutGun} iş günü var, min. {tahmin.toplamGun} gün gerekli.
                  </div>
                  {acikSn>0&&(
                    <div style={{background:`${C.coral}10`,borderRadius:8,padding:"8px 10px",
                      marginBottom:6,fontSize:11}}>
                      <div style={{marginBottom:3}}>
                        💪 <strong>Mesai Gereksinimi:</strong>
                      </div>
                      <div style={{display:"flex",gap:12,flexWrap:"wrap",color:C.muted}}>
                        <span>Toplam açık: <strong style={{color:C.coral}}>{Math.ceil(acikSn/3600)} saat</strong></span>
                        <span>Günde ekstra: <strong style={{color:C.gold}}>{gundeEkstraSaat} saat mesai</strong></span>
                        <span style={{color:C.text}}>→ Günde {(8+parseFloat(gundeEkstraSaat)).toFixed(1)} saat çalışılmalı</span>
                      </div>
                    </div>
                  )}
                  <button onClick={()=>upUE("termin",terminStr)}
                    style={{background:`${C.gold}15`,border:`1px solid ${C.gold}30`,
                    borderRadius:6,padding:"3px 10px",fontSize:10,color:C.gold,cursor:"pointer"}}>
                    Tahmini uygula ({terminStr})
                  </button>
                </div>
              );
            })()}
            {ue.termin&&ue.termin>=terminStr&&(
              <div style={{color:C.mint}}>✓ Termin uygun — <strong>{isGunuFarki(new Date(),ue.termin)}</strong> iş günü var, {isGunuFarki(new Date(),ue.termin)-tahmin.toplamGun} gün buffer.</div>
            )}
          </div>
        )}
        {!tahmin&&ue.termin&&(
          <div style={{fontSize:11,color:C.muted}}>
            Termin: <strong style={{color:C.cyan}}>{ue.termin}</strong> · <strong>{isGunuFarki(new Date(),ue.termin)}</strong> iş günü kaldı
          </div>
        )}
      </div>

      {/* ── ÜRETİM STRATEJİSİ ── */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,
          textTransform:"uppercase",marginBottom:8}}>⚡ Üretim Stratejisi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {id:"gunluk", ikon:"🔄", baslik:"Günlük Akış",
             aciklama:"Her gün tamamlanmış ürün çıkar. Örn: günde 120 adet döngüsü biter."},
            {id:"haftalik", ikon:"📦", baslik:"Haftalık Batch",
             aciklama:"Önce hepsi kesilir, sonra hepsi dikilir... Hafta sonu topluca biter."},
          ].map(s=>(
            <div key={s.id} onClick={()=>upUE("strateji",s.id)}
              style={{background:ue.strateji===s.id?`${C.cyan}10`:"rgba(255,255,255,0.02)",
              border:`1.5px solid ${ue.strateji===s.id?C.cyan+"50":C.border}`,
              borderRadius:10,padding:"10px 12px",cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:16}}>{s.ikon}</span>
                <span style={{fontSize:12,fontWeight:700,color:ue.strateji===s.id?C.cyan:C.text}}>{s.baslik}</span>
                {ue.strateji===s.id&&<span style={{fontSize:9,color:C.cyan,marginLeft:"auto"}}>✓ Seçili</span>}
              </div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{s.aciklama}</div>
            </div>
          ))}
        </div>
        {ue.strateji==="gunluk"&&tahmin&&(
          <div style={{fontSize:10,color:C.muted,marginTop:6,padding:"6px 10px",
            background:"rgba(255,255,255,0.02)",borderRadius:7}}>
            📊 Günlük kapasite ile: <strong style={{color:C.cyan}}>{ue.adet||1} adet</strong> için her gün tam döngü tamamlanır
          </div>
        )}
        {ue.strateji==="haftalik"&&tahmin&&(
          <div style={{fontSize:10,color:C.muted,marginTop:6,padding:"6px 10px",
            background:"rgba(255,255,255,0.02)",borderRadius:7}}>
            📊 Batch üretim: <strong style={{color:C.gold}}>{ue.adet||1} adet</strong> toplu aşamalarla işlenir, son gün tümü hazır
          </div>
        )}
      </div>

      {/* ── MALZEME KONTROLÜ ── */}
      {ue.urunId&&malzemeListesi.length>0&&(
        <div style={{background:eksikVar?`${C.coral}07`:`${C.mint}07`,
          border:`1px solid ${eksikVar?C.coral+"30":C.mint+"30"}`,
          borderRadius:12,padding:"12px 14px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <span style={{fontSize:13}}>{eksikVar?"⚠️":"✅"}</span>
            <span style={{fontSize:11,fontWeight:700,color:eksikVar?C.coral:C.mint}}>
              {eksikVar?"Malzeme Eksik":"Tüm Malzemeler Mevcut"}
            </span>
          </div>
          {/* Debug tablosu */}
          {malzemeDebug.length>0&&(
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"8px",marginBottom:8,
              fontSize:10,fontFamily:"monospace",maxHeight:120,overflowY:"auto"}}>
              <div style={{color:C.gold,marginBottom:4,fontWeight:700}}>🔍 Hesap Detayı:</div>
              {malzemeDebug.map((d,i)=>(
                <div key={i} style={{color:C.muted,marginBottom:2}}>
                  <span style={{color:C.text}}>{d.ad}</span>: {d.bomMiktar}{d.bomBirim}
                  {d.boyUzunluk&&<span style={{color:C.sky}}> (boy={d.boyUzunluk}cm)</span>}
                  {" → "}<span style={{color:C.cyan}}>{d.bomMiktarStok?.toFixed(4)}{d.stokBirim}</span>
                  {" × "}{ue.adet||1}adet × carpan={d.carpan}
                  {" = "}<span style={{color:C.gold,fontWeight:700}}>{d.gereken?.toFixed(3)}{d.stokBirim}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {malzemeListesi.filter(m=>!m.yeterli).map(m=>(
              <div key={m.id} style={{background:`${C.coral}08`,borderRadius:7,
                padding:"6px 10px",marginBottom:2}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.text,fontWeight:600}}>{m.ad}</span>
                  <div style={{display:"flex",gap:8,fontSize:10,alignItems:"center"}}>
                    <span style={{color:C.muted}}>Stok: <strong style={{color:C.gold}}>{fmt(m.mevcut)} {m.birim}</strong></span>
                    <span style={{color:C.muted}}>Gerek: <strong style={{color:C.coral}}>{fmt(m.gereken)} {m.birim}</strong></span>
                    <span style={{color:C.coral,fontWeight:700,minWidth:50}}>-{fmt(m.eksik)} {m.birim}</span>
                  </div>
                </div>
                <div style={{marginTop:4,fontSize:9,color:C.muted}}>
                  → Bu malzemeyi tedarik listesine eklemek için üretim emrini kaydet
                </div>
              </div>
            ))}
            {malzemeListesi.filter(m=>m.yeterli).map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"3px 10px",opacity:0.6}}>
                <span style={{fontSize:10,color:C.muted}}>✓ {m.ad}</span>
                <span style={{fontSize:10,color:C.mint}}>{m.mevcut} {m.birim}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Üretim aşamaları */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>
            Üretim Aşamaları {ue.asamalar?.length>0&&`(${ue.asamalar.length})`}
          </span>
          <button onClick={()=>upUE("asamalar",[...(ue.asamalar||[]),{id:uid(),ad:"Yeni Aşama",durum:"bekliyor",calisan:"",sureDk:0,fason:false}])}
            style={{background:`${C.cyan}12`,border:`1px solid ${C.cyan}25`,borderRadius:7,
            padding:"4px 10px",fontSize:11,color:C.cyan,cursor:"pointer"}}>+ Ekle</button>
        </div>
        {(!ue.asamalar||ue.asamalar.length===0)&&(
          <div style={{textAlign:"center",color:C.muted,fontSize:12,padding:"16px",
            background:"rgba(255,255,255,0.02)",borderRadius:8,border:`1px dashed ${C.border}`}}>
            Ürün seçince aşamalar otomatik gelir
          </div>
        )}
        {(ue.asamalar||[]).map((asama,ai)=>(
          <div key={asama.id} style={{background:asama.fason?`${C.lav}06`:"rgba(255,255,255,0.02)",
            border:`1px solid ${asama.fason?C.lav+"20":C.border}`,borderRadius:9,
            padding:"8px 12px",marginBottom:6}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"center"}}>
              {/* Aşama adı */}
              <input value={asama.ad} onChange={e=>upUE("asamalar",(ue.asamalar).map((a,i)=>i===ai?{...a,ad:e.target.value}:a))}
                style={{...INP,padding:"6px 10px",fontSize:12}}/>
              {/* Çalışan */}
              <select value={asama.calisan}
                onChange={e=>upUE("asamalar",(ue.asamalar).map((a,i)=>i===ai?{...a,calisan:e.target.value}:a))}
                style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"6px 10px",fontSize:12,color:asama.calisan?C.text:C.muted,cursor:"pointer"}}>
                <option value="">{asama.fason?"Fason firma...":"Çalışan seç..."}</option>
                {asama.fason
                  ? <option value="—">— (Fason firma)</option>
                  : (calisanlar||[]).filter(c=>c.durum==="aktif").map(c=>
                      <option key={c.id} value={c.ad}>{c.ad}</option>)
                }
              </select>
              {/* Sil butonu */}
              <button onClick={()=>upUE("asamalar",(ue.asamalar).filter((_,i)=>i!==ai))}
                style={{background:`${C.coral}10`,border:`1px solid ${C.coral}20`,
                  borderRadius:7,width:28,height:28,cursor:"pointer",color:C.coral,fontSize:14,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            </div>
            <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.muted}}>
                {asama.fason?"🏭 Fason":"👤 İç"} ·{" "}
                {asama.sureDk>0?(asama.sureDk>=60?Math.floor(asama.sureDk/60)+"dk"+(asama.sureDk%60>0?" "+asama.sureDk%60+"sn":""):asama.sureDk+"sn"):"Süre girilmemiş"}
              </span>
              <label style={{fontSize:10,color:C.muted,display:"flex",alignItems:"center",gap:4,cursor:"pointer",marginLeft:"auto"}}>
                <input type="checkbox" checked={!!asama.fason}
                  onChange={e=>upUE("asamalar",(ue.asamalar).map((a,i)=>i===ai?{...a,fason:e.target.checked}:a))}/>
                Fason
              </label>
            </div>
          </div>
        ))}
      </div>

      <Field label="Not">
        <input value={ue.notlar||""} onChange={e=>upUE("notlar",e.target.value)}
          placeholder="Opsiyonel not..." style={INP}/>
      </Field>

      {/* Footer */}
      <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:16,alignItems:"center"}}>
        {duzenleme&&(
          <button onClick={handleSil} style={{background:silOnay?C.coral:`${C.coral}12`,
            border:`1px solid ${silOnay?C.coral:C.coral+"30"}`,borderRadius:9,
            padding:"9px 16px",fontSize:12,fontWeight:600,
            color:silOnay?"#000":C.coral,cursor:"pointer",transition:"all .2s"}}>
            {silOnay?"Emin misin? Tekrar bas":"🗑 Sil"}
          </button>
        )}
        <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
          <Btn onClick={onClose}>İptal</Btn>
          <Btn variant="primary" onClick={handleSave}>
            {duzenleme?"Kaydet":"Oluştur"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
