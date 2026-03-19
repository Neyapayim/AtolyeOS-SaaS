import { useMemo } from 'react';
import { hasPermission } from '../config/roles.js';

/**
 * usePermission: Rol bazlı yetki kontrolü hook iskeleti.
 *
 * Kullanım:
 *   const { can, canWrite } = usePermission("admin");
 *   if (can("siparisler")) { ... }
 *   if (canWrite("stok")) { ... }
 *
 * NOT: Şimdilik role parametresi dışarıdan geçilir.
 * Firebase entegrasyonundan sonra useAuthContext'ten otomatik alınacak.
 */
export function usePermission(role) {
  const helpers = useMemo(() => ({
    /** Belirli bir modüle erişim var mı? */
    can: (permission) => hasPermission(role, permission),

    /** Belirli bir modüle yazma yetkisi var mı? */
    canWrite: (module) => hasPermission(role, `${module}:yazma`),

    /** Mevcut rol */
    role,

    /** Admin mi? */
    isAdmin: role === "admin",
  }), [role]);

  return helpers;
}
