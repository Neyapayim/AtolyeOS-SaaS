import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { C, F, FB } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════
   AkisHaritasiCanvas — React Flow Gorsel Tuval
   ══════════════════════════════════════════════════════════════════
   Props:
     urun        — aktif urun objesi
     setUrunler  — urunler state setter'i
   ══════════════════════════════════════════════════════════════════ */

// ── Ozel Node Bileseni ──
function IstasyonNode({ id, data }) {
  const isSelected = data._selected;
  const renk = data.renk || C.cyan;

  return (
    <div style={{
      minWidth: 160,
      background: `color-mix(in srgb, ${renk} 8%, transparent)`,
      border: `1px solid ${isSelected ? renk : `color-mix(in srgb, ${renk} 25%, transparent)`}`,
      borderRadius: 14,
      padding: 0,
      fontFamily: FB,
      boxShadow: isSelected
        ? `0 0 20px color-mix(in srgb, ${renk} 20%, transparent), inset 0 1px 0 rgba(255,255,255,.08)`
        : `inset 0 1px 0 rgba(255,255,255,.06)`,
      transition: 'box-shadow .2s, border-color .2s',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Ust dekoratif cizgi */}
      <div style={{
        height: 2,
        borderRadius: '14px 14px 0 0',
        background: `linear-gradient(90deg, ${renk}, transparent)`,
      }} />

      <div style={{ padding: '12px 16px' }}>
        {/* Ikon + Baslik */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{data.ikon || '\u2699\uFE0F'}</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F,
            letterSpacing: '-0.3px',
          }}>
            {data.label}
          </span>
        </div>

        {/* Alt aciklama */}
        {data.aciklama && (
          <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4, marginTop: 2 }}>
            {data.aciklama}
          </div>
        )}

        {/* Tip badge */}
        <div style={{
          display: 'inline-block', marginTop: 6,
          padding: '2px 8px', borderRadius: 6,
          background: `color-mix(in srgb, ${renk} 15%, transparent)`,
          fontSize: 9, fontWeight: 600, color: renk, fontFamily: F,
          letterSpacing: '0.3px',
        }}>
          {data.tip === 'fason' ? 'FASON' : 'IC URETIM'}
        </div>
      </div>

      {/* React Flow Handle'lari */}
      <Handle type="target" position={Position.Left} style={{
        width: 10, height: 10, background: renk,
        border: `2px solid ${C.s2}`, borderRadius: '50%',
      }} />
      <Handle type="source" position={Position.Right} style={{
        width: 10, height: 10, background: renk,
        border: `2px solid ${C.s2}`, borderRadius: '50%',
      }} />
    </div>
  );
}

const nodeTypes = { istasyon: IstasyonNode };

// ── Hazir istasyon sablonlari ──
const SABLON_ISTASYONLAR = [
  { label: 'Kesim',        ikon: '\u2702\uFE0F', tip: 'ic',    renk: C.cyan },
  { label: 'Fason Lazer',  ikon: '\uD83D\uDD25', tip: 'fason', renk: C.lav },
  { label: 'Kaynak',       ikon: '\u26A1',       tip: 'ic',    renk: C.gold },
  { label: 'Boya',         ikon: '\uD83C\uDFA8', tip: 'fason', renk: C.lav },
  { label: 'Montaj',       ikon: '\uD83D\uDD27', tip: 'ic',    renk: C.mint },
  { label: 'Paketleme',    ikon: '\uD83D\uDCE6', tip: 'ic',    renk: C.sky },
  { label: 'Kalite Kontrol', ikon: '\u2705',     tip: 'ic',    renk: C.mint },
  { label: 'CNC',          ikon: '\u2699\uFE0F', tip: 'ic',    renk: C.cyan },
];

let _idCounter = Date.now();
const newId = () => `node_${++_idCounter}`;

