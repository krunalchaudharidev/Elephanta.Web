import React, { useMemo, useState } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

const categories = ["All Jewellery", "Bangles", "Rings", "Earrings", "Necklaces"];
const metalTypes = ["Gold Plated", "Silver", "Rose Gold", "Kundan"];

const products = [
  {
    id: 1,
    name: "Royal Kundan Bridal Necklace",
    category: "Necklaces",
    metal: "Kundan",
    price: 20200,
    oldPrice: 24500,
    rating: 4.8,
    reviews: 124,
    isNew: true,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "Pearl Drop Statement Earrings",
    category: "Earrings",
    metal: "Gold Plated",
    price: 2200,
    oldPrice: 2800,
    rating: 4.7,
    reviews: 86,
    isNew: true,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "Elegant Solitaire Crystal Ring",
    category: "Rings",
    metal: "Silver",
    price: 4000,
    oldPrice: 4800,
    rating: 4.9,
    reviews: 210,
    isNew: false,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    name: "Traditional Gold Plated Bangles",
    category: "Bangles",
    metal: "Gold Plated",
    price: 900,
    oldPrice: 1200,
    rating: 4.6,
    reviews: 72,
    isNew: false,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 5,
    name: "Classic Everyday Gold Necklace",
    category: "Necklaces",
    metal: "Rose Gold",
    price: 3500,
    oldPrice: 4200,
    rating: 4.5,
    reviews: 64,
    isNew: false,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 6,
    name: "Floral Antique Earrings",
    category: "Earrings",
    metal: "Kundan",
    price: 1800,
    oldPrice: 2300,
    rating: 4.8,
    reviews: 95,
    isNew: true,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 7,
    name: "Minimalist Silver Band Ring",
    category: "Rings",
    metal: "Silver",
    price: 1500,
    oldPrice: null,
    rating: 4.4,
    reviews: 48,
    isNew: false,
    inStock: false,
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 8,
    name: "Premium Designer Kada Bangles",
    category: "Bangles",
    metal: "Rose Gold",
    price: 5200,
    oldPrice: 6500,
    rating: 4.7,
    reviews: 113,
    isNew: false,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function FilterHeading({ children }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#27332d]">
      {children}
    </h3>
  );
}

function CheckOption({ label, checked, onChange, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2 text-sm text-[#625f59]">
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 cursor-pointer accent-[#a78051]"
        />
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-[#a29a90]">{count}</span>
      )}
    </label>
  );
}

export default function ProductListing() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSelection = (value, selected, setSelected) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedMetals([]);
    setMaxPrice(25000);
    setMinRating(0);
    setInStockOnly(false);
    setNewArrivalsOnly(false);
    setSearch("");
    setSortBy("featured");
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesMetal =
        selectedMetals.length === 0 ||
        selectedMetals.includes(product.metal);

      const matchesPrice = product.price <= maxPrice;
      const matchesRating = product.rating >= minRating;
      const matchesStock = !inStockOnly || product.inStock;
      const matchesNew = !newArrivalsOnly || product.isNew;

      const matchesSearch = `${product.name} ${product.category} ${product.metal}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return (
        matchesCategory &&
        matchesMetal &&
        matchesPrice &&
        matchesRating &&
        matchesStock &&
        matchesNew &&
        matchesSearch
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    return result;
  }, [
    selectedCategories,
    selectedMetals,
    maxPrice,
    minRating,
    inStockOnly,
    newArrivalsOnly,
    search,
    sortBy,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedMetals.length +
    (maxPrice < 25000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    Number(inStockOnly) +
    Number(newArrivalsOnly);

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

  const FilterContent = () => (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Filters</h2>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-[#a78051] hover:text-[#74512e]"
        >
          <RotateCcw size={13} /> Clear all
        </button>
      </div>

      <div>
        <FilterHeading>Categories</FilterHeading>
        {categories.map((category) => (
          <CheckOption
            key={category}
            label={category}
            checked={selectedCategories.includes(category)}
            onChange={() =>
              toggleSelection(
                category,
                selectedCategories,
                setSelectedCategories
              )
            }
            count={
              category === "All Jewellery"
                ? products.length
                : products.filter((p) => p.category === category).length
            }
          />
        ))}
      </div>

      <div className="border-t border-[#eee7df] pt-6">
        <FilterHeading>Price Range</FilterHeading>
        <div className="mb-4 flex items-center justify-between text-xs text-[#777168]">
          <span>₹0</span>
          <span className="font-semibold text-[#172521]">
            Up to {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="25000"
          step="500"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          aria-label="Maximum price"
          className="w-full cursor-pointer accent-[#a78051]"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-[#e9e0d6] px-3 py-2">
            <span className="block text-[10px] text-[#999086]">Minimum</span>
            <span className="text-xs">₹0</span>
          </div>
          <div className="rounded-md border border-[#e9e0d6] px-3 py-2">
            <span className="block text-[10px] text-[#999086]">Maximum</span>
            <span className="text-xs">{formatPrice(maxPrice)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#eee7df] pt-6">
        <FilterHeading>Material & Finish</FilterHeading>
        {metalTypes.map((metal) => (
          <CheckOption
            key={metal}
            label={metal}
            checked={selectedMetals.includes(metal)}
            onChange={() =>
              toggleSelection(metal, selectedMetals, setSelectedMetals)
            }
            count={products.filter((p) => p.metal === metal).length}
          />
        ))}
      </div>

      <div className="border-t border-[#eee7df] pt-6">
        <FilterHeading>Customer Rating</FilterHeading>
        {[4, 3, 2].map((rating) => (
          <label
            key={rating}
            className="flex cursor-pointer items-center gap-3 py-2"
          >
            <input
              type="radio"
              name="rating"
              checked={minRating === rating}
              onChange={() => setMinRating(rating)}
              className="h-4 w-4 accent-[#a78051]"
            />
            <span className="flex items-center gap-1 text-sm text-[#625f59]">
              <span className="text-[#c79848]">{"★".repeat(rating)}</span>
              <span className="text-xs text-[#817a71]">& up</span>
            </span>
          </label>
        ))}
        <button
          onClick={() => setMinRating(0)}
          className="mt-2 text-xs text-[#a78051] hover:underline"
        >
          Any rating
        </button>
      </div>

      <div className="border-t border-[#eee7df] pt-6">
        <FilterHeading>Availability</FilterHeading>
        <CheckOption
          label="In stock only"
          checked={inStockOnly}
          onChange={() => setInStockOnly(!inStockOnly)}
        />
        <CheckOption
          label="New arrivals"
          checked={newArrivalsOnly}
          onChange={() => setNewArrivalsOnly(!newArrivalsOnly)}
        />
      </div>

      <button
        onClick={() => setMobileFiltersOpen(false)}
        className="w-full rounded-md bg-[#172521] py-3 text-sm text-white transition hover:bg-[#a78051] lg:hidden"
      >
        Show {filteredProducts.length} Products
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#172521]">
      
      {/* Page heading */}
      <section className="mx-auto max-w-[1440px] px-5 pb-4 pt-7 lg:px-10 lg:pb-5">
        <div className="relative overflow-hidden rounded-xl bg-[#eee4d8]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eee4d8] via-[#eee4d8]/90 to-[#eee4d8]/10" />
          <div className="relative flex min-h-48 items-center px-6 py-9 sm:px-10 md:min-h-56 md:px-14">
            <div className="max-w-lg">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a78051]">
                Discover your signature style
              </p>
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
                All Jewellery
              </h1>
              <p className="mt-3 max-w-md text-xs leading-6 text-[#635b52] sm:text-sm">
                Explore timeless pieces, thoughtfully designed to celebrate
                every moment and every version of you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-2 lg:px-10">
        <div className="flex items-center gap-2 text-xs text-[#92887c]">
          <a href="/" className="hover:text-[#a78051]">Home</a>
          <ChevronRight size={13} />
          <span className="text-[#172521]">Shop All Jewellery</span>
        </div>
      </div>

      {/* Main listing */}
      <main className="mx-auto max-w-[1440px] px-5 pb-16 lg:px-10">
        {/* Search and toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#eae3da] pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl">Find Your Favourite</h2>
            <p className="mt-1 text-xs text-[#817a71]">
              {filteredProducts.length} products to explore
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#e5ddd3] bg-white px-3 py-2.5 sm:w-52 sm:flex-none">
              <Search size={16} className="shrink-0 text-[#918679]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jewellery..."
                aria-label="Search products"
                className="w-full min-w-0 bg-transparent text-xs outline-none"
              />
            </label>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-md border border-[#e5ddd3] bg-white px-3 py-2.5 text-xs lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a78051] px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label className="flex items-center gap-2 rounded-md border border-[#e5ddd3] bg-white px-3 py-2.5">
              <ArrowUpDown size={15} className="text-[#918679]" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort products"
                className="max-w-40 bg-transparent text-xs outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={13} className="text-[#918679]" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-9">
          {/* Desktop sidebar */}
          <aside className="hidden self-start rounded-lg border border-[#eae3da] bg-white p-5 lg:sticky lg:top-28 lg:block">
            <FilterContent />
          </aside>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 h-full w-full bg-black/40"
              />
              <div className="absolute inset-y-0 right-0 w-[min(88%,390px)] overflow-y-auto bg-white p-6 shadow-xl">
                <div className="mb-7 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[#a78051]">
                    Refine your search
                  </span>
                  <button
                    aria-label="Close filters"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full p-2 hover:bg-[#f5f0e9]"
                  >
                    <X size={20} />
                  </button>
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Product grid */}
          <section>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {selectedCategories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    toggleSelection(
                      category,
                      selectedCategories,
                      setSelectedCategories
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-[#dfcbb3] bg-white px-3 py-1.5 text-[11px]"
                >
                  {category} <X size={12} />
                </button>
              ))}

              {selectedMetals.map((metal) => (
                <button
                  key={metal}
                  onClick={() =>
                    toggleSelection(metal, selectedMetals, setSelectedMetals)
                  }
                  className="flex items-center gap-2 rounded-full border border-[#dfcbb3] bg-white px-3 py-1.5 text-[11px]"
                >
                  {metal} <X size={12} />
                </button>
              ))}

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#a78051] underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group min-w-0 overflow-hidden rounded-lg border border-[#eee7df] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#342719]/5"
                >
                  <div className="relative aspect-[0.86] overflow-hidden bg-[#f2ece5]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    {product.isNew && (
                      <span className="absolute left-2 top-2 rounded-sm bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8c6a42] sm:left-3 sm:top-3">
                        New
                      </span>
                    )}

                    {product.oldPrice && (
                      <span className="absolute left-2 top-9 rounded-sm bg-[#a78051] px-2 py-1 text-[9px] font-medium text-white sm:left-3 sm:top-10">
                        {Math.round(
                          ((product.oldPrice - product.price) /
                            product.oldPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`${
                        wishlist.includes(product.id)
                          ? "Remove from"
                          : "Add to"
                      } wishlist: ${product.name}`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition hover:bg-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                    >
                      <Heart
                        size={17}
                        className={
                          wishlist.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-[#363a35]"
                        }
                      />
                    </button>

                    {!product.inStock && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/65 py-2 text-center text-[10px] uppercase tracking-widest text-white">
                        Out of stock
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#a78051]">
                      {product.category} · {product.metal}
                    </p>
                    <h3 className="min-h-10 text-xs font-medium leading-5 text-[#262b27] sm:text-sm">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-[#9e968d] line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#817a71]">
                      <Star
                        size={12}
                        className="fill-[#c99a48] text-[#c99a48]"
                      />
                      <span className="font-medium text-[#373b35]">
                        {product.rating}
                      </span>
                      <span>({product.reviews} reviews)</span>
                    </div>

                    <button
                      disabled={!product.inStock}
                      onClick={() => addToCart(product)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#172521] px-2 py-3 text-[10px] font-medium text-white transition hover:bg-[#a78051] disabled:cursor-not-allowed disabled:bg-[#c8c4be] sm:text-xs"
                    >
                      <ShoppingCart size={14} />
                      {product.inStock ? "Add to Cart" : "Unavailable"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-[#ded3c6] bg-white px-5 text-center">
                <Search size={32} className="mb-4 text-[#b6a28b]" />
                <h3 className="font-serif text-2xl">No jewellery found</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#817a71]">
                  Try adjusting your filters or searching for a different
                  product.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 rounded-md bg-[#172521] px-5 py-3 text-xs text-white transition hover:bg-[#a78051]"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="mt-10 border-t border-[#eae3da] pt-5 text-center text-xs text-[#817a71]">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            )}
          </section>
        </div>
      </main>

    </div>
  );
}
