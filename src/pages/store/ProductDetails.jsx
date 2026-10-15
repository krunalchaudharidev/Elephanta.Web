import React, { useState } from "react";
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
  Play,
  Gem,
} from "lucide-react";

const product = {
  id: 1,
  name: "Royal Kundan Bridal Necklace",
  category: "Necklaces",
  collection: "Kundan",
  price: 20200,
  oldPrice: 24500,
  rating: 4.8,
  reviewCount: 124,
  description:
    "A timeless masterpiece, this royal kundan necklace is crafted with intricate detailing and premium quality stones, making it the perfect choice for your special moments.",
  images: [
    {
      src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=90",
      alt: "Royal bridal necklace",
    },
    {
      src: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=90",
      alt: "Gold jewellery close-up",
    },
    {
      src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=90",
      alt: "Matching statement jewellery",
    },
    {
      src: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=90",
      alt: "Jewellery craftsmanship",
    },
  ],
  specifications: [
    ["Product Type", "Bridal Necklace Set"],
    ["Collection", "Royal Kundan"],
    ["Metal Finish", "Gold Plated"],
    ["Stone Type", "Kundan & Crystal"],
    ["Occasion", "Wedding, Festive"],
    ["Packaging", "Premium Gift Box"],
  ],
};

const relatedProducts = [
  {
    id: 2,
    name: "Classic Everyday Gold Necklace",
    price: 3500,
    oldPrice: 4200,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 3,
    name: "Floral Antique Earrings",
    price: 1800,
    oldPrice: 2300,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 4,
    name: "Elegant Solitaire Crystal Ring",
    price: 4000,
    oldPrice: 4800,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 5,
    name: "Traditional Gold Plated Bangles",
    price: 900,
    oldPrice: 1200,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 6,
    name: "Pearl Drop Pendant Necklace",
    price: 2800,
    oldPrice: 3500,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=85",
  },
];

