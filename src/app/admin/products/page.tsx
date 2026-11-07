"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Search, Upload, Image as ImageIcon, Star } from "lucide-react";
import { ProductType } from "@/types";

interface VariantForm {
  id?: string;
  size: string;
  sku: string;
  price: string | number;
  mrp: string | number;
  stock: string | number;
  isDefault: boolean;
}

interface ImageForm {
  id?: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [fragranceFamily, setFragranceFamily] = useState("Oud");
  const [gender, setGender] = useState("Unisex");
  const [topNotes, setTopNotes] = useState("");
  const [middleNotes, setMiddleNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Dynamic Variants & Images
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [images, setImages] = useState<ImageForm[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?includeUnpublished=true");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setSlug("");
    setSubtitle("Extrait de Parfum • 32% Pure Oil Strength");
    setDescription("");
    setFragranceFamily("Oud");
    setGender("Unisex");
    setTopNotes("Sicilian Bergamot, Saffron Threads");
    setMiddleNotes("Velvet Damascena Rose, Smoked Incense");
    setBaseNotes("Aged Cambodian Agarwood (Oud), Black Amber");
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsPublished(true);

    setVariants([
      { size: "60ml", sku: "GC-NEW-60", price: "1999", mrp: "3499", stock: "100", isDefault: true },
      { size: "20ml", sku: "GC-NEW-20", price: "799", mrp: "1299", stock: "200", isDefault: false },
    ]);

    setImages([
      { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85", alt: "New Flacon", isPrimary: true },
    ]);

    setMessage("");
    setModalOpen(true);
  };

  const openEditModal = (p: ProductType) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setSubtitle(p.subtitle || "");
    setDescription(p.description);
    setFragranceFamily(p.fragranceFamily);
    setGender(p.gender);
    setTopNotes(p.topNotes);
    setMiddleNotes(p.middleNotes);
    setBaseNotes(p.baseNotes);
    setIsFeatured(p.isFeatured);
    setIsBestSeller(p.isBestSeller);
    setIsNewArrival(p.isNewArrival);
    setIsPublished(p.isPublished);

    // Load existing variants
    if (p.variants && p.variants.length > 0) {
      setVariants(
        p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          sku: v.sku,
          price: String(v.price),
          mrp: String(v.mrp),
          stock: String(v.stock),
          isDefault: v.isDefault,
        }))
      );
    } else {
      setVariants([
        { size: "60ml", sku: `GC-${p.slug.toUpperCase()}-60`, price: "1999", mrp: "3499", stock: "50", isDefault: true },
      ]);
    }

    // Load existing images
    if (p.images && p.images.length > 0) {
      setImages(
        p.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || p.name,
          isPrimary: img.isPrimary,
        }))
      );
    } else {
      setImages([
        { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85", alt: p.name, isPrimary: true },
      ]);
    }

    setMessage("");
    setModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok && data.url) {
          setImages((prev) => [
            ...prev,
            {
              url: data.url,
              alt: name || "Product Image",
              isPrimary: prev.length === 0, // First image is primary by default
            },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload image file");
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset input
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === indexToPrimary,
      }))
    );
  };

  // Variant Management Handlers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "100ml",
        sku: `GC-${(slug || "PERFUME").toUpperCase().slice(0, 5)}-${Date.now().toString().slice(-4)}`,
        price: "2499",
        mrp: "3999",
        stock: "50",
        isDefault: prev.length === 0,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: any) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert("A perfume must have at least one size variant.");
      return;
    }
    setVariants((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((v) => v.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (images.length === 0) {
      setMessage("Please upload or add at least one product photo.");
      setSaving(false);
      return;
    }

    if (variants.length === 0) {
      setMessage("Please specify at least one product variant (size, price, stock).");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle,
      description,
      fragranceFamily,
      gender,
      topNotes,
      middleNotes,
      baseNotes,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      variants: variants.map((v, idx) => ({
        id: v.id,
        size: v.size,
        sku: v.sku || `GC-${name.slice(0, 3).toUpperCase()}-${idx}`,
        price: parseFloat(String(v.price)) || 1999,
        mrp: parseFloat(String(v.mrp)) || 2999,
        stock: parseInt(String(v.stock), 10) || 0,
        isDefault: v.isDefault,
      })),
      images: images.map((img, idx) => ({
        url: img.url,
        alt: img.alt || name,
        isPrimary: img.isPrimary,
        displayOrder: idx + 1,
      })),
    };

    try {
      const url = isEditing && currentId ? `/api/products/${currentId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        loadProducts();
      } else {
        setMessage(data.error || "Operation failed");
      }
    } catch {
      setMessage("Network error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${prodName}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch {
      alert("Network error");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.fragranceFamily.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE7DF]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Catalog & Inventory Administration
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
            Product Management ({products.length})
          </h1>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Upload bottle photography, adjust prices, edit fragrance notes pyramid, and manage inventory.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors rounded-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Flacon</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search flacons by name, family, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
        />
        <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-2.5" />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EBE7DF] rounded-sm overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#8C827A] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Flacon Photo & Name</th>
              <th className="p-3">Family / Gender</th>
              <th className="p-3">Sizes & Pricing (INR)</th>
              <th className="p-3">Total Stock</th>
              <th className="p-3">Badges</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {filteredProducts.map((p) => {
              const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
              const totalStock = (p.variants || []).reduce((sum, v) => sum + v.stock, 0);

              return (
                <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={primaryImg?.url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80"}
                        alt={p.name}
                        className="w-12 h-14 object-contain p-0.5 rounded-sm border border-[#EBE7DF] bg-[#FAF8F5]"
                      />
                      <div>
                        <span className="font-semibold text-[#0F0F0F] block text-sm">{p.name}</span>
                        <span className="text-[11px] text-[#8C827A] italic">{p.subtitle || p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[#5A5A5A]">
                    <span className="block font-medium text-[#0F0F0F]">{p.fragranceFamily}</span>
                    <span className="text-[11px] text-[#8C827A]">{p.gender}</span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {p.variants.map((v) => (
                        <div key={v.id} className="text-[11px]">
                          <span className="font-semibold text-[#0F0F0F]">{v.size}:</span> ₹{v.price}
                          <span className="text-[#8C827A] line-through ml-1.5">₹{v.mrp}</span>
                          <span className="text-[#2A6E3B] ml-1.5 font-medium">({v.stock} in stock)</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold ${totalStock < 20 ? "text-amber-700" : "text-[#0F0F0F]"}`}>
                      {totalStock} units
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isBestSeller && (
                        <span className="px-1.5 py-0.5 bg-[#0F0F0F] text-white text-[9px] rounded-xs font-semibold">
                          BESTSELLER
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-[#C5A059] text-white text-[9px] rounded-xs font-semibold">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.isPublished ? "bg-[#EAF5EC] text-[#2A6E3B]" : "bg-[#F0ECE4] text-[#7A7A7A]"}`}>
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1.5 bg-[#0F0F0F] text-white hover:bg-[#C5A059] text-[11px] font-medium uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5"
                        title="Edit Price, Images & Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-[#8C827A] hover:text-red-600 hover:bg-[#FDECEC] rounded-sm transition-colors"
                        title="Delete Flacon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Product Edit & Image Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-sm shadow-2xl p-6 sm:p-8 space-y-6 border border-[#EBE7DF] my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#EBE7DF] pb-3">
              <div>
                <h3 className="font-serif-luxury text-xl text-[#0F0F0F]">
                  {isEditing ? `Edit Flacon: ${name}` : "Create New Flacon"}
                </h3>
                <p className="text-xs text-[#7A7A7A]">
                  Upload bottle photos, set prices for variants, and refine olfactory notes.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#8C827A] hover:text-[#0F0F0F] p-1">
                ✕
              </button>
            </div>

            {message && (
              <div className="p-3 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F]">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* 1. Basic Product Identity */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-[#0F0F0F] pb-1 border-b border-[#F0ECE4]">
                  1. Perfume Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#0F0F0F] font-medium mb-1">Fragrance Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Black Oud Royale"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F0F0F] font-medium mb-1">URL Handle (Slug)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="black-oud-royale"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Subtitle / Concentration Headline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Extrait de Parfum • 32% Pure Oil Strength"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#0F0F0F] font-medium mb-1">Fragrance Family</label>
                    <select
                      value={fragranceFamily}
                      onChange={(e) => setFragranceFamily(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-medium"
                    >
                      <option value="Oud">Oud</option>
                      <option value="Floral & Fruity">Floral & Fruity</option>
                      <option value="Fresh & Aquatic">Fresh & Aquatic</option>
                      <option value="Warm & Woody">Warm & Woody</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#0F0F0F] font-medium mb-1">Category / Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-medium"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Scent Story / Narrative Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="The olfactory narrative and characteristics of this fragrance..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Manual Product Image Upload & Gallery */}
              <div className="space-y-3 p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-[#0F0F0F] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                      <span>2. Product Photography Gallery</span>
                    </h4>
                    <p className="text-[11px] text-[#7A7A7A]">
                      Upload high-resolution bottle photos directly from your computer or phone.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium rounded-sm cursor-pointer hover:bg-[#C5A059] transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Photo File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Images Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-[3/4] rounded-sm overflow-hidden border bg-white group ${
                        img.isPrimary ? "border-[#C5A059] ring-2 ring-[#C5A059]/40" : "border-[#E0DBD0]"
                      }`}
                    >
                      <img src={img.url} alt={img.alt || name} className="w-full h-full object-contain p-1" />

                      {/* Primary Badge */}
                      {img.isPrimary && (
                        <span className="absolute top-1.5 left-1.5 bg-[#C5A059] text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs shadow-xs">
                          Primary
                        </span>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="self-end p-1 bg-red-600 text-white rounded-xs hover:bg-red-700"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="w-full py-1 bg-white text-[#0F0F0F] text-[10px] font-semibold uppercase tracking-wider rounded-xs hover:bg-[#FAF8F5]"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Product Variants & Prices */}
              <div className="space-y-3 p-4 bg-white border border-[#EBE7DF] rounded-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#0F0F0F]">
                      3. Sizes, Prices & Inventory Stock
                    </h4>
                    <p className="text-[11px] text-[#7A7A7A]">
                      Configure 60ml, 20ml, 100ml, or gift set prices (INR), MRP, and warehouse stock units.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#0F0F0F] text-[#0F0F0F] text-xs uppercase tracking-luxury hover:bg-[#0F0F0F] hover:text-white transition-colors rounded-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Variant</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                    >
                      <div>
                        <label className="block text-[11px] font-medium text-[#0F0F0F] mb-1">
                          Flacon Size
                        </label>
                        <input
                          type="text"
                          required
                          value={v.size}
                          onChange={(e) => updateVariant(idx, "size", e.target.value)}
                          placeholder="e.g. 60ml"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DDD] rounded-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#0F0F0F] mb-1">
                          Selling Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => updateVariant(idx, "price", e.target.value)}
                          placeholder="1999"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DDD] rounded-sm font-semibold text-[#0F0F0F]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#0F0F0F] mb-1">
                          MRP Strike (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={v.mrp}
                          onChange={(e) => updateVariant(idx, "mrp", e.target.value)}
                          placeholder="3499"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DDD] rounded-sm text-[#7A7A7A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#0F0F0F] mb-1">
                          Stock Units
                        </label>
                        <input
                          type="number"
                          required
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                          placeholder="100"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#DDD] rounded-sm font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                          <input
                            type="radio"
                            name="defaultVariantRadio"
                            checked={v.isDefault}
                            onChange={() => {
                              setVariants((prev) =>
                                prev.map((item, i) => ({ ...item, isDefault: i === idx }))
                              );
                            }}
                            className="text-[#C5A059]"
                          />
                          <span>Default</span>
                        </label>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 ml-auto"
                            title="Remove variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Olfactory Pyramid Notes */}
              <div className="p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-3">
                <h4 className="font-semibold text-sm text-[#0F0F0F]">
                  4. Olfactory Pyramid Notes
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-[#5A5A5A] mb-0.5">Top Notes (0–30 mins)</label>
                    <input
                      type="text"
                      required
                      value={topNotes}
                      onChange={(e) => setTopNotes(e.target.value)}
                      placeholder="e.g. Sicilian Bergamot, Pink Peppercorn, Saffron Threads"
                      className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#5A5A5A] mb-0.5">Heart / Middle Notes (30 mins–4 hrs)</label>
                    <input
                      type="text"
                      required
                      value={middleNotes}
                      onChange={(e) => setMiddleNotes(e.target.value)}
                      placeholder="e.g. Velvet Damascena Rose, Smoked Incense, Nutmeg"
                      className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#5A5A5A] mb-0.5">Base Notes (4–16+ hrs)</label>
                    <input
                      type="text"
                      required
                      value={baseNotes}
                      onChange={(e) => setBaseNotes(e.target.value)}
                      placeholder="e.g. Aged Cambodian Agarwood (Oud), Black Amber, Golden Patchouli"
                      className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Merchandising Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-[#EBE7DF]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="text-[#C5A059]"
                  />
                  <span className="font-medium text-[#0F0F0F]">Featured Collection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="text-[#C5A059]"
                  />
                  <span className="font-medium text-[#0F0F0F]">Best Seller Flacon</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="text-[#C5A059]"
                  />
                  <span className="font-medium text-[#0F0F0F]">New Arrival Badge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="text-[#C5A059]"
                  />
                  <span className="font-medium text-[#0F0F0F]">Published on Storefront</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EBE7DF] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[#DDD] text-[#5A5A5A] hover:bg-[#FAF8F5] rounded-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-7 py-2.5 bg-[#0F0F0F] text-white uppercase tracking-widest-luxury text-xs font-medium hover:bg-[#C5A059] transition-colors rounded-sm shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : isEditing ? "Save & Publish Changes" : "Create Flacon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
