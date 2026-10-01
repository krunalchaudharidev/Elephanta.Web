import React, { useState, useEffect } from "react";
import PageHeader from "./component/PageHeader";
import ToggleSwitch from "./component/ToggleSwitch";
import RemoteImage from "./component/RemoteImage";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useParams } from 'react-router-dom'
import { getProduct, getCategories, updateProduct as apiUpdateProduct } from '../../services/productapi'
import RichTextEditor from './component/RichTextEditor'

// Inline SVG icon components (small, minimal paths)
const Svg = ({ children, className, viewBox = "0 0 24 24", ...rest }) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg" {...rest}>
    {children}
  </svg>
);

const ArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M15 19l-7-7 7-7" />
  </Svg>
);

const Save = (p) => (
  <Svg {...p}>
    <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8" />
  </Svg>
);

const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Svg>
);

const CircleHelp = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 014 1c0 2-2 2-2 3" />
    <path d="M12 17h.01" />
  </Svg>
);

const Tag = (p) => (
  <Svg {...p}>
    <path d="M20 10V6a2 2 0 00-2-2h-4L4 14v4a2 2 0 002 2h4l10-10z" />
    <path d="M7 7h.01" />
  </Svg>
);

const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);

const Settings2 = (p) => (
  <Svg {...p}>
    <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 014.27 17.9l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.3 4.27a2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H12a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c.12.67.51 1.25 1.1 1.59z" />
  </Svg>
);

const FileText = (p) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8M8 9h4" />
  </Svg>
);

const UploadCloud = (p) => (
  <Svg {...p}>
    <path d="M21 16v-1a4 4 0 00-4-4h-1.26A6 6 0 106 15" />
    <path d="M12 12v9" />
    <path d="M9 15l3-3 3 3" />
  </Svg>
);

const Trash2 = (p) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

const GripVertical = (p) => (
  <Svg {...p} viewBox="0 0 10 24">
    <circle cx="5" cy="4" r="1" />
    <circle cx="5" cy="12" r="1" />
    <circle cx="5" cy="20" r="1" />
  </Svg>
);

const Copy = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h8" />
  </Svg>
);

const Bold = (p) => (
  <Svg {...p} viewBox="0 0 24 24">
    <path d="M6 4h7a4 4 0 010 8H6zM6 12h8a4 4 0 010 8H6z" />
  </Svg>
);

const Italic = (p) => (
  <Svg {...p}>
    <path d="M10 4l4 0M10 20l4 0M13 4l-2 16" />
  </Svg>
);

const Underline = (p) => (
  <Svg {...p}>
    <path d="M5 3v8a7 7 0 0014 0V3" />
    <path d="M5 21h14" />
  </Svg>
);

const List = (p) => (
  <Svg {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </Svg>
);

const ListOrdered = List;

const Link = (p) => (
  <Svg {...p}>
    <path d="M10 14a5 5 0 007 0l1-1a5 5 0 00-7-7l-1 1" />
    <path d="M14 10a5 5 0 00-7 0l-1 1a5 5 0 007 7l1-1" />
  </Svg>
);

// Sidebar icons removed (not used in this page)

const Settings = Settings2;

const Bell = (p) => (
  <Svg {...p}>
    <path d="M15 17H9a3 3 0 006 0z" />
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
  </Svg>
);

const ChevronDown = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

const ChevronUp = (p) => (
  <Svg {...p}>
    <path d="M18 15l-6-6-6 6" />
  </Svg>
);

const ChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 18l6-6-6-6" />
  </Svg>
);

