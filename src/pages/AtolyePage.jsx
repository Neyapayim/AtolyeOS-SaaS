import { useState, useEffect } from 'react';
import { C, F, FB, fmt, uid } from '../config/constants.js';
import { PageHeader, Btn, Badge, SilButonu } from '../components/index.js';
import { bomMalzemeListesi, uretimTamamlaService, snGoster } from '../engine/index.js';
import { workLogRepo } from '../repositories/workLogRepo.js';

// ── RENK HARİTASI ──
const ASAMA_RENK = {
  "Kesim":C.sky,"Lazer Kesim":C.sky,"Kaynak":C.coral,
  "Boya":"#A78BFA","Statik Boya":"#A78BFA",
  "Süngerleme":C.gold,"Döşeme":C.cyan,"Montaj":"#3DB88A",
  "Paket":"#94A3B8","Paketleme":"#94A3B8","Dikim":"#F472B6",
  "Kumaş Kesim":"#38BDF8","Fason":C.lav
};
const aRenk = (ad) => ASAMA_RENK[ad] || "#6B7280";
const snToStr = (sn) => snGoster(sn);
const gecenSnNow = (isoStr) => isoStr ? Math.floor((Date.now() - new Date(isoStr).getTime())/1000) : 0;

// ── HAT GÖRSEL (SVG) ──
function HattGorsel({ ue }) {
  const asamalar = ue?.asamalar || [];
  if (!asamalar.length) return null;
  const W = 680, H = 110, PAD = 40;
  const adim = (W - PAD*2) / Math.max(asamalar.length-1, 1);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="rgba(255,255,255,0.06)" strokeWidth={2}/>
      {asamalar.map((a,i)=>{
        if(a.durum!=="bitti" || i>=asamalar.length-1) return null;
        const renk = aRenk(a.ad);
        return <line key={i} x1={PAD+i*adim} y1={H/2} x2={PAD+(i+1)*adim} y2={H/2}
          stroke={renk} strokeWidth={2.5} opacity={0.7} filter="url(#glow)"/>;
      })}
      {asamalar.map((a,i)=>{
        const x = PAD + i*adim;
        const renk = aRenk(a.ad);
        const bitti = a.durum==="bitti", devam = a.durum==="devam";
        const r = devam ? 14 : 10;
        return (
          <g key={i}>
            {devam && <><circle cx={x} cy={H/2} r={22} fill={renk} opacity={0.08}/>
              <circle cx={x} cy={H/2} r={17} fill={renk} opacity={0.12}/></>}
            <circle cx={x} cy={H/2} r={r}
              fill={bitti?renk:devam?renk:"rgba(255,255,255,0.04)"}
              stroke={bitti||devam?renk:"rgba(255,255,255,0.15)"}
              strokeWidth={devam?2.5:1.5}
              filter={devam?"url(#glow2)":bitti?"url(#glow)":"none"}
              opacity={bitti?0.9:devam?1:0.5}/>
            {bitti && <text x={x} y={H/2+1} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize={10} fontWeight="bold">✓</text>}
            {devam && <text x={x} y={H/2+1} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize={9}>⚙</text>}
            <text x={x} y={H/2+(devam?30:26)} textAnchor="middle"
              fill={bitti||devam?renk:"rgba(255,255,255,0.3)"}
              fontSize={9} fontWeight={devam?"700":"400"} fontFamily="Montserrat,sans-serif">
              {a.ad.length>9?a.ad.slice(0,8)+"…":a.ad}
            </text>
            {a.fason && <text x={x} y={H/2+(devam?42:38)} textAnchor="middle"
              fill={C.lav} fontSize={7}>fason</text>}
          </g>
        );
      })}
      {asamalar.map((a,i)=>{
        if(a.durum!=="devam") return null;
        const x = PAD + i*adim;
        return <circle key={`pulse-${i}`} cx={x} cy={H/2} r={18}
          fill="none" stroke={aRenk(a.ad)} strokeWidth={1.5} opacity={0.4}>
          <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>;
      })}
    </svg>
  );
}

