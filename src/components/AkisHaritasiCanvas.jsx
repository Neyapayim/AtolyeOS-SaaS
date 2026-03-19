import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { C, F, FB } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════
   FAZ 6.2 — BOM-Driven Flow Canvas
   ══════════════════════════════════════════════════════════════════ */

// ── Yesil onay animasyonu icin CSS inject ──
const GLOW_CSS_ID = 'akis-glow-css';
if (typeof document !== 'undefined' && !document.getElementById(GLOW_CSS_ID)) {
  const style = document.createElement('style');
  style.id = GLOW_CSS_ID;
  style.textContent = `
    @keyframes akisGlowPulse {
      0%   { box-shadow: 0 0 0px rgba(61,184,138,0), inset 0 1px 0 rgba(255,255,255,.06); }
      30%  { box-shadow: 0 0 24px rgba(61,184,138,.45), 0 0 48px rgba(61,184,138,.15), inset 0 1px 0 rgba(255,255,255,.12); }
      100% { box-shadow: 0 0 0px rgba(61,184,138,0), inset 0 1px 0 rgba(255,255,255,.06); }
    }
    .akis-node-validated {
      animation: akisGlowPulse .9s ease-out;
      border-color: #3DB88A !important;
    }
    .akis-node-validated .akis-top-bar {
      background: linear-gradient(90deg, #3DB88A, transparent) !important;
    }
    @keyframes akisEdgeGlow {
      0%   { filter: drop-shadow(0 0 0px rgba(61,184,138,0)); }
      30%  { filter: drop-shadow(0 0 8px rgba(61,184,138,.6)); }
      100% { filter: drop-shadow(0 0 0px rgba(61,184,138,0)); }
    }
    .react-flow__edge.akis-edge-validated path {
      stroke: #3DB88A !important;
      animation: akisEdgeGlow .9s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// ── Nakliye secenekleri ──
const NAKLIYE_SECENEKLERI = [
  { id: 'firma_getirir', label: 'Firma Getirir', ikon: '\uD83C\uDFED' },
  { id: 'kargo',         label: 'Kargo',          ikon: '\uD83D\uDCE6' },
  { id: 'bizim_arac',    label: 'Bizim Arac',     ikon: '\uD83D\uDE9A' },
  { id: 'kurye',         label: 'Kurye',           ikon: '\uD83D\uDEB4' },
  { id: 'musteri_alir',  label: 'Musteri Alir',   ikon: '\uD83E\uDD1D' },
];

// ── BOM tipine gore ikon ve renk ──
const BOM_TIP_META = {
  hammadde:    { ikon: '\uD83E\uDDF1', label: 'Ham Madde', renk: C.sky },
  yarimamul:   { ikon: '\uD83D\uDCE6', label: 'Yari Mamul', renk: C.cyan },
  hizmet_ic:   { ikon: '\uD83D\uDC64', label: 'Ic Iscilik', renk: C.gold },
  hizmet_fason:{ ikon: '\uD83C\uDFED', label: 'Fason',      renk: C.lav },
};

let _idC = Date.now();
const nid = () => `n_${++_idC}`;

/* ═══════════════════════════════════════════════════════════
   CUSTOM NODE: BomNode (HM, Hizmet, Fason)
   ═══════════════════════════════════════════════════════════ */
function BomNode({ id, data }) {
  const renk = data.renk || C.cyan;
  const isFason = data.bomTip === 'hizmet_fason';
  const validated = data._validated;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={validated ? 'akis-node-validated' : ''}
      style={{
        minWidth: 170, maxWidth: 220,
        background: validated
          ? `color-mix(in srgb, ${C.mint} 10%, ${C.s2})`
          : `color-mix(in srgb, ${renk} 6%, ${C.s2})`,
        border: `1px solid ${validated ? C.mint : `color-mix(in srgb, ${renk} 22%, transparent)`}`,
        borderRadius: 14,
        fontFamily: FB,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.06)`,
        transition: 'border-color .3s, background .3s, box-shadow .3s',
        position: 'relative',
      }}
    >
      <div className="akis-top-bar" style={{
        height: 2, borderRadius: '14px 14px 0 0',
        background: `linear-gradient(90deg, ${renk}, transparent)`,
        transition: 'background .3s',
      }} />

      <div style={{ padding: '10px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>{data.ikon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: C.text, fontFamily: F,
              letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {data.label}
            </div>
            {data.miktar && (
              <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>
                {data.miktar} {data.birim || ''}
              </div>
            )}
          </div>
          {validated && (
            <span style={{
              fontSize: 11, color: C.mint, fontWeight: 800, flexShrink: 0,
              textShadow: `0 0 8px color-mix(in srgb, ${C.mint} 40%, transparent)`,
            }}>{'\u2713'}</span>
          )}
        </div>

        {/* Tip badge */}
        <div style={{
          display: 'inline-block', marginTop: 5,
          padding: '2px 7px', borderRadius: 5,
          background: `color-mix(in srgb, ${renk} 14%, transparent)`,
          fontSize: 8, fontWeight: 600, color: renk, fontFamily: F,
          letterSpacing: '0.4px', textTransform: 'uppercase',
        }}>
          {BOM_TIP_META[data.bomTip]?.label || data.bomTip}
        </div>

        {/* Fason nakliye */}
        {isFason && (
          <div style={{ marginTop: 6 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                background: data.nakliye
                  ? `color-mix(in srgb, ${C.lav} 15%, transparent)`
                  : `color-mix(in srgb, ${C.muted} 10%, transparent)`,
                border: `1px solid ${data.nakliye ? `color-mix(in srgb, ${C.lav} 30%, transparent)` : C.border}`,
                color: data.nakliye ? C.lav : C.muted,
                cursor: 'pointer', fontFamily: FB, width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span>{data.nakliye ? NAKLIYE_SECENEKLERI.find(n => n.id === data.nakliye)?.ikon || '\uD83D\uDE9A' : '\uD83D\uDE9A'}</span>
              <span>{data.nakliye ? NAKLIYE_SECENEKLERI.find(n => n.id === data.nakliye)?.label || 'Sec' : 'Nakliye Sec...'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 7 }}>{menuOpen ? '\u25B4' : '\u25BE'}</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', left: 10, right: 10, top: '100%', marginTop: 4,
                background: C.s3, border: `1px solid ${C.borderHi}`, borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,.5)', zIndex: 50,
                overflow: 'hidden',
              }}>
                {NAKLIYE_SECENEKLERI.map(n => (
                  <button key={n.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      data._onNakliyeSec?.(id, n.id);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 12px', width: '100%', border: 'none',
                      background: data.nakliye === n.id ? `color-mix(in srgb, ${C.lav} 15%, transparent)` : 'transparent',
                      color: data.nakliye === n.id ? C.lav : C.text,
                      fontSize: 10, fontWeight: data.nakliye === n.id ? 700 : 400,
                      cursor: 'pointer', fontFamily: FB,
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${C.lav} 10%, transparent)`}
                    onMouseLeave={e => e.currentTarget.style.background = data.nakliye === n.id ? `color-mix(in srgb, ${C.lav} 15%, transparent)` : 'transparent'}
                  >
                    <span>{n.ikon}</span>
                    <span>{n.label}</span>
                    {data.nakliye === n.id && <span style={{ marginLeft: 'auto', color: C.mint }}>{'\u2713'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left}
        style={{ width: 9, height: 9, background: renk, border: `2px solid ${C.s2}`, borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right}
        style={{ width: 9, height: 9, background: renk, border: `2px solid ${C.s2}`, borderRadius: '50%' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM NODE: YmGroupNode (Yari Mamul Kapsayici)
   ═══════════════════════════════════════════════════════════ */
function YmGroupNode({ data }) {
  const renk = data.renk || C.cyan;
  const validated = data._validated;

  return (
    <div
      className={validated ? 'akis-node-validated' : ''}
      style={{
        width: '100%', height: '100%',
        minWidth: 280, minHeight: 180,
        background: validated
          ? `color-mix(in srgb, ${C.mint} 4%, ${C.s1})`
          : `color-mix(in srgb, ${renk} 3%, ${C.s1})`,
        border: `1.5px dashed ${validated ? C.mint : `color-mix(in srgb, ${renk} 30%, transparent)`}`,
        borderRadius: 18,
        fontFamily: FB,
        transition: 'border-color .3s, background .3s, box-shadow .3s',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.04)`,
      }}
    >
      {/* Baslik cubugu */}
      <div style={{
        padding: '10px 16px',
        borderBottom: `1px solid color-mix(in srgb, ${renk} 12%, transparent)`,
        display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: '18px 18px 0 0',
        background: `color-mix(in srgb, ${renk} 5%, transparent)`,
      }}>
        <span style={{ fontSize: 15 }}>{data.ikon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: renk, fontFamily: F,
            letterSpacing: '-0.3px',
          }}>
            {data.label}
          </div>
          <div style={{ fontSize: 8, color: C.muted, marginTop: 1, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            YARI MAMUL GRUBU
            {data.miktar ? ` \u00B7 ${data.miktar} ${data.birim || ''}` : ''}
          </div>
        </div>
        {validated && (
          <span style={{
            fontSize: 13, color: C.mint, fontWeight: 800,
            textShadow: `0 0 10px color-mix(in srgb, ${C.mint} 50%, transparent)`,
          }}>{'\u2713'}</span>
        )}
      </div>

      {/* Ic alan — cocuk node'lar buraya duser */}
      <div style={{
        padding: 12, minHeight: 100,
        fontSize: 9, color: `color-mix(in srgb, ${C.muted} 60%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {(!data._hasChildren) && 'Malzemeleri buraya suruklein'}
      </div>

      <Handle type="target" position={Position.Left}
        style={{ width: 11, height: 11, background: renk, border: `2px solid ${C.s1}`, borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right}
        style={{ width: 11, height: 11, background: renk, border: `2px solid ${C.s1}`, borderRadius: '50%' }} />
    </div>
  );
}

const nodeTypes = { bomNode: BomNode, ymGroup: YmGroupNode };

/* ═══════════════════════════════════════════════════════════
   INNER FLOW (ReactFlow icinde useReactFlow kullanir)
   ═══════════════════════════════════════════════════════════ */
function InnerFlow({ urun, setUrunler, bomPalette }) {
  const harita = urun?.akisHaritasi || { nodes: [], edges: [] };
  const { screenToFlowPosition } = useReactFlow();

  // ── State ──
  const [nodes, setNodes, onNodesChange] = useNodesState(
    harita.nodes.map(n => ({
      ...n,
      type: n.type || 'bomNode',
      ...(n.data?.isYmGroup ? { style: { width: n.style?.width || 320, height: n.style?.height || 220 } } : {}),
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(harita.edges || []);
  const [validatedNodes, setValidatedNodes] = useState(new Set());
  const [validatedEdges, setValidatedEdges] = useState(new Set());
  const wrapperRef = useRef(null);

  // ── Kaydet ──
  const kaydet = useCallback((nds, eds) => {
    if (!urun?.id) return;
    const finalNodes = nds || nodes;
    const finalEdges = eds || edges;
    const serialNodes = finalNodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      ...(n.parentId ? { parentId: n.parentId } : {}),
      ...(n.extent ? { extent: n.extent } : {}),
      ...(n.style ? { style: { width: n.style.width, height: n.style.height } } : {}),
      data: {
        ...n.data,
        _validated: undefined,
        _hasChildren: undefined,
        _onNakliyeSec: undefined,
      },
    }));
    const serialEdges = finalEdges.map(e => ({
      id: e.id, source: e.source, target: e.target,
      ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
      ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
    }));
    setUrunler(prev => prev.map(u =>
      u.id === urun.id
        ? { ...u, akisHaritasi: { nodes: serialNodes, edges: serialEdges } }
        : u
    ));
  }, [urun?.id, nodes, edges, setUrunler]);

  // ── Nakliye secimi handler ──
  const onNakliyeSec = useCallback((nodeId, nakliyeId) => {
    setNodes(nds => {
      const updated = nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, nakliye: nakliyeId } } : n
      );
      setTimeout(() => kaydet(updated), 0);
      return updated;
    });
  }, [kaydet]);

  // ── Node'lara callback inject et ──
  const nodesWithCallbacks = useMemo(() => {
    const childParentMap = {};
    nodes.forEach(n => { if (n.parentId) childParentMap[n.parentId] = true; });

    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        _validated: validatedNodes.has(n.id),
        _onNakliyeSec: onNakliyeSec,
        _hasChildren: !!childParentMap[n.id],
      },
    }));
  }, [nodes, validatedNodes, onNakliyeSec]);

  // ── Edge'lere validation class ekle ──
  const edgesStyled = useMemo(() =>
    edges.map(e => {
      const isVal = validatedEdges.has(e.id);
      const renk = isVal ? C.mint : C.cyan;
      return {
        ...e,
        className: isVal ? 'akis-edge-validated' : '',
        animated: true,
        style: { stroke: renk, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: renk, width: 16, height: 16 },
      };
    }),
    [edges, validatedEdges]
  );

  // ── Yesil onay tetikle ──
  const triggerValidation = useCallback((nodeIds, edgeId) => {
    setValidatedNodes(prev => {
      const next = new Set(prev);
      nodeIds.forEach(id => next.add(id));
      return next;
    });
    if (edgeId) {
      setValidatedEdges(prev => new Set(prev).add(edgeId));
    }
    setTimeout(() => {
      setValidatedNodes(prev => {
        const next = new Set(prev);
        nodeIds.forEach(id => next.delete(id));
        return next;
      });
      if (edgeId) {
        setValidatedEdges(prev => {
          const next = new Set(prev);
          next.delete(edgeId);
          return next;
        });
      }
    }, 1200);
  }, []);

  // ── Edge baglama ──
  const onConnect = useCallback((params) => {
    const edgeId = `e_${params.source}_${params.target}`;
    const newEdge = {
      ...params,
      id: edgeId,
      animated: true,
      style: { stroke: C.cyan, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan, width: 16, height: 16 },
    };
    setEdges(eds => {
      const updated = addEdge(newEdge, eds);
      setTimeout(() => kaydet(undefined, updated), 0);
      return updated;
    });
    triggerValidation([params.source, params.target], edgeId);
  }, [kaydet, triggerValidation]);

  // ── Node degisiklikleri ──
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    const hasDragEnd = changes.some(c => c.type === 'position' && c.dragging === false);
    if (hasDragEnd) setTimeout(() => kaydet(), 50);
  }, [onNodesChange, kaydet]);

  // ── Node sil ──
  const onNodesDelete = useCallback((deleted) => {
    const ids = new Set(deleted.map(n => n.id));
    setNodes(nds => nds.filter(n => !ids.has(n.parentId)));
    setEdges(eds => {
      const updated = eds.filter(e => !ids.has(e.source) && !ids.has(e.target));
      setTimeout(() => kaydet(undefined, updated), 0);
      return updated;
    });
    setTimeout(() => kaydet(), 100);
  }, [kaydet]);

  // ── Edge sil ──
  const onEdgesDelete = useCallback(() => {
    setTimeout(() => kaydet(), 50);
  }, [kaydet]);

  // ── Drag & Drop: Paletten tuvale ──
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/akis-bom');
    if (!raw) return;

    const bomItem = JSON.parse(raw);
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = nid();

    const isYm = bomItem.bomTip === 'yarimamul';

    if (isYm) {
      // Yari mamul = group node
      const node = {
        id,
        type: 'ymGroup',
        position: pos,
        style: { width: 320, height: 220 },
        data: {
          ...bomItem,
          isYmGroup: true,
        },
      };
      setNodes(nds => {
        const updated = [...nds, node];
        setTimeout(() => kaydet(updated), 0);
        return updated;
      });
    } else {
      // HM / Hizmet / Fason = normal node
      // Kontrol: droplanilan yer bir YM grubunun icinde mi?
      let parentId = null;
      const ymGroups = nodes.filter(n => n.type === 'ymGroup');
      for (const g of ymGroups) {
        const gx = g.position.x;
        const gy = g.position.y;
        const gw = g.style?.width || 320;
        const gh = g.style?.height || 220;
        if (pos.x >= gx && pos.x <= gx + gw && pos.y >= gy && pos.y <= gy + gh) {
          parentId = g.id;
          break;
        }
      }

      const node = {
        id,
        type: 'bomNode',
        position: parentId
          ? { x: pos.x - (nodes.find(n => n.id === parentId)?.position.x || 0), y: pos.y - (nodes.find(n => n.id === parentId)?.position.y || 0) }
          : pos,
        data: bomItem,
        ...(parentId ? { parentId, extent: 'parent' } : {}),
      };
      setNodes(nds => {
        // Parent node'u child'lardan once sirala
        const updated = [...nds, node];
        const sorted = sortNodesParentFirst(updated);
        setTimeout(() => kaydet(sorted), 0);
        return sorted;
      });

      if (parentId) {
        triggerValidation([id, parentId]);
      }
    }
  }, [nodes, screenToFlowPosition, kaydet, triggerValidation]);

  // ── Temizle ──
  const tumuTemizle = useCallback(() => {
    setNodes([]);
    setEdges([]);
    if (urun?.id) {
      setUrunler(prev => prev.map(u =>
        u.id === urun.id ? { ...u, akisHaritasi: { nodes: [], edges: [] } } : u
      ));
    }
  }, [urun?.id, setUrunler]);

  // ── Tema ──
  const isDark = C.bg.startsWith('#0') || C.bg.startsWith('#1');
  const bgColor = isDark ? '#08080D' : '#F0F2F5';
  const gridColor = isDark ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)';
  const miniMapBg = isDark ? '#0E0E14' : '#E5E8ED';

  return (
    <div style={{
      background: `color-mix(in srgb, ${C.bg} 92%, transparent)`,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.06)`,
    }}>
      {/* ═══ SOL PALET ═══ */}
      <div style={{
        width: 210, flexShrink: 0,
        borderRight: `1px solid ${C.border}`,
        background: `color-mix(in srgb, ${C.s2} 60%, transparent)`,
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Palet baslik */}
        <div style={{
          padding: '14px 14px 10px',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.text, fontFamily: F,
            letterSpacing: '-0.3px', marginBottom: 2,
          }}>
            {'\uD83E\uDDE9'} BOM Paleti
          </div>
          <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.4 }}>
            Asagidaki malzemeleri tuvale surukle
          </div>
        </div>

        {/* Palet icerik */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {bomPalette.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '24px 8px', color: C.muted, fontSize: 10,
              lineHeight: 1.5,
            }}>
              Bu urunun BOM recetesi bos. Once "Maliyet Kartlari" sekmesinden malzeme ekleyin.
            </div>
          ) : (
            Object.entries(
              bomPalette.reduce((acc, item) => {
                const group = BOM_TIP_META[item.bomTip]?.label || 'Diger';
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
              }, {})
            ).map(([groupLabel, items]) => (
              <div key={groupLabel} style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 8, fontWeight: 700, color: C.muted, fontFamily: F,
                  letterSpacing: '0.6px', textTransform: 'uppercase',
                  padding: '4px 4px 3px', marginBottom: 3,
                }}>
                  {groupLabel} ({items.length})
                </div>
                {items.map((item, i) => (
                  <div
                    key={item.bomId || i}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/akis-bom', JSON.stringify(item));
                      e.dataTransfer.effectAllowed = 'move';
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '7px 10px', marginBottom: 3, borderRadius: 10,
                      background: `color-mix(in srgb, ${item.renk} 6%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${item.renk} 15%, transparent)`,
                      cursor: 'grab', transition: 'all .15s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `color-mix(in srgb, ${item.renk} 14%, transparent)`;
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${item.renk} 35%, transparent)`;
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = `color-mix(in srgb, ${item.renk} 6%, transparent)`;
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${item.renk} 15%, transparent)`;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: 13, flexShrink: 0 }}>{item.ikon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: C.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 8, color: C.muted }}>
                        {item.miktar} {item.birim}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 8, color: item.renk, fontWeight: 700, fontFamily: F, flexShrink: 0,
                    }}>
                      {item.bomTip === 'yarimamul' ? 'YM' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Alt butonlar */}
        <div style={{
          padding: '8px 10px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {nodes.length > 0 && (
            <button onClick={tumuTemizle} style={{
              padding: '6px 10px', borderRadius: 8, width: '100%',
              background: `color-mix(in srgb, ${C.coral} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.coral} 18%, transparent)`,
              color: C.coral, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
            }}>
              Tuvali Temizle
            </button>
          )}
        </div>
      </div>

      {/* ═══ SAG: TUVAL ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Ust bilgi cubugu */}
        <div style={{
          padding: '10px 18px',
          borderBottom: `1px solid ${C.border}`,
          background: `color-mix(in srgb, ${C.s2} 40%, transparent)`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 15 }}>{'\uD83D\uDDFA\uFE0F'}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F,
              letterSpacing: '-0.5px',
            }}>
              {urun?.ad || 'Urun'} — Uretim Akis Haritasi
            </div>
            <div style={{ fontSize: 9, color: C.muted }}>
              Paletten surukle birak {'\u00B7'} Dugumler arasi bagla {'\u00B7'} YM icine at
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 7,
            background: `color-mix(in srgb, ${C.cyan} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${C.cyan} 18%, transparent)`,
            fontSize: 9, color: C.cyan, fontWeight: 600, fontFamily: F,
          }}>
            {nodes.length} dugum {'\u00B7'} {edges.length} baglanti
          </div>
        </div>

        {/* React Flow */}
        <div ref={wrapperRef} style={{ flex: 1, height: 540 }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edgesStyled}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
            style={{ background: bgColor }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: C.cyan, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan },
            }}
          >
            <Background variant="dots" gap={20} size={1} color={gridColor} />
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

        {/* Alt bilgi */}
        <div style={{
          padding: '7px 18px',
          borderTop: `1px solid ${C.border}`,
          background: `color-mix(in srgb, ${C.s2} 40%, transparent)`,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9, color: C.muted, fontFamily: FB,
        }}>
          <span>Delete = sil {'\u00B7'} Handle surukle = bagla {'\u00B7'} YM grubuna at = parent-child</span>
          <span style={{ color: C.mint, fontWeight: 600 }}>Otomatik kayit aktif</span>
        </div>
      </div>
    </div>
  );
}

