/**
 * Kullanıcı Rolleri — İskelet Tanımları
 * Detaylar program tamamlandıktan sonra genişletilecek.
 */

export const ROLES = {
  admin: {
    label: "Yönetici",
    description: "Şirket sahibi/yönetici — tam erişim",
    permissions: ["*"], // her şey
  },
  ofis: {
    label: "Ofis Çalışanı",
    description: "Sipariş, tedarik, müşteri, stok yönetimi",
    permissions: [
      "siparisler", "siparisler:yazma",
      "tedarik", "tedarik:yazma",
      "musteriler", "musteriler:yazma",
      "stok", "stok:yazma",
      "sevkiyat", "sevkiyat:yazma",
      "dashboard",
    ],
  },
  usta: {
    label: "Usta Başı",
    description: "Atölye, üretim emirleri, istasyonlar",
    permissions: [
      "atolye", "atolye:yazma",
      "uretimEmirleri", "uretimEmirleri:yazma",
      "istasyonlar",
      "stok", // sadece okuma
      "dashboard",
    ],
  },
  isci: {
    label: "İşçi",
    description: "Sadece kendi aşamaları (çalışan modu)",
    permissions: [
      "atolye:kendisi", // sadece kendi aşamaları
    ],
  },
  tedarikci: {
    label: "Tedarikçi",
    description: "Dış tedarikçi — sadece tedarik bölümleri",
    permissions: [
      "tedarik", // sadece okuma
    ],
  },
};

export const ROLE_KEYS = Object.keys(ROLES);

/**
 * hasPermission: Belirli bir rolün belirli bir yetkiye sahip olup olmadığını kontrol eder.
 */
export function hasPermission(role, permission) {
  const roleDef = ROLES[role];
  if (!roleDef) return false;
  if (roleDef.permissions.includes("*")) return true;
  return roleDef.permissions.includes(permission);
}