export default function AkisHaritasiCanvas({ urun, setUrunler }) {
  const harita = urun?.akisHaritasi || { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState(
    harita.nodes.map(n => ({ ...n, type: 'istasyon' }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(harita.edges || []);

  const [yeniAdOpen, setYeniAdOpen] = useState(false);
  const [yeniAd, setYeniAd] = useState('');
  const [yeniTip, setYeniTip] = useState('ic');
  const reactFlowRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  // ── Kaydet ──
  const kaydet = useCallback((newNodes, newEdges) => {
    if (!urun?.id) return;
    const serialNodes = (newNodes || nodes).map(n => ({
      id: n.id,
      type: 'istasyon',
      position: n.position,
      data: { ...n.data, _selected: undefined },
    }));
    const serialEdges = (newEdges || edges).map(e => ({
      id: e.id, source: e.source, target: e.target,
      ...(e.label ? { label: e.label } : {}),
    }));
    setUrunler(prev => prev.map(u =>
      u.id === urun.id
        ? { ...u, akisHaritasi: { nodes: serialNodes, edges: serialEdges } }
        : u
    ));
  }, [urun?.id, nodes, edges, setUrunler]);

  // ── Edge baglama ──
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge_${params.source}_${params.target}`,
      animated: true,
      style: { stroke: C.cyan, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan, width: 18, height: 18 },
    };
    setEdges(eds => {
      const updated = addEdge(newEdge, eds);
      setTimeout(() => kaydet(undefined, updated), 0);
      return updated;
    });
  }, [kaydet]);

  // ── Node degisikliklerini kaydet (pozisyon vb.) ──
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    const hasDrag = changes.some(c => c.type === 'position' && c.dragging === false);
    if (hasDrag) {
      setTimeout(() => kaydet(), 50);
    }
  }, [onNodesChange, kaydet]);

  // ── Sablon istasyon ekle ──
  const sablondanEkle = useCallback((sablon) => {
    const id = newId();
    const yOffset = nodes.length * 100;
    const node = {
      id,
      type: 'istasyon',
      position: { x: 250, y: 80 + yOffset },
      data: {
        label: sablon.label,
        ikon: sablon.ikon,
        tip: sablon.tip,
        renk: sablon.renk,
      },
    };
    setNodes(nds => {
      const updated = [...nds, node];
      setTimeout(() => kaydet(updated), 0);
      return updated;
    });
  }, [nodes.length, kaydet]);

  // ── Ozel isimle istasyon ekle ──
  const ozelEkle = useCallback(() => {
    if (!yeniAd.trim()) return;
    const id = newId();
    const yOffset = nodes.length * 100;
    const renk = yeniTip === 'fason' ? C.lav : C.cyan;
    const node = {
      id,
      type: 'istasyon',
      position: { x: 250, y: 80 + yOffset },
      data: {
        label: yeniAd.trim(),
        ikon: yeniTip === 'fason' ? '\uD83C\uDFED' : '\u2699\uFE0F',
        tip: yeniTip,
        renk,
      },
    };
    setNodes(nds => {
      const updated = [...nds, node];
      setTimeout(() => kaydet(updated), 0);
      return updated;
    });
    setYeniAd('');
    setYeniAdOpen(false);
  }, [yeniAd, yeniTip, nodes.length, kaydet]);

  // ── Node sil (Delete tusuna basinca) ──
  const onNodesDelete = useCallback((deleted) => {
    const deletedIds = new Set(deleted.map(n => n.id));
    setEdges(eds => {
      const updated = eds.filter(e => !deletedIds.has(e.source) && !deletedIds.has(e.target));
      setTimeout(() => kaydet(undefined, updated), 0);
      return updated;
    });
    setTimeout(() => kaydet(), 100);
  }, [kaydet]);

  // ── Edge sil ──
  const onEdgesDelete = useCallback(() => {
    setTimeout(() => kaydet(), 50);
  }, [kaydet]);

  // ── Tum tuvali temizle ──
  const tumuTemizle = useCallback(() => {
    setNodes([]);
    setEdges([]);
    if (urun?.id) {
      setUrunler(prev => prev.map(u =>
        u.id === urun.id
          ? { ...u, akisHaritasi: { nodes: [], edges: [] } }
          : u
      ));
    }
  }, [urun?.id, setUrunler]);

  // ── Reactive renk (tema uyumlu) ──
  const isDark = C.bg.startsWith('#0') || C.bg.startsWith('#1');
  const bgColor = isDark ? '#0A0A10' : '#F0F2F5';
  const gridColor = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
  const miniMapBg = isDark ? '#111118' : '#E5E8ED';

  return (
    <div style={{
      background: `color-mix(in srgb, ${C.bg} 90%, transparent)`,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 18px',
        borderBottom: `1px solid ${C.border}`,
        background: `color-mix(in srgb, ${C.s2} 50%, transparent)`,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
      }}>
        {/* Baslik */}
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>{'\uD83D\uDDFA\uFE0F'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.5px' }}>
              Uretim Akis Haritasi
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>
              {urun?.ad} — dugum ekle, fareyle bagla, surukle birak
            </div>
          </div>
        </div>

        {/* Sablon butonlari */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {SABLON_ISTASYONLAR.map(s => (
            <button key={s.label} onClick={() => sablondanEkle(s)}
              title={`${s.label} ekle`}
              style={{
                padding: '5px 10px', borderRadius: 8,
                background: `color-mix(in srgb, ${s.renk} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${s.renk} 20%, transparent)`,
                color: s.renk, fontSize: 10, fontWeight: 600, fontFamily: FB,
                cursor: 'pointer', transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `color-mix(in srgb, ${s.renk} 20%, transparent)`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${s.renk} 40%, transparent)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `color-mix(in srgb, ${s.renk} 10%, transparent)`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${s.renk} 20%, transparent)`;
              }}
            >
              <span>{s.ikon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Ozel istasyon ekle */}
        {yeniAdOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              autoFocus
              value={yeniAd}
              onChange={e => setYeniAd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ozelEkle()}
              placeholder="Istasyon adi..."
              style={{
                padding: '5px 10px', borderRadius: 8,
                background: C.s3, border: `1px solid ${C.borderHi}`,
                color: C.text, fontSize: 11, fontFamily: FB,
                outline: 'none', width: 140,
              }}
            />
            <select value={yeniTip} onChange={e => setYeniTip(e.target.value)}
              style={{
                padding: '5px 6px', borderRadius: 8,
                background: C.s3, border: `1px solid ${C.borderHi}`,
                color: C.text, fontSize: 10, fontFamily: FB,
                outline: 'none', cursor: 'pointer',
              }}>
              <option value="ic">Ic</option>
              <option value="fason">Fason</option>
            </select>
            <button onClick={ozelEkle} style={{
              padding: '5px 10px', borderRadius: 8,
              background: `color-mix(in srgb, ${C.mint} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.mint} 30%, transparent)`,
              color: C.mint, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
            }}>Ekle</button>
            <button onClick={() => { setYeniAdOpen(false); setYeniAd(''); }} style={{
              padding: '5px 8px', borderRadius: 8,
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.muted, fontSize: 10, cursor: 'pointer', fontFamily: FB,
            }}>X</button>
          </div>
        ) : (
          <button onClick={() => setYeniAdOpen(true)} style={{
            padding: '5px 12px', borderRadius: 8,
            background: `color-mix(in srgb, ${C.mint} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${C.mint} 25%, transparent)`,
            color: C.mint, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            + Ozel Istasyon
          </button>
        )}

        {/* Temizle butonu */}
        {nodes.length > 0 && (
          <button onClick={tumuTemizle} style={{
            padding: '5px 10px', borderRadius: 8,
            background: `color-mix(in srgb, ${C.coral} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${C.coral} 20%, transparent)`,
            color: C.coral, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
          }}>
            Tuvali Temizle
          </button>
        )}
      </div>

      {/* ── React Flow Tuval ── */}
      <div ref={reactFlowRef} style={{ width: '100%', height: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges.map(e => ({
            ...e,
            animated: true,
            style: { stroke: C.cyan, strokeWidth: 2, ...(e.style || {}) },
            markerEnd: e.markerEnd || {
              type: MarkerType.ArrowClosed,
              color: C.cyan,
              width: 18,
              height: 18,
            },
          }))}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
          style={{
            background: bgColor,
            borderRadius: '0 0 16px 16px',
          }}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: C.cyan, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan },
          }}
        >
          <Background
            variant="dots"
            gap={20}
            size={1}
            color={gridColor}
          />
          <Controls
            style={{
              background: isDark ? C.s3 : '#fff',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,.3)',
            }}
            showInteractive={false}
          />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(n) => n.data?.renk || C.cyan}
            maskColor={isDark ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.7)'}
            style={{
              background: miniMapBg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
            }}
          />
        </ReactFlow>
      </div>

      {/* ── Bilgi satiri ── */}
      <div style={{
        padding: '8px 18px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: `color-mix(in srgb, ${C.s2} 50%, transparent)`,
        fontSize: 10, color: C.muted, fontFamily: FB,
      }}>
        <span>{nodes.length} dugum, {edges.length} baglanti</span>
        <span>Dugumu sec + Delete = sil | Handle'dan surukle = bagla</span>
      </div>
    </div>
  );
}
