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
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { C, F, FB } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════
   FAZ 6.3 — Duzenle/Kaydet + Bounded BFS Validation
   ══════════════════════════════════════════════════════════════════ */

// ── CSS ──
const CSS_ID = 'akis-css-v3';
if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
  const s = document.createElement('style');
  s.id = CSS_ID;
  s.textContent = `
    .akis-ok { border-color:#3DB88A !important }
    .akis-ok .akis-bar { background:linear-gradient(90deg,#3DB88A,transparent) !important }
    .akis-fail { border-color:#DC3C3C !important }
    .akis-fail .akis-bar { background:linear-gradient(90deg,#DC3C3C,transparent) !important }
    .react-flow__edge.edge-ok path { stroke:#3DB88A !important }
    .react-flow__edge.edge-fail path { stroke:#DC3C3C !important }
  `;
  document.head.appendChild(s);
}

// ── Tip meta ──
const TIP = {
  hammadde:     { ikon: '\uD83E\uDDF1', label: 'Ham Madde',   renk: C.sky },
  yarimamul:    { ikon: '\uD83D\uDD29', label: 'Yari Mamul',  renk: C.cyan },
  hizmet_ic:    { ikon: '\uD83D\uDC64', label: 'Ic Iscilik',  renk: C.gold },
  hizmet_fason: { ikon: '\uD83C\uDFED', label: 'Fason',       renk: C.lav },
  nakliye:      { ikon: '\uD83D\uDE9A', label: 'Nakliye',     renk: C.orange },
  urun:         { ikon: '\uD83C\uDFAF', label: 'Nihai Urun',  renk: C.mint },
};

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
   BomNode
   ═══════════════════════════════════════════ */
