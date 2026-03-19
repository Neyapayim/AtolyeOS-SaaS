// ── STOK REZERVASYON + TOPLU UE ENGINE ───────────────────────────

import { uid } from '../config/constants.js';
import { bomMalzemeListesi } from './malzemeEngine.js';

export const toplamRezervasyon = (sips, allU, allH, allY) => {
  const rz={},ur={};
  (sips||[]).forEach(sp=>{if(sp.durum==="tamamlandi"||sp.durum==="iptal"||sp.durum==="sevk_edildi")return;
    (sp.kalemler||[]).forEach(k=>{if(!k.urunId||!k.adet)return;ur[k.urunId]=(ur[k.urunId]||0)+(k.adet||0);
      const u=allU.find(x=>x.id===k.urunId);if(!u)return;const p2=(ur[k.urunId]||0)-(k.adet||0);
      const kl=Math.max(0,(u.stok||0)-p2);const ut=Math.max(0,(k.adet||0)-kl);
      if(ut>0)bomMalzemeListesi(u,ut,allH,allY,allU).forEach(m=>{rz[m.id]=(rz[m.id]||0)+m.gereken;});});});
  return{hammadde:rz,urun:ur};
};

export const siparisKalemAnalizleri = (kalemler, mevSip, exId, allU, allH, allY) => {
  const filt=(mevSip||[]).filter(s=>s.id!==exId);const dR=toplamRezervasyon(filt,allU,allH,allY);
  const iU={},iH={};
  return kalemler.map(k=>{if(!k.urunId||!k.adet)return null;
    const u=allU.find(x=>x.id===k.urunId);if(!u)return{stokYeterli:false,stokMiktar:0,stokKarsilanan:0,uretilecek:k.adet,eksikHamMaddeler:[]};
    const kl=Math.max(0,(u.stok||0)-(dR.urun[k.urunId]||0)-(iU[k.urunId]||0));
    const sK=Math.min(k.adet,kl);const ut=Math.max(0,k.adet-sK);iU[k.urunId]=(iU[k.urunId]||0)+k.adet;
    let ek=[];if(ut>0){ek=bomMalzemeListesi(u,ut,allH,allY,allU).map(m=>{
      const kl2=Math.max(0,m.mevcut-(dR.hammadde[m.id]||0)-(iH[m.id]||0));const e2=Math.max(0,m.gereken-kl2);
      iH[m.id]=(iH[m.id]||0)+m.gereken;return{...m,kullanilabilir:kl2,eksik:e2,yeterli:e2===0};});}
    return{stokYeterli:ut===0,stokMiktar:kl,stokKarsilanan:sK,uretilecek:ut,eksikHamMaddeler:ek};});
};

