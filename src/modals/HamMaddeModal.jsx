import { useState, useMemo } from 'react';
import { C, F, FB, uid, fmt, BIRIM_GRUPLARI } from '../config/constants.js';
import { _netFiyat, boyUzunlukCmDuzelt } from '../engine/index.js';
import { Modal, Btn, SilButonu } from '../components/index.js';
import { Field, TextInp, NumInp } from '../components/FormElements.jsx';

// ── YÜCEL PROFİL & BORU FİYAT LİSTESİ ───────────────────────────────────────
const YUCEL_DATA = {
  "Profil": {
    "HR": {
      "15x15":              { "1.20":28.68, "1.50":34.50, "2.00":43.41 },
      "10x20":              { "1.20":28.68, "1.50":34.50, "2.00":43.41 },
      "16x16":                       { "2.00":39.59 },
      "20x20":      { "1.20":35.79, "1.40":40.05, "1.50":41.14, "1.90":48.15, "2.00":49.18, "2.50":64.41 },
      "10x30":      { "1.20":35.79, "1.40":40.05, "1.50":41.14, "1.90":48.15, "2.00":49.18, "2.50":64.41 },
      "15x25":      { "1.20":35.79, "1.40":40.05, "1.50":41.14, "1.90":48.15, "2.00":49.18, "2.50":64.41 },
      "15x30":                       { "2.00":49.55, "2.50":62.83 },
      "25x25":               { "1.20":44.95, "1.40":47.75, "1.50":49.73, "1.90":58.70, "2.00":59.23, "2.50":75.54, "3.00":89.35 },
      "20x30":               { "1.20":44.95, "1.40":47.75, "1.50":49.73, "1.90":58.70, "2.00":59.23, "2.50":75.54, "3.00":89.35 },
      "10x40":                       { "1.50":48.59, "2.00":55.54, "2.50":64.91, "3.00":82.28 },
      "15x40":               { "2.00":61.80, "2.50":79.89 },
      "20x35":               { "2.00":61.80, "2.50":79.89 },
      "25x35":                       { "2.00":66.66, "2.50":81.67 },
      "10x50":               { "2.00":67.31, "2.50":83.97 },
      "15x45":               { "2.00":67.31, "2.50":83.97 },
      "30x30":               { "1.20":53.42, "1.40":57.19, "1.50":59.29, "1.90":70.75, "2.00":72.92, "2.50":88.71, "3.00":106.34, "4.00":153.37 },
      "20x40":               { "1.20":53.42, "1.40":57.19, "1.50":59.29, "1.90":70.75, "2.00":72.92, "2.50":88.71, "3.00":106.34, "4.00":153.37 },
      "25x40":                       { "2.00":70.16, "2.50":87.50, "3.00":105.28, "4.00":125.27 },
      "30x40":                       { "1.20":63.07, "1.40":66.38, "1.50":68.55, "1.90":82.38, "2.00":84.81, "2.50":104.74, "3.00":123.89 },
      "35x35":               { "2.00":71.55, "2.50":88.46, "3.00":106.28, "4.00":129.86 },
      "20x50":               { "2.00":71.55, "2.50":88.46, "3.00":106.28, "4.00":129.86 },
      "25x50":                       { "2.00":82.27, "2.50":101.68, "3.00":121.66, "4.00":146.37 },
      "40x40":               { "1.20":72.12, "1.40":76.27, "1.50":78.47, "1.90":93.13, "2.00":95.62, "2.50":112.29, "3.00":134.46, "4.00":185.50 },
      "30x50":               { "1.20":72.12, "1.40":76.27, "1.50":78.47, "1.90":93.13, "2.00":95.62, "2.50":112.29, "3.00":134.46, "4.00":185.50 },
      "20x60":                       { "2.00":89.97, "2.50":109.93 },
      "45x45":      { "2.00":101.64, "2.50":123.22, "3.00":148.12, "4.00":174.76, "5.00":234.68, "6.00":292.31 },
      "30x60":      { "2.00":101.64, "2.50":123.22, "3.00":148.12, "4.00":174.76, "5.00":234.68, "6.00":292.31 },
      "40x50":      { "2.00":101.64, "2.50":123.22, "3.00":148.12, "4.00":174.76, "5.00":234.68, "6.00":292.31 },
      "50x50":               { "1.20":94.76, "1.50":100.02, "2.00":121.16, "2.50":141.68, "3.00":169.67, "4.00":173.68, "5.00":232.09, "6.00":287.41 },
      "40x60":               { "1.20":94.76, "1.50":100.02, "2.00":121.16, "2.50":141.68, "3.00":169.67, "4.00":173.68, "5.00":232.09, "6.00":287.41 },
      "30x70":                       { "1.50":96.86, "2.00":129.93, "2.50":156.04, "3.00":183.42, "4.00":243.12 },
      "20x80":                       { "2.00":113.70, "2.50":145.98, "3.00":163.95, "4.00":208.74 },
      "30x80":      { "2.00":129.30, "2.50":156.20, "3.00":187.26, "4.00":222.99, "5.00":291.94, "6.00":363.07 },
      "40x70":      { "2.00":129.30, "2.50":156.20, "3.00":187.26, "4.00":222.99, "5.00":291.94, "6.00":363.07 },
      "50x60":      { "2.00":129.30, "2.50":156.20, "3.00":187.26, "4.00":222.99, "5.00":291.94, "6.00":363.07 },
      "60x60":               { "1.50":114.97, "2.00":143.79, "2.50":172.66, "3.00":207.63, "4.00":212.02, "5.00":284.68, "6.00":357.78 },
      "40x80":               { "1.50":114.97, "2.00":143.79, "2.50":172.66, "3.00":207.63, "4.00":212.02, "5.00":284.68, "6.00":357.78 },
      "50x70":                       { "2.00":156.91, "3.00":187.52, "4.00":223.51, "5.00":299.04, "6.00":373.56 },
      "30x90":                       { "2.00":164.50, "3.00":203.25, "4.00":236.67 },
      "20x100":                      { "2.00":177.67 },
      "30x100":              { "2.00":149.42, "2.50":186.30, "3.00":225.22, "4.00":262.10, "5.00":339.70, "6.00":421.04 },
      "50x80":              { "2.00":149.42, "2.50":186.30, "3.00":225.22, "4.00":262.10, "5.00":339.70, "6.00":421.04 },
      "30x110":                      { "2.00":166.84 },
      "70x70": { "1.50":154.50, "2.00":181.89, "2.50":206.08, "3.00":245.63, "4.00":252.55, "5.00":334.75, "6.00":423.23, "8.00":548.27 },
      "50x90": { "1.50":154.50, "2.00":181.89, "2.50":206.08, "3.00":245.63, "4.00":252.55, "5.00":334.75, "6.00":423.23, "8.00":548.27 },
      "60x80": { "1.50":154.50, "2.00":181.89, "2.50":206.08, "3.00":245.63, "4.00":252.55, "5.00":334.75, "6.00":423.23, "8.00":548.27 },
      "40x100": { "1.50":154.50, "2.00":181.89, "2.50":206.08, "3.00":245.63, "4.00":252.55, "5.00":334.75, "6.00":423.23, "8.00":548.27 },
      "50x100":                      { "1.40":188.52, "2.00":181.14, "2.50":193.44, "3.00":263.88, "4.00":269.64, "5.00":351.76, "6.00":440.14, "8.00":557.19 },
      "75x75":                       { "2.00":203.39, "3.00":284.81 },
      "80x80":              { "2.00":175.72, "2.50":207.93, "3.00":280.06, "4.00":287.63, "5.00":377.05, "6.00":475.19, "8.00":575.95 },
      "60x100":              { "2.00":175.72, "2.50":207.93, "3.00":280.06, "4.00":287.63, "5.00":377.05, "6.00":475.19, "8.00":575.95 },
      "40x120":                      { "2.00":217.52, "3.00":254.29, "4.00":299.61, "5.00":395.58, "6.00":494.24 },
      "40x130":   { "3.00":288.43, "4.00":359.98, "5.00":481.94, "6.00":592.16 },
      "50x120":   { "3.00":288.43, "4.00":359.98, "5.00":481.94, "6.00":592.16 },
      "70x100":   { "3.00":288.43, "4.00":359.98, "5.00":481.94, "6.00":592.16 },
      "60x120":    { "2.00":234.56, "2.50":265.55, "3.00":326.67, "4.00":434.06, "5.00":534.41, "6.00":664.31 },
      "80x100":    { "2.00":234.56, "2.50":265.55, "3.00":326.67, "4.00":434.06, "5.00":534.41, "6.00":664.31 },
      "90x90":    { "2.00":234.56, "2.50":265.55, "3.00":326.67, "4.00":434.06, "5.00":534.41, "6.00":664.31 },
      "40x140":             { "4.00":368.11, "5.00":479.91, "6.00":594.89 },
      "70x110":             { "4.00":368.11, "5.00":479.91, "6.00":594.89 },
      "70x120":                      { "2.50":268.74, "3.00":328.69, "4.00":385.95 },
      "50x150":                      { "3.00":292.34, "4.00":334.17, "5.00":396.75, "6.00":517.82, "8.00":648.13, "10.00":773.17 },
      "60x140":                      { "3.00":320.96, "4.00":389.41, "5.00":512.95, "6.00":632.27, "8.00":818.51 },
      "100x100":            { "2.00":266.33, "2.50":303.30, "3.00":367.99, "4.00":483.20, "5.00":593.98, "6.00":726.52, "8.00":1007.76 },
      "80x120":            { "2.00":266.33, "2.50":303.30, "3.00":367.99, "4.00":483.20, "5.00":593.98, "6.00":726.52, "8.00":1007.76 },
      "80x140": { "4.00":437.01, "5.00":440.85, "6.00":575.79, "8.00":712.73, "10.00":855.81 },
      "110x110": { "4.00":437.01, "5.00":440.85, "6.00":575.79, "8.00":712.73, "10.00":855.81 },
      "100x120": { "4.00":437.01, "5.00":440.85, "6.00":575.79, "8.00":712.73, "10.00":855.81 },
      "120x120":            { "4.00":447.76, "5.00":580.69, "6.00":729.01, "8.00":885.61, "10.00":1229.48 },
      "80x160":            { "4.00":447.76, "5.00":580.69, "6.00":729.01, "8.00":885.61, "10.00":1229.48 },
      "100x150":                     { "5.00":486.49, "6.00":649.83, "8.00":807.49, "10.00":991.68 },
      "140x140":                     { "6.00":640.80, "8.00":751.44, "10.00":918.64 },
      "80x200":            { "6.00":649.08, "8.00":787.64, "10.00":959.27 },
      "100x180":            { "6.00":649.08, "8.00":787.64, "10.00":959.27 },
      "150x150":           { "4.00":660.67, "5.00":822.83, "6.00":1002.01, "8.00":1217.85, "10.00":1653.82 },
      "100x200":           { "4.00":660.67, "5.00":822.83, "6.00":1002.01, "8.00":1217.85, "10.00":1653.82 },
      "175x175":           { "6.00":887.73, "8.00":999.18, "10.00":1235.08 },
      "150x200":           { "6.00":887.73, "8.00":999.18, "10.00":1235.08 },
      "200x200":           { "4.00":1157.03, "5.00":1443.01, "6.00":1741.00, "8.00":2392.91, "10.00":3106.70 },
      "150x250":           { "4.00":1157.03, "5.00":1443.01, "6.00":1741.00, "8.00":2392.91, "10.00":3106.70 },
      "250x250":           { "8.00":1831.97, "10.00":2174.29 },
      "200x300":           { "8.00":1831.97, "10.00":2174.29 }
    },
    "CR": {
      "10x10":                       { "0.70":15.40, "0.80":16.37, "0.90":18.20, "1.00":19.68, "1.20":23.46 },
      "15x15":               { "0.70":18.70, "0.80":19.01, "0.90":21.20, "1.00":23.46, "1.20":27.87, "1.50":33.95, "2.00":40.53 },
      "10x20":               { "0.70":18.70, "0.80":19.01, "0.90":21.20, "1.00":23.46, "1.20":27.87, "1.50":33.95, "2.00":40.53 },
      "15x20":                       { "0.80":24.84, "0.90":26.07, "1.00":28.69, "1.20":34.09, "1.50":40.86 },
      "20x20":      { "0.70":23.29, "0.80":24.59, "0.90":27.73, "1.00":30.54, "1.20":36.29, "1.50":43.67, "2.00":57.23 },
      "10x30":      { "0.70":23.29, "0.80":24.59, "0.90":27.73, "1.00":30.54, "1.20":36.29, "1.50":43.67, "2.00":57.23 },
      "15x25":      { "0.70":23.29, "0.80":24.59, "0.90":27.73, "1.00":30.54, "1.20":36.29, "1.50":43.67, "2.00":57.23 },
      "15x30":                       { "1.00":35.73, "1.20":43.19, "1.50":51.72, "2.00":67.73 },
      "25x25":               { "0.70":28.84, "0.80":30.03, "0.90":33.97, "1.00":37.20, "1.20":45.07, "1.50":55.45, "2.00":71.88 },
      "20x30":               { "0.70":28.84, "0.80":30.03, "0.90":33.97, "1.00":37.20, "1.20":45.07, "1.50":55.45, "2.00":71.88 },
      "10x40":                       { "1.20":41.59, "1.50":47.09, "2.00":59.82 },
      "15x40":               { "0.80":44.71, "0.90":45.93, "1.00":54.01, "1.20":66.57, "1.50":83.80 },
      "20x35":               { "0.80":44.71, "0.90":45.93, "1.00":54.01, "1.20":66.57, "1.50":83.80 },
      "10x50":                       { "1.20":58.25, "1.50":74.94, "2.00":96.66 },
      "30x30":               { "0.70":36.89, "0.80":37.20, "0.90":40.51, "1.00":45.07, "1.20":53.38, "1.50":66.76, "2.00":87.09 },
      "20x40":               { "0.70":36.89, "0.80":37.20, "0.90":40.51, "1.00":45.07, "1.20":53.38, "1.50":66.76, "2.00":87.09 },
      "25x40":                       { "0.70":40.33, "0.80":40.68, "0.90":44.65, "1.00":49.40, "1.20":61.38, "1.50":74.31, "2.00":92.53 },
      "20x50":               { "0.90":50.99, "1.00":54.34, "1.20":65.17, "2.00":88.39 },
      "35x35":               { "0.90":50.99, "1.00":54.34, "1.20":65.17, "2.00":88.39 },
      "30x40":                       { "0.70":43.36, "0.80":48.43, "0.90":53.61, "1.00":63.03, "1.20":77.33, "2.00":104.12 },
      "25x50":                       { "0.80":59.74, "0.90":61.50, "1.00":75.61, "1.20":89.10, "2.00":114.88 },
      "40x40":               { "0.80":57.50, "0.90":62.01, "1.00":62.29, "1.20":72.06, "1.50":88.61, "2.00":115.86 },
      "30x50":               { "0.80":57.50, "0.90":62.01, "1.00":62.29, "1.20":72.06, "1.50":88.61, "2.00":115.86 },
      "20x60":               { "0.80":63.53, "0.90":71.89, "1.00":86.42, "2.00":124.89 },
      "25x55":               { "0.80":63.53, "0.90":71.89, "1.00":86.42, "2.00":124.89 },
      "45x45":      { "1.00":77.60, "1.20":87.45, "1.50":103.52, "2.00":134.90 },
      "30x60":      { "1.00":77.60, "1.20":87.45, "1.50":103.52, "2.00":134.90 },
      "40x50":      { "1.00":77.60, "1.20":87.45, "1.50":103.52, "2.00":134.90 },
      "50x50":               { "1.20":95.03, "1.50":110.78, "2.00":145.54 },
      "40x60":               { "1.20":95.03, "1.50":110.78, "2.00":145.54 },
      "30x70":                       { "0.90":91.19, "1.00":97.16, "1.20":115.19, "2.00":147.71 },
      "20x80":                       { "1.00":101.76, "1.20":119.33, "2.00":149.03 },
      "60x60":               { "1.20":116.03, "1.50":140.77, "2.00":185.33 },
      "40x80":               { "1.20":116.03, "1.50":140.77, "2.00":185.33 },
      "20x100":                      { "2.00":210.14 },
      "30x100":                      { "2.00":217.98 },
      "70x70": { "1.50":171.47, "2.00":216.54 },
      "60x80": { "1.50":171.47, "2.00":216.54 },
      "50x90": { "1.50":171.47, "2.00":216.54 },
      "40x100": { "1.50":171.47, "2.00":216.54 },
      "50x100":                      { "2.00":242.16 },
      "80x80":              { "2.00":266.52 },
      "60x100":              { "2.00":266.52 },
      "40x120":                      { "2.00":274.69 },
      "90x90":    { "2.00":285.62 },
      "60x120":    { "2.00":285.62 },
      "80x100":    { "2.00":285.62 }
    }
  },
  "Boru": {
    "HR": {
      "13":{ "1.50":27.33 },"16":{ "1.50":30.85 },"17":{ "1.50":33.00, "2.00":41.61 },
      "18":{ "1.50":34.88 },"19":{ "1.40":35.03, "1.50":36.55, "2.00":41.02 },
      "20":{ "1.50":38.43, "2.00":45.95 },
      "21.3":{ "1.50":38.50, "1.90":45.66, "2.00":47.03, "2.50":56.49 },
      "22":{ "1.50":41.71, "2.00":51.70, "3.00":65.64 },
      "25":{ "1.50":42.76, "2.00":51.90, "2.50":65.41, "3.00":77.23 },
      "26.9":{ "1.50":45.05, "1.90":53.39, "2.00":53.63, "2.40":62.45, "2.50":64.37, "3.00":75.75 },
      "28":{ "1.50":48.54, "2.00":62.55 },"30":{ "1.50":53.20, "2.00":66.76 },
      "32":{ "1.50":51.93, "1.90":62.35, "2.00":63.08, "2.50":78.17, "3.00":93.26 },
      "33.7":{ "1.50":55.08, "1.90":66.14, "2.00":66.48, "2.40":77.78, "2.50":80.14, "3.00":94.78, "3.20":106.86, "4.00":132.36 },
      "35":{ "1.50":63.65, "2.00":76.58, "3.00":90.24 },
      "38":{ "1.50":63.76, "2.00":77.90, "3.00":93.96, "4.00":110.84, "6.00":151.65 },
      "40":{ "1.50":69.66, "2.00":88.71, "3.00":104.76, "4.00":123.42, "6.00":162.40 },
      "42.4":{ "1.40":67.81, "1.50":69.40, "1.90":83.52, "2.00":85.76, "2.50":101.25, "3.00":119.00, "3.20":147.66, "4.00":163.23 },
      "45":{ "1.50":75.67, "2.00":92.94, "3.00":112.87, "4.00":133.89 },
      "48.3":{ "1.40":75.97, "1.50":78.01, "1.90":92.61, "2.00":96.88, "2.40":111.40, "2.50":114.85, "3.00":135.87, "3.20":172.56, "4.00":188.78, "5.00":235.49 },
      "50":{ "1.50":85.32, "2.00":103.92, "3.00":123.41, "4.00":146.80, "6.00":203.07, "8.00":256.03 },
      "51":{ "1.50":85.77, "1.90":101.74, "2.00":104.86, "2.40":121.75, "2.50":125.52, "3.00":149.04, "3.20":163.20, "5.00":203.43, "8.00":257.23 },
      "57":{ "1.50":106.70, "2.00":128.28, "3.00":154.21, "4.00":182.92, "6.00":240.95, "8.00":300.06 },
      "60.3":{ "1.50":99.77, "1.90":116.89, "2.00":120.67, "2.40":142.49, "2.50":145.96, "3.00":172.01, "3.20":217.81, "4.00":229.62, "5.00":293.16 },
      "63":{ "2.50":142.55, "3.00":171.15, "4.00":203.66, "8.00":339.09 },
      "63.5":{ "3.20":203.87, "6.00":262.81, "8.00":340.17 },
      "70":{ "1.50":128.24, "2.00":156.95, "3.00":188.93, "4.00":224.39, "6.00":296.29, "8.00":370.30 },
      "76.1":{ "1.50":127.72, "2.00":153.63, "2.40":181.14, "2.50":186.15, "3.00":215.28, "3.20":275.65, "4.00":292.71, "5.00":372.73 },
      "88.9":{ "1.50":166.27, "2.00":186.56, "2.50":219.67, "3.00":261.33, "4.00":342.76, "5.00":438.55, "6.00":567.35 },
      "101.6":{ "2.50":215.96, "3.00":261.36, "4.00":311.91, "5.00":380.95, "6.00":410.29, "8.00":520.50, "10.00":630.79 },
      "108":{ "2.50":252.05, "3.00":299.86, "4.00":352.41, "6.00":463.87, "8.00":572.94, "10.00":705.51 },
      "114.3":{ "2.00":241.08, "2.50":285.62, "3.00":339.96, "4.00":449.44, "5.00":565.21, "6.00":700.90, "6.30":770.82 },
      "127":{ "3.00":364.82, "4.00":391.65, "5.00":516.58, "6.00":641.82, "8.00":782.39, "10.00":1063.29 },
      "139.7":{ "3.00":372.81, "4.00":433.45, "5.00":569.90, "6.00":708.44, "6.30":861.17, "8.00":1219.03 },
      "150":{ "4.00":498.46, "8.00":660.41 },
      "152":{ "2.50":428.98, "3.00":498.62, "6.00":681.02, "8.00":821.74 },
      "156":{ "4.00":699.73, "6.00":845.23, "8.00":1044.31, "10.00":1434.03 },
      "159":{ "3.00":544.05, "5.00":702.99, "6.00":875.03, "8.00":1064.44 },
      "168.3":{ "4.00":557.45, "5.00":697.94, "6.00":867.00, "6.30":1061.95, "8.00":1440.91 },
      "191":{ "3.00":697.39, "5.00":886.92, "6.00":1061.19, "8.00":1275.22, "10.00":1810.33 },
      "219.1":{ "4.00":803.24, "5.00":963.76, "6.00":1188.25, "6.30":1436.39, "8.00":1986.49 },
      "273":{ "4.00":1263.52, "6.00":1539.31, "8.00":1910.51, "10.00":2626.40 },
      "323.3":{ "6.00":1869.97, "8.00":2267.62, "10.00":3166.32 }
    },
    "CR": {
      "8":{ "0.70":13.63, "0.80":13.93, "0.90":15.78, "1.00":17.81, "1.20":20.15, "1.50":23.94 },
      "9":{ "0.80":18.03 },
      "10":{ "0.60":13.45, "0.70":13.93, "0.80":14.42, "0.90":16.41, "1.00":18.29, "1.20":21.32, "1.50":25.29 },
      "12":{ "1.00":20.22, "1.50":27.66, "2.00":34.05 },
      "13":{ "0.60":15.94, "0.70":16.24, "0.80":16.41, "0.90":17.34, "1.00":20.53, "1.20":24.47, "1.50":28.41, "2.00":43.65 },
      "14":{ "2.00":37.89 },
      "16":{ "0.60":18.03, "0.70":18.74, "0.80":19.48, "0.90":21.38, "1.00":22.95, "1.20":27.74, "1.50":32.49, "2.00":41.41 },
      "17":{ "2.00":43.78 },"18":{ "0.80":19.85, "1.00":23.82, "1.50":33.47 },
      "19":{ "0.60":18.70, "0.70":19.50, "0.80":20.04, "0.90":22.18, "1.00":24.82, "1.20":29.87, "1.50":36.90, "2.00":48.86 },
      "20":{ "1.00":26.93, "1.20":31.05, "1.50":38.45, "2.00":51.43 },
      "21":{ "0.60":18.89, "0.70":20.53, "0.80":21.81, "0.90":24.49, "1.00":27.16, "1.20":31.64, "1.50":38.59, "2.00":52.65 },
      "22":{ "0.70":21.87, "0.80":23.64, "0.90":26.43, "1.00":29.40, "1.20":34.62, "1.50":41.95, "2.00":55.64 },
      "25":{ "0.60":22.18, "0.70":24.45, "0.80":25.29, "0.90":28.51, "1.00":31.35, "1.20":37.87, "1.50":45.56, "2.00":62.54 },
      "25.4":{ "1.00":32.45, "1.20":40.39, "1.50":48.86, "2.00":64.68 },
      "27":{ "1.20":43.60, "1.50":50.33, "2.00":66.57 },
      "28":{ "0.70":27.36, "0.80":29.71, "0.90":34.30, "1.00":36.77, "1.20":44.80, "1.50":53.01, "2.00":70.74 },
      "28.6":{ "1.00":38.23, "1.20":46.29, "1.50":55.31, "2.00":73.41 },
      "30":{ "0.80":31.66, "0.90":35.74, "1.00":39.65, "1.20":47.60, "1.50":57.28, "2.00":76.70 },
      "32":{ "0.70":31.15, "0.80":32.10, "0.90":35.96, "1.00":39.92, "1.20":47.66, "1.50":57.35, "2.00":79.09 },
      "34":{ "1.20":52.14, "1.50":62.97, "2.00":83.06 },
      "35":{ "0.80":35.98, "0.90":40.68, "1.00":45.30, "1.20":54.84, "1.50":65.65, "2.00":84.03 },
      "38":{ "0.70":36.40, "0.80":38.60, "0.90":43.36, "1.00":47.92, "1.20":58.25, "1.50":69.74, "2.00":94.84 },
      "40":{ "0.90":47.09, "1.00":51.57, "1.20":62.48, "1.50":75.61, "2.00":99.11 },
      "42":{ "0.80":48.68, "0.90":48.90, "1.00":52.94, "1.20":64.14, "1.50":75.80, "2.00":104.54 },
      "45":{ "0.70":45.93, "0.80":52.20, "0.90":52.98, "1.00":57.30, "1.20":68.47, "1.50":82.87, "2.00":112.69 },
      "48":{ "1.00":62.66, "1.20":74.95, "1.50":90.75, "2.00":120.06 },
      "50":{ "1.20":79.78, "1.50":91.85, "2.00":128.16 },
      "51":{ "0.80":65.36, "0.90":66.46, "1.00":80.57, "1.20":96.19, "1.50":129.75 },
      "57":{ "1.00":82.51, "1.20":90.08, "1.50":110.11, "2.00":145.88 },
      "60":{ "1.00":88.78, "1.20":97.91, "1.50":116.96, "2.00":154.42 },
      "70":{ "1.50":136.49, "2.00":170.07 },
      "76":{ "1.20":124.47, "1.50":142.41, "2.00":185.36 },
      "89":{ "1.50":186.93, "2.00":219.20 },
      "101.6":{ "2.00":264.09 },"114":{ "2.00":292.95 }
    },
    "Galvanizli": {
      "21.3":{ "2.00":63.50 },"26.9":{ "2.00":80.00, "2.50":90.46, "3.00":106.08 },
      "33.7":{ "2.00":97.19, "2.50":113.67, "3.00":133.78 },
      "42.4":{ "2.00":122.89, "2.50":140.79, "3.00":166.60 },
      "48.3":{ "2.00":137.53, "2.50":158.69, "3.00":187.10 },
      "60.3":{ "2.00":173.54, "2.50":198.06, "3.00":235.37 },
      "76.1":{ "2.00":251.64, "2.50":300.45 },
      "88.9":{ "2.00":307.17, "2.50":367.70 },
      "114.3":{ "2.00":482.67 }
    }
  },
  "Oval Profil": {
    "Düz Oval (CR)": {
      "14x24":{ "0.70":24.92, "0.80":27.72, "0.90":29.89 },
      "15x30":{ "0.70":27.12, "0.80":29.18, "0.90":31.05, "1.00":34.09, "1.20":40.49, "1.50":47.87, "2.00":62.54 },
      "15x35":{ "0.80":33.49, "0.90":37.08, "1.00":37.44, "1.20":45.15, "1.50":54.32, "2.00":77.77 },
      "16x34":{ "1.50":56.27 },
      "16x40":{ "1.00":42.22, "1.20":50.50, "1.50":61.38, "2.00":81.24 },
      "20x40":{ "0.80":38.36, "0.90":41.55, "1.00":44.34, "1.20":53.04, "1.50":64.13, "2.00":85.01 },
      "20x50":{ "1.50":85.58, "2.00":108.16 },
      "25x50":{ "1.00":59.38, "1.20":66.15, "1.50":80.39, "2.00":108.28 },
      "25x55":{ "1.20":78.56, "1.50":96.31, "2.00":125.22 },
      "32x50":{ "1.20":71.33, "1.50":86.17, "2.00":114.03 }
    },
    "Düz Oval (HR)": { "32x50":{ "2.00":86.31, "3.00":106.37 } },
    "Elips (CR)": { "20x40":{ "0.80":40.00, "0.90":47.21, "1.00":53.04, "1.20":62.17, "1.50":82.09 } }
  },
  "Özel Ebat Profil": {
    "D Profil (CR)":          { "30x40":{ "0.80":54.58, "0.90":60.71, "1.00":65.18, "1.20":78.07, "1.50":112.75 } },
    "Göz Yaşı Damlası (CR)":  { "30x45":{ "0.80":53.62, "1.00":70.84 } },
    "Altıgen Profil (CR)":    { "18x56":{ "1.00":65.78 } },
    "Omega (HR)":             { "OMEGA":{ "2.00":219.25, "3.00":320.66 } }
  }
};
const YUCEL_CATS = Object.keys(YUCEL_DATA);

