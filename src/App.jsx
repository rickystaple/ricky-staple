import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, wrap } from 'framer-motion';
import { ChevronRight, ChevronLeft, Menu, X, ArrowRight, Instagram, MessageCircle, Plus, Quote, ShoppingBag, ArrowLeft, Layers, Ruler, PenTool, Lock, Save, Trash2, RotateCcw, Upload, Image as ImageIcon } from 'lucide-react';

// --- CONFIGURATION ---
const brandName = "RICKY STAPLE";
const instagramLink = "https://instagram.com/rickystaple"; 
const whatsappNumber = "263777271697"; 
const GA_MEASUREMENT_ID = "G-R4PGJN1JSQ"; 
const ADMIN_PIN = "2026"; // Simple PIN for the Admin Dashboard

// --- ANALYTICS ---
const logEvent = (eventName, params = {}) => {
  console.log(`📊 [Analytics] ${eventName}:`, params);
  if (window.gtag) { window.gtag('event', eventName, params); }
};

// --- DATA (Linked to Clean Single-Extension Filenames) ---
const INITIAL_LOOKBOOK = [
  { id: 1, title: "Vintage Archive", image: "/archive-olive.jpg", product: { name: "Archive Olive", price: 25 } },
  { id: 2, title: "Natural Wilderness", image: "/forest-green.jpg", product: { name: "Forest Green", price: 25 } },
  { id: 3, title: "Earthen Tones", image: "/mocha-brown.jpg", product: { name: "Mocha Brown", price: 25 } }
];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Obsidian Black", price: 25, stock: "04/10", images: ["/obsidian-black.png"], description: "Deep matte black finish. 260GSM heavyweight cotton. Pre-shrunk and engineered for the perfect drape." },
  { id: 2, name: "Bone Off-White", price: 25, stock: "03/10", images: ["/bone-white.png"], description: "Natural unbleached tone. 260GSM heavyweight cotton. Soft hand-feel with structural integrity." },
  { id: 3, name: "Engineered Charcoal", price: 25, stock: "03/10", images: ["/charcoal-grey.jpg"], description: "Industrial slate grey. 260GSM heavyweight cotton. Reactive dyed for lasting color depth." },
  { id: 4, name: "Archive Olive", price: 25, stock: "02/10", images: ["/archive-olive.jpg"], description: "Vintage washed earth tone. 260GSM heavyweight cotton. A subtle, sophisticated essential." },
  { id: 5, name: "Forest Green", price: 25, stock: "Sold Out", images: ["/forest-green.jpg"], description: "Deep earthy green. 260GSM heavyweight cotton. Inspired by Zimbabwean landscapes." },
  { id: 6, name: "Mocha Brown", price: 25, stock: "01/10", images: ["/mocha-brown.jpg"], description: "Rich coffee tone. 260GSM heavyweight cotton. Warm, neutral, and versatile." }
];

// --- HELPER COMPONENTS ---

// New Component: Smart Mobile Scroll Hint
const ScrollHint = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: [0, 1, 1, 0] }}
    viewport={{ once: true, margin: "-20%" }} // Triggers when section is well into view
    transition={{ duration: 3.5, times: [0, 0.1, 0.8, 1] }} // Fast fade in, hold, fade out
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none md:hidden"
  >
    <div className="bg-black/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">Swipe</span>
      <motion.div 
        animate={{ x: [0, 5, 0] }} 
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight size={14} className="text-white" />
      </motion.div>
    </div>
  </motion.div>
);

