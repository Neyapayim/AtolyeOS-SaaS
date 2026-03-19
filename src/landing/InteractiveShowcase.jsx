import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Factory,
  Package,
  Plus,
  Truck,
} from "lucide-react";
import { C, F, FB, GLASS } from "../config/constants";

const STEP_WINDOWS = [
  [0.0, 0.07, 0.22, 0.28],
  [0.24, 0.33, 0.49, 0.58],
  [0.54, 0.64, 0.79, 0.87],
  [0.83, 0.9, 0.985, 1.0],
];

const STORY = [
  {
    kicker: "01 / Siparis girisi",
    title: "Musteriden gelen talep, sistemin icinde canli bir ise donusur.",
    subtitle: "Tek tikla siparis acilir; termin, teslim noktasi ve urun kirilimi ayni anda yakina gelir.",
    body:
      "Karaca Mobilya icin acilan SP-2026-041 siparisi, Ankara Armada subesine gidecek 24 Atlas Sandalye, 6 Atlas Masa ve 1 Karsilama Bankosu ile kayda girer. Kullanici kaydirirken kamera butona yaklasir, form acilir ve kayit geriye cekilerek sisteme oturur.",
    icon: ClipboardList,
  },
  {
    kicker: "02 / Stok ve tedarik",
    title: "Siparis sadece kaydedilmez; eksikler otomatik olarak yuzeye cikar.",
    subtitle: "BOM, mevcut stok ve kritik eksikler tek panelde okunur.",
    body:
      "Profil, tabla paneli, boya ve ayak kalemleri siparise bagli ihtiyac olarak ayrisir. Boylece ekip neyin stokta oldugunu, neyin tedarik emrine donecegini ikinci bir ekran aramadan gorur.",
    icon: AlertTriangle,
  },
  {
    kicker: "03 / Uretim akisi",
    title: "Uretim emri istasyonlara dagilir; atolyenin temposu ekranda akar.",
    subtitle: "Kesimden montaja kadar her adim sorumlu kisi ve ilerleme oranlariyla canlanir.",
    body:
      "SP-2026-041 icin acilan isler kesim, kaynak, boya/fason, montaj ve paketlemeye dagilir. Scroll ilerledikce statik kartlar degil, gercek bir operasyon akisi hissi veren bir panel one cikar.",
    icon: Factory,
  },
  {
    kicker: "04 / Sevkiyat ve teslim",
    title: "Ayni siparis, sevk evrakina ve teslim anina kadar izlenir.",
    subtitle: "Irsaliye, nakliye ve teslim onayi tek final sahnesinde kapanis duygusu verir.",
    body:
      "Ankara Armada subesi icin sevkiyat hazirlanir, barkod olusur, sevk ozeti tamamlanir ve teslim damgasi ekrana oturur. Final, efekt gostermek yerine isin gercekten kapandigini hissettirir.",
    icon: Truck,
  },
];

const APP_TABS = ["Dashboard", "Siparisler", "Tedarik", "Atolye", "Sevkiyat"];

const ORDER_ROWS = [
  { no: "SP-2026-038", customer: "Mondo Ic Mimari", due: "04 Nis", state: "Planlandi" },
  { no: "SP-2026-039", customer: "Galen Hotel", due: "06 Nis", state: "Acil" },
  { no: "SP-2026-040", customer: "Nora Kafe", due: "09 Nis", state: "Hazirlaniyor" },
  { no: "SP-2026-041", customer: "Karaca Mobilya", due: "12 Nis", state: "Onaylandi" },
  { no: "SP-2026-042", customer: "Marn Ofis", due: "15 Nis", state: "Beklemede" },
];

const SHORTAGES = [
  { name: "40x20 Profil", stock: "36 mt", need: "58 mt", gap: "22 mt", note: "Atlas Masa x6" },
  { name: "18 mm Tabla Paneli", stock: "11 plaka", need: "16 plaka", gap: "5 plaka", note: "Banko + Masa" },
  { name: "Elektrostatik Boya Siyah", stock: "4 kg", need: "9 kg", gap: "5 kg", note: "Sandalye kasalari" },
  { name: "Ayarli Pingo Ayak", stock: "28 adet", need: "44 adet", gap: "16 adet", note: "Tum siparis" },
];

