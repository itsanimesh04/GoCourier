import { extrasProducts } from '../../../data/extrasCatalog';
import { useAppDispatch } from '../../../store';
import { addExtra } from '../../../store/slices/cartSlice';

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b00?w=400&q=80',
  'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
];

const CartExtrasSection = () => {
  const dispatch = useAppDispatch();
  const available = extrasProducts.filter((p) => p.available);

  return (
    <section className="border border-gray-200 p-4">
      <h2 className="mb-1 font-bebas text-2xl uppercase tracking-wide text-tertiary">
        Add Campus Extras
      </h2>
      <p className="mb-4 font-sans text-sm text-gray-600">
        Snacks, drinks and essentials delivered with your order.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {available.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 border border-gray-100 p-2 hover:border-gray-300"
          >
            <img
              src={EXTRA_IMAGES[product.imageIndex % EXTRA_IMAGES.length]}
              alt={product.name}
              className="h-14 w-14 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bebas text-lg uppercase text-tertiary">
                {product.name}
              </p>
              <p className="font-bebas text-sm text-gray-500">
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
                    imageUrl: EXTRA_IMAGES[product.imageIndex % EXTRA_IMAGES.length],
                    unitPrice: product.price,
                  })
                )
              }
              className="shrink-0 border border-red-600 px-2 py-1 font-bebas text-sm uppercase text-red-600 hover:bg-red-600 hover:text-white"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CartExtrasSection;