const AdminDashboard = ({ products, setProducts, onClose }) => {
  const [editedProducts, setEditedProducts] = useState(products);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 25,
    stock: "10/10",
    description: "260GSM heavyweight cotton. Authentic quality.",
    images: []
  });

  const handleChange = (id, field, value) => {
    const updated = editedProducts.map(p => p.id === id ? { ...p, [field]: value } : p);
    setEditedProducts(updated);
    setHasChanges(true);
  };

  const handleImageUpload = (e, id = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (id === 'new') {
          setNewProduct({ ...newProduct, images: [...newProduct.images, reader.result] });
        } else {
          const product = editedProducts.find(p => p.id === id);
          if (product) {
            handleChange(id, 'images', [...product.images, reader.result]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (productId, imageIndex) => {
    if (productId === 'new') {
      const updatedImages = newProduct.images.filter((_, i) => i !== imageIndex);
      setNewProduct({ ...newProduct, images: updatedImages });
    } else {
      const product = editedProducts.find(p => p.id === productId);
      if (product) {
        const updatedImages = product.images.filter((_, i) => i !== imageIndex);
        handleChange(productId, 'images', updatedImages);
      }
    }
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      const updated = editedProducts.filter(p => p.id !== id);
      setEditedProducts(updated);
      setHasChanges(true);
    }
  };

  const handleAddNew = () => {
    if (!newProduct.name || newProduct.images.length === 0) {
      alert("Please provide at least a Name and one Image.");
      return;
    }
    const newId = Math.max(...editedProducts.map(p => p.id), 0) + 1;
    const productToAdd = { ...newProduct, id: newId };
    setEditedProducts([...editedProducts, productToAdd]);
    setHasChanges(true);
    setIsAdding(false);
    setNewProduct({ name: "", price: 25, stock: "10/10", description: "260GSM heavyweight cotton. Authentic quality.", images: [] });
  };

  const saveChanges = () => {
    setProducts(editedProducts);
    setHasChanges(false);
    localStorage.setItem('rs_products', JSON.stringify(editedProducts)); 
    logEvent('admin_update', { timestamp: new Date() });
    alert("Database Updated Successfully");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f1115] text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-6">
          <div>
            <h2 className="text-3xl font-serif italic text-white flex items-center gap-3">
              <Lock size={24} className="text-red-500" /> Control Center
            </h2>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Manage Inventory & Gallery</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsAdding(!isAdding)} className={`px-6 py-3 rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-all ${isAdding ? 'bg-white/10 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
              {isAdding ? <X size={14}/> : <Plus size={14}/>} {isAdding ? "Cancel" : "Add Product"}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
          </div>
        </div>

        {/* --- ADD NEW PRODUCT FORM --- */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-sm mb-12 overflow-hidden"
            >
              <h3 className="text-xl font-serif italic text-white mb-6">New Drop Item</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="aspect-[3/4] bg-black/40 border-2 border-dashed border-white/20 rounded-sm relative flex flex-col items-center justify-center group overflow-hidden">
                    {newProduct.images.length > 0 ? (
                        <img src={newProduct.images[0]} alt="Main Preview" className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                        <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-gray-500">Add Main Image</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'new')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    
                    {newProduct.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                             {newProduct.images.map((img, idx) => (
                                 <div key={idx} className="relative w-16 h-20 flex-shrink-0 border border-white/10 group">
                                     <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                     <button onClick={() => removeImage('new', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10">
                                         <X size={12} />
                                     </button>
                                 </div>
                             ))}
                             <div className="w-16 h-20 flex-shrink-0 border border-dashed border-white/20 flex items-center justify-center relative cursor-pointer hover:border-white/50 bg-white/5">
                                 <Plus size={16} className="text-white/50" />
                                 <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'new')} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Product Name</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-white/50 outline-none font-serif italic" placeholder="e.g. Midnight Blue" />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Price ($)</label>
                    <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-white/50 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Stock (Display Only)</label>
                    <input type="text" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-white/50 outline-none font-mono" placeholder="10/10" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Description</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-white/50 outline-none font-light h-24" />
                  </div>
                  <div className="col-span-1 md:col-span-2 pt-4">
                     <button onClick={handleAddNew} className="w-full py-4 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-gray-200 transition-colors">Launch Product</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- EXISTING PRODUCTS LIST --- */}
        <div className="grid gap-6">
          {editedProducts.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-sm flex flex-col md:flex-row gap-6 items-start group hover:border-white/20 transition-colors">
              <div className="w-full md:w-1/4">
                 <div className="aspect-[3/4] relative mb-4">
                     <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-sm bg-black/20" />
                     <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 text-[8px] uppercase text-white rounded-sm">Display</div>
                 </div>
                 
                 <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                     {item.images.slice(1).map((img, idx) => (
                         <div key={idx} className="relative w-16 h-20 flex-shrink-0 border border-white/10 bg-black/20">
                             <img src={img} alt="Gal" className="w-full h-full object-cover" />
                             {/* Mobile-friendly delete button (bigger touch target) */}
                             <button onClick={() => removeImage(item.id, idx + 1)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10">
                                 <X size={12} />
                             </button>
                         </div>
                     ))}
                     <div className="w-16 h-20 flex-shrink-0 border border-dashed border-white/20 flex items-center justify-center relative cursor-pointer hover:border-white/50 bg-white/5">
                         <Plus size={16} className="text-white/50" />
                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, item.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                 </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full items-center pt-2">
                <div className="md:col-span-1">
                  <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1 md:hidden">Name</label>
                  <input type="text" value={item.name} onChange={(e) => handleChange(item.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-white/30 p-1 text-sm text-white outline-none font-serif italic" />
                </div>
                <div>
                   <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1 md:hidden">Stock</label>
                  <input type="text" value={item.stock} onChange={(e) => handleChange(item.id, 'stock', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-white/30 p-1 text-sm text-white outline-none font-mono text-left md:text-center" />
                </div>
                <div>
                   <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1 md:hidden">Price</label>
                  <input type="number" value={item.price} onChange={(e) => handleChange(item.id, 'price', parseFloat(e.target.value))} className="w-full bg-transparent border-b border-transparent focus:border-white/30 p-1 text-sm text-white outline-none font-mono" />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => deleteProduct(item.id)} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Delete Product">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 w-full p-6 bg-[#0f1115] border-t border-white/10 flex justify-end gap-4 backdrop-blur-md z-50">
          <button onClick={() => setEditedProducts(products)} className="px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-white flex items-center gap-2">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={saveChanges} disabled={!hasChanges} className={`px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-all ${hasChanges ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin, onClose }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onLogin();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <Lock className="w-8 h-8 text-white/50 mx-auto mb-6" />
        <h3 className="text-xl font-serif italic text-white mb-8">Restricted Access</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setError(false); }} placeholder="ENTER ACCESS CODE" className="w-full bg-transparent border-b border-white/20 py-3 text-center text-xl tracking-[1em] text-white focus:border-white outline-none placeholder:text-xs placeholder:tracking-normal placeholder:text-gray-600" autoFocus />
          {error && <p className="text-red-500 text-[10px] tracking-widest uppercase animate-pulse">Access Denied</p>}
          <div className="flex gap-4 justify-center">
             <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-white underline">Cancel</button>
             <button type="submit" className="text-xs text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase tracking-widest">Unlock</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const targetDate = new Date("February 26, 2026 12:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center gap-8 mb-8 text-white/80 font-mono text-xs tracking-widest">
       <div className="text-center"><span className="block text-xl font-serif italic text-white">{timeLeft.days}</span><span className="text-[8px] uppercase opacity-60">Days</span></div>
       <div className="text-center"><span className="block text-xl font-serif italic text-white">{timeLeft.hours}</span><span className="text-[8px] uppercase opacity-60">Hrs</span></div>
       <div className="text-center"><span className="block text-xl font-serif italic text-white">{timeLeft.minutes}</span><span className="text-[8px] uppercase opacity-60">Mins</span></div>
       <div className="text-center"><span className="block text-xl font-serif italic text-white">{timeLeft.seconds}</span><span className="text-[8px] uppercase opacity-60">Secs</span></div>
    </div>
  );
};

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/5 bg-[#0a0a0a] relative z-10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-[0.3em] text-white/90 font-serif italic">{brandName}</h3>
        <p className="text-gray-500 text-[10px] font-light max-w-xs leading-relaxed uppercase tracking-[0.2em]">
          Authentic. Rare. Yours.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[10px] tracking-[0.3em] uppercase">
        <div className="flex flex-col gap-4">
          <span className="text-white/30 font-bold">Legal</span>
          <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Shipping</span>
          <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy</span>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-white/30 font-bold">Connect</span>
          <a href={instagramLink} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] tracking-[0.3em] text-gray-600 uppercase">
      <p>© 2026 {brandName}</p>
      <p>Uniqueness is the ultimate luxury.</p>
    </div>
  </footer>
);

