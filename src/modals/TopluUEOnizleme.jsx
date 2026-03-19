import { C, F, fmt } from '../config/constants.js';
import { topluUEOlustur } from '../engine/index.js';
import { Modal, Btn } from '../components/index.js';

export function TopluUEOnizleme({data, onClose, urunler = [], hamMaddeler = [], yarimamulList = [], hizmetler = [], uretimEmirleri = [], siparisler = [], setUretimEmirleri, setSiparisler}){
  const sp = data;
  const sonuc = topluUEOlustur(sp, {
    urunler,
    hamMaddeler,
    yarimamulList,
    hizmetler:[...(hizmetler||[]),...(urunler||[]).flatMap(u=>(u.bom||[]).filter(b=>b.tip==="hizmet").map(b=>b))],
    uretimEmirleri,
    siparisler
  });
  const {ueler, malzemeler} = sonuc;
  const eksikMalz = malzemeler.filter(m=>m.eksik>0);
  const yeterliMalz = malzemeler.filter(m=>m.eksik<=0);

  // Tedarikci bazli gruplama
  const tedGrp = {};
  eksikMalz.forEach(m=>{
    const hm=(hamMaddeler||[]).find(x=>x.id===m.id);
    const ted=hm?.tedarikci||"Belirtilmemis";
    if(!tedGrp[ted]) tedGrp[ted]=[];
    tedGrp[ted].push({...m, tedarikci:ted, hmBirim:hm?.birim||m.birim});
  });

  return(
    <Modal title={"🏭 Uretim Emri Onizleme — "+sp.id} onClose={onClose} width={650} maxHeight="85vh">
      {/* UE Listesi */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.cyan,marginBottom:8}}>Olusturulacak Uretim Emirleri ({ueler.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ueler.map((ue,i)=>{
            const ur=(urunler||[]).find(x=>x.id===ue.urunId);
            return(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:C.cyan+"08",border:"1px solid "+C.cyan+"18"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{ue.kod} — {ue.urunAd}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>{ue.asamalar.length} asama · {ue.eksikMalzemeler.length>0?ue.eksikMalzemeler.length+" eksik malzeme":"Malzeme tamam"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:800,color:C.cyan,fontFamily:"'Montserrat',sans-serif"}}>{ue.adet}</div>
                <div style={{fontSize:9,color:C.muted}}>adet uretim</div>
              </div>
            </div>);
          })}
        </div>
      </div>

      {/* Eksik Malzeme Listesi — tedarikci bazli */}
      {eksikMalz.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.coral,marginBottom:8}}>⚠ Eksik Malzemeler ({eksikMalz.length} kalem)</div>
          {Object.entries(tedGrp).map(([ted,malzList])=>(
            <div key={ted} style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
                <span>📦 {ted}</span>
                <span style={{fontSize:9,color:C.muted}}>{malzList.length} kalem</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {malzList.map((m,mi)=>(<div key={mi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",borderRadius:6,background:"rgba(255,255,255,.02)",border:"1px solid "+C.border,fontSize:11}}>
                  <span style={{color:C.text,fontWeight:600}}>{m.ad}</span>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{color:C.muted}}>Stok: {Number(m.mevcut).toFixed(1)}</span>
                    <span style={{color:C.gold}}>Gerek: {Number(m.gereken).toFixed(1)}</span>
                    <span style={{color:C.coral,fontWeight:700}}>Eksik: {Number(m.eksik).toFixed(1)} {m.hmBirim}</span>
                  </div>
                </div>))}
              </div>
            </div>
          ))}
        </div>
      )}

      {eksikMalz.length===0&&malzemeler.length>0&&(
        <div style={{padding:"10px 14px",borderRadius:8,background:C.mint+"08",border:"1px solid "+C.mint+"20",marginBottom:16,fontSize:12,color:C.mint,fontWeight:600}}>
          ✅ Tum malzemeler stokta mevcut
        </div>
      )}

      {/* Stokta yeterli malzemeler — ozet */}
      {yeterliMalz.length>0&&(
        <div style={{marginBottom:16,background:C.mint+"06",border:"1px solid "+C.mint+"15",borderRadius:8,padding:"8px 14px"}}>
          <details>
            <summary style={{fontSize:11,fontWeight:600,color:C.mint,cursor:"pointer",userSelect:"none"}}>
              ✅ Stokta Yeterli ({yeterliMalz.length} kalem) — detay icin tikla
            </summary>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:6}}>
              {yeterliMalz.map((m,mi)=>(
                <span key={mi} style={{fontSize:9,background:C.mint+"0C",border:"1px solid "+C.mint+"18",borderRadius:4,padding:"2px 6px",color:C.mint}}>
                  {m.ad}: {Number(m.gereken).toFixed(1)} / stok {Number(m.mevcut).toFixed(1)}
                </span>
              ))}
            </div>
          </details>
        </div>
      )}

      {ueler.length===0&&(
        <div style={{padding:"16px",textAlign:"center",color:C.mint,fontSize:13}}>
          ✅ Tum urunler stoktan karsilaniyor — uretim emri gerekmez.
        </div>
      )}

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <Btn onClick={onClose}>Iptal</Btn>
        {ueler.length>0&&<Btn variant="primary" onClick={()=>{
          setUretimEmirleri(p=>[...p,...ueler]);
          setSiparisler(p=>p.map(s=>s.id===sp.id?{...s,durum:"uretimde"}:s));
          onClose();
        }}>✓ {ueler.length} Uretim Emri Olustur</Btn>}
      </div>
    </Modal>
  );
}
