import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
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
   FAZ 6.2b — BOM Edge Validation & Swimlanes
   ══════════════════════════════════════════════════════════════════ */

// ── CSS Inject ──
const GLOW_CSS_ID = 'akis-glow-css-v2';
if (typeof document !== 'undefined' && !document.getElementById(GLOW_CSS_ID)) {
  const s = document.createElement('style');
  s.id = GLOW_CSS_ID;
  s.textContent = `
    @keyframes akisOk { 0%{box-shadow:inset 0 1px 0 rgba(255,255,255,.06)} 35%{box-shadow:0 0 22px rgba(61,184,138,.5),0 0 44px rgba(61,184,138,.15),inset 0 1px 0 rgba(255,255,255,.12)} 100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.06)} }
    @keyframes akisFail { 0%{box-shadow:inset 0 1px 0 rgba(255,255,255,.06)} 35%{box-shadow:0 0 22px rgba(220,60,60,.5),0 0 44px rgba(220,60,60,.15),inset 0 1px 0 rgba(255,255,255,.12)} 100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.06)} }
    @keyframes akisEdgeOk { 0%{filter:none} 35%{filter:drop-shadow(0 0 6px rgba(61,184,138,.7))} 100%{filter:none} }
    @keyframes akisEdgeFail { 0%{filter:none} 35%{filter:drop-shadow(0 0 6px rgba(220,60,60,.7))} 100%{filter:none} }
    .akis-ok { animation:akisOk .9s ease-out; border-color:#3DB88A !important }
    .akis-ok .akis-bar { background:linear-gradient(90deg,#3DB88A,transparent) !important }
    .akis-fail { animation:akisFail .9s ease-out; border-color:#DC3C3C !important }
    .akis-fail .akis-bar { background:linear-gradient(90deg,#DC3C3C,transparent) !important }
    .react-flow__edge.edge-ok path { stroke:#3DB88A !important; animation:akisEdgeOk .9s ease-out }
    .react-flow__edge.edge-fail path { stroke:#DC3C3C !important; animation:akisEdgeFail .9s ease-out }
  `;
  document.head.appendChild(s);
}

// ── BOM tip meta ──
const TIP = {
  hammadde:     { ikon: '\uD83E\uDDF1', label: 'Ham Madde',   renk: C.sky,    zone: 'dis' },
  yarimamul:    { ikon: '\uD83D\uDD29', label: 'Yari Mamul',  renk: C.cyan,   zone: 'ic' },
  hizmet_ic:    { ikon: '\uD83D\uDC64', label: 'Ic Iscilik',  renk: C.gold,   zone: 'ic' },
  hizmet_fason: { ikon: '\uD83C\uDFED', label: 'Fason',       renk: C.lav,    zone: 'dis' },
  nakliye:      { ikon: '\uD83D\uDE9A', label: 'Nakliye',     renk: C.orange, zone: 'dis' },
  urun:         { ikon: '\uD83C\uDFAF', label: 'Nihai Urun',  renk: C.mint,   zone: 'ic' },
};

// ── Nakliye turleri (palette icin) ──
const NAKLIYE_TURLERI = [
  { id: 'firma_getirir', label: 'Firma Getirir' },
  { id: 'kargo',         label: 'Kargo' },
  { id: 'bizim_arac',    label: 'Bizim Arac' },
  { id: 'kurye',         label: 'Kurye' },
  { id: 'musteri_alir',  label: 'Musteri Alir' },
];

let _c = Date.now();
const nid = () => `n_${++_c}`;

/* ═══════════════════════════════════════════
   BomNode — Tek node tipi (hepsi bagimsiz)
   ═══════════════════════════════════════════ */