const ProductModal = ({ product, onClose, onAdd, allProducts }) => {
  if (!product) return null;
  const [size, setSize] = useState('M');
  const defaultColor = allProducts.find(p => p.name === product.name)?.name || 'Obsidian Black';
  const [color, setColor] = useState(defaultColor);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = product.images || (product.image ? [product.image] : []);

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Swipe logic for mobile
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const colorOptions = [
    { name: "Obsidian Black", hex: "#111111" },
    { name: "Bone Off-White", hex: "#EAEAEA" },
    { name: "Engineered Charcoal", hex: "#374151" },
    { name: "Archive Olive", hex: "#5d5c52" },
    { name: "Forest Green", hex: "#064E3B" },
    { name: "Mocha Brown", hex: "#3F2C22" }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0f1115]/90 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row h-full md:h-auto max-h-[90svh] overflow-y-auto md:overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm">
          <X size={20} />
        </button>
        
        {/* IMAGE CAROUSEL SECTION */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-black/20 relative group shrink-0">
          <AnimatePresence initial={false} custom={currentImgIndex}>
            <motion.img 
                key={currentImgIndex}
                src={images[currentImgIndex]} 
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0 cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    nextImage();
                  } else if (swipe > swipeConfidenceThreshold) {
                    prevImage();
                  }
                }}
            />
          </AnimatePresence>
          
          {/* Carousel Arrows (Hidden on mobile generally, swipe is better) */}
          {images.length > 1 && (
            <>
                <button onClick={prevImage} className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight size={20} />
                </button>
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/30'}`} />
                    ))}
                </div>
                {/* Mobile Swipe Hint (optional) */}
                <div className="md:hidden absolute bottom-4 right-4 text-[8px] text-white/50 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">Swipe</div>
            </>
          )}
        </div>

        <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col h-auto">
          <h3 className="text-2xl font-serif italic text-white mb-2">{product.name}</h3>
          <p className="text-white/60 text-xs mb-6 leading-relaxed">{product.description}</p>
          
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Select Size</span>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`w-10 h-10 border text-xs transition-all ${size === s ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:border-white/50'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Select Colour</span>
            <div className="flex gap-3 flex-wrap">
              {colorOptions.map((c) => (
                <button 
                  key={c.name} 
                  onClick={() => setColor(c.name)} 
                  className={`w-6 h-6 rounded-full border transition-all ${color === c.name ? 'border-white scale-125 ring-1 ring-white/50' : 'border-white/20 hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-mono">{color}</p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/10 gap-4">
            <span className="text-xl font-mono text-white whitespace-nowrap">${product.price}</span>
            <button onClick={() => onAdd(product, size, color)} className="w-full md:w-auto bg-white text-black px-6 py-4 md:py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- PAGE COMPONENTS ---

const LandingPage = ({ setView, handleQuickShop, products, lookbook }) => {
  const { scrollYProgress } = useScroll();
  const alphaScrollRef = useRef(null);
  const [isAlphaEnd, setIsAlphaEnd] = useState(false);

  const handleAlphaScroll = () => {
    if (alphaScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = alphaScrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        setIsAlphaEnd(true);
      } else {
        setIsAlphaEnd(false);
      }
    }
  };

  const campaignScrollRef = useRef(null);
  const [isCampaignEnd, setIsCampaignEnd] = useState(false);
  const alphaCollection = products.slice(0, 3);

  const handleCampaignScroll = () => {
    if (campaignScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = campaignScrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        setIsCampaignEnd(true);
      } else {
        setIsCampaignEnd(false);
      }
    }
  };

  useEffect(() => {
    logEvent('page_view', { page_title: 'Home' });
  }, []);

  return (
    <>
      <section className="relative h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0a0a0a] z-10" />
            <img src="/hero-image.png" alt="Hero" className="w-full h-full object-cover scale-105 opacity-60 grayscale" />
          </div>
          
          <div className="z-10 text-center px-4 relative max-w-5xl mx-auto flex flex-col items-center">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-6 block border-b border-white/20 pb-2">EST. HARARE 2026</span>
            <h2 className="text-6xl md:text-9xl font-sans font-black tracking-tighter mb-4 py-4 glass-text-hero leading-tight">RICKY STAPLE</h2>
            <p className="text-xl md:text-3xl font-serif italic text-white/90 mb-8 tracking-wide">Premium Heavyweight Streetwear.</p>
            <Countdown />
            <button onClick={() => setView('shop')} className="mt-8 group relative inline-flex items-center gap-4 px-10 py-4 overflow-hidden rounded-sm bg-white text-black text-xs font-bold tracking-[0.3em] uppercase transition-all hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <span className="relative z-10 flex items-center gap-2">Secure Your Piece <ChevronRight size={14} /></span>
            </button>
          </div>
      </section>

      <div className="w-full bg-white/5 border-y border-white/5 overflow-hidden py-3 relative z-10 backdrop-blur-sm">
          <motion.div className="flex whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
            {[...Array(6)].map((_, i) => <span key={i} className="text-[10px] tracking-[0.5em] uppercase text-white/40 mx-8">260GSM Heavyweight • Ethically Sourced • Limited Batch 01 • </span>)}
          </motion.div>
      </div>

      <section className="py-20 px-6 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm order-2 md:order-1 shadow-2xl">
               <img src="/founder-image.jpg" alt="Founder" className="w-full h-full object-cover opacity-80" />
               <div className="absolute bottom-4 left-4 text-[8px] tracking-[0.3em] uppercase text-white bg-black/50 px-2 py-1 backdrop-blur-md">The Engineer's Log</div>
            </div>
            <div className="space-y-8 order-1 md:order-2">
              <Quote className="text-white/20 w-8 h-8 rotate-180" />
              <h3 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">"We didn't just make a shirt. We created a presence."</h3>
              <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">In a sea of fast fashion, standing out is a choice. We sourced 260gsm heavyweight cotton because true style carries weight. It's about walking into a room and feeling the difference. Authentic. Timeless. Exclusively yours.</p>
              <button onClick={() => setView('vision')} className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/30 pb-1 hover:border-white">Read Manifesto</button>
            </div>
          </div>
      </section>

      <section className="py-16 px-6 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 md:gap-6 items-start">
            {[
              { title: "Substance", desc: "260GSM Heavyweight." },
              { title: "Fit", desc: "Engineered Silhouette." },
              { title: "Promise", desc: "Built for Longevity." }
            ].map((item, i) => (
              <div key={i} className="p-2 md:p-8 rounded-sm bg-white/[0.02] border border-white/[0.05] text-center">
                <h3 className="text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-gray-500 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-xs md:text-lg font-playfair italic text-gray-300 leading-tight md:leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>
      </section>

      <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
              <h2 className="text-3xl md:text-5xl font-serif italic tracking-wide mb-2 glass-text-green py-2">Campaign</h2>
              <div className="md:hidden text-[10px] tracking-widest text-gray-500 h-6 flex items-end">
                <AnimatePresence mode="wait">
                  {!isCampaignEnd ? (
                    <motion.span key="scroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="block">SCROLL →</motion.span>
                  ) : (
                    <motion.button key="view-all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onClick={() => setView('shop')} className="text-white border-b border-white pb-1">VIEW ALL</motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative">
              <ScrollHint />
              <div ref={campaignScrollRef} onScroll={handleCampaignScroll} className="flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0 relative z-10">
                {lookbook.map((look) => (
                  <motion.div key={look.id} whileHover={{ y: -5 }} className="min-w-[85vw] snap-center md:min-w-0 md:w-auto aspect-[3/4] relative rounded-sm overflow-hidden group border border-white/5 bg-white/5 shadow-lg cursor-pointer" onClick={() => handleQuickShop(look.product)}>
                      <img src={look.image} alt={look.title} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
                      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-xl font-serif italic text-white mb-2">{look.title}</h3>
                        <button className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-1 hover:border-white">Shop Look</button>
                      </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
      </section>

      <section className="py-20 px-6 relative z-10 border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl md:text-6xl font-serif italic tracking-wide mb-2 glass-text-red py-2">Alpha Drop</h2>
                <p className="text-red-200/80 uppercase text-[10px] tracking-[0.4em] font-bold">Batch 01 // 10 Units // Live</p>
              </div>
              <button onClick={() => setView('shop')} className="hidden md:flex group items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-2 hover:border-white transition-all">View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></button>
              <div className="md:hidden text-[10px] tracking-widest text-gray-500 h-6 flex items-end">
                <AnimatePresence mode="wait">
                  {!isAlphaEnd ? (
                    <motion.span key="scroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="block">SCROLL →</motion.span>
                  ) : (
                    <motion.button key="view-all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onClick={() => setView('shop')} className="text-white border-b border-white pb-1">VIEW ALL</motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative">
              <ScrollHint />
              <div ref={alphaScrollRef} onScroll={handleAlphaScroll} className="flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0 relative z-10">
                {alphaCollection.map((item) => (
                  <motion.div key={item.id} whileHover={{ y: -10 }} onClick={() => handleQuickShop(item)} className="group cursor-pointer min-w-[85vw] snap-center md:min-w-0 md:w-auto">
                    <div className="aspect-[3/4] overflow-hidden bg-black/40 mb-4 relative rounded-sm border border-white/10">
                      <img src={item.images ? item.images[0] : item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover opacity-100 transition-all duration-700" />
                      <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md px-3 py-1 text-[8px] tracking-[0.3em] uppercase text-white border border-red-500/50 shadow-lg">{item.stock} Left</div>
                    </div>
                    <div className="flex justify-between items-start mb-4 px-1">
                      <h4 className="text-sm font-bold tracking-widest uppercase mb-1 text-white group-hover:text-white/80 transition-colors">{item.name}</h4>
                      <span className="text-sm font-mono text-white/60 bg-white/5 px-2 py-1 rounded border border-white/5">${item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
      </section>
      
      <Footer />
    </>
  );
};

// --- RESTORED VISION PAGE ---
const VisionPage = ({ setView }) => {
  useEffect(() => {
    logEvent('page_view', { page_title: 'Vision' });
  }, []);

  return (
    <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto min-h-screen relative z-10">
      <div className="mb-20">
        <span className="text-[10px] tracking-[0.5em] uppercase text-gray-500 mb-6 block">The Vision</span>
        <h2 className="text-6xl md:text-8xl font-serif italic text-white leading-none mb-12">
          Authentic. <br /> <span className="font-sans not-italic font-bold tracking-tighter">Rare.</span>
        </h2>
        <div className="space-y-12 text-lg md:text-xl font-light leading-relaxed text-gray-300">
          <p><strong className="text-white">Style is a language, and we believe in speaking it fluently.</strong> Our mission is to bring premium, international-standard quality to Zimbabwe, making authenticity accessible to those who seek it.</p>
          <p>We understand the desire to stand out. In a city flooded with the same trends, <span className="italic text-white">Ricky Staple offers the cure for the common.</span> We guarantee uniqueness. Our collections are released in strictly limited batches, ensuring that your look remains yours alone.</p>
          <p><strong className="text-white">Why $25?</strong> Because value is permanent. You aren't just buying a garment; you are investing in 260GSM of heavyweight durability that outlasts fast fashion. It is the peace of mind that comes with wearing something truly unique, crafted to a standard that justifies every cent.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mb-20 border-t border-b border-white/10 py-12">
        <div className="text-center space-y-4">
          <Layers className="mx-auto text-white/50 w-8 h-8" />
          <h4 className="text-white font-bold tracking-widest uppercase text-sm">Exclusivity</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Limited drops. Once it's gone, it's gone. You won't see it everywhere.</p>
        </div>
        <div className="text-center space-y-4">
          <Ruler className="mx-auto text-white/50 w-8 h-8" />
          <h4 className="text-white font-bold tracking-widest uppercase text-sm">Authenticity</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Real heavyweight cotton. No shortcuts. A standard you can feel.</p>
        </div>
        <div className="text-center space-y-4">
          <PenTool className="mx-auto text-white/50 w-8 h-8" />
          <h4 className="text-white font-bold tracking-widest uppercase text-sm">Value</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Engineered longevity. A $25 investment that outlasts the rest.</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-serif italic text-white mb-8">"Uniqueness is the ultimate luxury."</p>
        <button onClick={() => setView('shop')} className="px-10 py-4 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-gray-200 transition-all">
          Secure Your Piece
        </button>
      </div>
    </div>
  );
};

// --- RESTORED SHOP PAGE ---
const ShopPage = ({ setView, setSelectedProduct, products }) => {
  useEffect(() => {
    logEvent('page_view', { page_title: 'Shop' });
  }, []);

  return (
    <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-4xl font-serif italic text-white">The Collection</h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-2">Alpha Drop 01 // {products.length} Items</p>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-8 md:overflow-visible md:pb-0">
        {products.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} onClick={() => {
            logEvent('select_item', { item_name: item.name });
            setSelectedProduct(item);
          }} className="group cursor-pointer min-w-[45vw] snap-center md:min-w-0 md:w-auto">
            <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-4 relative rounded-sm border border-white/5 group-hover:border-white/20 transition-colors">
              <img src={item.images ? item.images[0] : item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
              {item.stock !== "Sold Out" ? (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 text-[8px] tracking-[0.3em] uppercase text-white border border-white/10">{item.stock} Left</div>
              ) : (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-xs font-bold tracking-[0.2em] uppercase border border-white px-3 py-1">Sold Out</span></div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm md:text-lg font-serif italic text-white group-hover:text-red-400 transition-colors">{item.name}</h3>
                <p className="text-[8px] md:text-[10px] tracking-widest text-gray-500 uppercase mt-1">260GSM Heavyweight</p>
              </div>
              <span className="text-sm md:text-base text-white font-mono">${item.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('rs_products');
    let data = savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
    if (!Array.isArray(data)) return INITIAL_PRODUCTS;
    return data.map(p => ({
        ...p,
        images: p.images || (p.image ? [p.image] : [])
    }));
  });
  
  const [lookbook, setLookbook] = useState(INITIAL_LOOKBOOK); 

  const [adminClicks, setAdminClicks] = useState(0);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  
  const clickTimeoutRef = useRef(null);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { scrollY } = useScroll();

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    setAdminClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setIsAdminLoginOpen(true);
        return 0; 
      }
      return newCount;
    });

    clickTimeoutRef.current = setTimeout(() => {
      setAdminClicks(0);
    }, 2000);
  };

  useEffect(() => {
    if (GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && !window.dataLayer) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
      console.log('✅ [Analytics] Google Analytics Initialized');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsHeaderVisible(latest < 100);
    });
    return () => unsubscribe();
  }, [scrollY]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const addToCart = (product, size, color) => {
    logEvent('add_to_cart', { item_name: product.name, size, color, value: product.price });
    setCart([...cart, { ...product, image: product.images ? product.images[0] : product.image, selectedSize: size, selectedColor: color }]);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    
    logEvent('begin_checkout', { value: cart.reduce((acc, item) => acc + item.price, 0), items: cart.map(i => i.name) });

    let message = "Hi Ricky Staple, I want to secure the following Alpha Drop items:\n\n";
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.selectedSize}, ${item.selectedColor}) - $${item.price}\n`;
    });
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    message += `\nTotal: $${total}. Are these still available?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleQuickShop = (lookProduct) => {
    logEvent('view_item', { item_name: lookProduct.name, source: 'lookbook' });
    const fullProduct = products.find(p => p.name === lookProduct.name) || { 
        ...lookProduct, 
        description: "Limited Edition Campaign Item", 
        stock: "Limited", 
        images: lookbook.find(l => l.product.name === lookProduct.name)?.image ? [lookbook.find(l => l.product.name === lookProduct.name).image] : []
    };
    setSelectedProduct(fullProduct);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] font-sans selection:bg-white selection:text-black relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes glass-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-text-hero {
          color: rgba(255, 255, 255, 0.1); 
          background: linear-gradient(270deg, #ff7eb3, #ff758c, #42d392, #647dee, #7f53ac, #ff7eb3);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
          animation: glass-shimmer 12s ease infinite;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
        }
        .glass-text-green {
          color: rgba(52, 211, 153, 0.1);
          background: linear-gradient(110deg, rgba(52, 211, 153, 0) 30%, rgba(52, 211, 153, 0.8) 50%, rgba(52, 211, 153, 0) 70%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(52, 211, 153, 0.5);
          animation: glass-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
        }
        .glass-text-red {
          color: rgba(248, 113, 113, 0.1);
          background: linear-gradient(110deg, rgba(248, 113, 113, 0) 30%, rgba(248, 113, 113, 0.8) 50%, rgba(248, 113, 113, 0) 70%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(248, 113, 113, 0.5);
          animation: glass-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(248, 113, 113, 0.4));
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#000000]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        {(view === 'home' || view === 'vision') && (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-900/30 rounded-full blur-[150px] mix-blend-screen" />
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-purple-900/30 rounded-full blur-[120px] mix-blend-screen" />
          </>
        )}
        {view === 'shop' && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4, scale: [1, 1.1] }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] bg-red-900/20 blur-[150px] pointer-events-none mix-blend-screen" />
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3, y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-amber-900/10 blur-[100px] pointer-events-none mix-blend-screen" />
           </>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-wide text-white mb-6">RS</h1>
            <div className="w-32 h-[1px] bg-white/20 mx-auto relative overflow-hidden">
                <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-white w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav animate={{ opacity: (isHeaderVisible || isMenuOpen) ? 1 : 0, y: (isHeaderVisible || isMenuOpen) ? 0 : -20 }} transition={{ duration: 0.4 }} className={`fixed top-0 w-full z-50 bg-black/10 backdrop-blur-lg border-b border-white/5 px-6 py-6 flex justify-between items-center ${(isHeaderVisible || isMenuOpen) ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button 
          onClick={(e) => { 
            // Prevent default behavior just in case, though usually not needed for buttons
            // e.preventDefault(); 
            setView('home'); 
            handleLogoClick(); 
          }} 
          className="text-xl font-bold tracking-[0.3em] text-white/90 drop-shadow-lg z-50 select-none active:scale-95 transition-transform"
        >
          {brandName}
        </button>
        <div className="flex items-center gap-6">
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-white/10 rounded-full transition-colors z-50">
            <ShoppingBag size={20} className="text-white" />
            {cart.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-[10px] flex items-center justify-center rounded-full text-white font-bold">{cart.length}</span>}
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors z-50">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#0f1115] border-l border-white/10 z-[100] p-6 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-playfair italic text-white">Your Selection</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={20} className="text-white"/></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6">
                {cart.length === 0 ? <p className="text-gray-500 text-sm">Your cart is empty.</p> : (
                  cart.map((item, i) => (
                    <div key={i} className="flex gap-4 border-b border-white/5 pb-4">
                      <img src={item.image} className="w-16 h-20 object-cover" alt={item.name} />
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.selectedSize} / {item.selectedColor}</p>
                        <p className="text-sm font-mono mt-1 text-white">${item.price}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex justify-between mb-4">
                  <span className="text-sm uppercase tracking-widest text-gray-400">Total</span>
                  <span className="text-xl font-mono text-white">${cart.reduce((acc, item) => acc + item.price, 0)}</span>
                </div>
                <button onClick={handleCartCheckout} className="w-full py-4 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors">Checkout on WhatsApp</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[75] flex flex-col items-center justify-center gap-8 backdrop-blur-md">
            <button onClick={() => { setIsMenuOpen(false); }} className="absolute top-6 right-6 text-white"><X size={24}/></button>
            <button onClick={() => { setView('vision'); setIsMenuOpen(false); }} className="text-4xl font-playfair italic text-white/90 hover:scale-105 transition-transform">Vision</button>
            <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} className="text-4xl font-playfair italic text-white/90 hover:scale-105 transition-transform">Collection</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdminLoginOpen && (
          <div className="relative z-[200]"> {/* Boosted z-index for visibility */}
            <AdminLogin onLogin={() => { setIsAdminLoginOpen(false); setIsAdminDashboardOpen(true); }} onClose={() => setIsAdminLoginOpen(false)} />
          </div>
        )}
        {isAdminDashboardOpen && (
          <div className="relative z-[200]"> {/* Boosted z-index for visibility */}
            <AdminDashboard products={products} setProducts={setProducts} onClose={() => setIsAdminDashboardOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage setView={setView} handleQuickShop={handleQuickShop} products={products} lookbook={lookbook} />
          </motion.div>
        )}
        {view === 'shop' && (
          <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ShopPage setView={setView} setSelectedProduct={setSelectedProduct} products={products} />
            <Footer />
          </motion.div>
        )}
        {view === 'vision' && (
          <motion.div key="vision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VisionPage setView={setView} />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} allProducts={products} />}
      </AnimatePresence>
    </div>
  );
};

export default App;