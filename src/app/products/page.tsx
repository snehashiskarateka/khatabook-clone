"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getProducts, createProduct, deleteProduct } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Plus, Package, Trash2, Edit, Search, Box, Weight, Ruler, Package2 } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [rate, setRate] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [gstRate, setGstRate] = useState("18");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  async function loadProducts() {
    setLoading(true);
    const { data } = await getProducts();
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name) return;
    const { error } = await createProduct({
      name,
      unit,
      rate: parseFloat(rate) || 0,
      hsn_code: hsnCode,
      gst_rate: parseFloat(gstRate) || 0,
      user_id: user.id,
    });
    if (!error) {
      setShowAdd(false);
      setName("");
      setRate("");
      setHsnCode("");
      loadProducts();
    }
  }

  const unitIcons: Record<string, React.ReactNode> = {
    pcs: <Box className="h-5 w-5" />,
    kg: <Weight className="h-5 w-5" />,
    mtr: <Ruler className="h-5 w-5" />,
    box: <Package2 className="h-5 w-5" />,
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        user={user ? { email: user.email || "", name: user.user_metadata?.full_name } : null}
        onSearch={setSearch}
        searchValue={search}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Master</h1>
            <p className="text-muted-foreground mt-1">Manage your items with rates, HSN codes & GST rates for quick billing</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">Add products to speed up invoice creation</p>
              <Button variant="primary" onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredProducts.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="bg-background border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        {unitIcons[p.unit] || <Package className="h-6 w-6 text-indigo-600" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          // edit product
                        }} aria-label="Edit product">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={async () => {
                          if (confirm("Delete this product?")) {
                            await deleteProduct(p.id);
                            loadProducts();
                          }
                        }} aria-label="Delete product">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-1 truncate">{p.name}</h3>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {p.hsn_code && (
                        <span className="px-2 py-0.5 rounded bg-secondary font-mono">
                          HSN: {p.hsn_code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-secondary">
                        GST: {p.gst_rate}%
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Rate per {p.unit}</p>
                        <p className="font-bold text-xl text-foreground">₹{Number(p.rate).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Product"
        description="Create a new product for quick invoice entry"
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-5">
          <Input
            label="Product Name *"
            placeholder="e.g. Steel Rods 10mm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rate (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
              <Select
                value={unit}
                onChange={setUnit}
                options={[
                  { label: "Pieces (pcs)", value: "pcs" },
                  { label: "Kilograms (kg)", value: "kg" },
                  { label: "Meters (mtr)", value: "mtr" },
                  { label: "Boxes (box)", value: "box" },
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="HSN Code"
              placeholder="e.g. 7214"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">GST Rate (%)</label>
              <Select
                value={gstRate}
                onChange={setGstRate}
                options={[
                  { label: "0%", value: "0" },
                  { label: "5%", value: "5" },
                  { label: "12%", value: "12" },
                  { label: "18%", value: "18" },
                  { label: "28%", value: "28" },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
      <BottomNav />
    </div>
  );
}

import { motion } from "framer-motion";