// ── Parent node'lari child'lardan once siralama ──
function sortNodesParentFirst(nodes) {
  const parents = nodes.filter(n => !n.parentId);
  const children = nodes.filter(n => n.parentId);
  return [...parents, ...children];
}

/* ═══════════════════════════════════════════════════════════
   EXPORT: ReactFlowProvider wrapper
   ═══════════════════════════════════════════════════════════ */
export default function AkisHaritasiCanvas({ urun, setUrunler, hamMaddeler = [], yarimamulList = [], hizmetler = [] }) {

  // ── BOM'dan palet verisi olustur ──
  const bomPalette = useMemo(() => {
    if (!urun?.bom?.length) return [];
    const allKalemler = [...hamMaddeler, ...yarimamulList, ...hizmetler];

    return urun.bom.map(b => {
      const kalem = allKalemler.find(x => x.id === b.kalemId);
      if (!kalem) return null;

      let bomTip = b.tip;
      if (b.tip === 'hizmet') {
        bomTip = kalem.tip === 'fason' ? 'hizmet_fason' : 'hizmet_ic';
      }
      const meta = BOM_TIP_META[bomTip] || BOM_TIP_META.hammadde;

      return {
        bomId: b.id,
        kalemId: b.kalemId,
        bomTip,
        label: kalem.ad || kalem.kod || '?',
        ikon: meta.ikon,
        renk: meta.renk,
        miktar: b.miktar,
        birim: b.birim,
        tip: b.tip,
      };
    }).filter(Boolean);
  }, [urun?.bom, hamMaddeler, yarimamulList, hizmetler]);

  return (
    <ReactFlowProvider>
      <InnerFlow
        urun={urun}
        setUrunler={setUrunler}
        bomPalette={bomPalette}
      />
    </ReactFlowProvider>
  );
}
