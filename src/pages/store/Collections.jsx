import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Heart,
  List,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

const collections = [
  {
    id: 1,
    name: "Bangles",
    slug: "bangles",
    subtitle: "Tradition on your wrist",
    count: 24,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Rings",
    slug: "rings",
    subtitle: "Made for your moments",
    count: 32,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Earrings",
    slug: "earrings",
    subtitle: "A little extra sparkle",
    count: 28,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Necklaces",
    slug: "necklaces",
    subtitle: "Elegance in every detail",
    count: 18,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Bridal Jewellery",
    slug: "bridal-jewellery",
    subtitle: "Your day, your forever",
    count: 16,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Pendants",
    slug: "pendants",
    subtitle: "Small details, lasting memories",
    count: 21,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Anklets",
    slug: "anklets",
    subtitle: "Grace in every step",
    count: 12,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Jewellery Sets",
    slug: "jewellery-sets",
    subtitle: "Beautifully paired",
    count: 20,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 9,
    name: "Pearl Jewellery",
    slug: "pearl-jewellery",
    subtitle: "Classic, never ordinary",
    count: 14,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 10,
    name: "Gold Jewellery",
    slug: "gold-jewellery",
    subtitle: "A timeless golden glow",
    count: 26,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 11,
    name: "Statement Jewellery",
    slug: "statement-jewellery",
    subtitle: "Made to stand out",
    count: 15,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 12,
    name: "Everyday Jewellery",
    slug: "everyday-jewellery",
    subtitle: "Your everyday favourite",
    count: 30,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 13,
    name: "Cocktail Rings",
    slug: "cocktail-rings",
    subtitle: "An unforgettable statement",
    count: 11,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 14,
    name: "Traditional Jewellery",
    slug: "traditional-jewellery",
    subtitle: "Heritage reimagined",
    count: 19,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 15,
    name: "Gift Collections",
    slug: "gift-collections",
    subtitle: "Give something meaningful",
    count: 17,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
];

const PAGE_SIZE = 6;

export default function Collections() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  const filteredCollections = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = collections.filter((collection) =>
      `${collection.name} ${collection.subtitle}`
        .toLowerCase()
        .includes(normalizedSearch)
    );

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "count-desc") {
      result.sort((a, b) => b.count - a.count);
    }

    return result;
  }, [search, sortBy]);

  const totalPages = Math.ceil(filteredCollections.length / PAGE_SIZE);

  const currentCollections = filteredCollections.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changeSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const getCollectionUrl = (slug) =>
    `/products?category=${encodeURIComponent(slug)}`;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#172923]">
      
      {/* Hero banner */}
      <section className="relative isolate min-h-[220px] overflow-hidden sm:min-h-[255px]">
        <img
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2000&q=90"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f4ece2] via-[#f4ece2]/95 to-[#f4ece2]/10" />

        <div className="mx-auto flex min-h-[220px] max-w-7xl items-center px-5 py-10 sm:min-h-[255px] lg:px-8">
          <div className="max-w-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-[#956c3e] sm:text-[10px]">
              The Elephanta Collections
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Timeless Collections
            </h1>
            <p className="mt-3 max-w-md text-xs leading-6 text-[#514f49] sm:text-sm">
              Explore our carefully curated jewellery collections, designed
              to celebrate every moment and every version of you.
            </p>
            <div className="mt-4 h-0.5 w-8 bg-[#a78051]" />
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] text-[#77766f]"
        >
          <a href="/" className="hover:text-[#a78051]">
            Home
          </a>
          <ChevronRight size={13} />
          <span className="text-[#172923]">Collections</span>
        </nav>
      </div>

      {/* Collections listing */}
      <main className="mx-auto max-w-7xl px-5 pb-14 pt-7 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#4f625a]">
              All Collections
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Our Jewellery Collections
            </h2>
            <p className="mt-2 text-xs leading-6 text-[#77766f] sm:text-sm">
              Discover timeless pieces, thoughtfully designed to celebrate
              every moment.
            </p>
            <p className="mt-2 text-[11px] text-[#93887b]">
              Showing{" "}
              {filteredCollections.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(currentPage * PAGE_SIZE, filteredCollections.length)}{" "}
              of {filteredCollections.length} collections
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <label
              htmlFor="collection-sort"
              className="text-[11px] text-[#5f625d]"
            >
              Sort by:
            </label>
            <div className="relative">
              <select
                id="collection-sort"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 min-w-32 appearance-none rounded-md border border-[#e5ddd3] bg-white py-2 pl-3 pr-9 text-xs outline-none focus:border-[#a78051]"
              >
                <option value="featured">Featured</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
                <option value="count-desc">Most products</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77766f]"
              />
            </div>

            <div className="ml-1 flex rounded-md border border-[#e5ddd3] bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`flex h-8 w-8 items-center justify-center rounded transition ${
                  viewMode === "grid"
                    ? "bg-[#eee3d3] text-[#946a3c]"
                    : "text-[#7c7c74] hover:bg-[#f6f1eb]"
                }`}
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`flex h-8 w-8 items-center justify-center rounded transition ${
                  viewMode === "list"
                    ? "bg-[#eee3d3] text-[#946a3c]"
                    : "text-[#7c7c74] hover:bg-[#f6f1eb]"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Collection cards */}
        {currentCollections.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-4"
            }
          >
            {currentCollections.map((collection) => (
              <article
                key={collection.id}
                className={`group min-w-0 ${
                  viewMode === "list"
                    ? "flex flex-col overflow-hidden rounded-lg border border-[#e9e1d7] bg-white sm:flex-row"
                    : ""
                }`}
              >
                <a
                  href={getCollectionUrl(collection.slug)}
                  className={`relative block overflow-hidden rounded-lg bg-[#eee5db] ${
                    viewMode === "grid"
                      ? "aspect-[1.25]"
                      : "aspect-[1.3] sm:aspect-auto sm:min-h-48 sm:w-64 sm:shrink-0"
                  }`}
                >
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                  <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white sm:bottom-5 sm:left-5 sm:right-5">
                    <span>
                      <span className="block font-serif text-2xl sm:text-3xl">
                        {collection.name}
                      </span>
                      <span className="mt-1 block text-[10px] text-white/90 sm:text-[11px]">
                        {collection.count} items
                      </span>
                      <span className="mt-1 block text-[10px] text-white/80">
                        {collection.subtitle}
                      </span>
                    </span>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#654c32] transition group-hover:bg-[#d6b786]">
                      <ArrowRight size={17} />
                    </span>
                  </span>
                </a>

                <div
                  className={`flex items-center justify-between gap-3 ${
                    viewMode === "grid"
                      ? "px-1 pt-3"
                      : "flex-1 p-4 sm:p-6"
                  }`}
                >
                  <div>
                    <a
                      href={getCollectionUrl(collection.slug)}
                      className="text-sm font-medium transition hover:text-[#a78051]"
                    >
                      {collection.name}
                    </a>
                    <p className="mt-1 text-xs text-[#817a71]">
                      {collection.subtitle}
                    </p>
                    <p className="mt-1 text-[10px] text-[#9b8c7a]">
                      {collection.count} collections items
                    </p>
                  </div>

                  <button
                    onClick={() => toggleWishlist(collection.id)}
                    aria-label={
                      wishlist.includes(collection.id)
                        ? `Remove ${collection.name} from wishlist`
                        : `Add ${collection.name} to wishlist`
                    }
                    aria-pressed={wishlist.includes(collection.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e9e1d7] bg-white transition hover:border-[#a78051]"
                  >
                    <Heart
                      size={17}
                      className={
                        wishlist.includes(collection.id)
                          ? "fill-[#a78051] text-[#a78051]"
                          : "text-[#77766f]"
                      }
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#d9cbbb] px-5 py-16 text-center">
            <Search
              size={28}
              className="mx-auto text-[#a78051]"
            />
            <h3 className="mt-4 font-serif text-2xl">
              No collections found
            </h3>
            <p className="mt-2 text-sm text-[#817a71]">
              Try a different search term.
            </p>
            <button
              onClick={() => changeSearch("")}
              className="mt-5 rounded-md bg-[#102722] px-5 py-3 text-xs text-white hover:bg-[#a78051]"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Collection pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d665f] transition hover:bg-[#eee5d9] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    document
                      .getElementById("collection-sort")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs transition ${
                    currentPage === page
                      ? "bg-[#a78051] font-medium text-white"
                      : "text-[#34413a] hover:bg-[#eee5d9]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d665f] transition hover:bg-[#eee5d9] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </main>

      {/* Promotional banner */}
      <section className="border-y border-[#ece2d6] bg-[#f3ece3]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center sm:py-9 lg:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9b754b]">
              A little luxury, every day
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Find the piece that tells your story.
            </h2>
          </div>

          <a
            href="/products"
            className="inline-flex min-h-11 items-center justify-center gap-3 self-start rounded-md bg-[#102722] px-5 py-3 text-xs text-white transition hover:bg-[#a78051] sm:self-auto"
          >
            Shop All Jewellery
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

    </div>
  );
}