// ── ANA BİLEŞEN ──
export default function AtolyePage({ data, setters, setModal, setTab, aktifUE, setAktifUE }) {
  const { uretimEmirleri=[], siparisler=[], urunler=[], hamMaddeler=[], yarimamulList=[], hizmetler=[], calisanlar=[], tedarikSiparisleri=[] } = data || {};
  const { setUretimEmirleri, setTedarikSiparisleri, setHamMaddeler } = setters || {};

  // ── LOCAL STATE ──
  const [atolyeSipNo, setAtolyeSipNo] = useState(null);
  const [atolyeTick, setAtolyeTick] = useState(0);
  const [durumFiltre, setDurumFiltre] = useState(null);

  // Timer tick — her saniye (aktif aşama süreleri için)
  useEffect(() => {
    const iv = setInterval(() => setAtolyeTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── SİPARİŞ BAZLI GRUPLAMA ──
  const sipGrpMap = {};
  uretimEmirleri.filter(e=>e.durum!=="tamamlandi"&&e.durum!=="iptal").forEach(ue=>{
    const key = ue.sipNo||"__bagimsiz__";
    if(!sipGrpMap[key]) sipGrpMap[key]={sipNo:key,ueler:[],sp:siparisler.find(s=>s.id===key)};
    sipGrpMap[key].ueler.push(ue);
  });
  const sipGruplar = Object.values(sipGrpMap);

  // ── YARDIMCI FONKSİYONLAR ──
  const ueProgress = (ue) => {
    const a = ue.asamalar||[];
    if(!a.length) return 0;
    return Math.round(a.filter(x=>x.durum==="bitti").length/a.length*100);
  };
  const aktifAsama = (ue) => (ue.asamalar||[]).find(a=>a.durum==="devam");

  // Seçili UE
  const ueSecili = aktifUE ? uretimEmirleri.find(e=>e.id===aktifUE) : null;
  const ueGosterilen = ueSecili || (!atolyeSipNo ? (uretimEmirleri.find(e=>e.durum==="uretimde") || uretimEmirleri[0]) : null);

  // ── EKSİK HAM MADDE HESABI ──
  const tumAktifHM = {};
  const atolyeYmStok = {};
  const hedefUEler = ueGosterilen ? [ueGosterilen] : uretimEmirleri.filter(e=>e.durum!=="tamamlandi"&&e.durum!=="iptal");
  hedefUEler.forEach(ue=>{
    const ur = urunler.find(x=>x.id===ue.urunId);
    if(!ur) return;
    try {
      const ml = bomMalzemeListesi(ur, ue.adet||1, hamMaddeler, yarimamulList, urunler, atolyeYmStok);
      ml.forEach(m=>{
        if(!tumAktifHM[m.id]) tumAktifHM[m.id]={...m,kaynakUEler:[],gereken:0};
        tumAktifHM[m.id].gereken+=m.gereken;
        tumAktifHM[m.id].eksik=Math.max(0,tumAktifHM[m.id].gereken-tumAktifHM[m.id].mevcut);
        tumAktifHM[m.id].yeterli=tumAktifHM[m.id].eksik===0;
        tumAktifHM[m.id].kaynakUEler.push(ue.kod);
      });
    } catch(e) { /* BOM hesabı hata verirse atla */ }
  });
  const tumEksikHM = Object.values(tumAktifHM).filter(m=>!m.yeterli);

  // Tedarikçi bazlı gruplama
  const tedGrpAtolye = {};
  tumEksikHM.forEach(m=>{
    const hm = hamMaddeler.find(x=>x.id===m.id);
    const ted = hm?.tedarikci||"Belirtilmemiş";
    if(!tedGrpAtolye[ted]) tedGrpAtolye[ted]=[];
    tedGrpAtolye[ted].push({...m,tedarikci:ted});
  });

  // ── AŞAMA GÜNCELLE + WORKLOG ──
  const asamaGuncelle = (ueId, asamaIdx, yeniDurum) => {
    const ue = uretimEmirleri.find(e=>e.id===ueId);
    const asama = ue?.asamalar?.[asamaIdx];
    if(asama) {
      const asamaKey = asama.id || ("asama-" + ueId + "-" + asamaIdx);
      if(yeniDurum==="devam") {
        workLogRepo.ac(ueId, asamaKey, asama.ad, asama.calisan||"—", asama.sureDk||asama.sureAdet||0);
      } else if(yeniDurum==="bitti") {
        workLogRepo.kapat(ueId, asamaKey);
      }
    }
    setUretimEmirleri(prev => prev.map(e => {
      if(e.id !== ueId) return e;
      const asamalar = e.asamalar.map((a,i) => {
        if(i === asamaIdx) return {...a, durum:yeniDurum,
          basladiAt: yeniDurum==="devam" ? new Date().toISOString() : a.basladiAt,
          tamamlandiAt: yeniDurum==="bitti" ? new Date().toISOString() : undefined
        };
        if(i === asamaIdx+1 && yeniDurum==="bitti" && a.durum==="bekliyor") {
          const sonrakiAsama = e.asamalar[i];
          if(sonrakiAsama) workLogRepo.ac(ueId, sonrakiAsama.id||("asama-"+ueId+"-"+i), sonrakiAsama.ad, sonrakiAsama.calisan||"—", sonrakiAsama.sureDk||0);
          return {...a, durum:"devam", basladiAt:new Date().toISOString()};
        }
        return a;
      });
      const hepBitti = asamalar.every(a=>a.durum==="bitti");
      return {...e, asamalar,
        durum: e.durum==="bekliyor" ? "uretimde" : hepBitti ? "tamamlandi" : e.durum,
        baslangicTarihi: e.durum==="bekliyor" ? new Date().toISOString() : e.baslangicTarihi,
        tamamlanmaTarihi: hepBitti ? new Date().toISOString() : e.tamamlanmaTarihi
      };
    }));
  };

  // ── AŞAMA TIMER BİLEŞENİ ──
  const AsamaTimer = ({basladiAt}) => {
    const sn = gecenSnNow(basladiAt);
    const dk = Math.floor(sn/60), s = sn%60;
    void atolyeTick; // render tetikleyici
    return <span style={{fontVariantNumeric:"tabular-nums",fontFamily:"monospace",
      color:C.cyan,fontWeight:700,fontSize:13}}>
      {String(dk).padStart(2,"0")}:{String(s).padStart(2,"0")}
    </span>;
  };

  // ── ÇALIŞAN DURUM ──
  const calisanDurum = (calisanlar||[]).map(c=>{
    let aktifIs = null;
    uretimEmirleri.forEach(ue=>{
      (ue.asamalar||[]).forEach(a=>{
        if(a.durum==="devam" && a.calisan===c.ad) aktifIs = {ue, asama:a};
      });
    });
    return {...c, aktifIs};
  });

  // ── EMİR KART ──
  const EmirKart = ({ue}) => {
    const pct = ueProgress(ue);
    const ak = aktifAsama(ue);
    const renk = ue.durum==="tamamlandi"?C.mint:ue.durum==="uretimde"?C.cyan:C.gold;
    const secili = ue.id === ueGosterilen?.id;
    return (
      <div onClick={()=>setAktifUE(ue.id)} style={{
        background: secili?"rgba(0,194,160,0.06)":"rgba(255,255,255,0.025)",
        border:`1px solid ${secili?C.cyan+"60":C.border}`,
        borderLeft:`3px solid ${renk}`,
        borderRadius:12, padding:"12px 14px", cursor:"pointer",
        transition:"all .18s",
        boxShadow:secili?`0 0 0 1px ${C.cyan}20,0 4px 20px rgba(0,0,0,0.3)`:"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div>
            <div style={{fontSize:9,color:renk,fontWeight:700,letterSpacing:.8,marginBottom:2}}>{ue.kod}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F,lineHeight:1.2}}>{ue.urunAd}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:800,color:renk,fontFamily:F}}>{ue.adet}<span style={{fontSize:9,fontWeight:400,color:C.muted,marginLeft:2}}>adet</span></div>
            {ue.termin&&<div style={{fontSize:9,color:C.muted}}>📅 {ue.termin}</div>}
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden",marginBottom:4}}>
          <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${renk},${renk}aa)`,
            borderRadius:3,transition:"width .5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:9,color:C.muted}}>
            {(ue.asamalar||[]).filter(a=>a.durum==="bitti").length}/{(ue.asamalar||[]).length} aşama
          </span>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            {ak && <span style={{fontSize:9,color:C.cyan,background:`${C.cyan}12`,
              borderRadius:4,padding:"1px 6px"}}>⚙ {ak.ad}</span>}
            {ue.durum==="tamamlandi"&&<span style={{fontSize:9,color:C.mint}}>✅</span>}
            <button onClick={(ev)=>{ev.stopPropagation();
              setUretimEmirleri(p=>p.filter(x=>x.id!==ue.id));
            }} style={{background:"rgba(224,92,92,0.08)",border:"none",borderRadius:4,
              padding:"2px 6px",fontSize:10,color:C.coral,cursor:"pointer",lineHeight:1}}>
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── AŞAMA KART ──
  const AsamaKart = ({asama, idx, ue}) => {
    const onceki = (ue.asamalar||[])[idx-1];
    const kilitli = idx>0 && onceki && onceki.durum!=="bitti" && asama.durum==="bekliyor";
    const renk = aRenk(asama.ad);
    const devam = asama.durum==="devam";
    const bitti = asama.durum==="bitti";
    const fasonHz = asama.fason&&asama.hizmetId ? (hizmetler||[]).find(h=>h.id===asama.hizmetId) : null;
    const fasonFirma = fasonHz?.firma || fasonHz?.ad || "";
    const fasonGonderimAt = asama.fasonGonderimAt || null;
    const fasonGeldiAt = asama.fasonGeldiAt || null;
    const ilgiliFasonSiparis = asama.fason ? tedarikSiparisleri.find(ts=>
      (ts.durum==="fasona_gonderildi"||ts.durum==="fasonda") &&
      ts.fasonYonlendirme?.fasonFirmaId===asama.hizmetId
    ) : null;

    return (
      <div style={{
        background: bitti?`${renk}06`:devam?`${renk}10`:"rgba(255,255,255,0.02)",
        border:`1.5px solid ${bitti?renk+"30":devam?renk+"50":C.border}`,
        borderRadius:12, padding:"12px 16px", opacity:kilitli?0.45:1,
        transition:"all .2s", position:"relative", overflow:"hidden"}}>
        {devam && <div style={{position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,${renk},${renk}60)`,animation:"bar-in .5s ease"}}/>}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {/* İkon */}
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
            background:bitti?`${renk}20`:devam?`${renk}15`:"rgba(255,255,255,0.04)",
            border:`1.5px solid ${bitti||devam?renk+"60":C.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16, filter:devam?`drop-shadow(0 0 6px ${renk})`:"none"}}>
            {bitti?"✅":devam?"⚙️":asama.fason?"🏭":"○"}
          </div>
          {/* Bilgi */}
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:13,fontWeight:700,color:bitti?C.muted:C.text,
                fontFamily:F,textDecoration:bitti?"line-through":"none"}}>{asama.ad}</span>
              {asama.fason&&<span style={{fontSize:9,background:`${C.lav}15`,color:C.lav,
                borderRadius:4,padding:"1px 5px",fontWeight:600}}>FASON</span>}
              {asama.fason&&fasonFirma&&<span style={{fontSize:9,background:`${C.lav}08`,color:C.lav,
                borderRadius:4,padding:"1px 5px"}}>🏭 {fasonFirma}</span>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:3,flexWrap:"wrap"}}>
              {asama.calisan&&!asama.fason&&<span style={{fontSize:10,color:C.muted}}>👤 {asama.calisan}</span>}
              {asama.sureDk>0&&!asama.fason&&<span style={{fontSize:10,color:C.muted}}>⏱ ~{snToStr(asama.sureDk)}</span>}
              {asama.fason&&fasonHz?.sureGun>0&&<span style={{fontSize:10,color:C.gold}}>⏱ ~{fasonHz.sureGun} gün</span>}
              {asama.fason&&fasonHz?.birimFiyat>0&&<span style={{fontSize:10,color:C.muted}}>💰 {fasonHz.birimFiyat}₺/adet</span>}
              {devam&&asama.basladiAt&&!asama.fason&&<span style={{fontSize:10,color:C.cyan}}>⏱ <AsamaTimer basladiAt={asama.basladiAt}/></span>}
              {bitti&&asama.tamamlandiAt&&asama.basladiAt&&(()=>{
                const sure = Math.floor((new Date(asama.tamamlandiAt)-new Date(asama.basladiAt))/1000);
                return <span style={{fontSize:10,color:C.mint}}>✓ {snToStr(sure)} sürdü</span>;
              })()}
            </div>
            {/* Fason durum satırı */}
            {asama.fason&&(fasonGonderimAt||fasonGeldiAt||ilgiliFasonSiparis)&&(
              <div style={{display:"flex",gap:8,marginTop:4,fontSize:9,flexWrap:"wrap"}}>
                {fasonGonderimAt&&<span style={{color:C.gold,background:`${C.gold}10`,borderRadius:3,padding:"1px 5px"}}>📤 Gönderildi: {new Date(fasonGonderimAt).toLocaleDateString("tr-TR")}</span>}
                {fasonGeldiAt&&<span style={{color:C.mint,background:`${C.mint}10`,borderRadius:3,padding:"1px 5px"}}>📥 Geldi: {new Date(fasonGeldiAt).toLocaleDateString("tr-TR")}</span>}
                {ilgiliFasonSiparis&&!fasonGonderimAt&&<span style={{color:C.sky,background:`${C.sky}10`,borderRadius:3,padding:"1px 5px"}}>🔗 {ilgiliFasonSiparis.id}</span>}
              </div>
            )}
            {/* Kısmi sevkiyat geçmişi */}
            {asama.fason&&(asama.fasonSevkler||[]).length>0&&(
              <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:4}}>Sevkiyat Geçmişi:</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {(asama.fasonSevkler||[]).map((s,si)=>(
                    <span key={si} style={{fontSize:9,
                      background:s.tip==="gonderim"?`${C.lav}10`:`${C.mint}10`,
                      color:s.tip==="gonderim"?C.lav:C.mint,
                      borderRadius:4,padding:"2px 6px"}}>
                      {s.tip==="gonderim"?"📤":"📥"} {s.miktar} adet · {new Date(s.tarih).toLocaleDateString("tr-TR")}
                    </span>
                  ))}
                </div>
                {(()=>{
                  const topGond = (asama.fasonSevkler||[]).filter(s=>s.tip==="gonderim").reduce((s2,s3)=>s2+(s3.miktar||0),0);
                  const topGelen = (asama.fasonSevkler||[]).filter(s=>s.tip==="teslim").reduce((s2,s3)=>s2+(s3.miktar||0),0);
                  const toplam = asama.fasonToplamAdet||ue.adet||1;
                  return(
                    <div style={{marginTop:4}}>
                      <div style={{display:"flex",height:4,borderRadius:2,overflow:"hidden",background:"rgba(255,255,255,.06)"}}>
                        <div style={{width:`${Math.min(100,topGelen/toplam*100)}%`,background:C.mint,borderRadius:2}}/>
                        <div style={{width:`${Math.min(100,(topGond-topGelen)/toplam*100)}%`,background:C.lav,borderRadius:2,opacity:.5}}/>
                      </div>
                      <div style={{fontSize:8,color:C.muted,marginTop:2}}>
                        {topGelen}/{topGond} geldi · {toplam} toplam
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          {/* Butonlar */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
            {!kilitli && !bitti && !asama.fason && (
              <button onClick={()=>asamaGuncelle(ue.id, idx, devam?"bitti":"devam")}
                style={{background:devam?`${renk}20`:"rgba(255,255,255,0.06)",
                  border:`1.5px solid ${devam?renk+"60":C.border}`,
                  borderRadius:9,padding:"9px 16px",fontSize:12,fontWeight:700,
                  color:devam?renk:C.sub,cursor:"pointer",whiteSpace:"nowrap",
                  transition:"all .15s",fontFamily:F,
                  boxShadow:devam?`0 0 12px ${renk}30`:"none"}}>
                {devam?"✅ Bitti":"▶ Başla"}
              </button>
            )}
            {/* Fason: Gönder */}
            {!kilitli && !bitti && asama.fason && !fasonGonderimAt && (
              <button onClick={()=>{
                const toplamAdet = ue.adet||1;
                setUretimEmirleri(p=>p.map(e=>e.id!==ue.id?e:{...e,
                  asamalar:e.asamalar.map((a,i)=>i!==idx?a:{...a,
                    durum:"devam",basladiAt:new Date().toISOString(),
                    fasonDurum:"gonderildi",fasonGonderimAt:new Date().toISOString(),
                    fasonToplamAdet:toplamAdet,
                    fasonSevkler:[...(a.fasonSevkler||[]),{
                      id:uid(),tip:"gonderim",miktar:toplamAdet,tarih:new Date().toISOString()
                    }],
                  })
                }));
              }} style={{background:`${C.lav}15`,border:`1px solid ${C.lav}40`,
                borderRadius:9,padding:"8px 14px",fontSize:11,fontWeight:700,
                color:C.lav,cursor:"pointer",whiteSpace:"nowrap"}}>
                📤 Fasona Gönder
              </button>
            )}
            {/* Fason: Geldi / Kısmi teslim / Daha gönder */}
            {asama.fason && fasonGonderimAt && !bitti && (()=>{
              const sevkler = asama.fasonSevkler||[];
              const toplamGelen = sevkler.filter(s=>s.tip==="teslim").reduce((s2,s3)=>s2+(s3.miktar||0),0);
              const toplamGonderilen = sevkler.filter(s=>s.tip==="gonderim").reduce((s2,s3)=>s2+(s3.miktar||0),0);
              const toplamAdet = asama.fasonToplamAdet||ue.adet||1;
              const kalanGelecek = toplamGonderilen - toplamGelen;
              const tumGeldi = toplamGelen >= toplamGonderilen && toplamGonderilen > 0;
              return(
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {sevkler.length>0&&(
                    <div style={{fontSize:9,color:C.muted,textAlign:"right",marginBottom:2}}>
                      Gönderilen: <strong style={{color:C.lav}}>{toplamGonderilen}</strong> /
                      Gelen: <strong style={{color:C.mint}}>{toplamGelen}</strong> /
                      Toplam: <strong>{toplamAdet}</strong>
                    </div>
                  )}
                  {kalanGelecek>0&&(
                    <button onClick={()=>{
                      const gelenMiktar = kalanGelecek;
                      const yeniSevkler = [...sevkler,{id:uid(),tip:"teslim",miktar:gelenMiktar,tarih:new Date().toISOString()}];
                      const yeniToplamGelen = toplamGelen + gelenMiktar;
                      const hepGeldi = yeniToplamGelen >= toplamGonderilen;
                      setUretimEmirleri(p=>p.map(e=>e.id!==ue.id?e:{...e,
                        asamalar:e.asamalar.map((a,i)=>{
                          if(i===idx) return {...a,
                            fasonSevkler:yeniSevkler,
                            ...(hepGeldi?{durum:"bitti",tamamlandiAt:new Date().toISOString(),fasonDurum:"geldi",fasonGeldiAt:new Date().toISOString()}:{}),
                          };
                          if(i===idx+1 && hepGeldi && a.durum==="bekliyor") return {...a,durum:"devam",basladiAt:new Date().toISOString()};
                          return a;
                        })
                      }));
                    }} style={{background:`${C.mint}15`,border:`1px solid ${C.mint}40`,
                      borderRadius:9,padding:"7px 12px",fontSize:11,fontWeight:700,
                      color:C.mint,cursor:"pointer",whiteSpace:"nowrap"}}>
                      📥 {kalanGelecek} adet geldi
                    </button>
                  )}
                  {toplamGonderilen<toplamAdet&&(
                    <button onClick={()=>{
                      const kalan = toplamAdet-toplamGonderilen;
                      setUretimEmirleri(p=>p.map(e=>e.id!==ue.id?e:{...e,
                        asamalar:e.asamalar.map((a,i)=>i!==idx?a:{...a,
                          fasonSevkler:[...(a.fasonSevkler||[]),{id:uid(),tip:"gonderim",miktar:kalan,tarih:new Date().toISOString()}],
                        })
                      }));
                    }} style={{background:`${C.lav}10`,border:`1px solid ${C.lav}25`,
                      borderRadius:7,padding:"5px 10px",fontSize:10,
                      color:C.lav,cursor:"pointer",whiteSpace:"nowrap"}}>
                      📤 +{toplamAdet-toplamGonderilen} daha gönder
                    </button>
                  )}
                  {tumGeldi&&!bitti&&(
                    <span style={{fontSize:9,color:C.mint,textAlign:"center"}}>✅ Tüm partiler geldi</span>
                  )}
                </div>
              );
            })()}
            {bitti && (
              <button onClick={()=>asamaGuncelle(ue.id, idx, "bekliyor")}
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,
                  borderRadius:8,padding:"5px 10px",fontSize:10,color:C.muted,cursor:"pointer"}}>
                Geri Al
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════
  // ── RENDER ──
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={{animation:"fade-up .35s ease"}}>

      {/* ── BAŞLIK ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:C.text,fontFamily:F,margin:0,letterSpacing:-1}}>
            🏭 Üretim Hattı
          </h1>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>
            {uretimEmirleri.filter(e=>e.durum==="uretimde").length} aktif ·{" "}
            {uretimEmirleri.filter(e=>e.durum==="bekliyor").length} bekliyor ·{" "}
            {uretimEmirleri.filter(e=>e.durum==="tamamlandi").length} tamamlandı
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {uretimEmirleri.length>0&&(
            <SilButonu label="Tümünü Sil" isim="tüm üretim emirleri"
              onDelete={()=>setUretimEmirleri([])} />
          )}
          <Btn variant="primary" onClick={()=>setModal({type:"yeniUretimEmri",data:{}})}>
            + Yeni Üretim Emri
          </Btn>
        </div>
      </div>

      {/* ── ÇALIŞAN DURUM ŞERİDİ ── */}
      {calisanDurum.some(c=>c.durum==="aktif") && (
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {calisanDurum.filter(c=>c.durum==="aktif").map(c=>{
            const renk = c.aktifIs?.asama ? aRenk(c.aktifIs.asama.ad) : C.muted;
            return (
              <div key={c.id} style={{background:c.aktifIs?`${renk}0D`:"rgba(255,255,255,0.02)",
                border:`1px solid ${c.aktifIs?renk+"30":C.border}`,
                borderRadius:10,padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",
                  background:c.aktifIs?renk:C.muted,
                  boxShadow:c.aktifIs?`0 0 6px ${renk}`:"none"}}/>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:c.aktifIs?C.text:C.muted}}>{c.ad}</div>
                  {c.aktifIs ? (
                    <div style={{fontSize:9,color:renk}}>
                      {c.aktifIs?.asama?.ad || "—"} · <AsamaTimer basladiAt={c.aktifIs?.asama?.basladiAt}/>
                    </div>
                  ):(
                    <div style={{fontSize:9,color:C.muted}}>Boşta</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOŞ DURUM ── */}
      {uretimEmirleri.length===0 ? (
        <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,
          borderRadius:20,padding:"80px",textAlign:"center",color:C.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>🏭</div>
          <div style={{fontSize:18,fontWeight:700,color:C.sub,fontFamily:F,marginBottom:8}}>Üretim Hattı Boş</div>
          <div style={{fontSize:13,marginBottom:24}}>İlk üretim emrini oluşturarak başla</div>
          <Btn variant="primary" onClick={()=>setModal({type:"yeniUretimEmri",data:{}})}>
            + İlk Üretim Emrini Oluştur
          </Btn>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:16,alignItems:"start"}}>

          {/* ═══════ SOL: EMİR LİSTESİ ═══════ */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {/* Filtre sekmecikleri */}
            <div style={{display:"flex",gap:4,marginBottom:4,flexWrap:"wrap"}}>
              {[["uretimde","⚙ Aktif",C.cyan],["bekliyor","⏳ Bekliyor",C.gold],["tamamlandi","✅ Bitti",C.mint]].map(([d,l,c])=>{
                const sayi = uretimEmirleri.filter(e=>e.durum===d).length;
                return sayi>0 && (
                  <span key={d} style={{fontSize:9,fontWeight:600,color:c,
                    background:`${c}12`,border:`1px solid ${c}25`,
                    borderRadius:20,padding:"2px 8px"}}>
                    {l} {sayi}
                  </span>
                );
              })}
            </div>

            {/* Sipariş bazlı gruplandırılmış UE listesi */}
            {sipGruplar.length>0 ? sipGruplar.map(grp=>{
              const spObj = grp.sp;
              const isSipSecili = atolyeSipNo===grp.sipNo;
              const sipToplam = grp.ueler.reduce((s,ue)=>s+(ue.adet||0),0);
              const durumSay = {bekliyor:0,uretimde:0,tamamlandi:0};
              grp.ueler.forEach(ue=>{durumSay[ue.durum]=(durumSay[ue.durum]||0)+1;});
              return(
                <div key={grp.sipNo} style={{marginBottom:8}}>
                  <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${isSipSecili?C.cyan+"50":C.border}`,
                    background:isSipSecili?"rgba(0,194,160,0.04)":"rgba(255,255,255,.02)",transition:"all .18s"}}>
                    {/* Sipariş header */}
                    <div style={{padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                      borderBottom:`1px solid ${C.border}`}}
                      onClick={()=>{setAtolyeSipNo(isSipSecili?null:grp.sipNo);setAktifUE(null);}}>
                      <span style={{fontSize:9,fontWeight:800,color:C.cyan,letterSpacing:.5,minWidth:50}}>
                        {grp.sipNo!=="__bagimsiz__"?grp.sipNo:"Bağımsız"}
                      </span>
                      <span style={{fontSize:9,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
                        {spObj?.siparisAdi||spObj?.musteri||""}
                      </span>
                      <span style={{fontSize:10,fontWeight:800,color:C.gold,fontFamily:F}}>{sipToplam}</span>
                      <span style={{fontSize:7,color:C.muted}}>adet</span>
                      <span style={{fontSize:9,color:C.muted,transform:isSipSecili?"rotate(180deg)":"rotate(0)",transition:"transform .2s",display:"inline-block"}}>▾</span>
                    </div>

                    {/* Kapalıyken durum özeti */}
                    {!isSipSecili&&(
                      <div style={{padding:"4px 10px 6px",display:"flex",gap:4,flexWrap:"wrap"}}>
                        {durumSay.bekliyor>0&&<span style={{fontSize:8,background:C.gold+"15",color:C.gold,borderRadius:3,padding:"1px 5px",fontWeight:600}}>⏳ {durumSay.bekliyor} bekliyor</span>}
                        {durumSay.uretimde>0&&<span style={{fontSize:8,background:C.cyan+"15",color:C.cyan,borderRadius:3,padding:"1px 5px",fontWeight:600}}>🔨 {durumSay.uretimde} üretimde</span>}
                        {durumSay.tamamlandi>0&&<span style={{fontSize:8,background:C.mint+"15",color:C.mint,borderRadius:3,padding:"1px 5px",fontWeight:600}}>✅ {durumSay.tamamlandi}</span>}
                        <span style={{fontSize:8,color:C.muted}}>{grp.ueler.length} ürün</span>
                      </div>
                    )}

                    {/* Sipariş Tümü butonu */}
                    {isSipSecili&&grp.ueler.length>1&&(
                      <div onClick={()=>{setAtolyeSipNo(grp.sipNo);setAktifUE(null);}}
                        style={{padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                          background:!aktifUE?`${C.lav}12`:"transparent",
                          borderBottom:`1px solid ${C.border}`}}>
                        <span style={{fontSize:11}}>📦</span>
                        <span style={{fontSize:10,fontWeight:!aktifUE?700:400,color:!aktifUE?C.lav:C.muted}}>
                          Sipariş Tümü ({grp.ueler.length} ürün)
                        </span>
                      </div>
                    )}

                    {/* UE listesi (sipariş açıkken) */}
                    {isSipSecili&&(
                      <div style={{padding:"4px"}}>
                        {grp.ueler.map(ue=><EmirKart key={ue.id} ue={ue}/>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : uretimEmirleri.map(ue=><EmirKart key={ue.id} ue={ue}/>)}
          </div>

          {/* ═══════ SAĞ: DETAY PANEL ═══════ */}

          {/* Sipariş Tümü Görünümü */}
          {atolyeSipNo&&!aktifUE&&(()=>{
            const grp = sipGruplar.find(g=>g.sipNo===atolyeSipNo);
            if(!grp) return null;
            const spObj = grp.sp;
            const birlesikHM = {};
            const birlesikYmStok = {};
            grp.ueler.forEach(ue=>{
              const ur=urunler.find(x=>x.id===ue.urunId);
              if(!ur) return;
              try {
                const ml=bomMalzemeListesi(ur,ue.adet||1,hamMaddeler,yarimamulList,urunler,birlesikYmStok);
                ml.forEach(m=>{
                  if(!birlesikHM[m.id]) birlesikHM[m.id]={...m,gereken:0,kaynakUrunler:[]};
                  birlesikHM[m.id].gereken+=m.gereken;
                  birlesikHM[m.id].eksik=Math.max(0,birlesikHM[m.id].gereken-birlesikHM[m.id].mevcut);
                  birlesikHM[m.id].yeterli=birlesikHM[m.id].eksik<=0;
                  birlesikHM[m.id].kaynakUrunler.push(ue.urunAd);
                });
              } catch(e) { /* atla */ }
            });
            const birlesikListe = Object.values(birlesikHM);
            const eksikler = birlesikListe.filter(m=>!m.yeterli);
            const yeterliler = birlesikListe.filter(m=>m.yeterli);
            const tedGrpSip = {};
            eksikler.forEach(m=>{
              const hm=hamMaddeler.find(x=>x.id===m.id);
              const ted=hm?.tedarikci||"Belirtilmemiş";
              if(!tedGrpSip[ted]) tedGrpSip[ted]=[];
              tedGrpSip[ted].push({...m,tedarikci:ted});
            });

            return(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Sipariş Başlık */}
                <div style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${C.lav}30`,
                  borderRadius:16,overflow:"hidden"}}>
                  <div style={{height:3,background:`linear-gradient(90deg,${C.lav},${C.cyan},${C.gold})`}}/>
                  <div style={{padding:"16px 20px"}}>
                    <div style={{fontSize:10,color:C.lav,fontWeight:700,marginBottom:3}}>📦 SİPARİŞ TÜMÜ · {atolyeSipNo}</div>
                    <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:F}}>{spObj?.siparisAdi||spObj?.musteri||atolyeSipNo}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                      {grp.ueler.length} ürün · {grp.ueler.reduce((s,ue)=>s+(ue.adet||0),0)} toplam adet
                      {spObj?.termin&&` · Termin: ${spObj.termin}`}
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                      {grp.ueler.map(ue=>(
                        <div key={ue.id} onClick={()=>setAktifUE(ue.id)}
                          style={{background:`${C.cyan}0A`,border:`1px solid ${C.cyan}20`,borderRadius:8,
                          padding:"6px 10px",cursor:"pointer",transition:"all .15s"}}>
                          <div style={{fontSize:11,fontWeight:600,color:C.text}}>{ue.urunAd}</div>
                          <div style={{fontSize:9,color:C.muted}}>{ue.adet} adet · {ue.kod}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Birleşik Eksik HM */}
                {eksikler.length>0&&(
                  <div style={{background:`${C.coral}06`,border:`1px solid ${C.coral}20`,borderRadius:12,padding:"14px 18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.coral,letterSpacing:.5}}>
                        ⚠ EKSİK HAM MADDELER — Sipariş Toplamı ({eksikler.length} kalem)
                      </div>
                      <button onClick={()=>{
                        const yeniTedSip = eksikler.map(m=>{
                          const hm=hamMaddeler.find(x=>x.id===m.id);
                          return {
                            id:"ts-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),
                            durum:"siparis_bekliyor",olusturmaAt:new Date().toISOString(),
                            kaynakModul:"uretim",kaynakSipNo:atolyeSipNo,
                            kalemler:[{hamMaddeId:m.id,ad:m.ad,miktar:m.eksik,birim:m.birim,birimFiyat:hm?.listeFiyat||0}],
                            tedarikci:hm?.tedarikci||"",
                          };
                        });
                        setTedarikSiparisleri(p=>[...p,...yeniTedSip]);
                      }}
                        style={{background:`${C.sky}15`,border:`1px solid ${C.sky}30`,borderRadius:8,
                        padding:"6px 14px",fontSize:11,fontWeight:700,color:C.sky,cursor:"pointer"}}>
                        📦 Toplu Tedariğe Gönder ({eksikler.length})
                      </button>
                    </div>
                    {Object.entries(tedGrpSip).map(([ted,malzList])=>(
                      <div key={ted} style={{marginBottom:8}}>
                        <div style={{fontSize:9,fontWeight:700,color:C.gold,marginBottom:3}}>📦 {ted} ({malzList.length})</div>
                        {malzList.map((m,mi)=>(
                          <div key={mi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                            padding:"5px 10px",marginBottom:2,borderRadius:6,background:"rgba(0,0,0,.15)",fontSize:10}}>
                            <div style={{flex:1}}>
                              <span style={{color:C.text,fontWeight:600}}>{m.ad}</span>
                              {m.kaynakUrunler?.length>0&&<span style={{color:C.muted,marginLeft:6,fontSize:8}}>({[...new Set(m.kaynakUrunler)].join(", ")})</span>}
                            </div>
                            <div style={{display:"flex",gap:8,flexShrink:0}}>
                              <span style={{color:C.muted}}>Stok: {fmt(m.mevcut)}</span>
                              <span style={{color:C.gold}}>Gerek: {fmt(m.gereken)}</span>
                              <span style={{color:C.coral,fontWeight:700}}>-{fmt(m.eksik)} {m.birim}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Stokta yeterli */}
                {yeterliler.length>0&&(
                  <div style={{background:`${C.mint}06`,border:`1px solid ${C.mint}18`,borderRadius:12,padding:"12px 16px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.mint,marginBottom:6}}>✅ Stokta Yeterli ({yeterliler.length} kalem)</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {yeterliler.map(m=>(
                        <span key={m.id} style={{fontSize:9,background:`${C.mint}0C`,border:`1px solid ${C.mint}18`,
                          borderRadius:4,padding:"2px 7px",color:C.mint}}>
                          {m.ad}: {fmt(m.gereken)} / stok {fmt(m.mevcut)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {eksikler.length===0&&birlesikListe.length>0&&(
                  <div style={{background:`${C.mint}08`,border:`1px solid ${C.mint}20`,borderRadius:12,
                    padding:"16px",textAlign:"center",fontSize:13,color:C.mint,fontWeight:600}}>
                    ✅ Tüm malzemeler stokta — üretime hazır!
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Ürün Bazlı Detay ── */}
          {ueGosterilen ? (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Üst başlık kartı */}
              <div style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${C.border}`,
                borderRadius:16,overflow:"hidden"}}>
                <div style={{height:3,background:`linear-gradient(90deg,${C.cyan},${C.lav},${C.mint})`}}/>
                <div style={{padding:"16px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                    <div>
                      <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{ueGosterilen.kod} · {ueGosterilen.sipNo||"Manuel Emir"}</div>
                      <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:-0.5}}>{ueGosterilen.urunAd}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>{ueGosterilen.adet} adet{ueGosterilen.termin?` · Termin: ${ueGosterilen.termin}`:""}</div>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      {/* İlerleme daire */}
                      {(()=>{
                        const pct = ueProgress(ueGosterilen);
                        const r=24, c=2*Math.PI*r, off=c*(1-pct/100);
                        const col = pct===100?C.mint:pct>50?C.cyan:C.gold;
                        return (
                          <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
                            <svg width={60} height={60} style={{transform:"rotate(-90deg)"}}>
                              <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
                              <circle cx={30} cy={30} r={r} fill="none" stroke={col} strokeWidth={4}
                                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                                style={{transition:"stroke-dashoffset .6s ease",filter:`drop-shadow(0 0 4px ${col})`}}/>
                            </svg>
                            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:12,fontWeight:800,color:col,fontFamily:F}}>{pct}%</div>
                          </div>
                        );
                      })()}
                      {ueGosterilen.durum==="bekliyor"&&(
                        <button onClick={()=>setUretimEmirleri(p=>p.map(e=>e.id===ueGosterilen.id?{...e,durum:"uretimde",baslangicTarihi:new Date().toISOString()}:e))}
                          style={{background:`${C.cyan}15`,border:`1px solid ${C.cyan}40`,borderRadius:9,
                          padding:"9px 18px",fontSize:13,fontWeight:700,color:C.cyan,cursor:"pointer",
                          boxShadow:`0 0 12px ${C.cyan}20`,fontFamily:F}}>
                          ▶ Üretime Başla
                        </button>
                      )}
                      {ueGosterilen.durum==="uretimde"&&(ueGosterilen.asamalar||[]).every(a=>a.durum==="bitti")&&(
                        <button onClick={()=>{
                          const sonuc = uretimTamamlaService(ueGosterilen.id, {
                            uretimEmirleri, hamMaddeler, yarimamulList, urunler,
                            setUretimEmirleri, setHamMaddeler
                          });
                          if(sonuc?.hatalar?.length>0) console.warn("Hata:", sonuc.hatalar);
                          if(sonuc?.uyarilar?.length>0) console.warn("Uyarı:", sonuc.uyarilar);
                        }}
                          style={{background:`${C.mint}15`,border:`1px solid ${C.mint}40`,borderRadius:9,
                          padding:"9px 18px",fontSize:13,fontWeight:700,color:C.mint,cursor:"pointer",fontFamily:F}}>
                          ✅ Tamamlandı — Stok Güncelle
                        </button>
                      )}
                      <button onClick={()=>setModal({type:"ueDetay",data:ueGosterilen})}
                        style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,
                        borderRadius:9,padding:"9px 12px",fontSize:12,color:C.sub,cursor:"pointer"}}>
                        ⚙ Düzenle
                      </button>
                    </div>
                  </div>

                  {/* HAT GÖRSEL */}
                  {(ueGosterilen.asamalar||[]).length>0 && (
                    <div style={{marginTop:16,padding:"12px 0 4px"}}>
                      <HattGorsel ue={ueGosterilen}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Eksik Malzeme (UE'ye kayıtlı) */}
              {(ueGosterilen.eksikMalzemeler||[]).length>0&&(
                <div style={{background:`${C.coral}06`,border:`1px solid ${C.coral}25`,
                  borderRadius:12,padding:"12px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:10,color:C.coral,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>
                      ⚠ Eksik Malzemeler
                    </div>
                    <span style={{fontSize:9,color:C.muted}}>{(ueGosterilen.eksikMalzemeler||[]).length} kalem</span>
                  </div>
                  {(ueGosterilen.eksikMalzemeler||[]).map((m,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",
                      alignItems:"center",padding:"5px 8px",marginBottom:4,
                      background:"rgba(0,0,0,0.15)",borderRadius:7}}>
                      <div>
                        <div style={{fontSize:11,color:C.text,fontWeight:600}}>{m.ad}</div>
                        <div style={{fontSize:9,color:C.muted}}>
                          Stok: {fmt(m.mevcut)} · Gerek: {fmt(m.gereken)} ·
                          <span style={{color:C.coral}}> -{fmt(m.eksik)} {m.birim} eksik</span>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        {m.tedarikDurum==="siparis"&&(
                          <span style={{fontSize:9,background:`${C.gold}15`,color:C.gold,
                            borderRadius:4,padding:"2px 6px"}}>📦 Sipariş Verildi</span>
                        )}
                        {m.tedarikDurum==="geldi"&&(
                          <span style={{fontSize:9,background:`${C.mint}15`,color:C.mint,
                            borderRadius:4,padding:"2px 6px"}}>✅ Geldi</span>
                        )}
                        {(!m.tedarikDurum||m.tedarikDurum==="bekliyor")&&(
                          <button onClick={()=>setUretimEmirleri(p=>p.map(e=>e.id===ueGosterilen.id?{
                            ...e,eksikMalzemeler:(e.eksikMalzemeler||[]).map((x,xi)=>xi===i?{...x,tedarikDurum:"siparis"}:x)
                          }:e))}
                            style={{fontSize:9,background:`${C.sky}12`,border:`1px solid ${C.sky}25`,
                            color:C.sky,borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>
                            Sipariş Ver
                          </button>
                        )}
                        {m.tedarikDurum==="siparis"&&(
                          <button onClick={()=>setUretimEmirleri(p=>p.map(e=>e.id===ueGosterilen.id?{
                            ...e,eksikMalzemeler:(e.eksikMalzemeler||[]).map((x,xi)=>xi===i?{...x,tedarikDurum:"geldi"}:x)
                          }:e))}
                            style={{fontSize:9,background:`${C.mint}12`,border:`1px solid ${C.mint}25`,
                            color:C.mint,borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>
                            Geldi ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WorkLog Özeti */}
              {(()=>{
                const logs = workLogRepo.byUE(ueGosterilen.id).filter(w=>w.durum==="bitti");
                if(logs.length===0) return null;
                const toplamGercek = logs.reduce((s,w)=>s+(w.gerceklesenSure||0),0);
                const toplamPlan   = logs.reduce((s,w)=>s+(w.planlananSure||0),0);
                return(
                  <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,
                    borderRadius:12,padding:"12px 16px"}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,
                      textTransform:"uppercase",marginBottom:8}}>⏱ Süre Analizi</div>
                    <div style={{display:"flex",gap:16,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
                      <span>Planlanan: <strong style={{color:C.gold}}>{snGoster(toplamPlan)}</strong></span>
                      <span>Gerçekleşen: <strong style={{color:toplamGercek<=toplamPlan?C.mint:C.coral}}>{snGoster(toplamGercek)}</strong></span>
                      {toplamPlan>0&&<span>Sapma: <strong style={{color:toplamGercek>toplamPlan?C.coral:C.mint}}>
                        {toplamGercek>toplamPlan?"+":""}{snGoster(Math.abs(toplamGercek-toplamPlan))}
                      </strong></span>}
                    </div>
                  </div>
                );
              })()}

              {/* Eksik HM Paneli (hesaplanan) */}
              {tumEksikHM.length>0&&(
                <div style={{background:`${C.coral}06`,border:`1px solid ${C.coral}20`,borderRadius:12,padding:"12px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.coral,letterSpacing:.5}}>
                      ⚠ EKSİK HAM MADDELER — {ueGosterilen?"Bu Ürün":"Tüm Aktif Üretim"} ({tumEksikHM.length} kalem)
                    </div>
                    {tumEksikHM.length>0&&!ueGosterilen?.eksikTedarikGonderildi&&(
                      <button onClick={()=>{
                        const yeniTedSip = tumEksikHM.map(m=>{
                          const hm=hamMaddeler.find(x=>x.id===m.id);
                          return {
                            id:"ts-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),
                            durum:"siparis_bekliyor",
                            olusturmaAt:new Date().toISOString(),
                            kaynakModul:"uretim",
                            kaynakUEler:m.kaynakUEler||[],
                            kalemler:[{
                              hamMaddeId:m.id, ad:m.ad, miktar:m.eksik,
                              birim:m.birim, birimFiyat:hm?.listeFiyat||0,
                            }],
                            tedarikci:hm?.tedarikci||"",
                          };
                        });
                        setTedarikSiparisleri(p=>[...p,...yeniTedSip]);
                        setUretimEmirleri(p=>p.map(e=>{
                          const ilgili=hedefUEler.find(h=>h.id===e.id);
                          if(!ilgili) return e;
                          return {...e,eksikTedarikGonderildi:true,eksikMalzemeler:(e.eksikMalzemeler||[]).map(m=>({...m,tedarikDurum:"siparis"}))};
                        }));
                      }}
                        style={{background:`${C.sky}15`,border:`1px solid ${C.sky}30`,borderRadius:8,
                        padding:"5px 14px",fontSize:11,fontWeight:700,color:C.sky,cursor:"pointer"}}>
                        📦 Tedariğe Gönder ({tumEksikHM.length} kalem)
                      </button>
                    )}
                  </div>
                  {Object.entries(tedGrpAtolye).map(([ted,malzList])=>(
                    <div key={ted} style={{marginBottom:8}}>
                      <div style={{fontSize:9,fontWeight:700,color:C.gold,marginBottom:3}}>📦 {ted} ({malzList.length})</div>
                      {malzList.map((m,mi)=>(
                        <div key={mi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          padding:"4px 8px",marginBottom:2,borderRadius:6,background:"rgba(0,0,0,.15)",fontSize:10}}>
                          <span style={{color:C.text,fontWeight:600}}>{m.ad}</span>
                          <div style={{display:"flex",gap:8}}>
                            <span style={{color:C.muted}}>Stok: {fmt(m.mevcut)}</span>
                            <span style={{color:C.gold}}>Gerek: {fmt(m.gereken)}</span>
                            <span style={{color:C.coral,fontWeight:700}}>-{fmt(m.eksik)} {m.birim}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Aşama kartları */}
              <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,
                borderRadius:16,padding:"16px 20px"}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,
                  textTransform:"uppercase",marginBottom:12}}>Üretim Aşamaları</div>
                {(ueGosterilen.asamalar||[]).length===0 ? (
                  <div style={{textAlign:"center",color:C.muted,fontSize:12,padding:"20px"}}>
                    <div style={{fontSize:28,marginBottom:8}}>📋</div>
                    Aşama tanımlanmamış.
                    <br/>
                    <button onClick={()=>setModal({type:"ueDetay",data:ueGosterilen})}
                      style={{marginTop:10,background:`${C.cyan}15`,border:`1px solid ${C.cyan}30`,
                      borderRadius:8,padding:"6px 14px",fontSize:12,color:C.cyan,cursor:"pointer"}}>
                      Aşama Ekle →
                    </button>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(ueGosterilen.asamalar||[]).map((asama,ai)=>(
                      <AsamaKart key={asama.id||ai} asama={asama} idx={ai} ue={ueGosterilen}/>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ):(
            !atolyeSipNo && (
              <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,
                borderRadius:16,padding:"60px",textAlign:"center",color:C.muted}}>
                <div style={{fontSize:40,marginBottom:12}}>👈</div>
                <div style={{fontSize:14,color:C.sub}}>Sol taraftan bir üretim emri seç</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
