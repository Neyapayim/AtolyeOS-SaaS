import { useState } from 'react';
import { C, F, fmt } from '../config/constants.js';
import { Modal, Btn } from '../components/index.js';

export function OtomatikKodModal({urunler, hamMaddeler, yarimamulList, hizmetler, urunBomList, onClose, onApply}){
  const [durum,setDurum]=useState("hazir"); // hazir | yukleniyor | onizleme | hata
  const [kodOneriler,setKodOneriler]=useState([]); // [{id, tip, mevcutKod, mevcutAd, yeniKod, aciklama}]
  const [hata,setHata]=useState("");
  const [secili,setSecili]=useState({}); // id->boolean (hangi kodlar onayli)

  const sistemOzetle=()=>{
    // Tum BOM baglantilarini cikar — hangi ham madde/ym hangi urunlerde kullaniliyor
    const urundeKullanilan={}; // hmId/ymId -> [urunAd]
    urunBomList.forEach(ur=>{
      (ur.bom||[]).forEach(row=>{
        const key=row.kalemId;
        if(!urundeKullanilan[key]) urundeKullanilan[key]=[];
        urundeKullanilan[key].push(ur.ad);
      });
    });
    // Yari mamullerin BOM'larindaki ham maddeler
    yarimamulList.forEach(ym=>{
      (ym.bom||[]).forEach(row=>{
        const key=row.kalemId;
        if(!urundeKullanilan[key]) urundeKullanilan[key]=[];
        urundeKullanilan[key].push(`(YM: ${ym.ad})`);
      });
    });

    return {
      urunler: urunler.map(u=>({id:u.id, ad:u.ad, kategori:u.kategori, mevcutKod:u.kod})),
      yarimamullar: yarimamulList.map(y=>({id:y.id, ad:y.ad, mevcutKod:y.kod, kullanildigiBomlar:urundeKullanilan[y.id]||[]})),
      hamMaddeler: hamMaddeler.map(h=>({id:h.id, ad:h.ad, kategori:h.kategori, mevcutKod:h.kod, kullanildigiYerler:urundeKullanilan[h.id]||[]})),
      hizmetler: hizmetler.map(h=>({id:h.id, ad:h.ad, tip:h.tip, mevcutKod:h.kod})),
      urunBomlar: urunBomList.map(u=>({
        id:u.id, ad:u.ad, mevcutKod:u.kod,
        malzemeler:(u.malBom||[]).map(r=>r.kalemId)
      }))
    };
  };

  const kodolustur=async()=>{
    setDurum("yukleniyor");
    setHata("");
    const ozet=sistemOzetle();
    const prompt=`Sen bir mobilya/metal atolyesi uretim yaziliminin akilli kod olusturma motorusun.

Asagidaki atolye sistemindeki tum kalemlere anlamli, tutarli ve otomatik kodlar olustur.

## KOD KURALLARI
- **Urunler**: Urun adindan 2-4 harfli kisaltma + sira -> TAB-001, SND-001, MSA-001
- **Yari Mamuller**: Ait oldugu urun kodu + YM + sira -> TAB-YM01, TAB-YM02 (birden fazla urunde kullanilanlar genel: YM-001)
- **Ham Maddeler**: Kategori kisaltmasi + sira -> PRF-001 (Profil), BRU-001 (Boru), KMS-001 (Kumas), SNG-001 (Sunger), SNT-001 (Sunta), AKS-001 (Aksesuar), genel: HM-001
- **Fason Hizmetler**: FSN-001, FSN-002...
- **Ic Iscilik**: ISC-001, ISC-002...
- **Urun BOM'lari** (stok>urun kaydi): Urun kodu + BOM -> TAB-BOM

## TURKCE KATEGORI KISALTMALARI
Profil->PRF, Boru->BRU, Kumas->KMS, Sunger->SNG, Sunta->SNT, Aksesuar->AKS,
Tabla->TBL, Ayak->AYK, Kaplama->KPL, Boya->BYA, Yapisirici->YPS

## SISTEM VERISI
${JSON.stringify(ozet, null, 2)}

## YANIT FORMATI
Sadece JSON dondur, baska hicbir sey yazma:
{
  "kodlar": [
    {"id": "...", "tip": "urun|yarimamul|hammadde|hizmet|urunbom", "yeniKod": "TAB-001", "aciklama": "Trio Tabure -> TAB"},
    ...
  ]
}`;

    try{
      const apiKey=localStorage.getItem("atolye_anthropic_key")||"";
      if(!apiKey){
        setHata("AI ozelligi icin Genel Ayarlar'dan Anthropic API Key giriniz.");
        setDurum("hata");
        return;
      }
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":apiKey,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"";
      // JSON temizle
      const jsonStr=raw.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(jsonStr);
      const oneriler=parsed.kodlar||[];

      // Mevcut adlari bul
      const tumKalemler=[
        ...urunler.map(x=>({...x,tip:"urun"})),
        ...yarimamulList.map(x=>({...x,tip:"yarimamul"})),
        ...hamMaddeler.map(x=>({...x,tip:"hammadde"})),
        ...hizmetler.map(x=>({...x,tip:"hizmet"})),
        ...urunBomList.map(x=>({...x,tip:"urunbom"}))
      ];
      const kalemMap={};
      tumKalemler.forEach(k=>kalemMap[k.id]=k);

      const zenginOneriler=oneriler.map(o=>({
        ...o,
        mevcutKod:kalemMap[o.id]?.kod||"—",
        mevcutAd:kalemMap[o.id]?.ad||o.id,
      }));

      setKodOneriler(zenginOneriler);
      // Hepsini varsayilan secili yap
      const yeniSecili={};
      zenginOneriler.forEach(o=>yeniSecili[o.id]=true);
      setSecili(yeniSecili);
      setDurum("onizleme");
    }catch(e){
      console.error(e);
      setHata("Claude API hatasi: "+e.message);
      setDurum("hata");
    }
  };

  const uygula=()=>{
    const kodMap={};
    kodOneriler.forEach(o=>{
      if(secili[o.id]) kodMap[o.id]=o.yeniKod;
    });
    onApply(kodMap);
  };

  const tipRenk={urun:C.cyan,yarimamul:C.mint,hammadde:C.sky,hizmet:C.lav,urunbom:C.gold};
  const tipEtiket={urun:"Urun",yarimamul:"Yari Mamul",hammadde:"Ham Madde",hizmet:"Hizmet",urunbom:"Urun BOM"};

  return(
    <Modal title="🤖 Otomatik Kod Olusturucu" onClose={onClose} width={700}>
      {durum==="hazir"&&(
        <div style={{textAlign:"center",padding:"32px 16px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🤖</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>Tum Sistemi Analiz Et</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:24,maxWidth:440,margin:"0 auto 24px"}}>
            Claude yapay zeka sistemindeki tum urunleri, yari mamulleri, ham maddeleri
            ve hizmetleri analiz ederek anlamli ve tutarli kodlar onerir.
            Onizleme ekraninda istedigini degistirebilir, istedigini uygulayabilirsin.
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:28}}>
            {[
              ["📦",`${urunler.length} Urun`],
              ["🔧",`${yarimamulList.length} Yari Mamul`],
              ["🏗️",`${hamMaddeler.length} Ham Madde`],
              ["⚙️",`${hizmetler.length} Hizmet`],
            ].map(([ic,lb])=>(
              <div key={lb} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,
                borderRadius:10,padding:"10px 16px",fontSize:12,color:C.sub}}>
                <span style={{fontSize:18,marginRight:6}}>{ic}</span>{lb}
              </div>
            ))}
          </div>
          <button onClick={kodolustur}
            style={{background:"linear-gradient(135deg,rgba(139,92,246,.3),rgba(59,130,246,.2))",
              border:"1px solid rgba(139,92,246,.4)",borderRadius:12,padding:"13px 32px",
              fontSize:15,fontWeight:700,color:"#a78bfa",cursor:"pointer",transition:"all .2s"}}>
            🚀 Kodlari Olustur
          </button>
        </div>
      )}

      {durum==="yukleniyor"&&(
        <div style={{textAlign:"center",padding:"48px 16px"}}>
          <div style={{fontSize:42,marginBottom:16,animation:"spin 1s linear infinite",display:"inline-block"}}>⚙️</div>
          <div style={{fontSize:15,color:C.sub,marginBottom:8}}>Claude analiz ediyor...</div>
          <div style={{fontSize:12,color:C.muted}}>Tum BOM agaci ve uretim zinciri inceleniyor</div>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {durum==="hata"&&(
        <div style={{textAlign:"center",padding:"32px"}}>
          <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
          <div style={{fontSize:13,color:C.coral,marginBottom:20}}>{hata}</div>
          <Btn onClick={()=>setDurum("hazir")}>← Tekrar Dene</Btn>
        </div>
      )}

      {durum==="onizleme"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,color:C.sub}}>
              {kodOneriler.length} kod onerisi ·
              <span style={{color:C.mint}}> {Object.values(secili).filter(Boolean).length} secili</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSecili(Object.fromEntries(kodOneriler.map(o=>[o.id,true])))}
                style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"4px 10px",fontSize:11,color:C.sub,cursor:"pointer"}}>Tumunu Sec</button>
              <button onClick={()=>setSecili({})}
                style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"4px 10px",fontSize:11,color:C.sub,cursor:"pointer"}}>Hicbirini Secme</button>
            </div>
          </div>

          <div style={{maxHeight:420,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {["urun","yarimamul","hammadde","hizmet","urunbom"].map(tip=>{
              const grup=kodOneriler.filter(o=>o.tip===tip);
              if(!grup.length) return null;
              return(
                <div key={tip}>
                  <div style={{fontSize:10,fontWeight:700,color:tipRenk[tip]||C.muted,
                    padding:"8px 4px 4px",letterSpacing:.5,textTransform:"uppercase"}}>
                    {tipEtiket[tip]||tip} ({grup.length})
                  </div>
                  {grup.map(o=>(
                    <div key={o.id} onClick={()=>setSecili(p=>({...p,[o.id]:!p[o.id]}))}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,
                        cursor:"pointer",marginBottom:2,border:`1px solid ${secili[o.id]?(tipRenk[o.tip]||C.border)+"44":C.border}`,
                        background:secili[o.id]?`${tipRenk[o.tip]||C.border}08`:"transparent",
                        transition:"all .15s"}}>
                      <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${secili[o.id]?tipRenk[o.tip]||C.cyan:C.border}`,
                        background:secili[o.id]?tipRenk[o.tip]||C.cyan:"transparent",flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",transition:"all .15s"}}>
                        {secili[o.id]?"✓":""}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,color:C.text,fontWeight:500,
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{o.mevcutAd}</div>
                        {o.aciklama&&<div style={{fontSize:10,color:C.muted,marginTop:1}}>{o.aciklama}</div>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                        <span style={{fontSize:11,color:C.muted,textDecoration:"line-through"}}>{o.mevcutKod}</span>
                        <span style={{fontSize:11,color:C.muted}}>→</span>
                        <span style={{fontSize:12,fontWeight:700,color:tipRenk[o.tip]||C.cyan,
                          background:`${tipRenk[o.tip]||C.cyan}15`,borderRadius:5,padding:"2px 7px"}}>{o.yeniKod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,
            paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <Btn onClick={()=>setDurum("hazir")}>← Yeniden Olustur</Btn>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={onClose}>Iptal</Btn>
              <button onClick={uygula}
                style={{background:"linear-gradient(135deg,rgba(139,92,246,.4),rgba(59,130,246,.3))",
                  border:"1px solid rgba(139,92,246,.5)",borderRadius:9,padding:"8px 20px",
                  fontSize:13,fontWeight:700,color:"#c4b5fd",cursor:"pointer"}}>
                ✅ {Object.values(secili).filter(Boolean).length} Kodu Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