function BomNode({ id, data }) {
  const renk = data.renk || C.cyan;
  const vState = data._v;
  const isCompound = data.bomTip === 'yarimamul' || data.bomTip === 'urun';
  const isNakliye = data.bomTip === 'nakliye';
  const subItems = data._subItems || [];
  const matchedIds = data._matchedKalemIds || new Set();
  const [menuOpen, setMenuOpen] = useState(false);

  // Tamamlanma orani (compound node'lar icin)
  const total = subItems.length;
  const matched = total > 0 ? subItems.filter(si => matchedIds.has(si.kalemId)).length : 0;
  const ratio = total > 0 ? matched / total : 0;
  const isComplete = total > 0 && matched === total;
  const isPartial = matched > 0 && !isComplete;

  // Renk: tamamen tamamlandi = guclu yesil, kismi = soluk yesil, fail = kirmizi, bos = default
  const effectiveV = isCompound
    ? (isComplete ? 'complete' : isPartial ? 'partial' : (vState === 'fail' ? 'fail' : null))
    : vState;
  const cls = effectiveV === 'complete' ? 'akis-ok' : effectiveV === 'fail' ? 'akis-fail' : '';
  const greenIntensity = isComplete ? 12 : isPartial ? Math.round(4 + ratio * 6) : 0;

  return (
    <div className={cls} style={{
      minWidth: isCompound ? 200 : 155, maxWidth: isCompound ? 260 : 210,
      background: effectiveV === 'complete' ? `color-mix(in srgb, ${C.mint} ${greenIntensity}%, ${C.s2})`
        : effectiveV === 'partial' ? `color-mix(in srgb, ${C.mint} ${greenIntensity}%, ${C.s2})`
        : effectiveV === 'fail' ? `color-mix(in srgb, ${C.coral} 6%, ${C.s2})`
        : vState === 'ok' ? `color-mix(in srgb, ${C.mint} 8%, ${C.s2})`
        : `color-mix(in srgb, ${renk} 5%, ${C.s2})`,
      border: `1px solid ${effectiveV === 'complete' ? C.mint : effectiveV === 'partial' ? `color-mix(in srgb, ${C.mint} ${Math.round(30 + ratio * 70)}%, transparent)` : effectiveV === 'fail' ? C.coral : vState === 'ok' ? C.mint : `color-mix(in srgb, ${renk} 22%, transparent)`}`,
      borderRadius: 14, fontFamily: FB,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: isComplete ? `0 0 16px color-mix(in srgb, ${C.mint} 25%, transparent), inset 0 1px 0 rgba(255,255,255,.08)` : 'inset 0 1px 0 rgba(255,255,255,.06)',
      transition: 'border-color .3s, background .3s, box-shadow .3s',
      position: 'relative',
    }}>
      <div className="akis-bar" style={{
        height: 2, borderRadius: '14px 14px 0 0',
        background: isComplete ? `linear-gradient(90deg, ${C.mint}, ${C.mint}40)` : isPartial ? `linear-gradient(90deg, ${C.mint} ${ratio * 100}%, ${renk}40 ${ratio * 100}%)` : `linear-gradient(90deg, ${renk}, transparent)`,
        transition: 'background .3s',
      }} />
      <div style={{ padding: '10px 13px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{data.ikon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</div>
            {data.miktar != null && <div style={{ fontSize: 8, color: C.muted, marginTop: 1 }}>{data.miktar} {data.birim || ''}</div>}
          </div>
          {isCompound && total > 0 && (
            isComplete
              ? <span style={{ fontSize: 13, color: C.mint, fontWeight: 800, textShadow: `0 0 10px ${C.mint}88` }}>{'\u2713'}</span>
              : <span style={{ fontSize: 8, color: isPartial ? C.mint : C.muted, fontWeight: 700, fontFamily: F, opacity: isPartial ? 0.6 + ratio * 0.4 : 0.4 }}>{matched}/{total}</span>
          )}
          {!isCompound && vState === 'ok' && <span style={{ fontSize: 12, color: C.mint, fontWeight: 800, textShadow: `0 0 8px ${C.mint}66` }}>{'\u2713'}</span>}
          {!isCompound && vState === 'fail' && <span style={{ fontSize: 12, color: C.coral, fontWeight: 800, textShadow: `0 0 8px ${C.coral}66` }}>{'\u2717'}</span>}
        </div>
        <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 7px', borderRadius: 5, background: `color-mix(in srgb, ${renk} 14%, transparent)`, fontSize: 7, fontWeight: 700, color: renk, fontFamily: F, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {TIP[data.bomTip]?.label || data.bomTip}{isNakliye && data.nakliyeTur ? ` \u2022 ${data.nakliyeTur}` : ''}
        </div>

        {/* Nakliye tur secimi */}
        {isNakliye && (
          <div style={{ marginTop: 5 }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }} style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 8, fontWeight: 600, width: '100%',
              background: data.nakliyeTur ? `color-mix(in srgb, ${C.orange} 12%, transparent)` : `color-mix(in srgb, ${C.muted} 8%, transparent)`,
              border: `1px solid ${data.nakliyeTur ? `color-mix(in srgb, ${C.orange} 25%, transparent)` : C.border}`,
              color: data.nakliyeTur ? C.orange : C.muted, cursor: 'pointer', fontFamily: FB, textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span>{'\uD83D\uDE9A'}</span><span>{data.nakliyeTur || 'Tur sec...'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 7 }}>{menuOpen ? '\u25B4' : '\u25BE'}</span>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', left: 8, right: 8, top: '100%', marginTop: 3, background: C.s3, border: `1px solid ${C.borderHi}`, borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.5)', zIndex: 50, overflow: 'hidden' }}>
                {NAKLIYE_TURLERI.map(nt => (
                  <button key={nt.id} onClick={e => { e.stopPropagation(); data._onNakliyeSec?.(id, nt.label); setMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', width: '100%', border: 'none',
                    background: data.nakliyeTur === nt.label ? `color-mix(in srgb, ${C.orange} 15%, transparent)` : 'transparent',
                    color: data.nakliyeTur === nt.label ? C.orange : C.text, fontSize: 10, fontWeight: data.nakliyeTur === nt.label ? 700 : 400,
                    cursor: 'pointer', fontFamily: FB, borderBottom: `1px solid ${C.border}`, transition: 'background .12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${C.orange} 10%, transparent)`}
                    onMouseLeave={e => e.currentTarget.style.background = data.nakliyeTur === nt.label ? `color-mix(in srgb, ${C.orange} 15%, transparent)` : 'transparent'}
                  ><span>{'\uD83D\uDE9A'}</span><span>{nt.label}</span>
                    {data.nakliyeTur === nt.label && <span style={{ marginLeft: 'auto', color: C.mint }}>{'\u2713'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* YM/Urun alt kalem listesi */}
        {isCompound && subItems.length > 0 && (
          <div style={{ marginTop: 6, padding: '5px 0 2px', borderTop: `1px solid color-mix(in srgb, ${renk} 10%, transparent)` }}>
            <div style={{ fontSize: 7, color: C.muted, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 3, textTransform: 'uppercase' }}>Gerekenler:</div>
            {subItems.map((si, i) => {
              const matched = matchedIds.has(si.kalemId);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '1.5px 0', fontSize: 8, lineHeight: 1.3 }}>
                  <span style={{ color: matched ? C.mint : C.muted, fontSize: 9, fontWeight: 700, width: 11, textAlign: 'center', textShadow: matched ? `0 0 6px ${C.mint}44` : 'none' }}>
                    {matched ? '\u2714' : '\u25CB'}
                  </span>
                  <span style={{ color: matched ? C.text : C.sub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{si.label}</span>
                  <span style={{ color: C.muted, fontSize: 7, flexShrink: 0 }}>{si.miktar}{si.birim ? ` ${si.birim}` : ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ width: 9, height: 9, background: renk, border: `2px solid ${C.s2}`, borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ width: 9, height: 9, background: renk, border: `2px solid ${C.s2}`, borderRadius: '50%' }} />
    </div>
  );
}

const nodeTypes = { bomNode: BomNode };

/* ═══════════════════════════════════════════
   Swimlane
   ═══════════════════════════════════════════ */
function SwimlaneBg({ isDark }) {
  const disColor = isDark ? 'rgba(62,123,212,.03)' : 'rgba(62,123,212,.04)';
  const icColor  = isDark ? 'rgba(232,145,74,.03)' : 'rgba(232,145,74,.04)';
  const lineColor = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
  const txtColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)';
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, display: 'flex' }}>
      <div style={{ flex: 1, background: disColor }} />
      <div style={{ width: 1, background: `linear-gradient(180deg, transparent 5%, ${lineColor} 20%, ${lineColor} 80%, transparent 95%)` }} />
      <div style={{ flex: 1, background: icColor }} />
      <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 10, fontWeight: 700, color: txtColor, fontFamily: F, letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none' }}>{'\u2190'} Dis Operasyonlar</div>
      <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 10, fontWeight: 700, color: txtColor, fontFamily: F, letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none' }}>Ic Uretim {'\u2192'}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Bounded BFS Validation
   ═══════════════════════════════════════════
   Her YM/Urun icin: geriye dogru tum zinciri tara ama
   baska YM/Urun'a ulasinca ONU kalemId olarak say ve DUR
   (onun ic zincirine girme). Nakliye/Iscilik/Fason koproden gec.
   ═══════════════════════════════════════════ */
function validateGraph(nodes, edges, yarimamulList, urun) {
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });
  const adj = {}; // target -> [source]
  edges.forEach(e => { (adj[e.target] = adj[e.target] || []).push(e.source); });

  const nodeResults = {};
  const edgeResults = {};

  nodes.forEach(n => {
    const bt = n.data?.bomTip;
    if (bt !== 'yarimamul' && bt !== 'urun') return;

    // BOM'u al
    let bom = [];
    if (bt === 'urun') bom = urun?.bom || [];
    else {
      const ym = yarimamulList.find(y => y.id === n.data.kalemId);
      bom = ym?.bom || [];
    }
    if (!bom.length) return;
    const bomKalemIds = new Set(bom.map(b => b.kalemId));

    // Bounded BFS: geriye git, YM/Urun sinirinda dur
    const visited = new Set();
    const queue = [n.id];
    const collectedKalemIds = new Set();
    const edgeStatuses = {}; // edgeId -> 'ok'|'fail'

    while (queue.length) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      (adj[cur] || []).forEach(srcId => {
        const src = nodeMap[srcId];
        if (!src) return;
        const srcBt = src.data?.bomTip;
        const srcKalem = src.data?.kalemId;
        const edgeId = edges.find(e => e.source === srcId && e.target === cur)?.id;

        if (srcBt === 'nakliye') {
          // Nakliye = kopru, devam et
          if (edgeId) edgeStatuses[edgeId] = 'ok';
          queue.push(srcId);
        } else if (srcBt === 'yarimamul' || srcBt === 'urun') {
          // Baska YM/Urun = sinir, kalemId'yi al ama icine girme
          if (srcKalem) collectedKalemIds.add(srcKalem);
          if (edgeId) edgeStatuses[edgeId] = srcKalem && bomKalemIds.has(srcKalem) ? 'ok' : 'fail';
          // DURMA — icine girme
        } else {
          // HM, Iscilik, Fason = kalemId'yi al ve devam et
          if (srcKalem) collectedKalemIds.add(srcKalem);
          if (edgeId) edgeStatuses[edgeId] = srcKalem && bomKalemIds.has(srcKalem) ? 'ok' : 'fail';
          queue.push(srcId);
        }
      });
    }

    if (collectedKalemIds.size === 0) return;

    // Matched kalemler
    const matchedIds = new Set();
    let allOk = true;
    collectedKalemIds.forEach(kid => {
      if (bomKalemIds.has(kid)) matchedIds.add(kid);
      else allOk = false;
    });

    nodeResults[n.id] = { status: allOk ? 'ok' : (matchedIds.size > 0 ? 'ok' : 'fail'), matchedKalemIds: matchedIds };

    // Edge sonuclari
    Object.assign(edgeResults, edgeStatuses);

    // Kaynak node'lari isaretle
    collectedKalemIds.forEach(kid => {
      const srcNode = nodes.find(nd => nd.data?.kalemId === kid);
      if (srcNode && !nodeResults[srcNode.id]) {
        nodeResults[srcNode.id] = { status: bomKalemIds.has(kid) ? 'ok' : 'fail', matchedKalemIds: new Set() };
      }
    });
  });

  return { nodeResults, edgeResults };
}

/* ═══════════════════════════════════════════
   InnerFlow
   ═══════════════════════════════════════════ */
function InnerFlow({ urun, setUrunler, bomPalette, yarimamulList, allKalemler }) {
  const harita = urun?.akisHaritasi || { nodes: [], edges: [] };
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(harita.nodes.map(n => ({ ...n, type: 'bomNode' })));
  const [edges, setEdges, onEdgesChange] = useEdgesState(harita.edges || []);
  const [vNodes, setVNodes] = useState({});
  const [vEdges, setVEdges] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef(null);
  const lastSyncRef = useRef('');

  // ── Firestore'dan gelen veri degisince senkronize et (duzenleme disinda) ──
  useEffect(() => {
    if (isEditing) return;
    const key = JSON.stringify(harita);
    if (key === lastSyncRef.current) return;
    lastSyncRef.current = key;
    setNodes(harita.nodes.map(n => ({ ...n, type: 'bomNode' })));
    setEdges(harita.edges || []);
  }, [harita, isEditing, setNodes, setEdges]);

  // Paletten gizle
  const usedBomIds = useMemo(() => new Set(nodes.map(n => n.data?.bomId).filter(Boolean)), [nodes]);
  const filteredPalette = useMemo(() => bomPalette.filter(it => !usedBomIds.has(it.bomId)), [bomPalette, usedBomIds]);

  // ── Kaydet (sadece butonla) ──
  const kaydet = useCallback(() => {
    if (!urun?.id) return;
    setUrunler(prev => prev.map(u =>
      u.id === urun.id ? { ...u, akisHaritasi: {
        nodes: nodes.map(n => ({
          id: n.id, type: 'bomNode', position: n.position,
          data: { ...n.data, _v: undefined, _subItems: undefined, _matchedKalemIds: undefined, _onNakliyeSec: undefined },
        })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
      }} : u
    ));
  }, [urun?.id, nodes, edges, setUrunler]);

  // ── Validation ──
  const runValidation = useCallback(() => {
    const { nodeResults, edgeResults } = validateGraph(nodes, edges, yarimamulList, urun);
    setVNodes(nodeResults);
    setVEdges(edgeResults);
  }, [nodes, edges, yarimamulList, urun]);

  // Her edge/node degisiminde validation calistir
  useEffect(() => { runValidation(); }, [nodes, edges, runValidation]);

  // ── Nakliye handlers ──
  const onNakliyeSec = useCallback((nodeId, turLabel) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, nakliyeTur: turLabel } } : n));
  }, [setNodes]);

  // ── Otomatik Akis Olustur ──
  // 5 katmanli layout: HM → Iscilik/Fason(YM) → YM → Iscilik/Fason(Urun) → Urun
  // Hammaddeler iscilik/fasondan SUZULEREK yari mamule donusur
  const otomatikAkisOlustur = useCallback(() => {
    if (!urun?.bom?.length) return;

    const N = []; // nodes
    const E = []; // edges
    const idOf = {}; // kalemId -> nodeId (tekrar onleme)
    const edgeSet = new Set(); // tekrar edge onleme
    const ROW = 80;
    // 5 katman x pozisyonlari
    const X = { hm: 60, ymSvc: 280, ym: 520, urunSvc: 740, urun: 960 };
    const rows = { hm: 0, ymSvc: 0, ym: 0, urunSvc: 0 };

    // Helper: node olustur (tekrar varsa mevcut id dondur)
    const mk = (kalemId, bomId, bomTip, label, ikon, renk, miktar, birim, col, rowKey) => {
      if (idOf[kalemId]) return idOf[kalemId];
      const id = nid();
      idOf[kalemId] = id;
      N.push({ id, type: 'bomNode', position: { x: col, y: 50 + rows[rowKey] * ROW }, data: { bomId, kalemId, bomTip, label, ikon, renk, miktar, birim } });
      rows[rowKey]++;
      return id;
    };
    const edge = (src, tgt) => {
      const key = `${src}_${tgt}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      E.push({ id: `e_${key}`, source: src, target: tgt });
    };
    const resolveTip = (b, k) => {
      if (b.tip === 'hizmet') return k.tip === 'fason' ? 'hizmet_fason' : 'hizmet_ic';
      return b.tip;
    };

    const urunBom = urun.bom || [];

    // ══════ ADIM 1: YM'leri isle ══════
    urunBom.forEach(b => {
      if (b.tip !== 'yarimamul') return;
      const kalem = allKalemler.find(x => x.id === b.kalemId);
      if (!kalem) return;

      // YM node (Col 3)
      const ymId = mk(b.kalemId, b.id, 'yarimamul', kalem.ad || '?', TIP.yarimamul.ikon, TIP.yarimamul.renk, b.miktar, b.birim, X.ym, 'ym');

      // YM'nin ic BOM'unu ac
      const ym = yarimamulList.find(y => y.id === b.kalemId);
      if (!ym?.bom) return;

      // Ic BOM'u kategorize et
      const icHm = [];   // hammaddeler
      const icSvc = [];   // iscilik/fason
      ym.bom.forEach(ib => {
        const ik = allKalemler.find(x => x.id === ib.kalemId);
        if (!ik) return;
        const bt = resolveTip(ib, ik);
        if (bt === 'hammadde') icHm.push({ ...ib, _k: ik, _bt: bt });
        else icSvc.push({ ...ib, _k: ik, _bt: bt });
      });

      // Iscilik/Fason node'lari olustur (Col 2: ymSvc)
      const svcIds = icSvc.map(s => {
        const m = TIP[s._bt] || TIP.hizmet_ic;
        return mk(s.kalemId, s.id, s._bt, s._k.ad || '?', m.ikon, m.renk, s.miktar, s.birim, X.ymSvc, 'ymSvc');
      });

      // HM node'lari olustur (Col 1)
      const hmIds = icHm.map(h => {
        const m = TIP.hammadde;
        return mk(h.kalemId, h.id, 'hammadde', h._k.ad || '?', m.ikon, m.renk, h.miktar, h.birim, X.hm, 'hm');
      });

      if (svcIds.length > 0) {
        // HM → Iscilik/Fason → YM (suzulerek gecer)
        hmIds.forEach(hid => svcIds.forEach(sid => edge(hid, sid)));
        svcIds.forEach(sid => edge(sid, ymId));
      } else {
        // Iscilik yoksa HM dogrudan YM'ye
        hmIds.forEach(hid => edge(hid, ymId));
      }
    });

    // ══════ ADIM 2: Urunun dogrudan kalemleri ══════
    const urunHm = [];
    const urunSvc = [];
    const urunYmIds = [];

    urunBom.forEach(b => {
      if (b.tip === 'yarimamul') {
        if (idOf[b.kalemId]) urunYmIds.push(idOf[b.kalemId]);
        return;
      }
      const kalem = allKalemler.find(x => x.id === b.kalemId);
      if (!kalem) return;
      const bt = resolveTip(b, kalem);
      if (bt === 'hammadde') urunHm.push({ ...b, _k: kalem, _bt: bt });
      else urunSvc.push({ ...b, _k: kalem, _bt: bt });
    });

    // Urun seviyesi iscilik/fason (Col 4: urunSvc)
    const urunSvcIds = urunSvc.map(s => {
      const m = TIP[s._bt] || TIP.hizmet_ic;
      return mk(s.kalemId, s.id, s._bt, s._k.ad || '?', m.ikon, m.renk, s.miktar, s.birim, X.urunSvc, 'urunSvc');
    });

    // Urun seviyesi dogrudan HM (Col 1)
    const urunHmIds = urunHm.map(h => {
      const m = TIP.hammadde;
      return mk(h.kalemId, h.id, 'hammadde', h._k.ad || '?', m.ikon, m.renk, h.miktar, h.birim, X.hm, 'hm');
    });

    // ══════ ADIM 3: Nihai urun node (Col 5) ══════
    const maxR = Math.max(rows.hm, rows.ymSvc, rows.ym, rows.urunSvc, 1);
    const urunNodeId = nid();
    N.push({
      id: urunNodeId, type: 'bomNode',
      position: { x: X.urun, y: 50 + Math.floor((maxR - 1) / 2) * ROW },
      data: { bomId: `urun_${urun.id}`, kalemId: urun.id, bomTip: 'urun', label: urun.ad || 'Urun', ikon: TIP.urun.ikon, renk: TIP.urun.renk },
    });

    // ══════ ADIM 4: Edge'ler ══════
    if (urunSvcIds.length > 0) {
      // YM'ler → urun iscilikler → Urun
      urunYmIds.forEach(yid => urunSvcIds.forEach(sid => edge(yid, sid)));
      urunSvcIds.forEach(sid => edge(sid, urunNodeId));
      // Dogrudan HM → urun iscilikler
      urunHmIds.forEach(hid => urunSvcIds.forEach(sid => edge(hid, sid)));
    } else {
      // Iscilik yoksa YM + HM dogrudan Urun'e
      urunYmIds.forEach(yid => edge(yid, urunNodeId));
      urunHmIds.forEach(hid => edge(hid, urunNodeId));
    }

    setNodes(N);
    setEdges(E);
    setIsEditing(true);
  }, [urun, allKalemler, yarimamulList, setNodes, setEdges]);

  // ── YM/Urun sub-items ──
  const subItemsMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => {
      const bt = n.data?.bomTip;
      if (bt !== 'yarimamul' && bt !== 'urun') return;
      let bom = [];
      if (bt === 'urun') bom = urun?.bom || [];
      else { const ym = yarimamulList.find(y => y.id === n.data.kalemId); bom = ym?.bom || []; }
      map[n.id] = bom.map(b => { const k = allKalemler.find(x => x.id === b.kalemId); return { kalemId: b.kalemId, label: k?.ad || '?', miktar: b.miktar, birim: b.birim }; });
    });
    return map;
  }, [nodes, urun?.bom, yarimamulList, allKalemler]);

  // ── Enriched nodes ──
  const nodesEnriched = useMemo(() => nodes.map(n => {
    const vr = vNodes[n.id];
    return { ...n, data: { ...n.data, _v: vr?.status || null, _subItems: subItemsMap[n.id] || [], _matchedKalemIds: vr?.matchedKalemIds || new Set(), _onNakliyeSec: onNakliyeSec } };
  }), [nodes, vNodes, subItemsMap, onNakliyeSec]);

  // ── Enriched edges ──
  const edgesStyled = useMemo(() => edges.map(e => {
    const st = vEdges[e.id];
    const clr = st === 'ok' ? C.mint : st === 'fail' ? C.coral : C.cyan;
    return { ...e, className: st === 'ok' ? 'edge-ok' : st === 'fail' ? 'edge-fail' : '', animated: true, style: { stroke: clr, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: clr, width: 16, height: 16 } };
  }), [edges, vEdges]);

  // ── Flow callbacks (sadece editing modda) ──
  const onConnect = useCallback((params) => {
    if (!isEditing) return;
    const eid = `e_${params.source}_${params.target}`;
    setEdges(eds => addEdge({ ...params, id: eid }, eds));
  }, [isEditing, setEdges]);

  const handleNodesChange = useCallback((changes) => {
    if (!isEditing) {
      // Sadece selection degisikliklerine izin ver
      const safe = changes.filter(c => c.type === 'select' || c.type === 'reset');
      if (safe.length > 0) onNodesChange(safe);
      return;
    }
    onNodesChange(changes);
  }, [isEditing, onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    if (!isEditing) {
      const safe = changes.filter(c => c.type === 'select' || c.type === 'reset');
      if (safe.length > 0) onEdgesChange(safe);
      return;
    }
    onEdgesChange(changes);
  }, [isEditing, onEdgesChange]);

  const onDragOver = useCallback((e) => { if (!isEditing) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, [isEditing]);

  const onDrop = useCallback((e) => {
    if (!isEditing) return;
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/akis-bom');
    if (!raw) return;
    const item = JSON.parse(raw);
    // Nakliye: her drop'ta benzersiz bomId olustur (sinirsiz ekleme)
    if (item.bomTip === 'nakliye') item.bomId = `nakliye_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes(nds => [...nds, { id: nid(), type: 'bomNode', position: pos, data: item }]);
  }, [isEditing, screenToFlowPosition, setNodes]);

  const onNodesDelete = useCallback((deleted) => {
    if (!isEditing) return;
    const ids = new Set(deleted.map(n => n.id));
    setEdges(eds => eds.filter(e => !ids.has(e.source) && !ids.has(e.target)));
  }, [isEditing, setEdges]);

  const onEdgesDelete = useCallback(() => {}, []);

  // ── Eksik baglanti kontrolu ──
  const eksikKontrol = useMemo(() => {
    const eksikler = [];
    nodes.forEach(n => {
      const bt = n.data?.bomTip;
      if (bt !== 'yarimamul' && bt !== 'urun') return;
      const si = subItemsMap[n.id] || [];
      if (si.length === 0) return;
      const matched = vNodes[n.id]?.matchedKalemIds || new Set();
      const eksik = si.filter(s => !matched.has(s.kalemId));
      if (eksik.length > 0) eksikler.push({ label: n.data.label, eksik });
    });
    return eksikler;
  }, [nodes, subItemsMap, vNodes]);

  const [saveMsg, setSaveMsg] = useState(null);

  // ── Kaydet + Kapat ──
  const handleKaydet = useCallback(() => {
    if (eksikKontrol.length > 0) {
      const msg = eksikKontrol.map(e =>
        `${e.label}: ${e.eksik.map(x => x.label).join(', ')}`
      ).join('\n');
      setSaveMsg(msg);
      // Yine de kaydet — uyari bilgilendirme amacli
      kaydet();
      setTimeout(() => setSaveMsg(null), 6000);
    } else {
      kaydet();
      setIsEditing(false);
      setSaveMsg(null);
    }
  }, [kaydet, eksikKontrol]);

  // ── Temizle ──
  const tumuTemizle = useCallback(() => {
    setNodes([]); setEdges([]);
    setVNodes({}); setVEdges({});
  }, [setNodes, setEdges]);

  // ── Tema ──
  const isDark = C.bg.startsWith('#0') || C.bg.startsWith('#1');
  const bgColor = isDark ? '#08080D' : '#F0F2F5';
  const gridColor = isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.05)';
  const miniMapBg = isDark ? '#0E0E14' : '#E5E8ED';

  return (
    <div style={{
      background: `color-mix(in srgb, ${C.bg} 92%, transparent)`,
      border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
      display: 'flex', height: 'calc(100vh - 160px)', minHeight: 500,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
    }}>
      {/* ═══ SOL PALET (sadece editing modda gorunur) ═══ */}
      {isEditing && (
        <div style={{
          width: 210, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: `color-mix(in srgb, ${C.s2} 60%, transparent)`,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 2 }}>{'\uD83E\uDDE9'} BOM Paleti</div>
            <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.4 }}>Malzemeleri tuvale surukle</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
            {filteredPalette.length === 0 && bomPalette.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: C.muted, fontSize: 10, lineHeight: 1.5 }}>BOM recetesi bos.</div>
            ) : filteredPalette.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '18px 8px', color: C.mint, fontSize: 10 }}>{'\u2713'} Tum kalemler eklendi</div>
            ) : (
              Object.entries(filteredPalette.reduce((acc, it) => { (acc[TIP[it.bomTip]?.label || 'Diger'] = acc[TIP[it.bomTip]?.label || 'Diger'] || []).push(it); return acc; }, {}))
                .map(([gl, items]) => (
                  <div key={gl} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: C.muted, fontFamily: F, letterSpacing: '.6px', textTransform: 'uppercase', padding: '4px 4px 2px' }}>{gl} ({items.length})</div>
                    {items.map((it, i) => <PaletItem key={it.bomId || `${it.bomTip}_${i}`} item={it} />)}
                  </div>
                ))
            )}
          </div>
          {/* Nakliye surukle-birak (kaybolmaz, sinirsiz) */}
          <div style={{ padding: '6px 10px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: C.muted, fontFamily: F, letterSpacing: '.6px', textTransform: 'uppercase', padding: '4px 4px 2px' }}>Nakliye</div>
            <div
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('application/akis-bom', JSON.stringify({
                  bomId: `nakliye_${Date.now()}`, bomTip: 'nakliye',
                  label: 'Nakliye', ikon: TIP.nakliye.ikon, renk: TIP.nakliye.renk,
                }));
                e.dataTransfer.effectAllowed = 'move';
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={e => { e.currentTarget.style.opacity = '1'; }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 9px', marginBottom: 3, borderRadius: 9,
                background: `color-mix(in srgb, ${C.orange} 5%, transparent)`,
                border: `1px solid color-mix(in srgb, ${C.orange} 14%, transparent)`,
                cursor: 'grab', transition: 'all .15s', userSelect: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.orange} 14%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${C.orange} 35%, transparent)`; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.orange} 5%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${C.orange} 14%, transparent)`; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <span style={{ fontSize: 12 }}>{'\uD83D\uDE9A'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.text }}>Nakliye</div>
                <div style={{ fontSize: 7, color: C.muted }}>Sinirsiz eklenebilir</div>
              </div>
            </div>
          </div>
          {/* Temizle */}
          <div style={{ padding: '4px 10px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {nodes.length > 0 && (
              <button onClick={tumuTemizle} style={{ padding: '6px 10px', borderRadius: 8, width: '100%', background: `color-mix(in srgb, ${C.coral} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${C.coral} 18%, transparent)`, color: C.coral, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: FB }}>Tuvali Temizle</button>
            )}
          </div>
        </div>
      )}

      {/* ═══ SAG TUVAL ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.s2} 40%, transparent)`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15 }}>{'\uD83D\uDDFA\uFE0F'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: '-0.5px' }}>
              {urun?.ad || 'Urun'} — Uretim Akis Haritasi
            </div>
            <div style={{ fontSize: 9, color: C.muted }}>
              {isEditing ? 'Duzenleme modu aktif — surukle, bagla, kaydet' : 'Goruntuleme modu — duzenlemek icin butona tikla'}
            </div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 7, background: `color-mix(in srgb, ${C.cyan} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${C.cyan} 18%, transparent)`, fontSize: 9, color: C.cyan, fontWeight: 600, fontFamily: F }}>
            {nodes.length} dugum {'\u00B7'} {edges.length} ok
          </div>

          {/* Duzenle / Kaydet butonu */}
          {isEditing ? (
            <button onClick={handleKaydet} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: F, fontSize: 11, fontWeight: 700,
              background: `color-mix(in srgb, ${C.mint} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.mint} 30%, transparent)`,
              color: C.mint, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.mint} 22%, transparent)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.mint} 12%, transparent)`; }}
            >
              {'\u2714'} Kaydet
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: F, fontSize: 11, fontWeight: 700,
              background: `color-mix(in srgb, ${C.cyan} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.cyan} 25%, transparent)`,
              color: C.cyan, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.cyan} 20%, transparent)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.cyan} 10%, transparent)`; }}
            >
              {'\u270F\uFE0F'} Akisi Duzenle
            </button>
          )}

          {/* Otomatik Akis */}
          {!isEditing && nodes.length === 0 && urun?.bom?.length > 0 && (
            <button onClick={otomatikAkisOlustur} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: F, fontSize: 11, fontWeight: 700,
              background: `color-mix(in srgb, ${C.lav} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${C.lav} 25%, transparent)`,
              color: C.lav, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.lav} 20%, transparent)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${C.lav} 10%, transparent)`; }}
            >
              {'\u2728'} Otomatik Akis Olustur
            </button>
          )}
        </div>

        {/* Eksik baglanti uyarisi */}
        {saveMsg && (
          <div style={{
            padding: '10px 18px', borderBottom: `1px solid color-mix(in srgb, ${C.gold} 25%, transparent)`,
            background: `color-mix(in srgb, ${C.gold} 6%, transparent)`,
            fontSize: 10, color: C.gold, fontFamily: FB, lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {'\u26A0\uFE0F'} Eksik baglantilar var — kaydedildi ama tamamlanmadi:
              <button onClick={() => setSaveMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12 }}>{'\u2715'}</button>
            </div>
            {saveMsg.split('\n').map((line, i) => (
              <div key={i} style={{ paddingLeft: 8, color: C.sub }}>
                {'\u2022'} <span style={{ color: C.text, fontWeight: 600 }}>{line.split(':')[0]}</span>: <span style={{ color: C.coral }}>{line.split(':').slice(1).join(':')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div ref={wrapperRef} style={{ flex: 1, minHeight: 0, position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
          <SwimlaneBg isDark={isDark} />
          <ReactFlow
            nodes={nodesEnriched}
            edges={edgesStyled}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            nodesDraggable={isEditing}
            nodesConnectable={isEditing}
            elementsSelectable={true}
            fitView
            snapToGrid snapGrid={[20, 20]}
            deleteKeyCode={isEditing ? ['Delete', 'Backspace'] : []}
            edgesReconnectable={isEditing}
            connectionMode={ConnectionMode.Loose}
            proOptions={{ hideAttribution: true }}
            style={{ background: bgColor }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: C.cyan, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan },
              interactionWidth: 20,
            }}
          >
            <Background variant="dots" gap={20} size={1} color={gridColor} />
            <Controls style={{ background: isDark ? C.s3 : '#fff', border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }} showInteractive={false} />
            <MiniMap nodeStrokeWidth={3} nodeColor={n => n.data?.renk || C.cyan} maskColor={isDark ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.7)'} style={{ background: miniMapBg, border: `1px solid ${C.border}`, borderRadius: 10 }} />
          </ReactFlow>
        </div>

        {/* Footer */}
        <div style={{ padding: '7px 18px', borderTop: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.s2} 40%, transparent)`, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, fontFamily: FB }}>
          <span>{isEditing ? 'Delete/Backspace = sil \u00B7 Handle surukle = bagla' : 'Akisi Duzenle butonuna tikla'} {'\u00B7'} Sol = dis / Sag = ic</span>
          <span style={{ color: isEditing ? C.gold : C.mint, fontWeight: 600 }}>{isEditing ? 'Duzenleniyor...' : 'BOM dogrulama aktif'}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PaletItem
   ═══════════════════════════════════════════ */
