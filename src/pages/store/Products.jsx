import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCategories, searchProducts } from "../../services/productapi";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../services/wishlistapi";
import RemoteImage from "../../components/store/RemoteImage";
import CartActionButton from "../../components/store/CartActionButton";
import {
  getCartItemsForProducts,
  getCartSessionId,
} from "../../services/cartapi";
import {
  Search,
  Heart,
  Check,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

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
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistUpdating, setWishlistUpdating] = useState([]);
  const [notification, setNotification] = useState("");
  const [cartItemsByProductId, setCartItemsByProductId] = useState({});
  const [cartLoading, setCartLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const wishlistLocks = useRef(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      try {
        const response = await getWishlist();
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? [];
        if (!cancelled) {
          setWishlist(
            items
              .map((item) => item?.productId ?? item?.ProductId)
              .filter((productId) => productId !== undefined && productId !== null)
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load wishlist.", error);
        }
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    }

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await getCategories(1, 1000, undefined, true, "nameasc");
        const items = response?.items ?? response?.Items ?? [];
        if (!cancelled) {
          setCategories(
            items
              .map((category) => {
                const name = category.name ?? category.Name ?? "";
                const id = category.id ?? category.Id;
                const slug = category.slug ?? category.Slug ?? "";
                return {
                  id,
                  slug,
                  name: typeof name === "string" ? name.trim() : "",
                  count:
                    category.productCount ??
                    category.ProductCount ??
                    0,
                };
              })
              .filter((category) => category.id && category.name)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setCategoriesError(error.message || "Unable to load categories.");
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!categoryFromUrl || categories.length === 0) return;
    const normalizedCategory = categoryFromUrl.toLowerCase();
    const matchingCategory = categories.find(
      (category) => [category.id, category.slug, category.name].some(
        (value) => String(value ?? "").toLowerCase() === normalizedCategory
      )
    );
    if (matchingCategory) {
      setSelectedCategories([matchingCategory.id]);
      setPageNumber(1);
    }
  }, [categoryFromUrl, categories]);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setProductsLoading(true);
      setProductsError("");
      try {
        const response = await searchProducts({
          name: search.trim() || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 25000 ? maxPrice : undefined,
          categoryIds: selectedCategories,
          sort: sortBy,
          isActive: true,
          minRating: minRating || undefined,
          isStockAvailable: inStockOnly ? true : undefined,
          pageNumber,
          pageSize,
        });
        const items = response?.items ?? response?.Items ?? [];
        const mappedProducts = items.map((item) => {
          const imageIds = item.imageIds ?? item.ImageIds ?? [];
          const primaryImageId = item.primaryImageId ?? item.PrimaryImageId;
          const imageId = primaryImageId
            ? imageIds.find((id) => String(id) === String(primaryImageId)) ??
              imageIds[0]
            : imageIds[0];
          const rawStockQuantity =
            item.stockQuantity ?? item.StockQuantity ?? 0;
          const stockQuantity = Number.isFinite(Number(rawStockQuantity))
            ? Number(rawStockQuantity)
            : 0;
          const compareAtPrice =
            item.compareAtPrice ?? item.CompareAtPrice ?? null;

          return {
            ...item,
            id: item.id ?? item.Id,
            name: item.name ?? item.Name ?? "",
            category:
              item.categoryName ??
              item.CategoryName ??
              (typeof item.category === "string" ? item.category : undefined) ??
              (typeof item.Category === "string" ? item.Category : undefined) ??
              item.category?.name ??
              item.Category?.Name ??
              "",
            metal: item.metal ?? item.Metal ?? item.material ?? item.Material ?? "",
            price: item.price ?? item.Price ?? 0,
            compareAtPrice,
            rating: item.averageRating ?? item.AverageRating ?? 0,
            reviews: item.reviewCount ?? item.ReviewCount ?? 0,
            stockQuantity,
            inStock: stockQuantity > 0,
            isFeatured: item.isFeatured ?? item.IsFeatured ?? false,
            image:
              item.imageUrl ??
              item.ImageUrl ??
              (imageId ? `/api/Media/${imageId}` : ""),
          };
        });

        if (!cancelled) {
          setProducts(mappedProducts);
          setTotalCount(
            response?.totalCount ?? response?.TotalCount ?? mappedProducts.length
          );
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setTotalCount(0);
          setProductsError(error.message || "Unable to load products.");
        }
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    search,
    minPrice,
    maxPrice,
    selectedCategories,
    sortBy,
    minRating,
    inStockOnly,
    pageNumber,
    pageSize,
  ]);

  const showNotification = useCallback((message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 2500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (products.length === 0) {
      setCartItemsByProductId({});
      setCartLoading(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadCartItems() {
      setCartLoading(true);
      try {
        const productIds = products
          .map((product) => product.id)
          .filter((productId) => productId !== undefined && productId !== null);
        const items = await getCartItemsForProducts(
          productIds,
          getCartSessionId()
        );
        if (!cancelled) {
          setCartItemsByProductId(
            Object.fromEntries(
              Array.from(items, ([productId, item]) => [
                productId,
                {
                  id: item.id ?? item.Id,
                  quantity: Number(item.quantity ?? item.Quantity) || 1,
                },
              ])
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load cart items.", error);
          showNotification(error?.message || "Unable to load your cart.");
        }
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    }

    loadCartItems();
    return () => {
      cancelled = true;
    };
  }, [products, showNotification]);

  const toggleSelection = (value, selected, setSelected) => {
    setPageNumber(1);
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(25000);
    setMinRating(0);
    setInStockOnly(false);
    setSearch("");
    setSortBy("featured");
    setPageNumber(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 25000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    Number(inStockOnly);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const isWishlisted = (productId) =>
    wishlist.some(
      (item) => String(item).toLowerCase() === String(productId).toLowerCase()
    );

  const toggleWishlist = async (product) => {
    if (!product?.id || wishlistLoading) return;
    const productId = String(product.id);
    const lockKey = productId.toLowerCase();
    if (wishlistLocks.current.has(lockKey)) return;

    wishlistLocks.current.add(lockKey);
    setWishlistUpdating((current) => [...current, lockKey]);
    const currentlyWishlisted = isWishlisted(productId);
    try {
      if (currentlyWishlisted) {
        await removeFromWishlist(productId);
        setWishlist((current) =>
          current.filter((item) => String(item).toLowerCase() !== lockKey)
        );
        showNotification("Removed from your wishlist.");
      } else {
        await addToWishlist(productId);
        setWishlist((current) => [...current, productId]);
        showNotification("Added to your wishlist.");
      }
    } catch (error) {
      console.error("Failed to update wishlist.", error);
      showNotification(error?.message || "Unable to update your wishlist.");
    } finally {
      wishlistLocks.current.delete(lockKey);
      setWishlistUpdating((current) =>
        current.filter((item) => item !== lockKey)
      );
    }
  };

  const handleCartItemChange = (productId, item) => {
    const key = String(productId).toLowerCase();
    setCartItemsByProductId((current) => {
      const updated = { ...current };
      if (item) updated[key] = item;
      else delete updated[key];
      return updated;
    });
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
        {categoriesLoading && (
          <p className="py-2 text-sm text-[#817a71]">Loading categories...</p>
        )}
        {categoriesError && (
          <p role="alert" className="py-2 text-sm text-red-700">
            {categoriesError}
          </p>
        )}
        {categories
          .slice(0, showAllCategories ? categories.length : 5)
          .map(({ id, name, count }) => (
          <CheckOption
            key={id}
            label={name}
            checked={selectedCategories.includes(id)}
            onChange={() =>
              toggleSelection(
                id,
                selectedCategories,
                setSelectedCategories
              )
            }
            count={count}
          />
        ))}
        {categories.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllCategories((current) => !current)}
            className="mt-2 text-xs text-[#a78051] underline underline-offset-4 hover:text-[#74512e]"
          >
            {showAllCategories ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="border-t border-[#eee7df] pt-6">
        <FilterHeading>Price Range</FilterHeading>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-[#e9e0d6] px-3 py-2">
            <label htmlFor="minimum-price" className="block text-[10px] text-[#999086]">Minimum</label>
            <input
              id="minimum-price"
              type="number"
              min="0"
              max={maxPrice}
              value={minPrice}
              onChange={(event) => {
                const value = Number(event.target.value);
                setMinPrice(Math.min(maxPrice, Math.max(0, value)));
                setPageNumber(1);
              }}
              className="mt-1 w-full bg-transparent text-xs outline-none"
            />
          </div>
          <div className="rounded-md border border-[#e9e0d6] px-3 py-2">
            <label htmlFor="maximum-price" className="block text-[10px] text-[#999086]">Maximum</label>
            <input
              id="maximum-price"
              type="number"
              min={minPrice}
              max="25000"
              value={maxPrice}
              onChange={(event) => {
                const value = Number(event.target.value);
                setMaxPrice(Math.min(25000, Math.max(minPrice, value)));
                setPageNumber(1);
              }}
              className="mt-1 w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[#999086]">
          Prices from {formatPrice(minPrice)} to {formatPrice(maxPrice)}
        </p>
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
              onChange={() => {
                setMinRating(rating);
                setPageNumber(1);
              }}
              className="h-4 w-4 accent-[#a78051]"
            />
            <span className="flex items-center gap-1 text-sm text-[#625f59]">
              <span className="text-[#c79848]">{"★".repeat(rating)}</span>
              <span className="text-xs text-[#817a71]">& up</span>
            </span>
          </label>
        ))}
        <button
          onClick={() => {
            setMinRating(0);
            setPageNumber(1);
          }}
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
          onChange={() => {
            setInStockOnly(!inStockOnly);
            setPageNumber(1);
          }}
        />
      </div>

      <button
        onClick={() => setMobileFiltersOpen(false)}
        className="w-full rounded-md bg-[#172521] py-3 text-sm text-white transition hover:bg-[#a78051] lg:hidden"
      >
        Show {products.length} Products
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
              {totalCount} products to explore
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#e5ddd3] bg-white px-3 py-2.5 sm:w-52 sm:flex-none">
              <Search size={16} className="shrink-0 text-[#918679]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageNumber(1);
                }}
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
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setPageNumber(1);
                }}
                aria-label="Sort products"
                className="max-w-40 bg-transparent text-xs outline-none"
              >
                <option value="featured">Featured</option>
                <option value="createdatasc">Newest Arrival</option>
                <option value="priceasc">Price: Low to High</option>
                <option value="pricedesc">Price: High to Low</option>
                <option value="toprated">Top Rated</option>
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
              {selectedCategories.map((categoryId) => {
                const category = categories.find(
                  (item) => item.id === categoryId
                );
                if (!category) return null;
                return (
                  <button
                    key={categoryId}
                    onClick={() =>
                      toggleSelection(
                        categoryId,
                        selectedCategories,
                        setSelectedCategories
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-[#dfcbb3] bg-white px-3 py-1.5 text-[11px]"
                  >
                    {category.name} <X size={12} />
                  </button>
                );
              })}

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#a78051] underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>

            {productsError && (
              <p role="alert" className="mb-5 rounded-md bg-red-50 p-4 text-sm text-red-700">
                {productsError}
              </p>
            )}
            {productsLoading && (
              <p role="status" className="mb-5 text-sm text-[#817a71]">
                Loading products...
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => {
                const cartItem =
                  cartItemsByProductId[String(product.id).toLowerCase()];
                const reservedQuantity = Number(
                  product.reservedQuantity ?? product.ReservedQuantity ?? 0
                );
                const availableStock = Math.max(
                  0,
                  product.stockQuantity - reservedQuantity
                );
                const isAvailable =
                  availableStock > 0 &&
                  (!cartItem || Number(cartItem.quantity) < availableStock);
                const nextQuantity = cartItem
                  ? Math.min(Number(cartItem.quantity) + 1, availableStock)
                  : 1;

                return (
                  <article
                    key={product.id}
                    className="group min-w-0 overflow-hidden rounded-lg border border-[#eee7df] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#342719]/5"
                  >
                  <div className="relative aspect-[0.86] overflow-hidden bg-[#f2ece5]">
                    <Link
                      to={`/store/products/${encodeURIComponent(product.id)}`}
                      aria-label={`View ${product.name}`}
                      className="absolute inset-0"
                    >
                      <RemoteImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {product.isFeatured && (
                      <span className="absolute left-2 top-2 rounded-sm bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8c6a42] sm:left-3 sm:top-3">
                        Featured
                      </span>
                    )}

                    {product.compareAtPrice > product.price && (
                      <span className="absolute left-2 top-9 rounded-sm bg-[#a78051] px-2 py-1 text-[9px] font-medium text-white sm:left-3 sm:top-10">
                        {Math.round(
                          ((product.compareAtPrice - product.price) /
                            product.compareAtPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}

                    <button
                      onClick={() => toggleWishlist(product)}
                      disabled={wishlistLoading || wishlistUpdating.includes(String(product.id).toLowerCase())}
                      aria-label={`${
                        isWishlisted(product.id)
                          ? "Remove from"
                          : "Add to"
                      } wishlist: ${product.name}`}
                      aria-pressed={isWishlisted(product.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                    >
                      <Heart
                        size={17}
                        className={
                          isWishlisted(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-[#363a35]"
                        }
                      />
                    </button>

                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/65 py-2 text-center text-[10px] uppercase tracking-widest text-white">
                        Out of stock
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/store/products/${encodeURIComponent(product.id)}`}
                    className="block p-3 sm:p-4"
                  >
                    <p className="mb-1 text-[9px] uppercase tracking-[0.12em] text-[#a78051]">
                      {[product.category, product.metal].filter(Boolean).join(" · ")}
                    </p>
                    <h3 className="min-h-10 text-xs font-medium leading-5 text-[#262b27] sm:text-sm">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-[10px] text-[#9e968d] line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#817a71]">
                      <Star
                        size={12}
                        className="fill-[#c99a48] text-[#c99a48]"
                      />
                      <span className="font-medium text-[#373b35]">
                        {Number(product.rating).toFixed(1)}
                      </span>
                      <span>({product.reviews} reviews)</span>
                    </div>
                  </Link>

                  <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                    <CartActionButton
                      productId={product.id}
                      quantity={nextQuantity}
                      cartItem={cartItem}
                      onCartItemChange={(item) =>
                        handleCartItemChange(product.id, item)
                      }
                      cartLoading={cartLoading || productsLoading}
                      isAvailable={isAvailable}
                      showCartQuantity
                      allowRemove
                      productName={product.name}
                      className="mt-4 flex items-center justify-center gap-2 rounded-md bg-[#172521] px-2 py-3 text-[10px] font-medium text-white transition hover:bg-[#a78051] disabled:cursor-not-allowed disabled:bg-[#c8c4be] sm:text-xs"
                      removeClassName="mt-4 flex shrink-0 items-center justify-center rounded-md border border-[#e5ddd3] px-3 text-[#817a71] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      iconSize={14}
                      onSuccess={({ updated, removed }) =>
                        showNotification(
                          removed
                            ? "Removed from your cart."
                            : updated
                              ? "Cart quantity updated."
                              : "Added to your cart."
                        )
                      }
                      onError={(error) =>
                        showNotification(
                          error?.message || "Unable to update your cart."
                        )
                      }
                    />
                  </div>
                  </article>
                );
              })}
            </div>

            {!productsLoading && !productsError && products.length === 0 && (
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

            {!productsLoading && products.length > 0 && (
              <div className="mt-10 border-t border-[#eae3da] pt-5 text-center text-xs text-[#817a71]">
                <p>
                  Showing {(pageNumber - 1) * pageSize + 1}–
                  {(pageNumber - 1) * pageSize + products.length} of {totalCount} products
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                    className="rounded-md border border-[#e5ddd3] bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {pageNumber} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={pageNumber >= totalPages}
                    onClick={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
                    className="rounded-md border border-[#e5ddd3] bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {notification && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-lg bg-[#102722] px-5 py-4 text-sm text-white shadow-xl"
        >
          <Check size={18} className="shrink-0 text-[#d4ae62]" />
          {notification}
        </div>
      )}
    </div>
  );
}
