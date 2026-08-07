import { foodCarouselImages } from '../../../data/homepageData';

export function FoodImageCarousel() {
  const loop = [...foodCarouselImages, ...foodCarouselImages];

  return (
    <section className="w-full overflow-hidden bg-foreground py-8 sm:py-10" aria-label="Food gallery">
      <div className="flex w-max animate-marquee gap-4 px-4">
        {loop.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="h-36 w-56 shrink-0 overflow-hidden rounded-2xl sm:h-44 sm:w-72"
          >
            <img src={src} alt="" className="h-full w-full object-cover opacity-90" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
