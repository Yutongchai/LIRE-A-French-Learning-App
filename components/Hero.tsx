export default function Hero({ label }: { label: string }) {
  return (
    <div className="lire-hero mb-8">
      <div className="lire-hero-content">
        <p className="lire-eyebrow">Your personal {label} collection</p>

        <h2 className="lire-display mt-5 text-4xl sm:text-5xl md:text-6xl">
          Explore the
          <br />
          art of {label}.
        </h2>

        <p className="lire-hero-description mt-5">
          Discover language, culture and ideas through carefully selected
          readings. A new perspective with every lesson.
        </p>

        <button
          onClick={() =>
            document
              .getElementById("daily-reading")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="lire-primary-button mt-7"
        >
          Explore today&apos;s reading
        </button>

        <div className="lire-timeline">
          <div className="lire-timeline-point" />
          <div className="lire-timeline-point" />
          <div className="lire-timeline-point" />
          <div className="lire-timeline-point" />
        </div>
      </div>
    </div>
  );
}