function BomNode({ id, data }) {
  const renk = data.renk || C.cyan;
  const vState = data._v; // 'ok' | 'fail' | null
  const cls = vState === 'ok' ? 'akis-ok' : vState === 'fail' ? 'akis-fail' : '';
  const isCompound = data.bomTip === 'yarimamul' || data.bomTip === 'urun';
  const isNakliye = data.bomTip === 'nakliye';
  const subItems = data._subItems || [];
  const matchedIds = data._matchedKalemIds || new Set();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={cls} style={{
      minWidth: isCompound ? 200 : 160, maxWidth: isCompound ? 260 : 210,
      background: vState === 'ok'
        ? `color-mix(in srgb, ${C.mint} 8%, ${C.s2})`
        : vState === 'fail'
          ? `color-mix(in srgb, ${C.coral} 6%, ${C.s2})`
          : `color-mix(in srgb, ${renk} 5%, ${C.s2})`,
      border: `1px solid ${vState === 'ok' ? C.mint : vState === 'fail' ? C.coral : `color-mix(in srgb, ${renk} 22%, transparent)`}`,
      borderRadius: 14, fontFamily: FB,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
      transition: 'border-color .3s, background .3s, box-shadow .3s',
      position: 'relative',
    }}>
      {/* Ust cubuk */}
      <div className="akis-bar" style={{
        height: 2, borderRadius: '14px 14px 0 0',
        background: `linear-gradient(90deg, ${renk}, transparent)`,
        transition: 'background .3s',
      }} />

      <div style={{ padding: '10px 13px 8px' }}>
        {/* Baslik */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{data.ikon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.text, fontFamily: F,
              letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{data.label}</div>
            {data.miktar != null && (
              <div style={{ fontSize: 8, color: C.muted, marginTop: 1 }}>{data.miktar} {data.birim || ''}</div>
            )}
          </div>
          {vState === 'ok' && <span style={{ fontSize: 12, color: C.mint, fontWeight: 800, textShadow: `0 0 8px ${C.mint}66` }}>{'\u2713'}</span>}
          {vState === 'fail' && <span style={{ fontSize: 12, color: C.coral, fontWeight: 800, textShadow: `0 0 8px ${C.coral}66` }}>{'\u2717'}</span>}
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-block', marginTop: 4, padding: '2px 7px', borderRadius: 5,
          background: `color-mix(in srgb, ${renk} 14%, transparent)`,
          fontSize: 7, fontWeight: 700, color: renk, fontFamily: F,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          {TIP[data.bomTip]?.label || data.bomTip}
          {isNakliye && data.nakliyeTur ? ` \u2022 ${data.nakliyeTur}` : ''}
        </div>

        {/* Nakliye tur secimi — tikla sec */}
        {isNakliye && (
          <div style={{ marginTop: 5 }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 8, fontWeight: 600, width: '100%',
                background: data.nakliyeTur
                  ? `color-mix(in srgb, ${C.orange} 12%, transparent)`
                  : `color-mix(in srgb, ${C.muted} 8%, transparent)`,
                border: `1px solid ${data.nakliyeTur ? `color-mix(in srgb, ${C.orange} 25%, transparent)` : C.border}`,
                color: data.nakliyeTur ? C.orange : C.muted,
                cursor: 'pointer', fontFamily: FB, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <span>{'\uD83D\uDE9A'}</span>
              <span>{data.nakliyeTur || 'Tur sec...'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 7 }}>{menuOpen ? '\u25B4' : '\u25BE'}</span>
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', left: 8, right: 8, top: '100%', marginTop: 3,
                background: C.s3, border: `1px solid ${C.borderHi}`, borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,.5)', zIndex: 50, overflow: 'hidden',
              }}>
                {NAKLIYE_TURLERI.map(nt => (
                  <button key={nt.id} onClick={e => {
                    e.stopPropagation();
                    data._onNakliyeSec?.(id, nt.label);
                    setMenuOpen(false);
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 12px', width: '100%', border: 'none',
                    background: data.nakliyeTur === nt.label ? `color-mix(in srgb, ${C.orange} 15%, transparent)` : 'transparent',
                    color: data.nakliyeTur === nt.label ? C.orange : C.text,
                    fontSize: 10, fontWeight: data.nakliyeTur === nt.label ? 700 : 400,
                    cursor: 'pointer', fontFamily: FB,
                    borderBottom: `1px solid ${C.border}`, transition: 'background .12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${C.orange} 10%, transparent)`}
                    onMouseLeave={e => e.currentTarget.style.background = data.nakliyeTur === nt.label ? `color-mix(in srgb, ${C.orange} 15%, transparent)` : 'transparent'}
                  >
                    <span>{'\uD83D\uDE9A'}</span>
                    <span>{nt.label}</span>
                    {data.nakliyeTur === nt.label && <span style={{ marginLeft: 'auto', color: C.mint }}>{'\u2713'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* YM / Urun alt kalem listesi */}
        {isCompound && subItems.length > 0 && (
          <div style={{
            marginTop: 6, padding: '5px 0 2px',
            borderTop: `1px solid color-mix(in srgb, ${renk} 10%, transparent)`,
          }}>
            <div style={{ fontSize: 7, color: C.muted, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 3, textTransform: 'uppercase' }}>
              Gerekenler:
            </div>
            {subItems.map((si, i) => {
              const matched = matchedIds.has(si.kalemId);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '1.5px 0', fontSize: 8, lineHeight: 1.3,
                }}>
                  <span style={{
                    color: matched ? C.mint : C.muted, fontSize: 9, fontWeight: 700, width: 11, textAlign: 'center',
                    textShadow: matched ? `0 0 6px ${C.mint}44` : 'none',
                  }}>
                    {matched ? '\u2714' : '\u25CB'}
                  </span>
                  <span style={{
                    color: matched ? C.text : C.sub,
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {si.label}
                  </span>
                  <span style={{ color: C.muted, fontSize: 7, flexShrink: 0 }}>{si.miktar}{si.birim ? ` ${si.birim}` : ''}</span>
                </div>
              );
            })}
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

const nodeTypes = { bomNode: BomNode };

/* ═══════════════════════════════════════════
   Swimlane Overlay (Panel icinde SVG)
   ═══════════════════════════════════════════ */
function SwimlaneBg({ isDark }) {
  const disColor = isDark ? 'rgba(62,123,212,.03)' : 'rgba(62,123,212,.04)';
  const icColor  = isDark ? 'rgba(232,145,74,.03)' : 'rgba(232,145,74,.04)';
  const lineColor = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
  const txtColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)';

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      display: 'flex',
    }}>
      {/* Sol: Dis Operasyonlar */}
      <div style={{ flex: 1, background: disColor }} />
      {/* Ortada separator */}
      <div style={{
        width: 1,
        background: `linear-gradient(180deg, transparent 5%, ${lineColor} 20%, ${lineColor} 80%, transparent 95%)`,
      }} />
      {/* Sag: Ic Uretim */}
      <div style={{ flex: 1, background: icColor }} />

      {/* Etiketler — sabit */}
      <div style={{
        position: 'absolute', top: 12, left: 16,
        fontSize: 10, fontWeight: 700, color: txtColor, fontFamily: F,
        letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none',
      }}>
        {'\u2190'} Dis Operasyonlar
      </div>
      <div style={{
        position: 'absolute', top: 12, right: 16,
        fontSize: 10, fontWeight: 700, color: txtColor, fontFamily: F,
        letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none',
      }}>
        Ic Uretim {'\u2192'}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Graph analiz: BOM validation engine
   ═══════════════════════════════════════════ */
function validateGraph(nodes, edges, allKalemler, yarimamulList, urun) {
  // Her YM/Urun node'u icin, ona edge ile (dogrudan veya zincir yoluyla) bagli olan
  // kaynak node'larin kalemId'lerini topla, BOM ile karsilastir
  const adj = {}; // target -> [source]
  edges.forEach(e => {
    if (!adj[e.target]) adj[e.target] = [];
    adj[e.target].push(e.source);
  });

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // BFS ile bir node'a bagli tum kaynak kalemId'leri topla
  function collectSources(targetId) {
    const visited = new Set();
    const queue = [targetId];
    const kalemIds = new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      (adj[cur] || []).forEach(srcId => {
        const srcNode = nodeMap[srcId];
        if (srcNode?.data?.kalemId) kalemIds.add(srcNode.data.kalemId);
        queue.push(srcId);
      });
    }
    return kalemIds;
  }

  // Sonuc: nodeId -> { status, matchedKalemIds }
  const result = {};
  // edgeId -> status
  const edgeResult = {};

  nodes.forEach(n => {
    const bt = n.data?.bomTip;
    if (bt !== 'yarimamul' && bt !== 'urun') return;

    // Bu node'un BOM'unu bul
    let bom = [];
    if (bt === 'urun') {
      bom = urun?.bom || [];
    } else {
      const ym = yarimamulList.find(y => y.id === n.data.kalemId);
      bom = ym?.bom || [];
    }
    if (!bom.length) return;

    const bomKalemIds = new Set(bom.map(b => b.kalemId));
    const connectedKalemIds = collectSources(n.id);

    if (connectedKalemIds.size === 0) return;

    const matchedIds = new Set();
    let anyMatch = false;
    let anyWrong = false;
    connectedKalemIds.forEach(kid => {
      if (bomKalemIds.has(kid)) { matchedIds.add(kid); anyMatch = true; }
      else anyWrong = true;
    });

    result[n.id] = {
      status: anyWrong ? 'fail' : 'ok',
      matchedKalemIds: matchedIds,
    };

    // Edge'leri isaretle: target'a gelen tum edge'ler
    // + zincirdeki ara edge'ler
    const visitedForEdges = new Set();
    const q2 = [n.id];
    while (q2.length) {
      const cur = q2.shift();
      if (visitedForEdges.has(cur)) continue;
      visitedForEdges.add(cur);
      (adj[cur] || []).forEach(srcId => {
        const srcNode = nodeMap[srcId];
        const srcKalem = srcNode?.data?.kalemId;
        const edgeId = edges.find(e => e.source === srcId && e.target === cur)?.id;
        if (edgeId) {
          if (srcKalem && !bomKalemIds.has(srcKalem) && srcNode?.data?.bomTip !== 'nakliye') {
            edgeResult[edgeId] = 'fail';
          } else if (anyMatch && !anyWrong) {
            edgeResult[edgeId] = 'ok';
          } else if (srcKalem && bomKalemIds.has(srcKalem)) {
            edgeResult[edgeId] = 'ok';
          }
        }
        q2.push(srcId);
      });
    }

    // Kaynak node'lari da isaretle
    connectedKalemIds.forEach(kid => {
      const srcNode = nodes.find(nd => nd.data?.kalemId === kid);
      if (srcNode) {
        result[srcNode.id] = {
          status: bomKalemIds.has(kid) ? 'ok' : 'fail',
          matchedKalemIds: new Set(),
        };
      }
    });
  });

  return { nodeResults: result, edgeResults: edgeResult };
}

/* ═══════════════════════════════════════════
   InnerFlow
   ═══════════════════════════════════════════ */
function InnerFlow({ urun, setUrunler, bomPalette, yarimamulList, allKalemler }) {
  const harita = urun?.akisHaritasi || { nodes: [], edges: [] };
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    harita.nodes.map(n => ({ ...n, type: 'bomNode' }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(harita.edges || []);
  const [flashNodes, setFlashNodes] = useState({});   // nodeId -> 'ok'|'fail'
  const [flashEdges, setFlashEdges] = useState({});   // edgeId -> 'ok'|'fail'
  const wrapperRef = useRef(null);

  // ── Tuvalde olan bomId'ler → paletten gizle ──
  const usedBomIds = useMemo(() => new Set(nodes.map(n => n.data?.bomId).filter(Boolean)), [nodes]);
  const filteredPalette = useMemo(() => bomPalette.filter(it => !usedBomIds.has(it.bomId)), [bomPalette, usedBomIds]);

  // kaydet ref — circular dep onlemek icin
  const kaydetRef = useRef(null);

  // ── Nakliye tur secimi handler ──
  const onNakliyeSec = useCallback((nodeId, turLabel) => {
    setNodes(nds => {
      const updated = nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, nakliyeTur: turLabel } } : n
      );
      setTimeout(() => kaydetRef.current?.(updated), 0);
      return updated;
    });
  }, []);

  // ── Nakliye node ekle (butondan) ──
  const nakliyeEkle = useCallback(() => {
    const pos = { x: 200 + Math.random() * 100, y: 100 + nodes.length * 60 };
    const node = {
      id: nid(), type: 'bomNode', position: pos,
      data: {
        bomId: `nakliye_${Date.now()}`, bomTip: 'nakliye',
        label: 'Nakliye', ikon: TIP.nakliye.ikon, renk: TIP.nakliye.renk,
      },
    };
    setNodes(nds => {
      const updated = [...nds, node];
      setTimeout(() => kaydetRef.current?.(updated), 0);
      return updated;
    });
  }, [nodes.length]);

  // ── Kaydet ──
  const kaydet = useCallback((nds, eds) => {
    if (!urun?.id) return;
    const fn = nds || nodes;
    const fe = eds || edges;
    setUrunler(prev => prev.map(u =>
      u.id === urun.id ? { ...u, akisHaritasi: {
        nodes: fn.map(n => ({
          id: n.id, type: 'bomNode', position: n.position,
          data: { ...n.data, _v: undefined, _subItems: undefined, _matchedKalemIds: undefined, _onNakliyeSec: undefined },
        })),
        edges: fe.map(e => ({ id: e.id, source: e.source, target: e.target })),
      }} : u
    ));
  }, [urun?.id, nodes, edges, setUrunler]);
  useEffect(() => { kaydetRef.current = kaydet; }, [kaydet]);

  // ── Validation calistir ──
  const runValidation = useCallback((nds, eds) => {
    const { nodeResults, edgeResults } = validateGraph(nds || nodes, eds || edges, allKalemler, yarimamulList, urun);
    setFlashNodes(nodeResults);
    setFlashEdges(edgeResults);
    // 1.5s sonra flash'i kaldir (kalici renk validationdan gelir)
    // Kalici tutuyoruz: setTimeout yok, validation surekli aktif
  }, [nodes, edges, allKalemler, yarimamulList, urun]);

  // ── YM/Urun sub-items hesapla ──
  const subItemsMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => {
      const bt = n.data?.bomTip;
      if (bt !== 'yarimamul' && bt !== 'urun') return;
      let bom = [];
      if (bt === 'urun') bom = urun?.bom || [];
      else {
        const ym = yarimamulList.find(y => y.id === n.data.kalemId);
        bom = ym?.bom || [];
      }
      map[n.id] = bom.map(b => {
        const k = allKalemler.find(x => x.id === b.kalemId);
        return { kalemId: b.kalemId, label: k?.ad || '?', miktar: b.miktar, birim: b.birim };
      });
    });
    return map;
  }, [nodes, urun?.bom, yarimamulList, allKalemler]);

  // ── Node'lara validation + subItems + callbacks inject ──
  const nodesEnriched = useMemo(() =>
    nodes.map(n => {
      const vr = flashNodes[n.id];
      return {
        ...n,
        data: {
          ...n.data,
          _v: vr?.status || null,
          _subItems: subItemsMap[n.id] || [],
          _matchedKalemIds: vr?.matchedKalemIds || new Set(),
          _onNakliyeSec: onNakliyeSec,
        },
      };
    }),
    [nodes, flashNodes, subItemsMap, onNakliyeSec]
  );

  // ── Edge styling ──
  const edgesStyled = useMemo(() =>
    edges.map(e => {
      const st = flashEdges[e.id];
      const clr = st === 'ok' ? C.mint : st === 'fail' ? C.coral : C.cyan;
      return {
        ...e,
        className: st === 'ok' ? 'edge-ok' : st === 'fail' ? 'edge-fail' : '',
        animated: true,
        style: { stroke: clr, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: clr, width: 16, height: 16 },
      };
    }),
    [edges, flashEdges]
  );

  // ── Edge baglama + validation ──
  const onConnect = useCallback((params) => {
    const eid = `e_${params.source}_${params.target}`;
    const ne = { ...params, id: eid };
    setEdges(eds => {
      const updated = addEdge(ne, eds);
      setTimeout(() => { kaydet(undefined, updated); runValidation(undefined, updated); }, 0);
      return updated;
    });
  }, [kaydet, runValidation]);

  // ── Node drag end ──
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    if (changes.some(c => c.type === 'position' && c.dragging === false))
      setTimeout(() => kaydet(), 50);
  }, [onNodesChange, kaydet]);

  // ── Sil ──
  const onNodesDelete = useCallback((deleted) => {
    const ids = new Set(deleted.map(n => n.id));
    setEdges(eds => {
      const updated = eds.filter(e => !ids.has(e.source) && !ids.has(e.target));
      setTimeout(() => { kaydet(undefined, updated); runValidation(undefined, updated); }, 50);
      return updated;
    });
    setTimeout(() => kaydet(), 100);
  }, [kaydet, runValidation]);

  const onEdgesDelete = useCallback(() => {
    setTimeout(() => { kaydet(); runValidation(); }, 50);
  }, [kaydet, runValidation]);

  // ── Drop paletten ──
  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/akis-bom');
    if (!raw) return;
    const item = JSON.parse(raw);
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const node = { id: nid(), type: 'bomNode', position: pos, data: item };
    setNodes(nds => {
      const updated = [...nds, node];
      setTimeout(() => { kaydet(updated); runValidation(updated); }, 0);
      return updated;
    });
  }, [screenToFlowPosition, kaydet, runValidation]);

  // ── Temizle ──
  const tumuTemizle = useCallback(() => {
    setNodes([]); setEdges([]);
    setFlashNodes({}); setFlashEdges({});
    if (urun?.id) setUrunler(prev => prev.map(u =>
      u.id === urun.id ? { ...u, akisHaritasi: { nodes: [], edges: [] } } : u
    ));
  }, [urun?.id, setUrunler]);

  // ── Tema ──
  const isDark = C.bg.startsWith('#0') || C.bg.startsWith('#1');
  const bgColor = isDark ? '#08080D' : '#F0F2F5';
  const gridColor = isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.05)';
  const miniMapBg = isDark ? '#0E0E14' : '#E5E8ED';

  return (
    <div style={{
      background: `color-mix(in srgb, ${C.bg} 92%, transparent)`,
      border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
      display: 'flex', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
    }}>
      {/* ═══ SOL PALET ═══ */}
      <div style={{
        width: 210, flexShrink: 0, borderRight: `1px solid ${C.border}`,
        background: `color-mix(in srgb, ${C.s2} 60%, transparent)`,
        backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 2 }}>
            {'\uD83E\uDDE9'} BOM Paleti
          </div>
          <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.4 }}>Malzemeleri tuvale surukle</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
          {filteredPalette.length === 0 && bomPalette.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 8px', color: C.muted, fontSize: 10, lineHeight: 1.5 }}>
              BOM recetesi bos. Once malzeme ekleyin.
            </div>
          ) : filteredPalette.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '18px 8px', color: C.mint, fontSize: 10, lineHeight: 1.5 }}>
              {'\u2713'} Tum kalemler tuvale eklendi
            </div>
          ) : (
            Object.entries(
              filteredPalette.reduce((acc, it) => {
                const g = TIP[it.bomTip]?.label || 'Diger';
                (acc[g] = acc[g] || []).push(it);
                return acc;
              }, {})
            ).map(([gl, items]) => (
              <div key={gl} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: C.muted, fontFamily: F, letterSpacing: '.6px', textTransform: 'uppercase', padding: '4px 4px 2px' }}>
                  {gl} ({items.length})
                </div>
                {items.map((it, i) => (
                  <PaletItem key={it.bomId || `${it.bomTip}_${i}`} item={it} />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Alt butonlar: Nakliye + Temizle */}
        <div style={{ padding: '8px 10px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={nakliyeEkle} style={{
            padding: '7px 10px', borderRadius: 8, width: '100%',
            background: `color-mix(in srgb, ${C.orange} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${C.orange} 20%, transparent)`,
            color: C.orange, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <span>{'\uD83D\uDE9A'}</span> Nakliye Ekle
          </button>
          {nodes.length > 0 && (
            <button onClick={tumuTemizle} style={{
              padding: '6px 10px', borderRadius: 8, width: '100%',
              background: `color-mix(in srgb, ${C.coral} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.coral} 18%, transparent)`,
              color: C.coral, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
            }}>Tuvali Temizle</button>
          )}
        </div>
      </div>

      {/* ═══ SAG TUVAL ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '10px 18px', borderBottom: `1px solid ${C.border}`,
          background: `color-mix(in srgb, ${C.s2} 40%, transparent)`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 15 }}>{'\uD83D\uDDFA\uFE0F'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.5px' }}>
              {urun?.ad || 'Urun'} — Uretim Akis Haritasi
            </div>
            <div style={{ fontSize: 9, color: C.muted }}>
              Surukle {'\u00B7'} Bagla {'\u00B7'} Yesil = dogru BOM {'\u00B7'} Kirmizi = uyumsuz
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 7,
            background: `color-mix(in srgb, ${C.cyan} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${C.cyan} 18%, transparent)`,
            fontSize: 9, color: C.cyan, fontWeight: 600, fontFamily: F,
          }}>{nodes.length} dugum {'\u00B7'} {edges.length} ok</div>
        </div>

        <div ref={wrapperRef} style={{ flex: 1, height: 560, position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
          <SwimlaneBg isDark={isDark} />
          <ReactFlow
            nodes={nodesEnriched}
            edges={edgesStyled}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView snapToGrid snapGrid={[20, 20]}
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
            <Controls style={{
              background: isDark ? C.s3 : '#fff', border: `1px solid ${C.border}`,
              borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.3)',
            }} showInteractive={false} />
            <MiniMap nodeStrokeWidth={3} nodeColor={n => n.data?.renk || C.cyan}
              maskColor={isDark ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.7)'}
              style={{ background: miniMapBg, border: `1px solid ${C.border}`, borderRadius: 10 }} />
          </ReactFlow>
        </div>

        <div style={{
          padding: '7px 18px', borderTop: `1px solid ${C.border}`,
          background: `color-mix(in srgb, ${C.s2} 40%, transparent)`,
          display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, fontFamily: FB,
        }}>
          <span>Delete = sil {'\u00B7'} Handle surukle = bagla {'\u00B7'} Sol = dis operasyonlar / Sag = ic uretim</span>
          <span style={{ color: C.mint, fontWeight: 600 }}>BOM dogrulama aktif</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PaletItem — drag handle
   ═══════════════════════════════════════════ */
function PaletItem({ item }) {
  const renk = item.renk || C.cyan;
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('application/akis-bom', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={e => { e.currentTarget.style.opacity = '1'; }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 9px', marginBottom: 3, borderRadius: 9,
        background: `color-mix(in srgb, ${renk} 5%, transparent)`,
        border: `1px solid color-mix(in srgb, ${renk} 14%, transparent)`,
        cursor: 'grab', transition: 'all .15s', userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `color-mix(in srgb, ${renk} 14%, transparent)`;
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${renk} 35%, transparent)`;
        e.currentTarget.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `color-mix(in srgb, ${renk} 5%, transparent)`;
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${renk} 14%, transparent)`;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{ fontSize: 12, flexShrink: 0 }}>{item.ikon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </div>
        {item.miktar != null && <div style={{ fontSize: 7, color: C.muted }}>{item.miktar} {item.birim}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EXPORT
   ═══════════════════════════════════════════ */
export default function AkisHaritasiCanvas({ urun, setUrunler, hamMaddeler = [], yarimamulList = [], hizmetler = [] }) {
  const allKalemler = useMemo(() => [...hamMaddeler, ...yarimamulList, ...hizmetler], [hamMaddeler, yarimamulList, hizmetler]);

  // ── Rekursif BOM Paleti: urunun BOM'u + YM'lerin ic BOM'lari ──
  const bomPalette = useMemo(() => {
    const items = [];
    const seen = new Set(); // ayni kalemId tekrar eklenmesin

    // Rekursif BOM acici
    const explodeBom = (bom, depth) => {
      if (depth > 6 || !bom?.length) return;
      bom.forEach(b => {
        const kalem = allKalemler.find(x => x.id === b.kalemId);
        if (!kalem) return;
        // Tekrar kontrolu: ayni kalemId zaten varsa ekleme
        if (seen.has(b.kalemId)) return;
        seen.add(b.kalemId);

        let bomTip = b.tip;
        if (b.tip === 'hizmet') bomTip = kalem.tip === 'fason' ? 'hizmet_fason' : 'hizmet_ic';
        const meta = TIP[bomTip] || TIP.hammadde;
        items.push({
          bomId: b.id, kalemId: b.kalemId, bomTip,
          label: kalem.ad || kalem.kod || '?',
          ikon: meta.ikon, renk: meta.renk,
          miktar: b.miktar, birim: b.birim,
        });

        // Eger YM ise, onun da ic BOM'unu ac
        if (b.tip === 'yarimamul') {
          const ym = yarimamulList.find(y => y.id === b.kalemId);
          if (ym?.bom) explodeBom(ym.bom, depth + 1);
        }
      });
    };

    // Urunun ust BOM'unu ac
    explodeBom(urun?.bom || [], 0);

    // Nihai urun (kendisi)
    if (urun) {
      items.push({
        bomId: `urun_${urun.id}`, kalemId: urun.id, bomTip: 'urun',
        label: urun.ad || urun.kod || 'Urun',
        ikon: TIP.urun.ikon, renk: TIP.urun.renk,
      });
    }

    return items;
  }, [urun?.bom, urun?.id, urun?.ad, allKalemler, yarimamulList]);

  return (
    <ReactFlowProvider>
      <InnerFlow
        urun={urun}
        setUrunler={setUrunler}
        bomPalette={bomPalette}
        yarimamulList={yarimamulList}
        allKalemler={allKalemler}
      />
    </ReactFlowProvider>
  );
}
