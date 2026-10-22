
import React, { useEffect, useState } from "react";
import RemoteImage from "../../components/store/RemoteImage";
import { getCategories, searchProducts } from "../../services/productapi";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  Menu,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
  X,
  Star,
} from "lucide-react";

const slides = [
  {
    eyebrow: "TIMELESS ELEGANCE",
    title: "More Than Jewellery",
    subtitle: "It's a Legacy",
    description:
      "Discover exquisite designs that celebrate your unique story. Crafted with passion, for every precious moment.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90",
    button: "Explore Collections",
  },
  {
    eyebrow: "CRAFTED WITH PASSION",
    title: "Beauty in Every Detail",
    subtitle: "Made to Treasure",
    description:
      "Discover thoughtfully crafted pieces that make every celebration unforgettable.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2000&q=90",
    button: "Discover More",
  },
  {
    eyebrow: "YOUR STORY, YOUR STYLE",
    title: "Elegance That Lasts",
    subtitle: "Forever Yours",
    description:
      "From everyday favourites to extraordinary occasions, find jewellery that feels like you.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=90",
    button: "Shop Jewellery",
  },
];

const benefits = [
  {
    icon: PackageCheck,
    title: "PREMIUM QUALITY",
    description: "Crafted with precision",
  },
  {
    icon: ShieldCheck,
    title: "SECURE SHOPPING",
    description: "Safe & reliable payments",
  },
  {
    icon: Truck,
    title: "FREE SHIPPING",
    description: "On orders above ₹2,000",
  },
  {
    icon: RotateCcw,
    title: "EASY RETURNS",
    description: "Hassle-free process",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function SectionHeading({ eyebrow, title, href, linkText }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9b7044]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-[#14231f] sm:text-3xl">
          {title}
        </h2>
      </div>

      {href && (
        <a
          href={href}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e2d5c5] px-3 py-2 text-[10px] transition hover:border-[#a77b4c] hover:bg-[#f5eee5] sm:px-4 sm:text-xs"
        >
          {linkText}
          <ArrowRight size={13} />
        </a>
      )}
    </div>
  );
}

export default function StoreHome() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await getCategories(1, 4, undefined, true, "createdatdesc");
        if (!cancelled) {
          setCategories(response?.items || response?.Items || []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProducts() {
      try {
        const response = await searchProducts({
          isFeatured: true,
          sort: "createdatdesc",
          pageNumber: 1,
          pageSize: 4,
        });
        const items = response?.items || response?.Items || [];
        if (!cancelled) {
          setProducts(
            items.map((item) => {
              const imageIds = item.imageIds ?? item.ImageIds ?? [];
              const primaryImageId = item.primaryImageId ?? item.PrimaryImageId;
              const imageId = primaryImageId
                ? imageIds.find((id) => String(id) === String(primaryImageId)) ?? imageIds[0]
                : imageIds[0];

              return {
                ...item,
                id: item.id ?? item.Id,
                name: item.name ?? item.Name ?? "",
                price: item.price ?? item.Price ?? 0,
                rating: item.averageRating ?? item.AverageRating,
                reviewCount: item.reviewCount ?? item.ReviewCount,
                image:
                  item.imageUrl ??
                  item.ImageUrl ??
                  (imageId ? `/api/Media/${imageId}` : ""),
              };
            })
          );
        }
      } catch {
        if (!cancelled) setProducts([]);
      }
    }

    loadFeaturedProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const slide = slides[activeSlide];

  const changeSlide = (direction) => {
    setActiveSlide((current) =>
      (current + direction + slides.length) % slides.length
    );
  };

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  const subscribe = (event) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfaf7] text-[#18231f]">
      
      {/* Hero carousel */}
      <section className="relative isolate min-h-[370px] overflow-hidden sm:min-h-[410px] lg:min-h-[460px]">
        {slides.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 -z-20 h-full w-full object-cover object-center transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          />

        ))}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f3e9dd] via-[#f3e9dd]/90 to-[#f3e9dd]/5" />

        <div className="mx-auto flex min-h-[370px] max-w-[1440px] items-center px-8 py-12 sm:min-h-[410px] sm:px-14 lg:min-h-[460px] lg:px-20">
          <div className="max-w-lg">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#936c43] sm:text-[10px]">
              {slide.eyebrow}
            </p>

            <h1 className="mt-4 font-serif text-4xl leading-[1.12] text-[#111714] sm:text-5xl lg:text-[56px]">
              {slide.title}
              <span className="mt-1 block italic text-[#987047]">
                {slide.subtitle}
              </span>
            </h1>

            <p className="mt-5 max-w-xs text-xs leading-6 text-[#363a35] sm:text-sm sm:leading-7">
              {slide.description}
            </p>

            <a
              href="/store/collections"
              className="mt-6 inline-flex items-center gap-4 rounded-sm bg-[#a77c4e] px-5 py-3 text-[11px] font-medium text-white transition hover:bg-[#815b36] sm:px-6"
            >
              {slide.button}
              <ArrowRight size={15} />
            </a>

            <div className="mt-7 flex items-center gap-3">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-pressed={activeSlide === index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-5 bg-[#a77b4c]"
                      : "w-3 bg-[#b9b0a5]/60 hover:bg-[#a77b4c]"
                  }`}
                />
              ))}
              <span className="ml-2 text-[9px] tracking-widest text-[#4c4d47]">
                0{activeSlide + 1} / 0{slides.length}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => changeSlide(-1)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition hover:bg-white sm:left-6 sm:h-10 sm:w-10"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => changeSlide(1)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition hover:bg-white sm:right-6 sm:h-10 sm:w-10"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Shopping benefits */}
      <section className="border-b border-[#eee8e0] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 py-5 sm:px-10 lg:grid-cols-4 lg:px-14 lg:py-6">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`flex items-center justify-center gap-3 px-2 py-3 sm:gap-4 lg:justify-start lg:px-5 ${
                index > 1 ? "border-t border-[#eee8e0] lg:border-t-0" : ""
              } ${
                index % 2 === 1 ? "sm:border-l sm:border-[#eee8e0]" : ""
              } ${
                index === 2 ? "lg:border-l lg:border-[#eee8e0]" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eee0ce] text-[#a77b4c] sm:h-12 sm:w-12">
                <Icon size={21} strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="text-[8px] font-semibold tracking-[0.1em] sm:text-[9px]">
                  {title}
                </h3>
                <p className="mt-1 text-[9px] text-[#77766f] sm:text-[10px]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
        <SectionHeading
          eyebrow="SHOP BY CATEGORY"
          title="Explore Our Collections"
          href="/store/collections"
          linkText="View All Collections"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const name = category.name ?? category.Name ?? "";
            const slug = category.slug ?? category.Slug ?? "";
            const mediaId = category.mediaId ?? category.MediaId;
            const image =
              category.imageUrl ??
              category.ImageUrl ??
              (mediaId ? `/api/Media/${mediaId}` : "");

            return (
            <a
              href={`/products?category=${slug}`}
              key={slug || category.id || category.Id || name}
              className="group relative aspect-[0.95] overflow-hidden rounded-md bg-[#eae0d4] sm:aspect-[1.05]"
            >
              <RemoteImage
                src={image}
                alt={name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white sm:inset-x-4 sm:bottom-4">
                <h3 className="font-serif text-lg sm:text-xl">
                  {name}
                </h3>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/80 transition group-hover:bg-white group-hover:text-[#172923]">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </a>
            );
          })}
        </div>
      </section>

      {/* Best sellers */}
      <section className="border-y border-[#f0ebe5] bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
          <SectionHeading
            eyebrow="FEATURED PRODUCTS"
            title="Best Sellers"
            href="/store/products"
            linkText="View All Products"
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-lg border border-[#ece7e0] bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#30251a]/5"
              >
                <div className="relative aspect-[1.15] overflow-hidden bg-[#f1e9df]">
                  <a href={`/products/${product.id}`}>
                    <RemoteImage
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </a>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={
                      wishlist.includes(product.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    aria-pressed={wishlist.includes(product.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 transition hover:bg-white"
                  >
                    <Heart
                      size={16}
                      className={
                        wishlist.includes(product.id)
                          ? "fill-[#a77b4c] text-[#a77b4c]"
                          : "text-[#1b2520]"
                      }
                    />
                  </button>
                </div>

                <div className="p-3 sm:p-3.5">
                  <a
                    href={`/products/${product.id}`}
                    className="line-clamp-2 min-h-8 text-[10px] font-medium leading-4 transition hover:text-[#a77b4c] sm:text-xs"
                  >
                    {product.name}
                  </a>

                  <p className="mt-1.5 text-xs font-semibold sm:text-sm">
                    {formatPrice(product.price)}
                  </p>

                  {product.rating != null && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="flex items-center gap-0.5 text-[#e6a83c]">
                        {Array.from({ length: 5 }, (_, index) => {
                          const fillPercent = Math.max(
                            0,
                            Math.min(1, Number(product.rating) - index)
                          ) * 100;

                          return (
                            <span
                              key={index}
                              className="relative inline-flex h-[11px] w-[11px]"
                            >
                              <Star
                                size={11}
                                className="text-[#d7cfc4]"
                                strokeWidth={1}
                              />
                              <span
                                className="absolute inset-y-0 left-0 overflow-hidden text-[#e6a83c]"
                                style={{ width: `${fillPercent}%` }}
                              >
                                <Star
                                  size={11}
                                  fill="currentColor"
                                  strokeWidth={1}
                                />
                              </span>
                            </span>
                          );
                        })}
                      </span>
                      <span className="text-[9px] text-[#77766f]">
                        {Number(product.rating).toFixed(1)} ({product.reviewCount ?? 0} {product.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#152822] px-2 py-2.5 text-[9px] font-medium text-white transition hover:bg-[#a77b4c] sm:text-[10px]"
                  >
                    <ShoppingCart size={13} />
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Brand story banner */}
      <section className="relative isolate overflow-hidden bg-[#102923]">
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1800&q=85"
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2821] via-[#0b2821]/90 to-[#0b2821]/15" />

        <div className="mx-auto flex max-w-[1440px] items-center px-6 py-12 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
          <div className="max-w-lg">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#e3b75f]">
              CRAFTED WITH PASSION
            </p>
            <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
              Luxury in Every Detail
            </h2>
            <p className="mt-3 text-xs leading-6 text-white/80 sm:text-sm">
              Exquisite designs. Premium materials. A legacy of trust since
              day one.
            </p>
            <a
              href="/about"
              className="mt-5 inline-flex items-center gap-3 rounded-sm bg-[#b58a5a] px-4 py-3 text-[10px] font-medium text-white transition hover:bg-[#c49b6d]"
            >
              Explore Our Story
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-b border-[#e9e2d9] bg-[#fcfaf7]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 py-8 sm:px-10 lg:flex-row lg:justify-between lg:px-14">
          <div className="flex items-center gap-4">
            <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-[#e9dccb] text-[#a77b4c] sm:flex">
              <Mail size={21} strokeWidth={1.4} />
            </span>
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a77b4c]">
                JOIN THE INNER CIRCLE
              </p>
              <h3 className="mt-2 font-serif text-xl">
                A little luxury in your inbox.
              </h3>
              <p className="mt-1 text-[10px] text-[#77766f] sm:text-xs">
                Get exclusive access to private collection drops and updates.
              </p>
            </div>
          </div>

          <form
            onSubmit={subscribe}
            className="flex w-full max-w-md gap-2 lg:w-auto"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubscribed(false);
              }}
              placeholder="Your email address"
              className="min-w-0 flex-1 rounded-sm border border-[#e6ded4] bg-white px-3 py-3 text-xs outline-none transition focus:border-[#a77b4c] lg:w-64"
            />
            <button
              type="submit"
              className="shrink-0 rounded-sm bg-[#a77b4c] px-4 py-3 text-[10px] font-medium text-white transition hover:bg-[#815b36] sm:px-5"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p role="status" className="text-xs text-[#28704e]">
              Thank you for subscribing!
            </p>
          )}
        </div>
      </section>

    </main>
  );
}
