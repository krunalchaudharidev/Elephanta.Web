import React, { useEffect, useState } from "react";
import RemoteImage from "../../components/store/RemoteImage";
import { getCategories } from "../../services/productapi";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
} from "lucide-react";

const PAGE_SIZE = 6;

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [sortBy, setSortBy] = useState("nameasc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await getCategories(
          currentPage,
          PAGE_SIZE,
          undefined,
          true,
          sortBy
        );
        const items = response?.items || response?.Items || [];
        if (!cancelled) {
          setCollections(
            items.map((category) => {
              const mediaId = category.mediaId ?? category.MediaId;
              return {
                ...category,
                id: category.id ?? category.Id,
                name: category.name ?? category.Name ?? "",
                slug: category.slug ?? category.Slug ?? "",
                subtitle: category.description ?? category.Description ?? "",
                productCount:
                  category.productCount ?? category.ProductCount ?? 0,
                image:
                  category.imageUrl ??
                  category.ImageUrl ??
                  (mediaId ? `/api/Media/${mediaId}` : ""),
              };
            })
          );
          setTotalCount(response?.totalCount ?? response?.TotalCount ?? 0);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCollections([]);
          setTotalCount(0);
          setError(loadError.message || "Unable to load collections.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [currentPage, sortBy]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const firstItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, totalCount);

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
              Showing {firstItem}–{lastItem} of {totalCount} collections
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
                <option value="nameasc">Name: A–Z</option>
                <option value="namedesc">Name: Z–A</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77766f]"
              />
            </div>

          </div>
        </div>

        {/* Collection cards */}
        {loading ? (
          <div role="status" className="py-16 text-center text-sm text-[#817a71]">
            Loading collections...
          </div>
        ) : error ? (
          <div role="alert" className="py-16 text-center text-sm text-red-700">
            {error}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="group min-w-0"
              >
                <a
                  href={getCollectionUrl(collection.slug)}
                  className="relative block aspect-[1.25] overflow-hidden rounded-lg bg-[#eee5db]"
                >
                  <RemoteImage
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                  <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white sm:bottom-5 sm:left-5 sm:right-5">
                    <span>
                      <span className="block font-serif text-2xl sm:text-3xl">
                        {collection.name}
                      </span>
                      <span className="mt-1 block text-[10px] text-white/90 sm:text-[11px]">
                        {collection.productCount} items
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

              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#d9cbbb] px-5 py-16 text-center">
            <h3 className="mt-4 font-serif text-2xl">
              No collections available
            </h3>
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
            href="/store/products"
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