export const topluUEOlustur = (sp, {urunler,hamMaddeler,yarimamulList,hizmetler,uretimEmirleri,siparisler}) => {
  const kalemler=sp.kalemler||[];if(!kalemler.length)return{ueler:[],malzemeler:[]};

  const gecerliKalemler = kalemler.filter(k=>k.urunId&&k.adet>0);
  const guncelAnalizler = siparisKalemAnalizleri(gecerliKalemler, siparisler||[], sp.id, urunler, hamMaddeler, yarimamulList);

  const uG={};
  gecerliKalemler.forEach((k,ki)=>{
    const a = guncelAnalizler?.[ki] || {};
    if(!k.urunId)return;
    if(!uG[k.urunId])uG[k.urunId]={urunId:k.urunId,topAdet:0,stokK:0,urtK:0,altler:[]};
    uG[k.urunId].topAdet+=(k.adet||0);
    uG[k.urunId].stokK+=(a.stokKarsilanan||0);
    uG[k.urunId].urtK+=(a.uretilecek||0);
    if(k.altMusteriAd)uG[k.urunId].altler.push({ad:k.altMusteriAd,adet:k.adet});
  });
  const mevUE=(uretimEmirleri||[]).length;const ueler=[];const tumMalz={};let idx=0;
  const sharedYmStok = {};
  Object.values(uG).forEach(g=>{if(g.urtK<=0)return;const u=urunler.find(x=>x.id===g.urunId);if(!u)return;
    const hz=hizmetler||[];const asm=[];const hT=(bom,d=0)=>{if(d>6)return;(bom||[]).forEach(b=>{
      if(b.tip==="hizmet"){const h=hz.find(x=>x.id===b.kalemId);if(h&&!asm.find(a=>a.hizmetId===h.id))asm.push({id:uid(),ad:h.ad,durum:"bekliyor",calisan:h.calisan||"",sureDk:h.sureDkAdet||0,fason:h.tip==="fason",hizmetId:h.id});}
      else if(b.tip==="yarimamul"){const ym=yarimamulList.find(x=>x.id===b.kalemId)||urunler.find(x=>x.id===b.kalemId);hT(ym?.bom||[],d+1);}});};
    (u.bom||[]).forEach(b=>{if(b.tip==="yarimamul"){const ym=yarimamulList.find(x=>x.id===b.kalemId)||urunler.find(x=>x.id===b.kalemId);hT(ym?.bom||[],1);}});
    (u.bom||[]).filter(b=>b.tip==="hizmet").forEach(b=>hT([b]));
    const ml=bomMalzemeListesi(u,g.urtK,hamMaddeler,yarimamulList,urunler,sharedYmStok);
    ml.forEach(m=>{
      if(!tumMalz[m.id]) tumMalz[m.id]={...m,gereken:0,eksik:0};
      tumMalz[m.id].gereken = Math.round((tumMalz[m.id].gereken + m.gereken) * 1e10) / 1e10;
      tumMalz[m.id].eksik = Math.max(0, Math.round((tumMalz[m.id].gereken - tumMalz[m.id].mevcut) * 1e10) / 1e10);
      tumMalz[m.id].yeterli=tumMalz[m.id].eksik<=0;
    });
    const aS=g.altler.length>0?" ("+g.altler.map(a=>a.ad+" "+a.adet).join(", ")+")":"";
    ueler.push({id:uid(),kod:"UE-"+String(mevUE+idx+1).padStart(3,"0"),urunId:g.urunId,urunAd:u.ad,
      adet:g.urtK,durum:"bekliyor",sipNo:sp.id,termin:sp.termin||"",strateji:"gunluk",
      notlar:"Sipariş: "+sp.id+" — "+g.topAdet+" adet"+aS+(g.stokK>0?" (stoktan "+g.stokK+")":""),
      asamalar:asm,eksikMalzemeler:ml.filter(m=>!m.yeterli),olusturmaTarihi:new Date().toISOString()});idx++;});
  return{ueler,malzemeler:Object.values(tumMalz)};
};

// ── REZERVE ENGINE ────────────────────────────────────────────
export const hesaplaRezervasyon = (uretimEmirleri, urunler, hamMaddeler, yarimamulList) => {
  const hmRezerve = {};
  const ymRezerve = {};
  const sharedYm = {};

  (uretimEmirleri||[])
    .filter(e => e.durum!=="tamamlandi" && e.durum!=="iptal")
    .forEach(ue => {
      const urun = urunler.find(x=>x.id===ue.urunId);
      if(!urun?.bom) return;
      const adet = ue.adet||1;

      const ml = bomMalzemeListesi(urun, adet, hamMaddeler, yarimamulList, urunler, sharedYm);
      ml.forEach(m => {
        hmRezerve[m.id] = (hmRezerve[m.id]||0) + m.gereken;
      });

      const ymTara = (bom, carpan=1, depth=0) => {
        if(depth>8) return;
        (bom||[]).forEach(b => {
          if(b.tip==="hizmet") return;
          const ym = (yarimamulList||[]).find(x=>x.id===b.kalemId) || (urunler||[]).find(x=>x.id===b.kalemId);
          if(ym && ym.bom?.length) {
            const gereken = (b.miktar||1) * carpan * adet;
            ymRezerve[ym.id] = (ymRezerve[ym.id]||0) + gereken;
            ymTara(ym.bom, (b.miktar||1)*carpan, depth+1);
          }
        });
      };
      ymTara(urun.bom);
    });

  return { hammadde: hmRezerve, yarimamul: ymRezerve };
};
