import { Star } from '../../../components/icons';
import { reviews } from '../../../data/homepageData';

export function ReviewsSection() {
  return (
    <section id="reviews" className="w-full scroll-mt-24 bg-background py-14 sm:py-20">
      <div className="content-rail">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Loved by students
        </h2>
        <p className="mt-2 text-sm text-muted">Real feedback from hostels we deliver to every night</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <blockquote
              key={review.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-subtle"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold text-white"
                  style={{
                    backgroundColor: review.avatarColor === '#D4FF4F' ? '#0A0A0B' : review.avatarColor
                  }}
                >
                  {review.name.charAt(0)}
                </span>
                <div>
                  <cite className="not-italic font-display text-sm font-bold text-foreground">{review.name}</cite>
                  <p className="text-xs text-muted">{review.campus}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-secondary">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-secondary text-secondary" />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
