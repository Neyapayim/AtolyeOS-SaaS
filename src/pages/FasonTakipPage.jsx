import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, AramaInput, SilButonu, Badge, Btn } from '../components/index.js';

export default function FasonTakipPage({ data, setters, setModal }) {
  const {
    fasonIsler = [], fasonFirmalar = [], tedarikSiparisleri = [],
    uretimEmirleri = [], hizmetler = [],
  } = data || {};
  const { setFasonIsler } = setters || {};

  // ── Fason is durum gruplari ──
  const fasonBekleyen   = fasonIsler.filter(f => f.durum === "bekliyor");
  const fasonGonderilen = fasonIsler.filter(f => f.durum === "gonderildi");
  const fasonDonen      = fasonIsler.filter(f => f.durum === "dond");
  const fasonTamam      = fasonIsler.filter(f => f.durum === "tamam");

  // ── Tedarik siparisleri fason tracking ──
  const tsFasonAktif = tedarikSiparisleri.filter(ts =>
    ts.durum === "fasona_gonderildi" || ts.durum === "fasonda"
  );
  const tsFasonBiten = tedarikSiparisleri.filter(ts => ts.durum === "fasondan_geldi");

  // ── Firma bazli gruplama ──
  const fasonHizmetler = (hizmetler || []).filter(h => h.tip === "fason");
  const firmaMap = {};

  // Hizmet bazli firmalar
  fasonHizmetler.forEach(fh => {
    if (!firmaMap[fh.id]) firmaMap[fh.id] = { firma: fh, aktifIsler: [], bekleyenIsler: [], tsIsler: [] };
  });

  // Fason firmalar da ekle
  (fasonFirmalar || []).forEach(ff => {
    if (!firmaMap[ff.id]) firmaMap[ff.id] = { firma: ff, aktifIsler: [], bekleyenIsler: [], tsIsler: [] };
  });

  // ── UE fason asamalari ──
  const ueFasonlar = uretimEmirleri
    .filter(e => e.durum !== "tamamlandi" && e.durum !== "iptal")
    .flatMap(ue =>
      (ue.asamalar || [])
        .filter(a => a.fason)
        .map(a => ({ ...a, ueKod: ue.kod, ueAd: ue.urunAd, ueId: ue.id, t: ue.adet }))
    );

  ueFasonlar.forEach(a => {
    const fId = a.hizmetId || a.firmaId;
    if (fId && firmaMap[fId]) {
      if (a.fasonDurum === "gonderildi" || a.durum === "devam") {
        firmaMap[fId].aktifIsler.push(a);
      } else {
        firmaMap[fId].bekleyenIsler.push(a);
      }
    }
  });

  // ── Tedarik siparisleri firmaya esleme ──
  tsFasonAktif.forEach(ts => {
    const fId = ts.fasonYonlendirme?.firmaId;
    if (fId && firmaMap[fId]) {
      firmaMap[fId].tsIsler.push({ ...ts, kaynak: "tedarik" });
    }
  });

  const firmalar = Object.values(firmaMap).filter(
    f => f.aktifIsler.length > 0 || f.bekleyenIsler.length > 0 || f.tsIsler.length > 0
  );
  const toplamAktif = Object.values(firmaMap).reduce((s, f) => s + f.aktifIsler.length + f.tsIsler.length, 0);

  // ── Ozet kartlari ──
  const ozet = [
    { l: "Bekleyen",    v: fasonBekleyen.length, c: C.coral, ikon: "⏳" },
    { l: "Firmada",     v: fasonGonderilen.length + toplamAktif, c: C.gold, ikon: "🏭" },
    { l: "Döndü",       v: fasonDonen.length + tsFasonBiten.length, c: C.cyan, ikon: "📥" },
    { l: "Tamamlandı",  v: fasonTamam.length, c: C.mint, ikon: "✅" },
    { l: "Aktif Firma", v: firmalar.length, c: C.lav, ikon: "🔗" },
  ];

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader
        title="Fason Takip"
        sub={`${toplamAktif} iş firmada · ${firmalar.length} aktif firma`}
        action={
          <Btn variant="primary" onClick={() => setModal?.({ type: "yeniFasonIs", data: {} })}>
            + Fason İş Emri
          </Btn>
        }
      />

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {ozet.map(k => (
          <div key={k.l} style={{
            background: `${k.c}0C`, border: `1px solid ${k.c}20`,
            borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>{k.ikon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, fontFamily: F, lineHeight: 1 }}>{k.v}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Firma Bazli Gorunum ── */}
      {firmalar.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.lav,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 12,
          }}>
            🏭 Firma Bazlı Görünüm
          </div>
          {firmalar.map(({ firma, aktifIsler, bekleyenIsler, tsIsler }) => (
            <div key={firma.id} style={{
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.lav}20`,
              borderRadius: 14, overflow: "hidden", marginBottom: 10,
            }}>
              {/* Firma header */}
              <div style={{
                padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: `${C.lav}08`, borderBottom: `1px solid ${C.lav}15`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🏭</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{firma.ad || "—"}</div>
                    <div style={{ fontSize: 10, color: C.muted, display: "flex", gap: 8 }}>
                      {firma.sureGun > 0 && <span>~{firma.sureGun} gün</span>}
                      {firma.tip && <span>{firma.tip}</span>}
                      {firma.tel && <span>📞 {firma.tel}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {aktifIsler.length > 0 && <Badge label={`${aktifIsler.length} aktif`} color={C.gold} small />}
                  {bekleyenIsler.length > 0 && <Badge label={`${bekleyenIsler.length} bekliyor`} color={C.coral} small />}
                  {tsIsler.length > 0 && <Badge label={`${tsIsler.length} tedarik`} color={C.sky} small />}
                </div>
              </div>

              {/* UE fason aktif isler */}
              <div style={{ padding: "8px 16px" }}>
                {aktifIsler.map((is2, ii) => (
                  <div key={`aktif-${ii}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: ii < aktifIsler.length - 1 || bekleyenIsler.length > 0 || tsIsler.length > 0
                      ? `1px solid ${C.border}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {is2.ueKod || ""} — {is2.ad || ""}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                        {is2.t && <span>{is2.t} adet</span>}
                        {is2.ueAd && <span> · {is2.ueAd}</span>}
                      </div>
                    </div>
                    <Badge label="Firmada" color={C.gold} small />
                  </div>
                ))}

                {/* UE fason bekleyen isler */}
                {bekleyenIsler.map((is2, ii) => (
                  <div key={`bek-${ii}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: ii < bekleyenIsler.length - 1 || tsIsler.length > 0
                      ? `1px solid ${C.border}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {is2.ueKod || ""} — {is2.ad || ""}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                        {is2.t && <span>{is2.t} adet</span>}
                        {is2.ueAd && <span> · {is2.ueAd}</span>}
                      </div>
                    </div>
                    <Badge label="Bekliyor" color={C.coral} small />
                  </div>
                ))}

                {/* Tedarik siparisleri fason isler */}
                {tsIsler.map((ts, ti) => (
                  <div key={`ts-${ti}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: ti < tsIsler.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        Tedarik #{(ts.id || "").slice(-5)} — {ts.fasonYonlendirme?.islem || "Fason İşlem"}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                        {ts.kaynakUEAd && <span>{ts.kaynakUEAd}</span>}
                        {ts.kalemler?.length > 0 && <span> · {ts.kalemler.length} kalem</span>}
                      </div>
                    </div>
                    <Badge label="Tedarik Fasonda" color={C.sky} small />
                  </div>
                ))}

                {aktifIsler.length === 0 && bekleyenIsler.length === 0 && tsIsler.length === 0 && (
                  <div style={{ padding: "12px 0", fontSize: 11, color: C.muted, textAlign: "center" }}>
                    Bu firmada aktif iş yok
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tedarik Siparisleri Fason Takip ── */}
      {(tsFasonAktif.length > 0 || tsFasonBiten.length > 0) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.sky,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
          }}>
            📦 Tedarik Fason Takibi
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...tsFasonAktif, ...tsFasonBiten].map(ts => {
              const aktif = ts.durum === "fasona_gonderildi" || ts.durum === "fasonda";
              const renk = aktif ? C.gold : C.mint;
              return (
                <div key={ts.id} style={{
                  background: "rgba(255,255,255,0.025)", border: `1px solid ${renk}25`,
                  borderLeft: `3px solid ${renk}`, borderRadius: 12, padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {ts.kaynakUEAd || ts.tedarikci || "Tedarik Siparişi"}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2, display: "flex", gap: 8 }}>
                        {ts.kaynakSipNo && <span>Sipariş: {ts.kaynakSipNo}</span>}
                        {ts.kalemler?.length > 0 && <span>{ts.kalemler.length} kalem</span>}
                        {ts.fasonYonlendirme?.firmaAd && <span>🏭 {ts.fasonYonlendirme.firmaAd}</span>}
                      </div>
                    </div>
                    <Badge label={aktif ? "Fasonda" : "Fasondan Geldi"} color={renk} small />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Manuel Fason Isler ── */}
      {fasonIsler.length > 0 && (
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.muted,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
          }}>
            📋 Manuel Fason İşler
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fasonIsler.map(f => {
              const firma2 = fasonFirmalar.find(x => x.id === f.firmaId);
              const renkMap = { bekliyor: C.coral, gonderildi: C.gold, dond: C.cyan, tamam: C.mint };
              const renk = renkMap[f.durum] || C.muted;
              const labelMap = { bekliyor: "Bekliyor", gonderildi: "Firmada", dond: "Döndü", tamam: "Tamamlandı" };
              return (
                <div key={f.id} style={{
                  background: "rgba(255,255,255,0.025)", border: `1px solid ${renk}25`,
                  borderLeft: `3px solid ${renk}`, borderRadius: 12, padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                        {f.ad || "Fason İş"}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {firma2 && <span>🏭 {firma2.ad}</span>}
                        {f.adet && <span>{f.adet} adet</span>}
                        {f.gonderimTarihi && <span>📅 {f.gonderimTarihi}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <Badge label={labelMap[f.durum] || f.durum} color={renk} small />
                      {f.durum === "bekliyor" && (
                        <button onClick={() => setFasonIsler?.(p => p.map(x => x.id === f.id ? { ...x, durum: "gonderildi", gonderimTarihi: new Date().toLocaleDateString("tr-TR") } : x))} style={{
                          fontSize: 10, background: `${C.gold}12`, border: `1px solid ${C.gold}25`,
                          borderRadius: 6, padding: "3px 8px", color: C.gold, cursor: "pointer",
                        }}>📤 Gönder</button>
                      )}
                      {f.durum === "gonderildi" && (
                        <button onClick={() => setFasonIsler?.(p => p.map(x => x.id === f.id ? { ...x, durum: "dond" } : x))} style={{
                          fontSize: 10, background: `${C.cyan}12`, border: `1px solid ${C.cyan}25`,
                          borderRadius: 6, padding: "3px 8px", color: C.cyan, cursor: "pointer",
                        }}>📥 Döndü</button>
                      )}
                      {f.durum === "dond" && (
                        <button onClick={() => setFasonIsler?.(p => p.map(x => x.id === f.id ? { ...x, durum: "tamam" } : x))} style={{
                          fontSize: 10, background: `${C.mint}12`, border: `1px solid ${C.mint}25`,
                          borderRadius: 6, padding: "3px 8px", color: C.mint, cursor: "pointer",
                        }}>✅ Stoka Al</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {fasonIsler.length === 0 && firmalar.length === 0 && tsFasonAktif.length === 0 && tsFasonBiten.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.sub, fontFamily: F, marginBottom: 8 }}>
            Henüz fason iş yok
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Üretim emri oluştururken fason aşamalar otomatik eklenir veya manuel ekleyebilirsiniz.
          </div>
          <Btn variant="primary" onClick={() => setModal?.({ type: "yeniFasonIs", data: {} })}>
            + İlk Fason İş Emrini Oluştur
          </Btn>
        </div>
      )}
    </div>
  );
}