// ── PROFİL SİHİRBAZI ─────────────────────────────────────────────────────────
function ProfilSihirbazi({ onSec, onClose }) {
  const [aCins,   setACins]   = useState("Tümü");
  const [aMat,    setAMat]    = useState("Tümü");
  const [aEbat,   setAEbat]   = useState(null);
  const [aKal,    setAKal]    = useState(null);
  const [arama,   setArama]   = useState("");

  const CINSE = ["Tümü", ...YUCEL_CATS];

  const malzemeler = useMemo(() => {
    const s = new Set();
    const cins = aCins === "Tümü" ? YUCEL_CATS : [aCins];
    cins.forEach(c => Object.keys(YUCEL_DATA[c] || {}).forEach(m => s.add(m)));
    return ["Tümü", ...s];
  }, [aCins]);

  const ebatlar = useMemo(() => {
    let list = [];
    const cins = aCins === "Tümü" ? YUCEL_CATS : [aCins];
    cins.forEach(c => {
      const mats = aMat === "Tümü" ? Object.keys(YUCEL_DATA[c] || {}) : [aMat];
      mats.forEach(m => {
        if (YUCEL_DATA[c]?.[m]) {
          Object.keys(YUCEL_DATA[c][m]).forEach(e => list.push({ cat: c, mat: m, ebat: e }));
        }
      });
    });
    if (arama) {
      const t = arama.toLowerCase();
      list = list.filter(x => x.ebat.toLowerCase().includes(t));
    }
    return list;
  }, [aCins, aMat, arama]);

  const kalinliklar = useMemo(() => {
    if (!aEbat) return [];
    return Object.keys(YUCEL_DATA[aEbat.cat]?.[aEbat.mat]?.[aEbat.ebat] || {})
      .sort((a,b) => parseFloat(a) - parseFloat(b));
  }, [aEbat]);

  const listeFiyat = aEbat && aKal
    ? YUCEL_DATA[aEbat.cat][aEbat.mat][aEbat.ebat][aKal]
    : null;

  const handleSec = () => {
    if (!aEbat || !aKal || !listeFiyat) return;
    onSec({
      ad:       `${aEbat.cat} ${aEbat.mat} ${aEbat.ebat} – ${aKal}mm`,
      kategori: aEbat.cat,
      birimGrup:"uzunluk",
      birim:    "mt",
      listeFiyat: listeFiyat,
      iskonto:  0,
      kdv:      20,
      tedarikci:"Yücel Metal",
      _yucel:   { cat: aEbat.cat, mat: aEbat.mat, ebat: aEbat.ebat, kal: aKal }
    });
  };

  const tab = (label, active, onClick, col=C.cyan) => (
    <button onClick={onClick} style={{
      padding:"6px 12px", borderRadius:8, border:`1px solid ${active?col+"60":C.border}`,
      background: active ? `${col}12` : "rgba(255,255,255,.02)",
      color: active ? col : C.muted, fontSize:12, fontWeight: active?600:400,
      cursor:"pointer", fontFamily:FB, transition:"all .15s", whiteSpace:"nowrap"
    }}>{label}</button>
  );

  return (
    <div style={{background:C.s2, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden"}}>
      <div style={{padding:"12px 16px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"rgba(232,145,74,.05)"}}>
        <div style={{fontSize:13, fontWeight:700, color:C.cyan}}>🔩 Yücel Fiyat Listesi</div>
        {onClose && <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16}}>×</button>}
      </div>
      <div style={{padding:"14px 16px"}}>
        {/* Adım 1 – Cins */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.8,marginBottom:6}}>1 · ÜRÜN CİNSİ</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {CINSE.map(c => tab(c, aCins===c, ()=>{setACins(c);setAMat("Tümü");setAEbat(null);setAKal(null);}))}
          </div>
        </div>
        {/* Adım 2 – Malzeme */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.8,marginBottom:6}}>2 · MALZEME CİNSİ</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {malzemeler.map(m => tab(m, aMat===m, ()=>{setAMat(m);setAEbat(null);setAKal(null);}, C.sky))}
          </div>
        </div>
        {/* Adım 3 – Ebat Arama */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.8,marginBottom:6}}>3 · EBAT SEÇİMİ</div>
          <div style={{position:"relative",marginBottom:6}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.muted}}>🔍</span>
            <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Ebat ara... (örn: 15x30)"
              className="inp" style={{width:"100%",paddingLeft:30,background:"rgba(255,255,255,.04)",
                border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px 7px 28px",
                fontSize:12,color:C.text,boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:4,
            maxHeight:150,overflowY:"auto",background:"rgba(255,255,255,.02)",borderRadius:9,padding:6,
            border:`1px solid ${C.border}`}}>
            {ebatlar.map((obj,i) => {
              const sel = aEbat && aEbat.cat===obj.cat && aEbat.mat===obj.mat && aEbat.ebat===obj.ebat;
              return(
                <button key={i} onClick={()=>{setAEbat(obj);setAKal(null);}} style={{
                  padding:"5px 8px",borderRadius:7,border:`1px solid ${sel?C.mint+"60":C.border}`,
                  background:sel?`${C.mint}10`:"rgba(255,255,255,.02)",
                  color:sel?C.mint:C.sub,fontSize:11,fontWeight:sel?700:400,
                  cursor:"pointer",textAlign:"left",transition:"all .12s"}}>
                  <div style={{fontWeight:600,lineHeight:1.2}}>{obj.ebat}</div>
                  {(aCins==="Tümü"||aMat==="Tümü")&&
                    <div style={{fontSize:9,color:sel?C.mint:C.muted,marginTop:1}}>{obj.cat}·{obj.mat}</div>}
                </button>
              );
            })}
            {ebatlar.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"12px 0",fontSize:11,color:C.muted}}>Sonuç yok</div>}
          </div>
        </div>
        {/* Adım 4 – Et Kalınlığı */}
        <div style={{marginBottom:12, opacity: aEbat ? 1 : 0.35, pointerEvents: aEbat ? "auto" : "none"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.8,marginBottom:6}}>4 · ET KALINLIĞI (mm)</div>
          {!aEbat
            ? <div style={{fontSize:11,color:C.muted}}>Önce ebat seçin</div>
            : <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {kalinliklar.map(k => tab(`${k} mm`, aKal===k, ()=>setAKal(k), C.gold))}
              </div>}
        </div>
        {/* Fiyat özeti */}
        {listeFiyat && (
          <div style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:3}}>Liste Fiyat (₺/mt · KDV hariç)</div>
                <div style={{fontSize:22,fontWeight:800,color:C.cyan,fontFamily:F}}>{fmt(listeFiyat)}₺</div>
              </div>
              <div style={{fontSize:10,color:C.muted,textAlign:"right"}}>İskonto ve KDV bilgisini<br/>ham madde formunda gireceksiniz</div>
            </div>
          </div>
        )}
        {/* Ekle butonu */}
        <button onClick={handleSec} disabled={!listeFiyat} style={{
          width:"100%",padding:"10px",borderRadius:10,border:"none",cursor: listeFiyat?"pointer":"not-allowed",
          background: listeFiyat ? `linear-gradient(135deg,${C.cyan},${C.gold})` : "rgba(255,255,255,.06)",
          color: listeFiyat ? "#0C0800" : C.muted, fontWeight:700, fontSize:13, fontFamily:FB,
          transition:"all .2s", opacity: listeFiyat ? 1 : 0.5}}>
          {listeFiyat ? `✓ Ekle — ${fmt(listeFiyat)}₺/mt` : "Tüm adımları tamamlayın"}
        </button>
      </div>
    </div>
  );
}