function PaletItem({ item }) {
  const renk = item.renk || C.cyan;
  return (
    <div draggable
      onDragStart={e => { e.dataTransfer.setData('application/akis-bom', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'move'; e.currentTarget.style.opacity = '0.5'; }}
      onDragEnd={e => { e.currentTarget.style.opacity = '1'; }}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 9px', marginBottom: 3, borderRadius: 9, background: `color-mix(in srgb, ${renk} 5%, transparent)`, border: `1px solid color-mix(in srgb, ${renk} 14%, transparent)`, cursor: 'grab', transition: 'all .15s', userSelect: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${renk} 14%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${renk} 35%, transparent)`; e.currentTarget.style.transform = 'translateX(3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${renk} 5%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${renk} 14%, transparent)`; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <span style={{ fontSize: 12, flexShrink: 0 }}>{item.ikon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
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

  const bomPalette = useMemo(() => {
    const items = [];
    const seen = new Set();
    const explodeBom = (bom, depth) => {
      if (depth > 6 || !bom?.length) return;
      bom.forEach(b => {
        let kalem = allKalemler.find(x => x.id === b.kalemId || x.id === b.hizmetId);
        if (!kalem) kalem = { id: b.kalemId || b.hizmetId, ad: b.ad || b.hizmetAd || b.label || 'Bilinmeyen', tip: b.tip || 'hizmet' };
        const checkId = kalem.id || b.kalemId;
        if (seen.has(checkId)) return;
        seen.add(checkId);
        let bomTip = b.tip;
        if (b.tip === 'hizmet') bomTip = kalem.tip === 'fason' ? 'hizmet_fason' : 'hizmet_ic';
        const meta = TIP[bomTip] || TIP.hammadde;
        items.push({ bomId: b.id, kalemId: b.kalemId, bomTip, label: kalem.ad || kalem.kod || '?', ikon: meta.ikon, renk: meta.renk, miktar: b.miktar, birim: b.birim });
        if (b.tip === 'yarimamul') { const ym = yarimamulList.find(y => y.id === b.kalemId); if (ym?.bom) explodeBom(ym.bom, depth + 1); }
      });
    };
    explodeBom(urun?.bom || [], 0);
    if (urun) items.push({ bomId: `urun_${urun.id}`, kalemId: urun.id, bomTip: 'urun', label: urun.ad || urun.kod || 'Urun', ikon: TIP.urun.ikon, renk: TIP.urun.renk });
    return items;
  }, [urun?.bom, urun?.id, urun?.ad, allKalemler, yarimamulList]);

  return (
    <ReactFlowProvider>
      <InnerFlow urun={urun} setUrunler={setUrunler} bomPalette={bomPalette} yarimamulList={yarimamulList} allKalemler={allKalemler} />
    </ReactFlowProvider>
  );
}
