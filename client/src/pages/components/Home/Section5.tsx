import { useAppSelector } from '../../../store';
import { selectFoodCategories, selectRestaurants } from '../../../store/slices/catalogSlice';

const Section5 = () => {
  const categories = useAppSelector(selectFoodCategories);
  const restaurants = useAppSelector(selectRestaurants);
  const images = [
    ...categories.map((c) => c.imageUrl).filter(Boolean),
    ...restaurants.map((r) => r.imageUrl).filter(Boolean),
  ].slice(0, 12);

  if (images.length === 0) return null;

  const strip = [...images, ...images];

  return (
    <section className="w-full overflow-hidden py-3 sm:py-4 my-36">
      <div className="flex w-max animate-marquee" style={{ animationDuration: '40s' }}>
        {strip.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="mx-1.5 h-75 w-75 shrink-0 overflow-hidden rounded-xl border border-border sm:mx-2 sm:w-75"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Section5;