const STANDART_KATALOGLAR = [
  { id:"metal", label:"Metal Profil & Boru", icon:"🔩", desc:"Yücel fiyat listesi — Profil, Boru, Oval Profil", renk:"#3E7BD4", tip:"yucel" },
];

export function HamMaddeModal({kalem,onClose,onSave,onDelete,onKopya,hamMaddeler=[],yarimamulList=[],hizmetler=[]}) {
  const isEdit=!!kalem?.id;
  const [adim,setAdim]=useState((isEdit||kalem?._kopya)?"form":"kategori-sec");
  // Modal açılınca _kdvDahilInput'u sıfırla — net her zaman hesaplansın
  const [f,setF]=useState(kalem ? {...kalem, _kdvDahilInput:undefined} : {kod:"",ad:"",kategori:"",birimGrup:"uzunluk",birim:"mt",boyUzunluk:null,miktar:0,minStok:0,listeFiyat:0,iskonto:0,kdv:20,tedarikci:"",notlar:"",
    // ── Tedarik & Sevkiyat ──
    sevkiyatYontemi:"tedarikci_getirir", tahminiTeslimGun:null, minSiparisMiktar:null, odemeVadesi:null,
    // ── Fason Yönlendirme ──
    fasona_gider_mi:false, fasonHedefId:null,
    // ── Nakliye Bilgileri ──
    nakliye:{varsayilanNakliyeci:"",nakliyeTel:"",ortalamaUcret:0,ortalamaYuk:0}
  });
  const [tedarikAcik,setTedarikAcik]=useState(!!(kalem?.sevkiyatYontemi&&kalem.sevkiyatYontemi!=="tedarikci_getirir")||!!(kalem?.fasona_gider_mi)||!!(kalem?.nakliye?.varsayilanNakliyeci));
  const up=(k,v)=>setF(p=>({...p,[k]:v}));

  // KURAL: listeFiyat HER ZAMAN TL/mt
  // birim="boy" → stok birimi, fiyat TL/mt cinsinden girilir
  const listeNetHm   = _netFiyat(f.listeFiyat||0, f.iskonto||0); // TL/mt KDV hariç
  const listeKdvliHm = listeNetHm * (1 + (f.kdv||0)/100);       // TL/mt KDV dahil
  const boyUzunlukHm = boyUzunlukCmDuzelt(f.boyUzunluk);
  // net: her zaman TL/mt (gösterim için)
  const net = f.birim==="cm"
    ? listeKdvliHm * 100   // TL/cm → TL/mt
    : listeKdvliHm;        // TL/mt (mt veya boy)
  const secilenGrup=BIRIM_GRUPLARI[f.birimGrup];

  const handleSihirbazSec=(secim)=>{
    setF(p=>({...p,ad:secim.ad,kategori:secim.kategori,birimGrup:secim.birimGrup,birim:secim.birim,
      listeFiyat:secim.listeFiyat,iskonto:secim.iskonto,kdv:secim.kdv,tedarikci:secim.tedarikci,_yucel:secim._yucel}));
    setAdim("form");
  };

  const modalW=adim==="yucel-sihirbaz"?640:adim==="kategori-sec"?520:600;

  const geriBtn=(hedef)=>(
    <button onClick={()=>setAdim(hedef)} style={{background:"transparent",border:"none",cursor:"pointer",
      color:C.muted,fontSize:12,marginBottom:12,padding:0,display:"flex",alignItems:"center",gap:4}}>
      ← Geri
    </button>
  );

  const title=isEdit?"Ham Madde Düzenle":f._kopya?"Ham Madde Kopyası":adim==="kategori-sec"?"Ham Madde Ekle":adim==="yucel-sihirbaz"?"🔩 Metal Profil & Boru Seç":"Ham Madde Ekle";

  return(
    <Modal title={title} onClose={onClose} width={modalW}>

      {/* ── ADIM 1: KATEGORİ SEÇ ── */}
      {adim==="kategori-sec"&&(
        <div>
          <p style={{fontSize:12,color:C.muted,marginBottom:16}}>Nasıl eklemek istiyorsunuz?</p>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>📚 Standart Kataloglar</div>
            {STANDART_KATALOGLAR.map(k=>(
              <button key={k.id} onClick={()=>setAdim(k.tip==="yucel"?"yucel-sihirbaz":"form")}
                style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",marginBottom:7,
                  background:`${k.renk}08`,border:`1px solid ${k.renk}30`,
                  borderRadius:12,cursor:"pointer",textAlign:"left",transition:"all .18s",width:"100%"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${k.renk}14`;e.currentTarget.style.borderColor=`${k.renk}55`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${k.renk}08`;e.currentTarget.style.borderColor=`${k.renk}30`;}}>
                <div style={{width:44,height:44,borderRadius:11,background:`${k.renk}18`,border:`1px solid ${k.renk}28`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{k.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F}}>{k.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{k.desc}</div>
                </div>
                <div style={{fontSize:18,color:k.renk,opacity:.6}}>→</div>
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{flex:1,height:1,background:C.border}}/>
            <div style={{fontSize:10,color:C.muted}}>veya</div>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>
          <button onClick={()=>setAdim("form")}
            style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",width:"100%",
              background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,
              borderRadius:12,cursor:"pointer",textAlign:"left",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor=C.borderHi;}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor=C.border;}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(255,255,255,.05)",
              border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>✏️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>Manuel Giriş</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Kumaş, sünger, aksesuar veya herhangi bir malzeme</div>
            </div>
            <div style={{fontSize:18,color:C.muted,opacity:.4}}>→</div>
          </button>
        </div>
      )}

      {/* ── ADIM 2a: YÜCEL SİHİRBAZI ── */}
      {adim==="yucel-sihirbaz"&&(
        <div>
          {geriBtn("kategori-sec")}
          <ProfilSihirbazi onSec={handleSihirbazSec} />
          <div style={{marginTop:8,textAlign:"center"}}>
            <button onClick={()=>setAdim("form")} style={{background:"none",border:"none",cursor:"pointer",
              color:C.muted,fontSize:11,textDecoration:"underline"}}>Listede yok, manuel girmek istiyorum</button>
          </div>
        </div>
      )}

      {/* ── FORM (yeni veya düzenleme) ── */}
      {adim==="form"&&(
        <>
          {!isEdit&&geriBtn("kategori-sec")}

          {f._yucel&&(
            <div style={{background:"rgba(62,123,212,.08)",border:"1px solid rgba(62,123,212,.25)",borderRadius:10,
              padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔩</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{f.ad}</div>
                <div style={{fontSize:10,color:C.muted}}>Yücel listesinden seçildi</div>
              </div>
              <button onClick={()=>setAdim("yucel-sihirbaz")}
                style={{background:"rgba(62,123,212,.14)",border:"1px solid rgba(62,123,212,.28)",borderRadius:7,
                  padding:"4px 10px",fontSize:10,color:"#3E7BD4",cursor:"pointer",whiteSpace:"nowrap"}}>Değiştir</button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Kod"><TextInp value={f.kod} onChange={v=>up("kod",v)} placeholder="PM-001"/></Field>
            <Field label="Kategori">
              <div style={{position:"relative"}}>
                <input value={f.kategori} onChange={e=>up("kategori",e.target.value)}
                  list="hm-kat-list" placeholder="Profil, Kumaş, Aksesuar..."
                  className="inp" style={{width:"100%",background:"rgba(255,255,255,.04)",
                  border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text}}/>
                <datalist id="hm-kat-list">
                  {[...new Set([...hamMaddeler.map(x=>x.kategori),...yarimamulList.map(x=>x.kategori)].filter(Boolean))].map(k=>(
                    <option key={k} value={k}/>
                  ))}
                </datalist>
              </div>
            </Field>
          </div>
          <Field label="Kalem Adı"><TextInp value={f.ad} onChange={v=>up("ad",v)} placeholder="Düz Oval Profil 20x40"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Birim Grubu">
              <select value={f.birimGrup} onChange={e=>{up("birimGrup",e.target.value);up("birim",BIRIM_GRUPLARI[e.target.value]?.birimler[0]?.id||"adet");}}
                style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
                {Object.entries(BIRIM_GRUPLARI).map(([k,g])=><option key={k} value={k} style={{background:C.s2}}>{g.label}</option>)}
              </select>
            </Field>
            <Field label="Birim">
              <select value={f.birim} onChange={e=>{
                const eskiBirim = f.birim;
                const yeniBirim = e.target.value;
                up("birim", yeniBirim);
                // listeFiyat HER ZAMAN TL/mt — birim değişince fiyat değişmez
                // (cm↔mt hariç: cm birimiyle çalışan istisnai durumlar)
                if(f.birimGrup==="uzunluk" && f.listeFiyat>0) {
                  if(eskiBirim==="cm" && yeniBirim==="mt") {
                    up("listeFiyat", Math.round(f.listeFiyat * 100 * 10000)/10000);
                  } else if(eskiBirim==="mt" && yeniBirim==="cm") {
                    up("listeFiyat", Math.round(f.listeFiyat / 100 * 10000)/10000);
                  }
                  // mt↔boy: fiyat değişmez (her zaman TL/mt)
                }
                up("_kdvDahilInput", undefined);
              }}
                style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
                {(secilenGrup?.birimler||[]).map(b=><option key={b.id} value={b.id} style={{background:C.s2}}>{b.label}</option>)}
              </select>
            </Field>
          </div>
          {f.birim==="boy"&&<Field label="Boy Uzunluğu (cm)"><NumInp value={f.boyUzunluk} onChange={v=>{up("boyUzunluk",v);up("_kdvDahilInput",undefined);}} step={1} width={140}/></Field>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Field label="Mevcut Miktar"><NumInp value={f.miktar} onChange={v=>up("miktar",v)} step={0.01} style={{width:"100%"}}/></Field>
            <Field label="Min Stok"><NumInp value={f.minStok} onChange={v=>up("minStok",v)} step={0.01} style={{width:"100%"}}/></Field>
            <Field label="KDV %">
              <select value={String(f.kdv)} onChange={e=>{
                const kdv=parseInt(e.target.value);
                up("kdv",kdv);
                up("_kdvDahilInput",undefined);
              }} style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
                {["0","10","20"].map(v=><option key={v} value={v} style={{background:C.s2}}>%{v}</option>)}
              </select>
            </Field>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Field label={`Liste Fiyat (₺/mt · KDV hariç)${f.birim==="boy"&&boyUzunlukHm>0?" · 1 boy="+boyUzunlukHm+"cm":""}`}>
              <div style={{display:"flex",gap:5}}>
                <NumInp value={f.listeFiyat} onChange={v=>{
                  const liste=parseFloat(v)||0;
                  up("listeFiyat",liste);
                  up("_kdvDahilInput",undefined); // net otomatik hesaplansın
                }} step={0.01} style={{flex:1}}/>
              </div>
            </Field>
            <Field label="İskonto %"><NumInp value={f.iskonto} onChange={v=>{
              up("iskonto",v);
              up("_kdvDahilInput",undefined);
            }} step={1} max={100} style={{width:"100%"}}/></Field>
            <Field label="Net Fiyat (₺/mt · KDV dahil)">
              <input type="number" step="0.0001"
                value={f._kdvDahilInput !== undefined ? f._kdvDahilInput : net || ""}
                onChange={e=>{
                  const v=e.target.value;
                  up("_kdvDahilInput",v);
                  const kdvliMt=parseFloat(v)||0;
                  if(kdvliMt>0){
                    const carpan=(1-(f.iskonto||0)/100)*(1+(f.kdv||0)/100);
                    up("listeFiyat", Math.round(kdvliMt/carpan*10000)/10000);
                  } else { up("listeFiyat",0); }
                }}
                onFocus={e=>e.target.select()}
                placeholder="KDV dahil metre fiyatı"
                style={{width:"100%",background:"rgba(232,145,74,.13)",border:"1px solid rgba(232,145,74,.35)",
                  borderRadius:9,padding:"9px 12px",fontSize:14,fontWeight:700,color:C.cyan,
                  outline:"none",boxSizing:"border-box"}}/>
            </Field>
          </div>
          <Field label="Tedarikçi"><TextInp value={f.tedarikci} onChange={v=>up("tedarikci",v)} placeholder="Firma adı"/></Field>

          {/* ── TEDARİK & SEVKİYAT BİLGİLERİ (Progressive Disclosure) ── */}
          <div style={{marginTop:6,marginBottom:6}}>
            <button onClick={()=>setTedarikAcik(p=>!p)}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",
                background:tedarikAcik?"rgba(62,123,212,.06)":"rgba(255,255,255,.02)",
                border:`1px solid ${tedarikAcik?"rgba(62,123,212,.25)":C.border}`,
                borderRadius:11,cursor:"pointer",transition:"all .2s"}}>
              <span style={{fontSize:14,transition:"transform .2s",transform:tedarikAcik?"rotate(90deg)":"rotate(0)"}}>{tedarikAcik?"▾":"▸"}</span>
              <span style={{fontSize:12,fontWeight:700,color:tedarikAcik?C.sky:C.sub,letterSpacing:.3}}>🚚 Tedarik & Sevkiyat Bilgileri</span>
              {(f.sevkiyatYontemi&&f.sevkiyatYontemi!=="tedarikci_getirir"||f.fasona_gider_mi||f.nakliye?.varsayilanNakliyeci)&&!tedarikAcik&&(
                <span style={{fontSize:9,background:`${C.sky}15`,color:C.sky,borderRadius:5,padding:"2px 7px",marginLeft:"auto"}}>Doldurulmuş</span>
              )}
            </button>

            {tedarikAcik&&(
              <div style={{background:"rgba(255,255,255,.015)",border:`1px solid ${C.border}`,borderTop:"none",
                borderRadius:"0 0 11px 11px",padding:"14px",display:"grid",gap:12}}>

                {/* Sevkiyat Yöntemi */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <Field label="Sevkiyat Yöntemi">
                    <select value={f.sevkiyatYontemi||"tedarikci_getirir"} onChange={e=>up("sevkiyatYontemi",e.target.value)}
                      style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
                      <option value="tedarikci_getirir" style={{background:C.s2}}>🏪 Tedarikçi getiriyor</option>
                      <option value="ben_alirim" style={{background:C.s2}}>🏃 Ben alıyorum</option>
                      <option value="nakliye" style={{background:C.s2}}>🚚 Nakliye ayarlıyorum</option>
                      <option value="kargo" style={{background:C.s2}}>📦 Kargo ile geliyor</option>
                    </select>
                  </Field>
                  <Field label="Tahmini Teslim (gün)">
                    <NumInp value={f.tahminiTeslimGun} onChange={v=>up("tahminiTeslimGun",v)} step={1} placeholder="3" style={{width:"100%"}}/>
                  </Field>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <Field label="Min Sipariş Miktarı (opsiyonel)">
                    <NumInp value={f.minSiparisMiktar} onChange={v=>up("minSiparisMiktar",v)} step={1} placeholder="—" style={{width:"100%"}}/>
                  </Field>
                  <Field label="Ödeme Vadesi (gün, opsiyonel)">
                    <NumInp value={f.odemeVadesi} onChange={v=>up("odemeVadesi",v)} step={1} placeholder="30" style={{width:"100%"}}/>
                  </Field>
                </div>

                {/* Fason Yönlendirme */}
                <div style={{background:f.fasona_gider_mi?"rgba(124,92,191,.06)":"rgba(255,255,255,.01)",
                  border:`1px solid ${f.fasona_gider_mi?"rgba(124,92,191,.25)":C.border}`,borderRadius:10,padding:"10px 13px"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:f.fasona_gider_mi?10:0}}>
                    <input type="checkbox" checked={!!f.fasona_gider_mi} onChange={e=>{
                      up("fasona_gider_mi",e.target.checked);
                      if(!e.target.checked) up("fasonHedefId",null);
                    }} style={{accentColor:C.lav,width:15,height:15}}/>
                    <span style={{fontSize:12,fontWeight:600,color:f.fasona_gider_mi?C.lav:C.sub}}>
                      🏭 Bu malzeme alındıktan sonra fasona gidecek
                    </span>
                  </label>
                  {f.fasona_gider_mi&&(
                    <div>
                      <Field label="Fason Firma / Hizmet">
                        <select value={f.fasonHedefId||""} onChange={e=>up("fasonHedefId",e.target.value||null)}
                          style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,cursor:"pointer"}}>
                          <option value="" style={{background:C.s2}}>— Seçiniz —</option>
                          {hizmetler.filter(h=>h.tip==="fason").map(h=>(
                            <option key={h.id} value={h.id} style={{background:C.s2}}>{h.ad} — {h.tip2||h.firma||""}</option>
                          ))}
                        </select>
                      </Field>
                      {f.fasonHedefId&&(()=>{
                        const fh=hizmetler.find(h=>h.id===f.fasonHedefId);
                        return fh?(
                          <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                            {fh.firma&&<span style={{fontSize:10,background:`${C.lav}12`,color:C.lav,borderRadius:5,padding:"2px 8px"}}>🏭 {fh.firma}</span>}
                            {fh.sureGun&&<span style={{fontSize:10,background:`${C.gold}12`,color:C.gold,borderRadius:5,padding:"2px 8px"}}>⏱ ~{fh.sureGun} gün</span>}
                            {fh.birimFiyat>0&&<span style={{fontSize:10,background:`${C.cyan}12`,color:C.cyan,borderRadius:5,padding:"2px 8px"}}>💰 {fh.birimFiyat}₺/adet</span>}
                          </div>
                        ):null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Nakliye Bilgisi (sevkiyat=nakliye ise göster) */}
                {f.sevkiyatYontemi==="nakliye"&&(
                  <div style={{background:"rgba(232,145,74,.04)",border:"1px solid rgba(232,145,74,.18)",borderRadius:10,padding:"10px 13px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#E8914A",letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
                      🚚 Nakliye Bilgisi
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <Field label="Varsayılan Nakliyeci">
                        <TextInp value={f.nakliye?.varsayilanNakliyeci||""} onChange={v=>up("nakliye",{...f.nakliye,varsayilanNakliyeci:v})} placeholder="Ahmet Nakliyat"/>
                      </Field>
                      <Field label="Nakliye Tel">
                        <TextInp value={f.nakliye?.nakliyeTel||""} onChange={v=>up("nakliye",{...f.nakliye,nakliyeTel:v})} placeholder="0532 xxx xx xx"/>
                      </Field>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
                      <Field label="Son Nakliye Ücreti (₺)">
                        <NumInp value={f.nakliye?.ortalamaUcret||0} onChange={v=>up("nakliye",{...f.nakliye,ortalamaUcret:v})} step={1} style={{width:"100%"}}/>
                      </Field>
                      <Field label={`Son Nakliye Yükü (${f.birim||"birim"})`}>
                        <NumInp value={f.nakliye?.ortalamaYuk||0} onChange={v=>up("nakliye",{...f.nakliye,ortalamaYuk:v})} step={1} style={{width:"100%"}}/>
                      </Field>
                    </div>
                    {f.nakliye?.ortalamaUcret>0&&f.nakliye?.ortalamaYuk>0&&(
                      <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:10,color:C.muted}}>→ Birim nakliye:</span>
                        <span style={{fontSize:13,fontWeight:800,color:"#E8914A",fontFamily:"JetBrains Mono,SF Mono,monospace"}}>
                          {(f.nakliye.ortalamaUcret/f.nakliye.ortalamaYuk).toFixed(2)}₺/{f.birim||"birim"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Field label="Not"><TextInp value={f.notlar} onChange={v=>up("notlar",v)} placeholder=""/></Field>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
            <div style={{display:"flex",gap:6}}>
              {isEdit&&<SilButonu onDelete={()=>onDelete(f.id)} isim={f.ad}/>}
              {isEdit&&onKopya&&<button onClick={()=>onKopya(f)}
                style={{background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 13px",fontSize:12,color:C.sub,cursor:"pointer"}}>📋 Kopyasını Oluştur</button>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={onClose}>İptal</Btn>
              <Btn variant="primary" color={C.sky} onClick={()=>onSave(f)}>{isEdit?"Kaydet":"Ekle"}</Btn>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