const metalFinishes = ["Gold Plated", "Silver", "Rose Gold", "Kundan"];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductDetails() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState("Kundan");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState("");

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 2500);
  };

  const handleAddToCart = () => {
    setCartCount((count) => count + quantity);
    showNotification(`${quantity} item(s) added to your cart.`);
  };

  const changeImage = (direction) => {
    setActiveImage((current) => {
      const total = product.images.length;
      return (current + direction + total) % total;
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#172521]">
      
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1280px] px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#93897e]">
          <a href="/" className="hover:text-[#a78051]">Home</a>
          <ChevronRight size={13} />
          <a href="/products" className="hover:text-[#a78051]">Shop</a>
          <ChevronRight size={13} />
          <a href="/products" className="hover:text-[#a78051]">
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
                  key={image.src}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`aspect-[0.8] overflow-hidden rounded-md border-2 transition ${
                    activeImage === index
                      ? "border-[#a78051]"
                      : "border-transparent hover:border-[#d7c5ad]"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="relative aspect-[0.86] overflow-hidden rounded-lg bg-[#f0e8de] sm:aspect-[0.95] lg:aspect-[0.88]">
              <img
                key={product.images[activeImage].src}
                src={product.images[activeImage].src}
                alt={product.images[activeImage].alt}
                className="h-full w-full object-cover"
              />

              <span className="absolute left-4 top-4 rounded-sm bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8d6a43]">
                Best Seller
              </span>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Add to wishlist"
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

              <button
                onClick={() => changeImage(-1)}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => changeImage(1)}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.src}
                    aria-label={`Go to image ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImage === index
                        ? "w-7 bg-white"
                        : "w-2 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product details */}
          <div className="py-1 lg:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a78051]">
              {product.category} <span className="mx-1.5">·</span>{" "}
              {product.collection}
            </p>

            <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5 text-[#c79643]">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} size={17} className="fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold">{product.rating}</span>
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
              <span className="text-sm text-[#9b948b] line-through">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="rounded-full bg-[#f5eadb] px-3 py-1 text-[11px] font-semibold text-[#986d3b]">
                {discount}% OFF
              </span>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#777168]">
              {product.description}
            </p>

            {/* Metal finish */}
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold">Metal Finish</h2>
                <span className="text-xs text-[#a78051]">{selectedMetal}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {metalFinishes.map((metal) => (
                  <button
                    key={metal}
                    onClick={() => setSelectedMetal(metal)}
                    className={`rounded-md border px-4 py-2.5 text-xs transition ${
                      selectedMetal === metal
                        ? "border-[#a78051] bg-[#f8f1e8] text-[#78532f]"
                        : "border-[#e4ddd4] bg-white text-[#625f59] hover:border-[#b99b77]"
                    }`}
                  >
                    {metal}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-7">
              <h2 className="mb-3 text-xs font-semibold">Quantity</h2>
              <div className="flex h-11 w-36 items-center justify-between rounded-md border border-[#e4ddd4] bg-white">
                <button
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-full w-10 items-center justify-center text-[#777168] transition hover:text-[#a78051] disabled:opacity-40"
                >
                  <Minus size={15} />
                </button>

                <span className="text-sm">{quantity}</span>

                <button
                  aria-label="Increase quantity"
                  disabled={quantity >= 10}
                  onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                  className="flex h-full w-10 items-center justify-center text-[#777168] transition hover:text-[#a78051] disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[#91877b]">
                Maximum 10 items per order.
              </p>
            </div>

            {/* Purchase actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#102722] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#a78051]"
              >
                <ShoppingCart size={17} />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  setIsFavorite((current) => !current);
                  showNotification(
                    isFavorite
                      ? "Removed from your wishlist."
                      : "Added to your wishlist."
                  );
                }}
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
                    detail: "Orders above ₹2,000",
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
              ["specifications", "Specifications"],
              ["reviews", `Reviews (${product.reviewCount})`],
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

          <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div>
              {activeTab === "description" && (
                <div>
                  <h2 className="font-serif text-2xl">
                    Royal Elegance, Timeless Beauty
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777168]">
                    This exquisite kundan necklace is a celebration of
                    traditional craftsmanship and modern elegance. Designed
                    with precision, it features brilliant kundan stones set
                    in a beautiful finish with delicate pearl drops. Perfect
                    for weddings, festive occasions, and grand celebrations.
                  </p>

                  <ul className="mt-5 space-y-3">
                    {[
                      "Handcrafted design with intricate detailing",
                      "Elegant finish for special occasions",
                      "Designed to complement traditional outfits",
                      "Comes in a premium presentation box",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-xs leading-5 text-[#625f59]"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eee3d2] text-[#987344]">
                          <Check size={11} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "specifications" && (
                <div>
                  <h2 className="font-serif text-2xl">Product Specifications</h2>
                  <div className="mt-5 divide-y divide-[#eee7df]">
                    {product.specifications.map(([label, value]) => (
                      <div
                        key={label}
                        className="grid grid-cols-2 gap-4 py-4 text-sm"
                      >
                        <span className="text-[#817a71]">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div id="reviews">
                  <h2 className="font-serif text-2xl">Customer Reviews</h2>
                  <div className="mt-5 rounded-lg border border-[#eae3da] bg-white p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-serif text-5xl">
                        {product.rating}
                      </span>
                      <div>
                        <div className="flex gap-1 text-[#c79643]">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <Star
                              key={item}
                              size={17}
                              className="fill-current"
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-[#817a71]">
                          Based on {product.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                    <p className="mt-6 border-t border-[#eee7df] pt-5 text-sm leading-6 text-[#817a71]">
                      Customer reviews will appear here when review data is
                      connected to your API.
                    </p>
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

        {/* Related products */}
        <section className="mt-8 border-t border-[#eae3da] pt-8 sm:mt-12 sm:pt-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#a78051]">
                Curated for you
              </p>
              <h2 className="font-serif text-3xl">You May Also Like</h2>
            </div>
            <a
              href="/products"
              className="text-xs text-[#8b6a45] hover:underline"
            >
              View All
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {relatedProducts.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-lg border border-[#eee7df] bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#342719]/5"
              >
                <a
                  href={`/products/${item.id}`}
                  className="block aspect-[0.9] overflow-hidden bg-[#f2ece5]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </a>
                <div className="p-3 sm:p-4">
                  <a
                    href={`/products/${item.id}`}
                    className="line-clamp-2 min-h-10 text-xs font-medium leading-5 hover:text-[#a78051]"
                  >
                    {item.name}
                  </a>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] text-[#9b948b] line-through">
                      {formatPrice(item.oldPrice)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#817a71]">
                    <Star
                      size={12}
                      className="fill-[#c79643] text-[#c79643]"
                    />
                    {item.rating}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
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
