import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RemoteImage from "../../components/store/RemoteImage";
import ProductReviews from "../../components/store/ProductReviews";
import YouMayAlsoLike from "../../components/store/YouMayAlsoLike";
import {
  getProduct,
  getProductFaqs,
} from "../../services/productapi";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../services/wishlistapi";
import { getWebsiteSetting } from "../../services/websitesettingsapi";
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  Gem,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const allowedDescriptionTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
]);
const descriptionTagsToRemove = new Set([
  "embed",
  "iframe",
  "object",
  "script",
  "style",
  "svg",
]);

function renderDescriptionHtml(html) {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  function renderNode(node, key) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName.toLowerCase();
    if (descriptionTagsToRemove.has(tagName)) return null;

    const children = Array.from(node.childNodes).map((child, index) =>
      renderNode(child, index)
    );
    if (!allowedDescriptionTags.has(tagName)) {
      return <React.Fragment key={key}>{children}</React.Fragment>;
    }

    const props = { key };
    if (tagName === "a") {
      try {
        const href = node.getAttribute("href");
        if (href) {
          const url = new URL(href, window.location.origin);
          if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
            props.href = url.href;
          }
        }
      } catch {
        props.href = undefined;
      }
    }
    return React.createElement(tagName, props, ...children);
  }

  return Array.from(parsed.body.childNodes).map((node, index) =>
    renderNode(node, index)
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistUpdating, setWishlistUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [notification, setNotification] = useState("");
  const [freeShippingOnOrdersAbove, setFreeShippingOnOrdersAbove] = useState(2000);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqsError, setFaqsError] = useState("");
  const handleReviewCountChange = useCallback((reviewCount) => {
    setProduct((current) =>
      current && current.reviewCount !== reviewCount
        ? { ...current, reviewCount }
        : current
    );
  }, []);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    async function loadWishlist() {
      setWishlistLoading(true);
      setIsFavorite(false);
      try {
        const response = await getWishlist();
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? [];
        const isProductWishlisted = items.some((item) => {
          const wishlistProductId = item?.productId ?? item?.ProductId;
          return (
            wishlistProductId !== undefined &&
            String(wishlistProductId).toLowerCase() === String(id).toLowerCase()
          );
        });
        if (!cancelled) setIsFavorite(isProductWishlisted);
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
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadWebsiteSettings() {
      try {
        const settings = await getWebsiteSetting();
        const threshold =
          settings?.freeShippingOnOrdersAbove ??
          settings?.FreeShippingOnOrdersAbove;
        if (!cancelled && threshold !== undefined && threshold !== null) {
          const value = Number(threshold);
          if (Number.isFinite(value) && value >= 0) {
            setFreeShippingOnOrdersAbove(value);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load website settings.", error);
        }
      }
    }

    loadWebsiteSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    async function loadFaqs() {
      setFaqsLoading(true);
      setFaqsError("");
      try {
        const response = await getProductFaqs(id);
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items ?? [];
        if (!cancelled) {
          setFaqs(
            items
              .map((faq) => ({
                id: faq?.id ?? faq?.Id,
                question: faq?.question ?? faq?.Question ?? "",
                answer: faq?.answer ?? faq?.Answer ?? "",
                isActive: faq?.isActive ?? faq?.IsActive ?? true,
                displayOrder: faq?.displayOrder ?? faq?.DisplayOrder ?? 0,
              }))
              .filter((faq) => faq.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setFaqsError(error?.message || "Unable to load FAQs.");
        }
      } finally {
        if (!cancelled) setFaqsLoading(false);
      }
    }

    loadFaqs();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setLoadError("");
      setProduct(null);
      setActiveImage(0);
      setQuantity(1);
      try {
        const response = await getProduct(id);
        const rawImageIds = response?.imageIds ?? response?.ImageIds ?? [];
        const imageIds = Array.isArray(rawImageIds) ? rawImageIds : [];
        const primaryImageId = response?.primaryImageId ?? response?.PrimaryImageId;
        const orderedImageIds = primaryImageId
          ? [
              ...imageIds.filter((imageId) => String(imageId) === String(primaryImageId)),
              ...imageIds.filter((imageId) => String(imageId) !== String(primaryImageId)),
            ]
          : imageIds;
        const name = response?.name ?? response?.Name ?? "";
        const price = Number(response?.price ?? response?.Price ?? 0);
        const compareAtPrice = response?.compareAtPrice ?? response?.CompareAtPrice ?? null;
        const stockQuantity = Number(response?.stockQuantity ?? response?.StockQuantity ?? 0);
        const reservedQuantity = Number(response?.reservedQuantity ?? response?.ReservedQuantity ?? 0);
        const reviewCount = Number(response?.reviewCount ?? response?.ReviewCount ?? 0);

        if (!cancelled) {
          setProduct({
            ...response,
            id: response?.id ?? response?.Id ?? id,
            name,
            slug: response?.slug ?? response?.Slug ?? "",
            sku: response?.sku ?? response?.SKU ?? "",
            shortDescription: response?.shortDescription ?? response?.ShortDescription ?? "",
            description: response?.description ?? response?.Description ?? "",
            category: response?.categoryName ?? response?.CategoryName ?? "",
            categoryId: response?.categoryId ?? response?.CategoryId ?? "",
            price: Number.isFinite(price) ? price : 0,
            compareAtPrice,
            stockQuantity: Number.isFinite(stockQuantity) ? stockQuantity : 0,
            reservedQuantity: Number.isFinite(reservedQuantity) ? reservedQuantity : 0,
            isActive: response?.isActive ?? response?.IsActive ?? false,
            isFeatured: response?.isFeatured ?? response?.IsFeatured ?? false,
            isCategoryActive: response?.isCategoryActive ?? response?.IsCategoryActive ?? false,
            reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
            rating: response?.averageRating ?? response?.AverageRating ?? 0,
            images: orderedImageIds.map((imageId) => ({
              src: `/api/Media/${imageId}`,
              alt: name,
            })),
          });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error?.message || "Unable to load product details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const discount =
    product?.compareAtPrice > product?.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0;

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 2500);
  };

  const handleWishlistToggle = async () => {
    if (!product || wishlistLoading || wishlistUpdating) return;

    setWishlistUpdating(true);
    try {
      if (isFavorite) {
        await removeFromWishlist(product.id);
        setIsFavorite(false);
        showNotification("Removed from your wishlist.");
      } else {
        await addToWishlist(product.id);
        setIsFavorite(true);
        showNotification("Added to your wishlist.");
      }
    } catch (error) {
      console.error("Failed to update wishlist.", error);
      showNotification(error?.message || "Unable to update your wishlist.");
    } finally {
      setWishlistUpdating(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !product.isActive || !product.isCategoryActive || product.stockQuantity <= product.reservedQuantity) {
      return;
    }
    showNotification(`${quantity} item(s) added to your cart.`);
  };

  const changeImage = (direction) => {
    setActiveImage((current) => {
      const total = product?.images.length ?? 0;
      if (total === 0) return 0;
      return (current + direction + total) % total;
    });
  };

  if (loading) {
    return <div role="status" className="min-h-screen bg-[#fcfaf7] px-5 py-16 text-center text-[#777168]">Loading product...</div>;
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] px-5 py-16 text-center">
        <p role="alert" className="text-sm text-red-700">
          {loadError || "Product not found."}
        </p>
      </div>
    );
  }

  const currentImage = product.images[activeImage];
  const availableStock = Math.max(0, product.stockQuantity - product.reservedQuantity);
  const isAvailable = product.isActive && product.isCategoryActive && availableStock > 0;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#172521]">
      
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1280px] px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#93897e]">
          <a href="/" className="hover:text-[#a78051]">Home</a>
          <ChevronRight size={13} />
          <a href="/store/products" className="hover:text-[#a78051]">Shop</a>
          <ChevronRight size={13} />
          <a
            href={`/store/products?category=${encodeURIComponent(product.categoryId)}`}
            className="hover:text-[#a78051]"
          >
            {product.category}
          </a>
          <ChevronRight size={13} />
          <span className="text-[#172521]">{product.name}</span>
        </div>
      </div>

      {/* Product information */}
      <main className="mx-auto max-w-[1280px] px-5 pb-14 md:px-8">
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product gallery */}
          <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
            <div className="flex flex-col gap-3">
              {product.images.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`aspect-[0.8] overflow-hidden rounded-md border-2 transition ${
                    activeImage === index
                      ? "border-[#a78051]"
                      : "border-transparent hover:border-[#d7c5ad]"
                  }`}
                >
                  <RemoteImage
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="relative aspect-[0.86] overflow-hidden rounded-lg bg-[#f0e8de] sm:aspect-[0.95] lg:aspect-[0.88]">
              {currentImage ? (
                <RemoteImage
                  key={currentImage.src}
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No image available
                </div>
              )}

              {product.isFeatured && (
                <span className="absolute left-4 top-4 rounded-sm bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8d6a43]">
                  Featured
                </span>
              )}
              {!isAvailable && (
                <span className="absolute inset-x-0 bottom-0 bg-black/65 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-white">
                  Unavailable
                </span>
              )}

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading || wishlistUpdating}
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isFavorite}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 transition hover:bg-white"
              >
                <Heart
                  size={20}
                  className={
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-[#252b27]"
                  }
                />
              </button>

              {product.images.length > 1 && <button
                onClick={() => changeImage(-1)}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronLeft size={20} />
              </button>}

              {product.images.length > 1 && <button
                onClick={() => changeImage(1)}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronRight size={20} />
              </button>}

              {product.images.length > 1 && <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    aria-label={`Go to image ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImage === index
                        ? "w-7 bg-white"
                        : "w-2 bg-white/60"
                    }`}
                  />
                ))}
              </div>}
            </div>
          </div>

          {/* Product details */}
          <div className="py-1 lg:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a78051]">
              {product.category}
            </p>

            <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>
            {product.sku && (
              <p className="mt-2 text-xs text-[#82796f]">SKU: {product.sku}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5" aria-label={`Rated ${product.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((item) => {
                  const fillPercent = Math.max(
                    0,
                    Math.min(1, Number(product.rating) - item + 1)
                  ) * 100;
                  return (
                    <span key={item} className="relative inline-flex h-[17px] w-[17px]">
                      <Star size={17} className="text-[#d7cfc4]" strokeWidth={1} />
                      <span
                        className="absolute inset-y-0 left-0 overflow-hidden text-[#c79643]"
                        style={{ width: `${fillPercent}%` }}
                      >
                        <Star size={17} fill="currentColor" strokeWidth={1} />
                      </span>
                    </span>
                  );
                })}
              </div>
              <span className="text-xs font-semibold">{Number(product.rating).toFixed(1)}</span>
              <a
                href="#reviews"
                onClick={() => setActiveTab("reviews")}
                className="text-xs text-[#82796f] underline underline-offset-4 hover:text-[#a78051]"
              >
                ({product.reviewCount} reviews)
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="text-sm text-[#9b948b] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-[#f5eadb] px-3 py-1 text-[11px] font-semibold text-[#986d3b]">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="mt-5 max-w-xl text-sm leading-7 text-[#777168] [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5">
              {renderDescriptionHtml(
                product.shortDescription ||
                  product.description ||
                  "No description available."
              )}
            </div>
            <p className={`mt-3 text-xs font-medium ${isAvailable ? "text-green-700" : "text-red-700"}`}>
              {isAvailable ? `${availableStock} in stock` : "Currently unavailable"}
            </p>

            {/* Quantity */}
            <div className="mt-7">
              <h2 className="mb-3 text-xs font-semibold">Quantity</h2>
              <div className="flex h-11 w-36 items-center justify-between rounded-md border border-[#e4ddd4] bg-white">
                <button
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !isAvailable}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-full w-10 items-center justify-center text-[#777168] transition hover:text-[#a78051] disabled:opacity-40"
                >
                  <Minus size={15} />
                </button>

                <span className="text-sm">{quantity}</span>

                <button
                  aria-label="Increase quantity"
                  disabled={quantity >= Math.min(10, availableStock) || !isAvailable}
                  onClick={() => setQuantity((current) => Math.min(10, availableStock, current + 1))}
                  className="flex h-full w-10 items-center justify-center text-[#777168] transition hover:text-[#a78051] disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[#91877b]">
                Maximum {Math.min(10, availableStock)} items per order.
              </p>
            </div>

            {/* Purchase actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#102722] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#a78051] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <ShoppingCart size={17} />
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading || wishlistUpdating}
                aria-pressed={isFavorite}
                className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#dfd4c7] bg-white px-5 py-3 text-xs font-medium transition hover:border-[#a78051] hover:text-[#a78051]"
              >
                <Heart
                  size={17}
                  className={isFavorite ? "fill-red-500 text-red-500" : ""}
                />
                {isFavorite ? "Added to Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            <div className="mt-7 border-t border-[#eae3da] pt-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Premium Quality",
                    detail: "Crafted with precision",
                  },
                  {
                    icon: Truck,
                    title: "Free Shipping",
                    detail: `Orders above ${formatPrice(freeShippingOnOrdersAbove)}`,
                  },
                  {
                    icon: RotateCcw,
                    title: "Easy Returns",
                    detail: "Hassle-free process",
                  },
                ].map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="flex flex-col gap-2 sm:flex-row">
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#a78051]"
                    />
                    <div>
                      <p className="text-[10px] font-semibold">{title}</p>
                      <p className="mt-1 text-[9px] leading-4 text-[#8b8379]">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Product information tabs */}
        <section className="mt-14 border-t border-[#eae3da] pt-6 sm:mt-20">
          <div className="flex gap-7 overflow-x-auto border-b border-[#eae3da]">
            {[
              ["description", "Description"],
              ["reviews", `Reviews (${product.reviewCount})`],
              ["faqs", "FAQs"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`shrink-0 border-b-2 pb-4 text-xs transition ${
                  activeTab === key
                    ? "border-[#a78051] font-semibold text-[#172521]"
                    : "border-transparent text-[#82796f] hover:text-[#a78051]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid items-start gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div>
              {activeTab === "description" && (
                <div>
                  <h2 className="font-serif text-2xl">Product Description</h2>
                  <div className="mt-4 max-w-2xl text-sm leading-7 text-[#777168] [&_h1]:my-4 [&_h1]:text-2xl [&_h2]:my-3 [&_h2]:text-xl [&_h3]:my-3 [&_h3]:text-lg [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
                    {renderDescriptionHtml(
                      product.description ||
                        product.shortDescription ||
                        "No description available."
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <ProductReviews
                  key={id}
                  productId={id}
                  averageRating={product.rating}
                  initialReviewCount={product.reviewCount}
                  onReviewCountChange={handleReviewCountChange}
                />
              )}

              {activeTab === "faqs" && (
                <div>
                  <h2 className="font-serif text-2xl">Frequently Asked Questions</h2>
                  {faqsLoading && (
                    <p role="status" className="mt-4 text-sm text-[#817a71]">
                      Loading FAQs...
                    </p>
                  )}
                  {faqsError && (
                    <p role="alert" className="mt-4 text-sm text-red-700">
                      Unable to load FAQs: {faqsError}
                    </p>
                  )}
                  {!faqsLoading && !faqsError && faqs.length === 0 && (
                    <p className="mt-4 text-sm text-[#817a71]">
                      No FAQs available for this product.
                    </p>
                  )}
                  <div className="mt-5 space-y-3">
                    {faqs.map((faq, index) => (
                      <details
                        key={faq.id ?? `${faq.question}-${index}`}
                        className="rounded-lg border border-[#eae3da] bg-white p-4"
                      >
                        <summary className="cursor-pointer text-sm font-medium text-[#172521]">
                          {faq.question}
                        </summary>
                        <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#777168]">
                          {renderDescriptionHtml(faq.answer || "No answer provided.")}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand promise */}
            <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-lg bg-[#f3ece3] p-6 sm:p-7">
                <Gem size={23} className="text-[#a78051]" />
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a78051]">
                  The Elephanta Promise
                </p>
                <h3 className="mt-3 font-serif text-2xl">
                  Made to Be Treasured
                </h3>
                <p className="mt-3 text-xs leading-6 text-[#777168]">
                  Discover thoughtfully selected designs, elegant
                  craftsmanship, and jewellery made for your special moments.
                </p>
                <a
                  href="/about"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#89633d] hover:text-[#172521]"
                >
                  Learn More <ChevronRight size={14} />
                </a>
              </div>

              <div className="relative min-h-52 overflow-hidden rounded-lg sm:min-h-0 lg:min-h-56">
                <img
                  src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"
                  alt="Elegant jewellery presentation"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em]">
                    Crafted with care
                  </p>
                  <p className="mt-2 font-serif text-2xl">
                    A Gift Worth Remembering
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <YouMayAlsoLike productId={id} />
      </main>

      {/* Notification */}
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
