import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "TIMELESS JEWELLERY",
    title: "More Than Jewellery",
    subtitle: "It's a Legacy",
    description:
      "Exquisite designs. Timeless elegance. Crafted for your every moment.",
    buttonText: "EXPLORE COLLECTION",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1800&q=90",
    imageAlt: "Elegant gold jewellery collection",
  },
  {
    eyebrow: "THE ART OF ELEGANCE",
    title: "Every Detail",
    subtitle: "Tells a Story",
    description:
      "Discover jewellery that celebrates your individuality and timeless beauty.",
    buttonText: "DISCOVER DESIGNS",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=90",
    imageAlt: "Premium necklace jewellery",
  },
  {
    eyebrow: "MADE FOR YOUR MOMENTS",
    title: "Tradition Meets",
    subtitle: "Modern Luxury",
    description:
      "From everyday elegance to unforgettable celebrations, find your signature style.",
    buttonText: "VIEW COLLECTION",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1800&q=90",
    imageAlt: "Luxury jewellery accessories",
  },
];



function ArrowIcon({ direction = "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      aria-hidden="true"
    >
      {direction === "right" ? (
        <path
          d="M5 12h14m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M19 12H5m6-6-6 6 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function JewelleryHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  const previousSlide = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      aria-label="Elephanta jewellery featured collections"
      className="relative isolate min-h-[650px] overflow-hidden bg-[#fbf9f6] text-[#1b1b1b] md:min-h-[720px]"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <img
          key={activeSlide.image}
          src={activeSlide.image}
          alt={activeSlide.imageAlt}
          className="h-full w-full object-cover object-center transition-opacity duration-700"
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/80 via-white/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/60 via-transparent to-white/20" />

      {/* Main content */}
      <div className="mx-auto flex min-h-[650px] max-w-[1600px] items-center px-6 py-24 sm:px-12 md:min-h-[720px] md:px-16 lg:px-24">
        <div className="w-full max-w-2xl">
          

          {/* Slide copy */}
          <div key={activeIndex} className="animate-hero-content">
            <p className="mb-5 text-xs font-medium tracking-[0.35em] text-[#6e4e2a] sm:text-sm">{activeSlide.eyebrow}</p>

            <h1 className="font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {activeSlide.title}
              <span className="mt-2 block italic text-[#c79b5a]">{activeSlide.subtitle}</span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-[#111827] sm:text-base sm:leading-8">{activeSlide.description}</p>

            <a
              href="/collections"
              className="group mt-9 inline-flex min-h-14 items-center gap-5 border border-[#4b3522] px-6 py-4 text-xs font-medium tracking-[0.16em] text-[#4b3522] transition-all duration-300 hover:bg-[#4b3522] hover:text-white sm:px-8"
            >
              {activeSlide.buttonText}
              <ArrowIcon />
            </a>
          </div>

          {/* Carousel pagination */}
          <div className="mt-14 flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-9 bg-[#c79b5a]"
                    : "w-2 bg-gray-500/40 hover:bg-gray-500"
                }`}
              />
            ))}

            <span className="ml-3 font-serif text-sm text-gray-700">0{activeIndex + 1}<span className="mx-2 text-[#d4b77a]">/</span>0{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Previous / Next controls */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 p-3 text-[#111827]/90 transition hover:text-[#4b3522] sm:block md:left-6"
      >
        <ArrowIcon direction="left" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-[#111827]/90 transition hover:text-[#4b3522] sm:right-6"
      >
        <ArrowIcon />
      </button>
    </section>
  );
}
