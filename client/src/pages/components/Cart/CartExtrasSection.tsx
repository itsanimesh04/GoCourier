import { extrasImageUrl } from '../../../data/extrasImages';
import { extrasProducts } from '../../../data/extrasCatalog';
import { useAppDispatch } from '../../../store';
import { addExtra } from '../../../store/slices/cartSlice';

const CartExtrasSection = () => {
  const dispatch = useAppDispatch();
  const available = extrasProducts.filter((p) => p.available);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="mb-1 font-display text-lg font-bold uppercase tracking-wide text-fg sm:text-xl">
        Add Campus Extras
      </h2>
      <p className="mb-4 font-sans text-sm text-muted">
        Snacks, drinks and essentials delivered with your order.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {available.map((product) => {
          const imageUrl = extrasImageUrl(product.imageIndex);
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-border p-2 hover:border-muted"
            >
              <img
                src={imageUrl}
                alt={product.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold uppercase text-fg">
                  {product.name}
                </p>
                <p className="font-sans text-sm text-muted">
                  {product.unit} · ₹ {product.price}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    addExtra({
                      extrasProductId: product.id,
                      name: product.name,
                      imageUrl,
                      unitPrice: product.price,
                    })
                  )
                }
                className="shrink-0 rounded-xl border border-primary px-2 py-1 font-display text-sm font-semibold uppercase text-primary hover:bg-primary hover:text-on-primary"
              >
                Add
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CartExtrasSection;
