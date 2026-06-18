import { useEffect, useRef } from "react";
import { useCart } from "react-use-cart";
import { useContext } from "react";
import { UserContext } from "@context/UserContext";
import CustomerServices from "@services/CustomerServices";

/**
 * useCartSync
 *
 * Runs once when the logged-in user changes:
 *  1. Fetches the customer's DB cart.
 *  2. Merges DB items into the local cart (DB wins for quantity when higher).
 *  3. Pushes any LOCAL-ONLY items (added as guest) up to the DB.
 *
 * This ensures:
 *  - Items added before login are preserved and saved to DB after login.
 *  - Items saved in DB from a previous session are restored into local cart.
 */
const useCartSync = () => {
  const { addItem, items, updateItemQuantity, getItem, emptyCart } = useCart();
  const {
    state: { userInfo },
  } = useContext(UserContext);

  const isSyncedRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncBackendCart = async () => {
      const userId = userInfo?._id || userInfo?.id;

      // Reset sync state if user changes or logs out
      if (!userId) {
        isSyncedRef.current = false;
        lastUserIdRef.current = null;
        isSyncingRef.current = false;
        return;
      }

      // Allow re-sync if user changed
      if (lastUserIdRef.current !== userId) {
        isSyncedRef.current = false;
      }

      // If already synced for this user or currently syncing, skip
      if (isSyncedRef.current || isSyncingRef.current) {
        return;
      }

      // Mark as syncing to prevent multiple simultaneous syncs
      isSyncingRef.current = true;

      try {
        // ── Step 1: Fetch DB cart ───────────────────────────────────────────
        const res = await CustomerServices.getCustomerById(userId);
        const backendCart = res.cart || [];

        // ── Step 2: Merge DB → Local ────────────────────────────────────────
        const itemsToProcess = [];

        backendCart.forEach((cartItem) => {
          const product = cartItem.productId;
          if (!product || !product._id) return;

          const id = product._id;
          const backendQty = cartItem.quantity || 1;

          const localItem = getItem(id);
          const hasVariantInCart = items.some((item) =>
            String(item.id).startsWith(String(id) + "-")
          );

          if (localItem) {
            // DB has higher quantity → update local
            if (backendQty > localItem.quantity) {
              itemsToProcess.push({ type: "update", id, quantity: backendQty });
            }
          } else if (!hasVariantInCart) {
            const effectivePrice =
              product.prices?.price || product.prices?.originalPrice || 0;

            itemsToProcess.push({
              type: "add",
              item: {
                id: id,
                price: effectivePrice,
                title: product.title?.en || product.title || "Product",
                image: Array.isArray(product.image)
                  ? product.image[0]
                  : typeof product.image === "string"
                    ? product.image
                    : "",
                quantity: backendQty,
                slug: product.slug,
                stock:
                  product?.stock !== undefined
                    ? product.stock
                    : product?.variants && product.variants[0]
                      ? product.variants[0].quantity
                      : undefined,
              },
              quantity: backendQty,
            });
          }
        });

        // Apply DB → local updates
        itemsToProcess.forEach((action) => {
          if (action.type === "update") {
            updateItemQuantity(action.id, action.quantity);
          } else if (action.type === "add") {
            if (!getItem(action.item.id)) {
              addItem(action.item, action.quantity);
            }
          }
        });

        // ── Step 3: Merge Local → DB (push guest items into DB) ────────────
        // After applying DB items to local, push any remaining local items
        // that aren't in the DB cart back up.
        const dbProductIds = new Set(
          backendCart
            .map((c) => c.productId?._id?.toString())
            .filter(Boolean)
        );

        const localOnlyItems = items.filter((localItem) => {
          // Resolve db-compatible id (strip variant suffix if any)
          const rawId = String(localItem.id);
          const baseId = rawId.includes("-")
            ? rawId.slice(0, rawId.indexOf("-"))
            : rawId;
          return !dbProductIds.has(baseId);
        });

        // Push each local-only item up to DB in parallel
        if (localOnlyItems.length > 0) {
          await Promise.allSettled(
            localOnlyItems.map((localItem) => {
              const rawId = String(localItem.id);
              const baseId = rawId.includes("-")
                ? rawId.slice(0, rawId.indexOf("-"))
                : rawId;
              return CustomerServices.addToCartDB(
                userId,
                baseId,
                localItem.quantity
              );
            })
          );
        }

        // ── Done ────────────────────────────────────────────────────────────
        isSyncedRef.current = true;
        lastUserIdRef.current = userId;
      } catch (err) {
        console.error("[useCartSync] Error syncing cart:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncBackendCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id, userInfo?.id]);
};

export default useCartSync;
