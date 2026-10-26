import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import RemoteImage from "./RemoteImage";
import { getYouMayAlsoLike } from "../../services/productapi";

function normalizeProduct(product) {
  const imageIds = product?.imageIds ?? product?.ImageIds ?? [];
  const primaryImageId = product?.primaryImageId ?? product?.PrimaryImageId;
  const price = Number(product?.price ?? product?.Price ?? 0);
  const rating = Number(
    product?.averageRating ?? product?.AverageRating ?? 0
  );
  const reviewCount = Number(
    product?.reviewCount ?? product?.ReviewCount ?? 0
  );

  return {
    id: product?.id ?? product?.Id,
    name: product?.name ?? product?.Name ?? "",
    price: Number.isFinite(price) ? price : 0,
    compareAtPrice:
      product?.compareAtPrice ?? product?.CompareAtPrice ?? null,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    imageSrc: primaryImageId
      ? `/api/Media/${primaryImageId}`
      : Array.isArray(imageIds) && imageIds[0]
        ? `/api/Media/${imageIds[0]}`
        : "",
  };
}

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function YouMayAlsoLike({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return undefined;
    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      setError("");
      try {
        const response = await getYouMayAlsoLike(productId);
        const items = Array.isArray(response)
          ? response
          : response?.items ?? response?.Items;
        if (!Array.isArray(items)) {
          throw new Error("Unexpected response while loading related products.");
        }
        if (!cancelled) {
          setProducts(
            items
              .map(normalizeProduct)
              .filter(
                (product) =>
                  product.id != null &&
                  String(product.id) !== String(productId)
              )
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.message || "Unable to load related products."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <section className="mt-8 border-t border-[#eae3da] pt-8 sm:mt-12 sm:pt-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#a78051]">
            Curated for you
          </p>
          <h2 className="font-serif text-3xl">You May Also Like</h2>
        </div>
        <a
          href="/store/products"
          className="text-xs text-[#8b6a45] hover:underline"
        >
          View All
        </a>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-[#817a71]">
          Loading recommendations...
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-700">
          Unable to load recommendations: {error}
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-[#817a71]">
          No recommendations available right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-lg border border-[#eee7df] bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#342719]/5"
            >
              <Link
                to={`/store/products/${encodeURIComponent(product.id)}`}
                className="block aspect-[0.9] overflow-hidden bg-[#f2ece5]"
              >
                <RemoteImage
                  src={product.imageSrc}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-3 sm:p-4">
                <Link
                  to={`/store/products/${encodeURIComponent(product.id)}`}
                  className="line-clamp-2 min-h-10 text-xs font-medium leading-5 hover:text-[#a78051]"
                >
                  {product.name}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {Number(product.compareAtPrice) > product.price && (
                    <span className="text-[10px] text-[#9b948b] line-through">
                      {formatPrice(Number(product.compareAtPrice))}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-[#817a71]">
                  {product.reviewCount > 0 ? (
                    <>
                      <Star
                        size={12}
                        className="fill-[#c79643] text-[#c79643]"
                      />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