const ProductDetails = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isActive, setIsActive] = useState(true);

  const [product, setProduct] = useState({
    id: null,
    name: "",
    sku: "",
    slug: "",
    category: "",
    brand: "",
    shortDescription: "",
    description: "",
    price: 0,
    compareAtPrice: null,
    stockQuantity: 0,
    weight: 0,
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    soldQuantity: 0,
  });

  const [slugTouched, setSlugTouched] = useState(false)

  function slugify(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(product?.name || null);
    return () => setTitle(null);
  }, [product?.name, setTitle]);

  const [images, setImages] = useState([]);

  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What is the return policy?",
      answer: "You can return the product within 30 days of delivery.",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 2,
      question: "What sizes are available?",
      answer: "Available sizes range from UK 6 to UK 12.",
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 3,
      question: "Is it waterproof?",
      answer:
        "The shoes are water-resistant but not completely waterproof.",
      isActive: true,
      displayOrder: 3,
    },
  ]);

  const updateProduct = (field, value) => {
    if (field === 'slug') {
      setSlugTouched(true)
      setProduct((prev) => ({ ...prev, slug: value }))
      return
    }

    if (field === 'name') {
      setProduct((prev) => ({
        ...prev,
        name: value,
        slug: !slugTouched ? slugify(value) : prev.slug,
      }))
      return
    }

    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }))
  };

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");

  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      try {
        const res = await getCategories(1, 1000);
        if (!mounted) return;
        const items = res?.items || res?.Items || [];
        setCategories(items);
      } catch (e) {}
    }
    loadCats();
    return () => {
      mounted = false;
    };
  }, []);

  // load product when route id present
  const { id: routeId } = useParams();

  useEffect(() => {
    if (!routeId) return;
    let mounted = true;
    async function load() {
      try {
        const res = await getProduct(routeId)
        if (!mounted || !res) return

        const pid = res?.id ?? res?.Id
        const mapped = {
          id: pid,
          name: res?.name ?? res?.Name ?? '',
          sku: res?.sku ?? res?.SKU ?? '',
          slug: res?.slug ?? res?.Slug ?? '',
          shortDescription: res?.shortDescription ?? res?.ShortDescription ?? '',
          description: res?.description ?? res?.Description ?? '',
          price: res?.price ?? res?.Price ?? 0,
          compareAtPrice: res?.compareAtPrice ?? res?.CompareAtPrice ?? null,
          stockQuantity: res?.stockQuantity ?? res?.StockQuantity ?? 0,
          isFeatured: res?.isFeatured ?? res?.IsFeatured ?? false,
          // keep category name for display
          category: res?.categoryName ?? res?.CategoryName ?? '',
        }

        setProduct(mapped)
        // determine if slug was manually edited (treat as touched when it differs from auto value)
        const auto = slugify(mapped.name)
        setSlugTouched(Boolean(mapped.slug) && mapped.slug !== auto)
        setIsActive(Boolean(res?.isActive ?? res?.IsActive))
        setCategoryId(res?.categoryId ?? res?.CategoryId ?? '')

        // build images array from ImageIds -> /api/Media/{id}
        const imageIds = res?.imageIds ?? res?.ImageIds ?? []
        if (imageIds && imageIds.length) {
          const imgs = imageIds.map((mid, idx) => ({ id: mid, url: `/api/Media/${mid}`, isPrimary: idx === 0 }))
          setImages(imgs)
        }

      } catch (e) {
        // ignore for now
      }
    }

    load()
    return () => { mounted = false }
  }, [routeId])

  // -----------------------------------------
  // IMAGE HANDLING
  // -----------------------------------------

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);

    const newImages = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        isPrimary: false,
        file,
      }));

    setImages((prev) => [...prev, ...newImages]);

    event.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const setPrimaryImage = (id) => {
    setImages((prev) =>
      prev.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      }))
    );
  };

  // -----------------------------------------
  // FAQ HANDLING
  // -----------------------------------------

  const addFaq = () => {
    const nextOrder = faqs.length + 1;

    setFaqs((prev) => [
      ...prev,
      {
        id: Date.now(),
        question: "",
        answer: "",
        isActive: true,
        displayOrder: nextOrder,
      },
    ]);
  };

  const updateFaq = (id, field, value) => {
    setFaqs((prev) =>
      prev.map((faq) =>
        faq.id === id
          ? {
              ...faq,
              [field]: value,
            }
          : faq
      )
    );
  };

  const removeFaq = (id) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  // -----------------------------------------
  // SAVE HANDLERS
  // - basic: updates only name, sku, slug, categoryId, isActive
  // - descriptions: updates shortDescription and description
  // - faqs: updates faqs array
  // -----------------------------------------

  const handleSaveBasic = async () => {
    const id = product?.id ?? routeId
    if (!id) {
      alert('Product id is required to update.')
      return
    }

    const payload = {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      isActive: Boolean(isActive),
      categoryId: categoryId || null,
    }

    try {
      await apiUpdateProduct(id, payload)
      setProduct((prev) => ({ ...prev, ...payload }))
    } catch (e) {
      alert(e?.message || 'Failed to save product')
    }
  }

  const handleSaveDescriptions = async () => {
    const id = product?.id ?? routeId
    if (!id) {
      alert('Product id is required to update.')
      return
    }

    const payload = {
      shortDescription: product.shortDescription,
      description: product.description,
    }

    try {
      await apiUpdateProduct(id, payload)
      setProduct((prev) => ({ ...prev, ...payload }))
    } catch (e) {
      alert(e?.message || 'Failed to save descriptions')
    }
  }

  const handleSaveFaqs = async () => {
    const id = product?.id ?? routeId
    if (!id) {
      alert('Product id is required to update.')
      return
    }

    const payload = {
      faqs,
    }

    try {
      await apiUpdateProduct(id, payload)
      // keep local faqs state as-is
    } catch (e) {
      alert(e?.message || 'Failed to save FAQs')
    }
  }

  const handleSavePricing = async () => {
    const id = product?.id ?? routeId
    if (!id) {
      alert('Product id is required to update.')
      return
    }

    const payload = {
      price: product.price ?? 0,
      compareAtPrice: product.compareAtPrice ?? null,
    }

    try {
      await apiUpdateProduct(id, payload)
      setProduct((prev) => ({ ...prev, ...payload }))
    } catch (e) {
      alert(e?.message || 'Failed to save pricing')
    }
  }

  const handleSaveInventory = async () => {
    const id = product?.id ?? routeId
    if (!id) {
      alert('Product id is required to update.')
      return
    }

    const payload = {
      stockQuantity: product.stockQuantity ?? 0,
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(isActive),
    }

    try {
      await apiUpdateProduct(id, payload)
      setProduct((prev) => ({ ...prev, ...payload }))
      setIsActive(Boolean(payload.isActive))
    } catch (e) {
      alert(e?.message || 'Failed to save inventory')
    }
  }

  // -----------------------------------------
  // TABS
  // -----------------------------------------

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: FileText,
    },
    {
      id: "pricing",
      label: "Pricing & Inventory",
      icon: Tag,
    },
    {
      id: "images",
      label: "Images",
      icon: ImageIcon,
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: CircleHelp,
    },
  ];

  return (
    
        <div className="mx-auto max-w-[1500px]">

                <div className="w-full">
                  <PageHeader
                  title={product?.name || "Product Details"}
                  breadcrumbs={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Products", to: "/admin/products" },
                    { label: product?.name || "Product Details" },
                  ]}
                />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Update product information, images, pricing and settings.</p>
                  </div>
                  
                </div>
              </div>

            
            {/* =====================================================
                BASIC PRODUCT INFORMATION
            ====================================================== */}

            <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[150px_1fr]">

                {/* Product Image */}

                <div className="flex justify-center xl:justify-start">

                  <div className="w-full max-w-[300px] xl:max-w-none mx-auto aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                    <RemoteImage src={images.find((x) => x.isPrimary)?.url} alt={product.name} className="h-full w-full object-cover" />

                  </div>

                </div>


                {/* Product Fields */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                  <FormField label="Product Name" required className="md:col-span-2">
                    <input value={product.name} onChange={(e) => updateProduct("name", e.target.value)} className={inputClass} />
                  </FormField>


                  <FormField label="SKU" required>
                    <input value={product.sku} onChange={(e) => updateProduct("sku", e.target.value)} className={inputClass} />
                  </FormField>


                  <FormField label="Slug">

                    <div className="relative">

                      <input value={product.slug} onChange={(e) => updateProduct("slug", e.target.value)} className={`${inputClass} pr-10`} />

                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                        <Copy className="h-4 w-4" />
                      </button>

                    </div>

                  </FormField>


                  <FormField label="Category" className="md:col-span-2">

                    <select
                      value={categoryId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setCategoryId(id);
                        const sel = categories.find((c) => String(c.id ?? c.Id) === String(id));
                        updateProduct("category", sel?.name ?? sel?.Name ?? "");
                      }}
                      className={selectClass}
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.name ?? c.Name}</option>
                      ))}
                    </select>

                  </FormField>
                  
                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>

                    <div className="flex h-[42px] items-center gap-3">

                      <ToggleSwitch checked={isActive} onChange={(v) => setIsActive(v)} />

                      <span className={`text-sm font-medium ${isActive ? "text-emerald-600" : "text-slate-500"}`}>{isActive ? "Active" : "Inactive"}</span>

                    </div>

                  </div>

                </div>

              </div>

              <div className="mt-2 flex justify-center md:justify-end">
                <button type="button" onClick={handleSaveBasic} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </section>


            {/* =====================================================
                TABS
            ====================================================== */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              {/* Tab Header */}

              <div className="overflow-x-auto border-b border-slate-200">

                <div className="flex min-w-max px-4">

                  {tabs.map((tab) => {

                    const Icon = tab.icon;

                    const active = activeTab === tab.id;

                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm transition ${active ? "border-blue-600 font-semibold text-blue-600" : "border-transparent font-medium text-slate-500 hover:text-slate-800"}`}>

                        <Icon className="h-4 w-4" />

                        {tab.label}

                      </button>
                    );

                  })}

                </div>

              </div>


              {/* =====================================================
                  GENERAL
              ====================================================== */}

              {activeTab === "general" && (

                <div className="p-5">

                  <div className="rounded-xl border border-slate-200 p-5">

                    <h2 className="mb-5 font-semibold text-slate-900">Descriptions</h2>


                    {/* Short Description */}

                    <div className="mb-5">

                      <div className="mb-1.5 flex justify-between">

                        <label className="text-sm font-medium text-slate-700">Short Description<span className="text-red-500"> *</span></label>

                        <span className="text-xs text-slate-400">{product.shortDescription.length} / 200</span>

                      </div>

                      <textarea rows={3} maxLength={200} value={product.shortDescription} onChange={(e) => updateProduct("shortDescription", e.target.value)} className={`${inputClass} resize-none`} />

                    </div>


                    {/* Full Description */}

                    <div>

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Description<span className="text-red-500"> *</span></label>

                        <RichTextEditor value={product.description} onChange={(v) => updateProduct('description', v)} maxLength={5000} rows={8} />

                    </div>

                      <div className="mt-5 flex justify-end">
                        <button type="button" onClick={handleSaveDescriptions} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>

                    </div>

                </div>

              )}


              {/* =====================================================
                  IMAGES
              ====================================================== */}

              {activeTab === "images" && (

                <div className="p-5">

                  <div className="rounded-xl border border-slate-200 p-5">

                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                      <div>

                        <h2 className="font-semibold text-slate-900">Product Images</h2>

                        <p className="mt-1 text-sm text-slate-500">Upload and manage images for this product.</p>

                      </div>

                      <input id="image-upload" type="file" multiple accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden" />

                    </div>


                    {/* Upload */}

                    <label htmlFor="image-upload" className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">

                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">

                        <UploadCloud className="h-6 w-6 text-blue-600" />

                      </div>

                      <p className="text-sm font-medium text-slate-700">Drag & drop images here</p>

                      <p className="mt-1 text-xs text-slate-500">or click to browse</p>

                      <p className="mt-3 text-xs text-slate-400">JPG, PNG, JPEG · Maximum 5MB per image</p>

                    </label>


                    {/* Image Grid */}

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

                      {images.map((image) => (

                        <div key={image.id} className="group relative">

                          <div className={`aspect-square overflow-hidden rounded-xl bg-slate-100 ${image.isPrimary ? "border-2 border-blue-500" : "border border-slate-200"}`}>

                            {image.url ? (
                              <RemoteImage src={image.url} alt={product.name} className="object-cover h-full w-full" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">No image</div>
                            )}

                          </div>


                          {image.isPrimary && (
                            <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Primary</span>
                          )}


                          {!image.isPrimary && (
                            <button onClick={() => setPrimaryImage(image.id)} className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-xs font-medium opacity-0 shadow transition group-hover:opacity-100">Set Primary</button>
                          )}


                          <button onClick={() => removeImage(image.id)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 opacity-0 shadow transition hover:text-red-700 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              )}


              {/* =====================================================
                  FAQ
              ====================================================== */}

              {activeTab === "faqs" && (

                <div className="p-5">

                  <div className="overflow-hidden rounded-xl border border-slate-200">

                    {/* Header */}

                    <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">

                      <div>

                        <h2 className="font-semibold text-slate-900">Product FAQs</h2>

                        <p className="mt-1 text-sm text-slate-500">Manage frequently asked questions for this product.</p>

                      </div>

                      <button onClick={addFaq} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">

                        <Plus className="h-4 w-4" />

                        Add FAQ

                      </button>

                    </div>


                    {/* FAQ List */}

                    <div className="border-t border-slate-200">


                      {faqs.length === 0 && (
                        <div className="p-10 text-center">

                          <CircleHelp className="mx-auto h-10 w-10 text-slate-300" />

                          <p className="mt-3 text-sm font-medium text-slate-600">No FAQs added</p>

                          <p className="mt-1 text-xs text-slate-400">Add a FAQ to help customers understand this product.</p>

                        </div>
                      )}


                      {faqs.map((faq) => (

                        <div key={faq.id} className="border-b border-slate-200 p-5 last:border-b-0">

                          <div className="flex items-start gap-4">

                            <div className="mt-2 cursor-move text-slate-400">
                              <GripVertical className="h-5 w-5" />
                            </div>


                            <div className="flex-1">

                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">

                                {/* Question */}

                                <div>

                                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">QUESTION</label>

                                  <input value={faq.question} onChange={(e) => updateFaq(faq.id, "question", e.target.value)} placeholder="Enter question" className={inputClass} />

                                </div>


                                {/* Answer */}

                                <div>

                                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">ANSWER</label>

                                  <textarea rows={2} value={faq.answer} onChange={(e) => updateFaq(faq.id, "answer", e.target.value)} placeholder="Enter answer" className={`${inputClass} resize-none`} />

                                </div>

                              </div>


                              {/* FAQ options */}

                              <div className="mt-4 flex flex-wrap items-center gap-5">

                                <label className="flex items-center gap-2 text-sm">

                                  <input type="checkbox" checked={faq.isActive} onChange={(e) => updateFaq(faq.id, "isActive", e.target.checked)} className="h-4 w-4 accent-blue-600" />

                                  Active

                                </label>


                                <div className="flex items-center gap-2">

                                  <span className="text-sm text-slate-500">Display Order</span>

                                  <input type="number" value={faq.displayOrder} onChange={(e) => updateFaq(faq.id, "displayOrder", Number(e.target.value))} className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500" />

                                </div>

                              </div>

                            </div>


                            {/* Delete */}

                            <button onClick={() => removeFaq(faq.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-5 w-5" />
                            </button>

                          </div>

                        </div>

                      ))}

                    </div>

                    <div className="mt-5 flex justify-end p-5">
                      <button type="button" onClick={handleSaveFaqs} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>

                  </div>

                </div>

              )}


              {/* =====================================================
                  PRICING & INVENTORY
              ====================================================== */}

              {activeTab === "pricing" && (

                <div className="p-5">

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {/* Pricing */}

                    <div className="rounded-xl border border-slate-200 p-5">

                      <h2 className="mb-5 font-semibold text-slate-900">Pricing</h2>

                      <div className="space-y-5">

                        <FormField label="Price" required>

                          <div className="relative">

                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>

                            <input type="number" value={product.price} onChange={(e) => updateProduct("price", Number(e.target.value))} className={`${inputClass} pl-8`} />

                          </div>

                        </FormField>

                        <FormField label="Compare at Price">

                          <div className="relative">

                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>

                            <input type="number" value={product.compareAtPrice} onChange={(e) => updateProduct("compareAtPrice", Number(e.target.value))} className={`${inputClass} pl-8`} />

                          </div>

                        </FormField>

                        <div className="mt-5 flex justify-end">
                          <button type="button" onClick={handleSavePricing} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                            <Save className="h-4 w-4" />
                            Save Changes
                          </button>
                        </div>

                      </div>

                    </div>


                    {/* Inventory */}

                    <div className="rounded-xl border border-slate-200 p-5">

                      <h2 className="mb-5 font-semibold text-slate-900">Inventory</h2>

                      <div className="space-y-5">

                        <FormField label="Stock Quantity" required>

                          <input type="number" value={product.stockQuantity} onChange={(e) => updateProduct("stockQuantity", Number(e.target.value))} className={inputClass} />

                        </FormField>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs font-medium text-slate-500">Sold</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{product.soldQuantity ?? 0}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs font-medium text-slate-500">Remaining</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{Math.max(0, (product.stockQuantity || 0) - (product.soldQuantity ?? 0))}</p>
                          </div>
                        </div>

                        

                      </div>


                      {/* Visibility */}

                      <div className="mt-5 rounded-xl border border-slate-200 p-5">

                        <h2 className="mb-5 font-semibold text-slate-900">Product Visibility</h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>

                              <p className="text-sm font-medium">Featured Product</p>

                              <p className="mt-1 text-xs text-slate-500">Show this product in featured sections.</p>

                            </div>

                            <ToggleSwitch size="sm" checked={product.isFeatured} onChange={(v) => updateProduct('isFeatured', v)} />

                          </label>


                          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>

                              <p className="text-sm font-medium">Active Product</p>

                              <p className="mt-1 text-xs text-slate-500">Product will be visible to customers.</p>

                            </div>

                            <ToggleSwitch size="sm" checked={isActive} onChange={(v) => setIsActive(v)} />

                          </label>

                        </div>

                      </div>

                      <div className="mt-5 flex justify-end">
                        <button type="button" onClick={handleSaveInventory} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>

                    </div>

                  </div>


                </div>

              )}


              


              

            </section>


            

          </div>

  );
};


// =====================================================
// REUSABLE COMPONENTS
// =====================================================

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";


const FormField = ({
  label,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={className}>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="text-red-500"> {" "}*</span>
        )}

      </label>

      {children}

    </div>
  );
};


const ReadOnlyField = ({
  label,
  value,
}) => {
  return (
    <FormField label={label}>

      <input value={value} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />

    </FormField>
  );
};


const EditorButton = ({ icon }) => {
  return (
    <button type="button" className="rounded p-1.5 hover:bg-slate-200">
      {React.cloneElement(icon, {
        className: "h-4 w-4",
      })}
    </button>
  );
};


// Sidebar helper components removed


export default ProductDetails;
