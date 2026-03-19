import React from 'react';
import { C, F, FB } from '../config/constants.js';
import { PageHeader, Btn, Badge } from '../components/index.js';

export default function DashboardPage({ data, setTab, setters, setModal, aktifUE, setAktifUE, onNewUE }) {
  const {
    siparisler = [], uretimEmirleri = [], hamMaddeler = [],
    calisanlar = [], urunler = [], yarimamulList = [],
  } = data || {};

  const ueBeklyen = uretimEmirleri.filter(e => e.durum === "bekliyor");
  const ueUretimde = uretimEmirleri.filter(e => e.durum === "uretimde");
  const ueTamam = uretimEmirleri.filter(e => e.durum === "tamamlandi");

  const bugun = new Date().toDateString();
  const bugunTamam = ueTamam.filter(e =>
    e.tamamlanmaTarihi && new Date(e.tamamlanmaTarihi).toDateString() === bugun
  ).length;

  const stokAlarmListesi = hamMaddeler.filter(x => (x.miktar || 0) <= (x.minStok || 0));
  const stokAlarm = stokAlarmListesi.length;
  const aktifCalisan = calisanlar.filter(c => c.durum === "aktif").length;

  const bugununTarihi = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long"
  });

  const kpilar = [
    { l: "Üretimde", v: ueUretimde.length, u: "emir", col: C.cyan, icon: "\🏭", onClick: () => setTab("atolye") },
    { l: "Bekleyen", v: ueBeklyen.length, u: "emir", col: C.gold, icon: "⏳", onClick: () => setTab("atolye") },
    { l: "Bugün Tamamlanan", v: bugunTamam, u: "adet", col: C.mint, icon: "✅" },
    { l: "Stok Alarmı", v: stokAlarm, u: "kalem", col: stokAlarm > 0 ? C.coral : C.mint, icon: "\📦", onClick: () => setTab("stok") },
    { l: "Aktif Çalışan", v: aktifCalisan, u: "kişi", col: C.lav, icon: "\👷" },
  ];

  return (
    <div style={{ animation: "fade-up .4s ease" }}>
      <PageHeader
        title="Fabrika Kontrol Paneli"
        sub={bugununTarihi}
        action={<Btn variant="primary" onClick={onNewUE}>+ Üretim Emri</Btn>}
      />

      {/* ── KPI Kartları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 22 }}>
        {kpilar.map((k, i) => (
          <div key={i} className="card" onClick={k.onClick} style={{
            background: "rgba(255,255,255,0.028)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${k.col}18`,
            borderRadius: 14, padding: "16px",
            boxShadow: `0 8px 32px rgba(0,0,0,.5),inset 0 0 20px ${k.col}05`,
            transition: "all .25s", animation: `fade-up .4s ${i * 0.06}s ease both`,
            cursor: k.onClick ? "pointer" : "default",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{
              fontSize: 26, fontWeight: 700, color: k.col, fontFamily: F, letterSpacing: -0.5,
              textShadow: `0 0 24px ${k.col}40`
            }}>
              {k.v}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3, color: C.muted }}>{k.u}</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── KANBAN + SAĞ PANEL ikili layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, alignItems: "start" }}>

        {/* KANBAN */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              \🏭 Üretim Durumu
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <button onClick={() => setTab("atolye")} style={{
              fontSize: 12, color: C.cyan, background: "none", border: "none", cursor: "pointer"
            }}>
              Atölye Görünümü →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { baslik: "⏳ Bekleyen", renk: C.gold, emirler: ueBeklyen, isBekleyen: true },
              { baslik: "⚙️ Üretimde", renk: C.cyan, emirler: ueUretimde, isBekleyen: false },
              { baslik: "✅ Tamamlandı", renk: C.mint, emirler: ueTamam.slice(-3).reverse(), isBekleyen: false },
            ].map(({ baslik, renk, emirler, isBekleyen }) => (
              <div key={baslik} style={{
                background: "rgba(255,255,255,.02)", border: `1px solid ${renk}20`,
                borderRadius: 12, overflow: "hidden"
              }}>
                {/* Kolon başlığı */}
                <div style={{
                  padding: "10px 12px", borderBottom: `1px solid ${renk}15`,
                  background: `${renk}08`, display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: renk }}>{baslik}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{emirler.length}</span>
                </div>

                {/* Emir kartları */}
                <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
                  {emirler.length === 0 && (
                    <div style={{ textAlign: "center", color: C.muted, fontSize: 11, padding: "20px 0" }}>Boş</div>
                  )}
                  {emirler.map(e => {
                    const asamaDone = (e.asamalar || []).filter(a => a.durum === "bitti").length;
                    const asamaToplam = (e.asamalar || []).length;
                    const pct = asamaToplam > 0 ? Math.round(asamaDone / asamaToplam * 100) : 0;
                    return (
                      <div key={e.id}
                        onClick={() => { setAktifUE(e.id); setTab("atolye"); }}
                        className="card"
                        style={{
                          background: "rgba(255,255,255,.03)",
                          border: `1px solid ${renk}22`, borderRadius: 9,
                          padding: "8px 10px", cursor: "pointer",
                          transition: "all .18s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 9, color: renk, fontWeight: 700 }}>{e.kod}</span>
                          <span style={{ fontSize: 9, color: C.muted }}>{e.adet} adet</span>
                        </div>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {e.urunAd}
                        </div>
                        {asamaToplam > 0 && <>
                          <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 3, height: 3, overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`, height: "100%", background: renk,
                              borderRadius: 3, transition: "width .4s"
                            }} />
                          </div>
                          <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                            {asamaDone}/{asamaToplam} aşama · %{pct}
                          </div>
                        </>}
                        {e.termin && (
                          <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                            \📅 {e.termin}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bekleyen kolonuna "+ Yeni Emri" butonu */}
                {isBekleyen && (
                  <div style={{ padding: "6px 8px", borderTop: `1px solid ${C.border}` }}>
                    <button
                      onClick={() => setModal({ type: "yeniUretimEmri", data: {} })}
                      style={{
                        width: "100%", background: `${renk}10`,
                        border: `1px solid ${renk}25`, borderRadius: 7,
                        padding: "6px", fontSize: 11, color: renk,
                        cursor: "pointer", fontWeight: 600
                      }}
                    >
                      + Yeni Emri
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── SAĞ PANEL: Stok Alarmları + Çalışan Durumu ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Stok Alarmları */}
          <div style={{
            background: "rgba(255,255,255,.02)", border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden"
          }}>
            <div style={{
              padding: "10px 12px", borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.coral }}>⚠️ Stok Alarmları</span>
              <button onClick={() => setTab("stok")} style={{
                fontSize: 10, color: C.cyan, background: "none", border: "none", cursor: "pointer"
              }}>
                Tümü →
              </button>
            </div>
            <div style={{ padding: 8 }}>
              {stokAlarmListesi.length === 0 ? (
                <div style={{ textAlign: "center", color: C.mint, fontSize: 11, padding: "12px 0" }}>
                  ✅ Stok Normal
                </div>
              ) : (
                stokAlarmListesi.slice(0, 4).map(s => (
                  <div key={s.id} style={{
                    padding: "6px 4px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{s.ad}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>{s.kategori}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.coral }}>{s.miktar} {s.birim}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>min: {s.minStok}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Çalışan Durumu */}
          <div style={{
            background: "rgba(255,255,255,.02)", border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden"
          }}>
            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.lav }}>\👷 Çalışanlar</span>
            </div>
            <div style={{ padding: 8 }}>
              {calisanlar.filter(c => c.durum === "aktif").map(c => {
                const aktifGorev = uretimEmirleri
                  .flatMap(e => (e.asamalar || []).filter(a => a.calisan === c.ad && a.durum === "devam"))
                  .slice(0, 1)[0];
                return (
                  <div key={c.id} style={{
                    padding: "6px 4px", display: "flex", alignItems: "center", gap: 8,
                    borderBottom: `1px solid ${C.border}`
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: `${C.lav}18`,
                      border: `1px solid ${C.lav}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: C.lav, flexShrink: 0
                    }}>
                      {c.ad.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{c.ad}</div>
                      <div style={{
                        fontSize: 9, color: aktifGorev ? C.mint : C.muted,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {aktifGorev ? `⚙️ ${aktifGorev.ad}` : "Boşta"}
                      </div>
                    </div>
                    {aktifGorev && (
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", background: C.mint,
                        animation: "pulse-dot 2s ease-in-out infinite", flexShrink: 0
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