const STATIONS = [
  { name: "Kesim", owner: "Fatma H.", progress: 1.0, state: "Tamamlandi" },
  { name: "Kaynak", owner: "Ercan Usta", progress: 0.82, state: "Devam ediyor" },
  { name: "Boya / Fason", owner: "Boya Atolyesi A", progress: 0.58, state: "Dis operasyon" },
  { name: "Montaj", owner: "Ahmet Usta", progress: 0.36, state: "Siradaki is" },
  { name: "Paketleme", owner: "Mehmet", progress: 0.12, state: "Hazirlaniyor" },
];

const SHIPMENT_CARDS = [
  { label: "Irsaliye", value: "IRS-041-26" },
  { label: "Nakliyeci", value: "Aydin Lojistik" },
  { label: "Teslim", value: "12 Nisan 2026" },
];

const SHELL = {
  border: GLASS.border,
  boxShadow: `${GLASS.boxShadow}, 0 48px 140px rgba(0,0,0,.58), 0 0 0 1px rgba(255,255,255,.03)`,
};

const PANEL = {
  background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.025))",
  border: GLASS.border,
  boxShadow: GLASS.boxShadow,
  borderRadius: 24,
};

function useSceneMotion(progress, range, reducedMotion) {
  const [a, b, c, d] = range;
  const timeline = useTransform(progress, [a, b, c, d], [0, 0.34, 0.72, 1]);
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(
    progress,
    [a, b, c, d],
    reducedMotion ? [0, 0, 0, 0] : [34, 0, 0, -24]
  );
  const x = useTransform(
    progress,
    [a, b, c, d],
    reducedMotion ? ["0%", "0%", "0%", "0%"] : ["20%", "0%", "0%", "-18%"]
  );
  const rotateY = useTransform(
    progress,
    [a, b, c, d],
    reducedMotion ? [0, 0, 0, 0] : [15, 0, 0, -15]
  );
  const scale = useTransform(
    progress,
    [a, b, c, d],
    reducedMotion ? [1, 1, 1, 1] : [0.92, 1, 1, 0.9]
  );
  return { timeline, opacity, y, x, rotateY, scale };
}

function CopyStage({ progress, reducedMotion }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: 360,
        display: "flex",
        alignItems: "center",
      }}
    >
      {STORY.map((step, index) => (
        <CopyCard
          key={step.kicker}
          step={step}
          index={index}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}

function CopyCard({ step, index, progress, reducedMotion }) {
  const Icon = step.icon;
  const { opacity, y } = useSceneMotion(progress, STEP_WINDOWS[index], reducedMotion);

  return (
    <motion.article
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        y,
        willChange: "transform, opacity",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        paddingRight: 8,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          width: "fit-content",
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(255,255,255,.045)",
          border: GLASS.border,
          boxShadow: GLASS.boxShadow,
          color: C.sub,
          fontFamily: FB,
          fontSize: 13,
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, rgba(232,145,74,.3), rgba(90,170,255,.16))",
            color: C.text,
          }}
        >
          <Icon size={16} />
        </span>
        {step.kicker}
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: F,
            color: C.text,
            fontSize: "clamp(2.25rem, 3.4vw, 4.5rem)",
            lineHeight: 0.94,
            letterSpacing: "-0.04em",
            maxWidth: 620,
          }}
        >
          {step.title}
        </h2>

        <p
          style={{
            margin: 0,
            color: "rgba(237,232,223,.78)",
            fontFamily: FB,
            fontSize: "clamp(1.02rem, 1.3vw, 1.26rem)",
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          {step.subtitle}
        </p>

        <p
          style={{
            margin: 0,
            color: C.sub,
            fontFamily: FB,
            fontSize: 15,
            lineHeight: 1.85,
            maxWidth: 560,
          }}
        >
          {step.body}
        </p>
      </div>
    </motion.article>
  );
}

function SideRail() {
  return (
    <aside
      className="landing-showcase-rail"
      style={{
        width: 108,
        padding: "18px 14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderRight: "1px solid rgba(255,255,255,.05)",
        background: "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012))",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          color: C.text,
          background: "linear-gradient(135deg, rgba(232,145,74,.24), rgba(84,180,255,.14))",
          boxShadow: "0 0 0 1px rgba(255,255,255,.06) inset",
        }}
      >
        <Package size={17} />
      </div>

      {APP_TABS.map((tab, index) => (
        <div
          key={tab}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            background: index === 1 ? "rgba(255,255,255,.08)" : "transparent",
            color: index === 1 ? C.text : C.sub,
            fontFamily: FB,
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          {tab}
        </div>
      ))}
    </aside>
  );
}

