// web/src/context/CartContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import type { Product } from "../types";

export type CartLine = {
  id?: number;            // id del CartItem en backend (cuando hay sesión)
  product: Product;
  qty: number;
};

type CartState = {
  items: CartLine[];
  subtotal: number;
  totalQty: number;
  loading: boolean;
  add: (productId: number, qty: number) => Promise<void>;
  update: (productId: number, qty: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: (silent?: boolean) => Promise<void>;
};

const CartCtx = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, l) => sum + Number(l.product?.price || 0) * Number(l.qty || 0),
        0
      ),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((sum, l) => sum + Number(l.qty || 0), 0),
    [items]
  );

  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // --- REFRESH (usa "silent" para no mostrar loader y evitar parpadeo) ---
  const refresh = async (silent = false) => {
    if (!token) {
      // TODO: carrito de invitado real; de momento vacío para no romper UI
      setItems([]);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/cart", auth);
      const lines: CartLine[] = Array.isArray(data?.items)
        ? data.items.map((d: any) => ({
            id: d.id,
            qty: d.qty,
            product: d.product,
          }))
        : [];
      setItems(lines);
    } catch {
      // noop
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // --- Actualización optimista local ---
  const optimisticSet = (productId: number, newQty: number) => {
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.product.id === productId);
      if (newQty <= 0) {
        if (idx === -1) return prev;
        const copy = prev.slice();
        copy.splice(idx, 1);
        return copy;
      }
      if (idx === -1) {
        return [
          ...prev,
          {
            product: { id: productId, name: "", slug: "", price: 0, image: "" } as any,
            qty: newQty,
          },
        ];
      } else {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], qty: newQty };
        return copy;
      }
    });
  };

  // --- Sync con backend sin bloquear UI ---
  const postSetQty = async (productId: number, qty: number) => {
    if (!token) {
      // Invitado: de momento solo actualizamos local (sin backend)
      optimisticSet(productId, qty);
      return;
    }

    // Optimista: actualiza UI al instante
    optimisticSet(productId, qty);

    // Elige la operación correcta según exista el item y el qty
    const line = items.find((l) => l.product.id === productId);
    try {
      if (!line && qty > 0) {
        await api.post("/cart", { product_id: productId, qty }, auth);
      } else if (line && qty <= 0) {
        await api.delete(\`/cart/\${line.id}\`, auth);
      } else if (line && qty > 0) {
        await api.put(\`/cart/\${line.id}\`, { qty }, auth);
      }
      await refresh(true); // silencioso, sin parpadeo
    } catch {
      // En error, revertimos al estado servidor silenciosamente
      await refresh(true);
    }
  };

  const add = (productId: number, qty: number) =>
    postSetQty(
      productId,
      (items.find((l) => l.product.id === productId)?.qty || 0) + qty
    );

  const update = (productId: number, qty: number) => postSetQty(productId, qty);

  const remove = (productId: number) => postSetQty(productId, 0);

  const clear = async () => {
    // Optimista
    setItems([]);
    try {
      if (token) await api.delete("/cart", auth);
    } finally {
      await refresh(true);
    }
  };

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value: CartState = {
    items,
    subtotal,
    totalQty,
    loading,
    add,
    update,
    remove,
    clear,
    refresh,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
