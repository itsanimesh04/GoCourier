import { foodCarouselImages } from '../../../data/homepageData';

const Section5 = () => {
  const strip = [...foodCarouselImages, ...foodCarouselImages];

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