function StageFrame({ progress, reducedMotion }) {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        background:
          "radial-gradient(circle at 18% 12%, rgba(232,145,74,.08), transparent 40%), radial-gradient(circle at 84% 24%, rgba(77,164,255,.08), transparent 36%), linear-gradient(180deg, rgba(7,7,10,.92), rgba(8,9,12,.98))",
      }}
    >
      <SceneOrder progress={progress} reducedMotion={reducedMotion} />
      <SceneStock progress={progress} reducedMotion={reducedMotion} />
      <SceneProduction progress={progress} reducedMotion={reducedMotion} />
      <SceneShipment progress={progress} reducedMotion={reducedMotion} />
    </div>
  );
}

function SceneOrder({ progress, reducedMotion }) {
  const { timeline, opacity, y, x, rotateY, scale } = useSceneMotion(
    progress,
    STEP_WINDOWS[0],
    reducedMotion
  );
  const focusScale = useTransform(
    timeline,
    [0, 0.18, 0.36, 0.6, 1],
    reducedMotion ? [1, 1, 1, 1, 1] : [1, 1.05, 1.22, 1.06, 0.98]
  );
  const focusX = useTransform(
    timeline,
    [0, 0.2, 0.36, 0.62, 1],
    reducedMotion ? [0, 0, 0, 0, 0] : [0, 12, 36, 10, -16]
  );
  const focusY = useTransform(
    timeline,
    [0, 0.2, 0.36, 0.62, 1],
    reducedMotion ? [0, 0, 0, 0, 0] : [0, -4, -28, -10, -6]
  );
  const overlayOpacity = useTransform(timeline, [0, 0.25, 0.42, 0.68, 1], [0, 0, 0.9, 0.18, 0]);
  const modalOpacity = useTransform(timeline, [0, 0.22, 0.36, 0.72, 1], [0, 0, 1, 1, 0]);
  const modalScale = useTransform(
    timeline,
    [0, 0.26, 0.42, 0.72, 1],
    reducedMotion ? [1, 1, 1, 1, 1] : [0.92, 0.92, 1, 1, 0.98]
  );
  const modalY = useTransform(timeline, [0, 0.24, 0.42, 1], [28, 28, 0, -10]);
  const savedOpacity = useTransform(timeline, [0, 0.54, 0.7, 1], [0, 0, 1, 1]);
  const rowGlowOpacity = useTransform(timeline, [0, 0.5, 0.68, 1], [0.25, 0.25, 1, 0.9]);

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        x,
        y,
        rotateY,
        scale,
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
        padding: 26,
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          ...PANEL,
          height: "100%",
          overflow: "hidden",
          padding: 24,
          position: "relative",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02)), linear-gradient(135deg, rgba(232,145,74,.04), transparent 34%)",
        }}
      >
        <motion.div
          style={{
            display: "grid",
            gap: 18,
            height: "100%",
            scale: focusScale,
            x: focusX,
            y: focusY,
            transformOrigin: "82% 15%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  color: C.text,
                  fontFamily: F,
                  fontSize: 24,
                  letterSpacing: "-0.03em",
                }}
              >
                Gelen Siparisler
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, marginTop: 6 }}>
                Karaca Mobilya siparisi kayda alinip otomatik is akisini baslatir.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  color: C.sub,
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.03)",
                  fontFamily: FB,
                  fontSize: 12,
                }}
              >
                Filtreler
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  color: C.bg,
                  background: "linear-gradient(135deg, #F2B26C, #E8914A)",
                  fontFamily: FB,
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: "0 20px 48px rgba(232,145,74,.32)",
                }}
              >
                <Plus size={16} />
                Siparis Ekle
              </div>
            </div>
          </div>

          <div
            className="landing-scene-order-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr .78fr",
              gap: 18,
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ ...PANEL, padding: 18, display: "grid", gap: 10, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.15fr 1.05fr .55fr .6fr",
                  padding: "0 12px 10px",
                  color: C.muted,
                  fontFamily: FB,
                  fontSize: 11,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                <span>Siparis no</span>
                <span>Musteri</span>
                <span>Termin</span>
                <span>Durum</span>
              </div>

              {ORDER_ROWS.map((row) => (
                <div
                  key={row.no}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "1.15fr 1.05fr .55fr .6fr",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 12px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,.05)",
                    background:
                      row.no === "SP-2026-041"
                        ? "linear-gradient(135deg, rgba(232,145,74,.14), rgba(61,184,138,.08))"
                        : "rgba(255,255,255,.025)",
                  }}
                >
                  {row.no === "SP-2026-041" && (
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 16,
                        opacity: rowGlowOpacity,
                        boxShadow: "inset 0 0 0 1px rgba(232,145,74,.35), 0 0 32px rgba(232,145,74,.12)",
                      }}
                    />
                  )}

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ color: C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>{row.no}</div>
                    <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 6 }}>
                      {row.no === "SP-2026-041"
                        ? "Atlas Sandalye x24 / Atlas Masa x6 / Karsilama Bankosu x1"
                        : "Urun kirilimi hazir"}
                    </div>
                  </div>
                  <div style={{ position: "relative", zIndex: 1, color: C.text, fontFamily: FB, fontSize: 13 }}>
                    {row.customer}
                  </div>
                  <div style={{ position: "relative", zIndex: 1, color: C.sub, fontFamily: FB, fontSize: 13 }}>
                    {row.due}
                  </div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "7px 10px",
                        borderRadius: 999,
                        color: row.state === "Acil" ? "#FFD9B6" : C.text,
                        background:
                          row.state === "Acil"
                            ? "rgba(220,60,60,.22)"
                            : row.state === "Onaylandi"
                              ? "rgba(61,184,138,.18)"
                              : "rgba(255,255,255,.07)",
                        fontFamily: FB,
                        fontSize: 12,
                      }}
                    >
                      {row.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 14 }}>
              <div style={{ ...PANEL, padding: 18, display: "grid", gap: 10 }}>
                <div style={{ color: C.muted, fontSize: 11, fontFamily: FB, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  Aktif siparis
                </div>
                <div style={{ color: C.text, fontFamily: F, fontSize: 20, letterSpacing: "-0.03em" }}>
                  SP-2026-041
                </div>
                <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, lineHeight: 1.6 }}>
                  Karaca Mobilya / Ankara Armada Subesi / Termin 12 Nisan 2026
                </div>
              </div>

              <div style={{ ...PANEL, padding: 18, display: "grid", alignContent: "start", gap: 10 }}>
                <div style={{ color: C.muted, fontSize: 11, fontFamily: FB, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  Siparis kirilimi
                </div>
                {[
                  "24 Atlas Sandalye",
                  "6 Atlas Masa 140 cm",
                  "1 Karsilama Bankosu 220 cm",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,.03)",
                      color: C.text,
                      fontFamily: FB,
                      fontSize: 13,
                    }}
                  >
                    <span>{item}</span>
                    <ArrowRight size={14} color={C.sub} />
                  </div>
                ))}
              </div>

              <motion.div
                style={{
                  ...PANEL,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: savedOpacity,
                }}
              >
                <CheckCircle2 size={18} color="#82D9B2" />
                <div>
                  <div style={{ color: C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>
                    Siparis kaydedildi
                  </div>
                  <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 4 }}>
                    Termin, teslim noktasi ve urun agaci olusturuldu.
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            background: "rgba(1,2,5,.78)",
            opacity: overlayOpacity,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        />

        <motion.div
          className="landing-scene-order-modal"
          style={{
            ...PANEL,
            position: "absolute",
            top: "16%",
            right: "6%",
            width: "42%",
            minWidth: 310,
            padding: 22,
            opacity: modalOpacity,
            scale: modalScale,
            y: modalY,
            willChange: "transform, opacity",
            background:
              "linear-gradient(180deg, rgba(14,15,20,.96), rgba(11,12,16,.98)), radial-gradient(circle at top right, rgba(232,145,74,.12), transparent 32%)",
            boxShadow: "0 42px 90px rgba(0,0,0,.58), 0 0 0 1px rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 20, letterSpacing: "-0.03em" }}>
                Yeni siparis
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 6 }}>
                Musteri, termin ve teslim noktasi tek akista olusturulur.
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: "rgba(232,145,74,.12)",
                color: "#F2B26C",
              }}
            >
              <Plus size={18} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Musteri", value: "Karaca Mobilya" },
              { label: "Teslim noktasi", value: "Ankara Armada Subesi" },
              { label: "Termin", value: "12 Nisan 2026" },
              { label: "Proje", value: "Bahar Koleksiyonu Magaza Acilisi" },
            ].map((field) => (
              <div
                key={field.label}
                style={{
                  padding: "13px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.03)",
                }}
              >
                <div style={{ color: C.muted, fontSize: 11, fontFamily: FB, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  {field.label}
                </div>
                <div style={{ color: C.text, fontFamily: FB, fontSize: 13, marginTop: 8 }}>{field.value}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ color: C.sub, fontFamily: FB, fontSize: 12 }}>
              31 kalem alt parca ve operasyon zinciri hazirlanacak
            </div>
            <div
              style={{
                padding: "12px 15px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: C.bg,
                background: "linear-gradient(135deg, #F2B26C, #E8914A)",
                fontFamily: FB,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Kaydet ve olustur
              <ArrowRight size={15} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function SceneStock({ progress, reducedMotion }) {
  const { timeline, opacity, y, x, rotateY, scale } = useSceneMotion(
    progress,
    STEP_WINDOWS[1],
    reducedMotion
  );
  const summaryX = useTransform(
    timeline,
    [0, 0.26, 0.74, 1],
    reducedMotion ? [0, 0, 0, 0] : [-16, 0, 0, -12]
  );
  const boardX = useTransform(
    timeline,
    [0, 0.22, 0.7, 1],
    reducedMotion ? [0, 0, 0, 0] : [24, 0, 0, -20]
  );
  const actionY = useTransform(
    timeline,
    [0, 0.3, 0.62, 1],
    reducedMotion ? [0, 0, 0, 0] : [20, 0, 0, -8]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        x,
        y,
        rotateY,
        scale,
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
        padding: 26,
        pointerEvents: "none",
      }}
    >
      <div
        className="landing-scene-stock-grid"
        style={{
          ...PANEL,
          height: "100%",
          padding: 24,
          display: "grid",
          gridTemplateColumns: ".9fr 1.15fr",
          gap: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.018)), radial-gradient(circle at top right, rgba(220,60,60,.08), transparent 28%)",
        }}
      >
        <motion.div style={{ display: "grid", gap: 14, x: summaryX }}>
          <div style={{ ...PANEL, padding: 18, display: "grid", gap: 12 }}>
            <div style={{ color: C.muted, fontFamily: FB, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Siparis baglam
            </div>
            <div style={{ color: C.text, fontFamily: F, fontSize: 22, letterSpacing: "-0.03em" }}>
              SP-2026-041
            </div>
            <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, lineHeight: 1.6 }}>
              24 Atlas Sandalye, 6 Atlas Masa ve 1 Karsilama Bankosu icin ihtiyac cikariliyor.
            </div>
          </div>

          {[
            { label: "Stokta hazir", value: "14 kalem", tone: "rgba(61,184,138,.12)", color: "#9BE5C2" },
            { label: "Kritik eksik", value: "4 kalem", tone: "rgba(220,60,60,.16)", color: "#FFC5C5" },
            { label: "Tedarik suresi", value: "2-4 gun", tone: "rgba(255,255,255,.06)", color: C.text },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                ...PANEL,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                background: item.tone,
              }}
            >
              <span style={{ color: C.sub, fontFamily: FB, fontSize: 13 }}>{item.label}</span>
              <span style={{ color: item.color, fontFamily: F, fontSize: 19 }}>{item.value}</span>
            </div>
          ))}

          <motion.div
            style={{
              ...PANEL,
              padding: 16,
              y: actionY,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ color: C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>
                Tedarik emri olustur
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 5 }}>
                Eksikler siparisle bagli tek listede birlesir.
              </div>
            </div>
            <div
              style={{
                padding: "11px 13px",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(232,145,74,.2), rgba(232,145,74,.12))",
                color: "#FFD3A0",
                fontFamily: FB,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Tedarik Et
            </div>
          </motion.div>
        </motion.div>

        <motion.div style={{ ...PANEL, padding: 18, display: "grid", gap: 12, x: boardX }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 24, letterSpacing: "-0.03em" }}>
                Stok Eksik Listesi
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, marginTop: 6 }}>
                BOM ve stok kontrolu ayni siparis baglaminda birlikte okunur.
              </div>
            </div>

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(220,60,60,.14)",
                color: "#FFB2B2",
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>

          {SHORTAGES.map((item) => (
            <div
              className="landing-scene-shortage-row"
              key={item.name}
              style={{
                ...PANEL,
                padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: "1.1fr .55fr .55fr .55fr auto",
                alignItems: "center",
                gap: 10,
                background: "linear-gradient(135deg, rgba(220,60,60,.08), rgba(255,255,255,.02))",
              }}
            >
              <div>
                <div style={{ color: C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 6 }}>{item.note}</div>
              </div>
              <MetricCell label="Stok" value={item.stock} />
              <MetricCell label="Gereken" value={item.need} />
              <MetricCell label="Eksik" value={item.gap} danger />
              <div
                style={{
                  justifySelf: "end",
                  padding: "9px 12px",
                  borderRadius: 12,
                  background: "rgba(232,145,74,.12)",
                  color: "#FFD3A0",
                  fontFamily: FB,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Tedarik Et
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function SceneProduction({ progress, reducedMotion }) {
  const { timeline, opacity, y, x, rotateY, scale } = useSceneMotion(
    progress,
    STEP_WINDOWS[2],
    reducedMotion
  );
  const cardY = useTransform(
    timeline,
    [0, 0.2, 0.72, 1],
    reducedMotion ? [0, 0, 0, 0] : [26, 0, 0, -10]
  );
  const boardScale = useTransform(
    timeline,
    [0, 0.26, 0.7, 1],
    reducedMotion ? [1, 1, 1, 1] : [0.97, 1, 1, 0.96]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        x,
        y,
        rotateY,
        scale,
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
        padding: 26,
        pointerEvents: "none",
      }}
    >
      <div
        className="landing-scene-production-grid"
        style={{
          ...PANEL,
          height: "100%",
          padding: 24,
          display: "grid",
          gridTemplateColumns: ".82fr 1.2fr",
          gap: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.016)), radial-gradient(circle at 14% 18%, rgba(61,184,138,.08), transparent 34%)",
        }}
      >
        <motion.div style={{ display: "grid", gap: 14, y: cardY }}>
          {[
            {
              label: "Uretim emri",
              title: "UE-1782",
              text: "Atlas Sandalye x24 / Hazirlik tamam, kaynak asamasinda.",
            },
            {
              label: "Atolye ritmi",
              title: "5 istasyon",
              text: "Kesim ve kaynak ayni panelde gorunur; fason bekleme ayrica izlenir.",
            },
            {
              label: "Termin baskisi",
              title: "12 Nisan 2026",
              text: "Kaynak ve boya akisi planlandigi icin teslim tarihi korunur.",
            },
          ].map((card) => (
            <div key={card.label} style={{ ...PANEL, padding: 18, display: "grid", gap: 10 }}>
              <div style={{ color: C.muted, fontFamily: FB, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
                {card.label}
              </div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 22, letterSpacing: "-0.03em" }}>{card.title}</div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, lineHeight: 1.65 }}>{card.text}</div>
            </div>
          ))}
        </motion.div>

        <motion.div style={{ ...PANEL, padding: 18, display: "grid", gap: 12, scale: boardScale }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 24, letterSpacing: "-0.03em" }}>
                Uretim Takip
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, marginTop: 6 }}>
                SP-2026-041 icin istasyon bazli ilerleme ve sorumlu dagilimi.
              </div>
            </div>

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(61,184,138,.14)",
                color: "#A3E9C8",
              }}
            >
              <Factory size={18} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 6 }}>
            {STATIONS.map((station) => (
              <StationRow
                key={station.name}
                station={station}
                timeline={timeline}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StationRow({ station, timeline, reducedMotion }) {
  const fill = useTransform(
    timeline,
    [0, 0.24, 0.76, 1],
    reducedMotion
      ? [station.progress, station.progress, station.progress, station.progress]
      : [0, station.progress * 0.62, station.progress, station.progress]
  );

  return (
    <div
      style={{
        ...PANEL,
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>{station.name}</div>
            <div style={{ color: C.sub, fontFamily: FB, fontSize: 12, marginTop: 5 }}>{station.owner}</div>
          </div>
          <div style={{ color: C.sub, fontFamily: FB, fontSize: 12 }}>{station.state}</div>
        </div>

        <div
          style={{
            marginTop: 12,
            height: 10,
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(255,255,255,.06)",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              scaleX: fill,
              transformOrigin: "left center",
              borderRadius: 999,
              background:
                station.progress >= 1
                  ? "linear-gradient(90deg, #69D3A6, #3DB88A)"
                  : "linear-gradient(90deg, #F2B26C, #E8914A)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          alignSelf: "center",
          padding: "8px 10px",
          borderRadius: 12,
          background: "rgba(255,255,255,.05)",
          color: C.text,
          fontFamily: F,
          fontSize: 18,
        }}
      >
        {Math.round(station.progress * 100)}%
      </div>
    </div>
  );
}

function SceneShipment({ progress, reducedMotion }) {
  const { timeline, opacity, y, x, rotateY, scale } = useSceneMotion(
    progress,
    STEP_WINDOWS[3],
    reducedMotion
  );
  const stampScale = useTransform(
    timeline,
    [0, 0.24, 0.5, 0.82, 1],
    reducedMotion ? [1, 1, 1, 1, 1] : [0.82, 0.94, 1.06, 1, 1]
  );
  const stampRotate = useTransform(
    timeline,
    [0, 0.22, 0.48, 0.86, 1],
    reducedMotion ? [0, 0, 0, 0, 0] : [8, 4, 0, -2, 0]
  );
  const lowerY = useTransform(
    timeline,
    [0, 0.28, 0.72, 1],
    reducedMotion ? [0, 0, 0, 0] : [24, 0, 0, -6]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        x,
        y,
        rotateY,
        scale,
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
        padding: 26,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          ...PANEL,
          height: "100%",
          padding: 24,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 16,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.016)), radial-gradient(circle at top right, rgba(61,184,138,.12), transparent 30%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: C.text, fontFamily: F, fontSize: 24, letterSpacing: "-0.03em" }}>
              Sevkiyat ve teslim
            </div>
            <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, marginTop: 6 }}>
              Ayni siparis, irsaliye ve sevk ozetiyle son sahnede kapanir.
            </div>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "rgba(61,184,138,.16)",
              color: "#A3E9C8",
            }}
          >
            <Truck size={18} />
          </div>
        </div>

        <div
          className="landing-scene-shipment-grid"
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 18,
            minHeight: 0,
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...PANEL, padding: 18, display: "grid", gap: 8 }}>
              <div style={{ color: C.muted, fontFamily: FB, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Sevk rotasi
              </div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 22, letterSpacing: "-0.03em" }}>
                Istanbul Atolye → Ankara Armada
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, lineHeight: 1.65 }}>
                4 kolilik sevk ozeti ve montaj sonrasi teslim onayi ayni panelde birlesir.
              </div>
            </div>

            <div style={{ ...PANEL, padding: 18, display: "grid", gap: 10 }}>
              <div style={{ color: C.muted, fontFamily: FB, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Barkod
              </div>
              <div
                style={{
                  height: 88,
                  borderRadius: 16,
                  background:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,.86) 0 3px, transparent 3px 8px)",
                  opacity: 0.82,
                }}
              />
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 12 }}>Barkod: 8690 4126 0041</div>
            </div>
          </div>

          <div
            style={{
              ...PANEL,
              position: "relative",
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 46%, rgba(61,184,138,.16), transparent 38%), radial-gradient(circle at 82% 18%, rgba(232,145,74,.12), transparent 24%)",
              }}
            />
            <motion.div
              style={{
                position: "relative",
                zIndex: 1,
                width: "min(82%, 340px)",
                padding: "26px 22px",
                borderRadius: 28,
                textAlign: "center",
                background: "rgba(9,13,12,.72)",
                border: "1px solid rgba(61,184,138,.22)",
                boxShadow: "0 0 44px rgba(61,184,138,.16), inset 0 0 0 1px rgba(255,255,255,.05)",
                scale: stampScale,
                rotate: stampRotate,
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  margin: "0 auto 18px",
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, rgba(61,184,138,.24), rgba(61,184,138,.1))",
                  color: "#A3E9C8",
                }}
              >
                <CheckCircle2 size={34} />
              </div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 32, letterSpacing: "-0.04em" }}>
                Teslim Edildi
              </div>
              <div style={{ color: C.sub, fontFamily: FB, fontSize: 13, marginTop: 10, lineHeight: 1.7 }}>
                Ankara Armada Subesi teslimi tamamlandi. Montaj, sevk ve onay kapanisi ayni kayitta tutuldu.
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="landing-scene-shipment-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
            y: lowerY,
          }}
        >
          {SHIPMENT_CARDS.map((card) => (
            <div key={card.label} style={{ ...PANEL, padding: 16, display: "grid", gap: 10 }}>
              <div style={{ color: C.muted, fontFamily: FB, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
                {card.label}
              </div>
              <div style={{ color: C.text, fontFamily: F, fontSize: 22, letterSpacing: "-0.03em" }}>
                {card.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value, danger = false }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ color: C.muted, fontFamily: FB, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: danger ? "#FFD0D0" : C.text, fontFamily: FB, fontWeight: 700, fontSize: 13 }}>
        {value}
      </div>
    </div>
  );
}

export default function InteractiveShowcase() {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const sceneLift = useTransform(
    scrollYProgress,
    [0, 0.08, 0.92, 1],
    reducedMotion ? [0, 0, 0, 0] : [42, 0, 0, -18]
  );
  const sceneScale = useTransform(
    scrollYProgress,
    [0, 0.1, 0.94, 1],
    reducedMotion ? [1, 1, 1, 1] : [0.97, 1, 1, 0.985]
  );
  const sceneRotateX = useTransform(
    scrollYProgress,
    [0, 0.12, 0.94, 1],
    reducedMotion ? [0, 0, 0, 0] : [8, 0, 0, -3]
  );
  const auraOpacity = useTransform(scrollYProgress, [0, 0.18, 0.85, 1], [0.45, 0.9, 0.9, 0.45]);

  return (
    <section
      ref={sectionRef}
      className="landing-showcase-section"
      style={{
        position: "relative",
        height: "420vh",
        background:
          "linear-gradient(180deg, rgba(6,6,8,0) 0%, rgba(6,6,8,.25) 6%, rgba(6,6,8,.85) 16%, rgba(6,6,8,.96) 84%, rgba(6,6,8,0) 100%)",
      }}
    >
      <div
        className="landing-showcase-sticky"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "clip",
          display: "grid",
          alignItems: "center",
          padding: "max(64px, 8vh) clamp(20px, 4vw, 56px)",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: "10% 0 0",
            opacity: auraOpacity,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 18% 22%, rgba(232,145,74,.12), transparent 26%), radial-gradient(circle at 78% 26%, rgba(84,180,255,.14), transparent 24%), radial-gradient(circle at 48% 82%, rgba(61,184,138,.1), transparent 28%)",
          }}
        />

        <div
          className="landing-showcase-grid"
          style={{
            position: "relative",
            zIndex: 1,
            width: "min(100%, 1540px)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: ".95fr 1.05fr",
            gap: "clamp(24px, 3vw, 42px)",
            alignItems: "center",
          }}
        >
          <div className="landing-showcase-copy">
            <CopyStage progress={scrollYProgress} reducedMotion={reducedMotion} />
          </div>

          <motion.div
            className="landing-showcase-window"
            style={{
              ...SHELL,
              position: "relative",
              borderRadius: 32,
              overflow: "hidden",
              minHeight: "min(74vh, 760px)",
              backdropFilter: "blur(26px)",
              WebkitBackdropFilter: "blur(26px)",
              background: "rgba(8,9,12,.64)",
              y: sceneLift,
              scale: sceneScale,
              rotateX: sceneRotateX,
              transformPerspective: 1600,
              willChange: "transform",
            }}
          >
            <div
              style={{
                height: 68,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "0 20px 0 18px",
                borderBottom: "1px solid rgba(255,255,255,.05)",
                background: "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
                  <span
                    key={color}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 999,
                      background: color,
                      boxShadow: "0 0 10px rgba(255,255,255,.08)",
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  flex: 1,
                  maxWidth: 320,
                  textAlign: "center",
                  color: C.sub,
                  fontFamily: FB,
                  fontSize: 12,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Atolye OS / Siparisten sevkiyata
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.04)",
                  color: C.sub,
                  fontFamily: FB,
                  fontSize: 12,
                }}
              >
                Product narrative
              </div>
            </div>

            <div className="landing-showcase-window-body" style={{ display: "flex", minHeight: 0, height: "calc(100% - 68px)" }}>
              <SideRail />
              <StageFrame progress={scrollYProgress} reducedMotion={reducedMotion} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
