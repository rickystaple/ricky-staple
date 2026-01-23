import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Menu, X, ArrowRight, Instagram, MessageCircle, Plus, Quote, ShoppingBag, ArrowLeft, Layers, Ruler, PenTool } from 'lucide-react';

// --- CONFIGURATION ---
const brandName = "RICKY STAPLE";
const instagramLink = "https://instagram.com/rickystaple"; 
const whatsappNumber = "263770000000"; 
const GA_MEASUREMENT_ID = "G-R4PGJN1JSQ"; 

// --- ANALYTICS ---
const logEvent = (eventName, params = {}) => {
  console.log(`📊 [Analytics] ${eventName}:`, params);
  if (window.gtag) { window.gtag('event', eventName, params); }
};

// --- DATA (Linked to Clean Single-Extension Filenames) ---
const lookbook = [
  { id: 1, title: "Urban Solitude", image: "/obsidian-black.png", product: { name: "Obsidian Black", price: 25 } },
  { id: 2, title: "Concrete Textures", image: "/charcoal-grey.jpg", product: { name: "Engineered Charcoal", price: 25 } },
  { id: 3, title: "Natural Light", image: "/bone-white.png", product: { name: "Bone Off-White", price: 25 } }
];

const products = [
  { id: 1, name: "Obsidian Black", price: 25, stock: "04/10", image: "/obsidian-black.png", description: "Deep matte black finish. 260GSM heavyweight cotton. Pre-shrunk and engineered for the perfect drape." },
  { id: 2, name: "Bone Off-White", price: 25, stock: "03/10", image: "/bone-white.png", description: "Natural unbleached tone. 260GSM heavyweight cotton. Soft hand-feel with structural integrity." },
  { id: 3, name: "Engineered Charcoal", price: 25, stock: "03/10", image: "/charcoal-grey.jpg", description: "Industrial slate grey. 260GSM heavyweight cotton. Reactive dyed for lasting color depth." },
  { id: 4, name: "Archive Olive", price: 25, stock: "02/10", image: "/archive-olive.jpg", description: "Vintage washed earth tone. 260GSM heavyweight cotton. A subtle, sophisticated essential." },
  { id: 5, name: "Forest Green", price: 25, stock: "Sold Out", image: "/forest-green.jpg", description: "Deep earthy green. 260GSM heavyweight cotton. Inspired by Zimbabwean landscapes." },
  { id: 6, name: "Mocha Brown", price: 25, stock: "01/10", image: "/mocha-brown.jpg", description: "Rich coffee tone. 260GSM heavyweight cotton. Warm, neutral, and versatile." }
];

const alphaCollection = products.slice(0, 3);

// --- HELPER COMPONENTS ---

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

const ProductModal = ({ product, onClose, onAdd }) => {
  if (!product) return null;
  const [size, setSize] = useState('M');
  const defaultColor = products.find(p => p.name === product.name)?.name || 'Obsidian Black';
  const [color, setColor] = useState(defaultColor);

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
        className="relative w-full max-w-lg bg-[#0f1115]/90 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-white/20 rounded-full text-white transition-colors">
          <X size={20} />
        </button>
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-black/20">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col">
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

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/10">
            <span className="text-xl font-mono text-white">${product.price}</span>
            <button onClick={() => onAdd(product, size, color)} className="bg-white text-black px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- PAGE COMPONENTS ---

const LandingPage = ({ setView, handleQuickShop }) => {
  const { scrollYProgress } = useScroll();

  // Alpha Drop Scroll Logic
  const alphaScrollRef = useRef(null);
  const [isAlphaEnd, setIsAlphaEnd] = useState(false);

  const handleAlphaScroll = () => {
    if (alphaScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = alphaScrollRef.current;
      // Check if user is near the end of the scroll (20px threshold)
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        setIsAlphaEnd(true);
      } else {
        setIsAlphaEnd(false);
      }
    }
  };

  // Campaign Scroll Logic
  const campaignScrollRef = useRef(null);
  const [isCampaignEnd, setIsCampaignEnd] = useState(false);

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

  // Track Page View
  useEffect(() => {
    logEvent('page_view', { page_title: 'Home' });
  }, []);

  return (
    <>
      <section className="relative h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0a0a0a] z-10" />
            {/* HERO IMAGE: Linked to HERO PNG - REMOVED GRAYSCALE */}
            <img src="/hero-image.png" alt="Hero" className="w-full h-full object-cover scale-105 opacity-60" />
          </div>
          
          <div className="z-10 text-center px-4 relative max-w-5xl mx-auto flex flex-col items-center">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-6 block border-b border-white/20 pb-2">EST. HARARE 2026</span>
            
            <h2 className="text-6xl md:text-9xl font-sans font-black tracking-tighter mb-4 py-4 glass-text-hero leading-tight">
              RICKY STAPLE
            </h2>
            
            <p className="text-xl md:text-3xl font-serif italic text-white/90 mb-8 tracking-wide">
              Premium Heavyweight Streetwear.
            </p>

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
               {/* FOUNDER IMAGE: Linked to FOUNDER JPG - REMOVED GRAYSCALE */}
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
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              { title: "Substance", desc: "260GSM Heavyweight." },
              { title: "Fit", desc: "Engineered Silhouette." },
              { title: "Promise", desc: "Built for Longevity." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-sm bg-white/[0.02] border border-white/[0.05] text-center">
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">{item.title}</h3>
                <p className="text-lg font-playfair italic text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
      </section>

      <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
              <h2 className="text-3xl md:text-5xl font-serif italic tracking-wide mb-2 glass-text-green py-2">Campaign</h2>
              
              {/* MOBILE Scroll/View Indicator for Campaign */}
              <div className="md:hidden text-[10px] tracking-widest text-gray-500 h-6 flex items-end">
                <AnimatePresence mode="wait">
                  {!isCampaignEnd ? (
                    <motion.span 
                      key="scroll"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="block"
                    >
                      SCROLL →
                    </motion.span>
                  ) : (
                    <motion.button 
                      key="view-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => setView('shop')}
                      className="text-white border-b border-white pb-1"
                    >
                      VIEW ALL
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Scrollable Grid Container for Campaign */}
            <div 
              ref={campaignScrollRef}
              onScroll={handleCampaignScroll}
              className="flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0"
            >
              {lookbook.map((look) => (
                 <motion.div 
                    key={look.id} 
                    whileHover={{ y: -5 }}
                    className="min-w-[85vw] snap-center md:min-w-0 md:w-auto aspect-[3/4] relative rounded-sm overflow-hidden group border border-white/5 bg-white/5 shadow-lg cursor-pointer" 
                    onClick={() => handleQuickShop(look.product)}
                 >
                    {/* LOOKBOOK IMAGE - REMOVED GRAYSCALE */}
                    <img src={look.image} alt={look.title} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                       <h3 className="text-xl font-serif italic text-white mb-2">{look.title}</h3>
                       <button className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-1 hover:border-white">Shop Look</button>
                    </div>
                 </motion.div>
              ))}
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
              
              {/* DESKTOP View All Button */}
              <button onClick={() => setView('shop')} className="hidden md:flex group items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-2 hover:border-white transition-all">
                View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
              </button>

              {/* MOBILE Scroll/View Indicator */}
              <div className="md:hidden text-[10px] tracking-widest text-gray-500 h-6 flex items-end">
                <AnimatePresence mode="wait">
                  {!isAlphaEnd ? (
                    <motion.span 
                      key="scroll"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="block"
                    >
                      SCROLL →
                    </motion.span>
                  ) : (
                    <motion.button 
                      key="view-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => setView('shop')}
                      className="text-white border-b border-white pb-1"
                    >
                      VIEW ALL
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div 
              ref={alphaScrollRef}
              onScroll={handleAlphaScroll}
              className="flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0"
            >
              {alphaCollection.map((item) => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ y: -10 }} 
                  onClick={() => handleQuickShop(item)} 
                  className="group cursor-pointer min-w-[85vw] snap-center md:min-w-0 md:w-auto"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-black/40 mb-4 relative rounded-sm border border-white/10">
                    {/* ALPHA DROP IMAGE - REMOVED GRAYSCALE */}
                    <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover opacity-100 transition-all duration-700" />
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
      </section>
      
      <Footer />
    </>
  );
};

const VisionPage = ({ setView }) => {
  // Track Page View
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

const ShopPage = ({ setView, setSelectedProduct }) => {
  // Track Page View
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {products.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} onClick={() => {
            logEvent('select_item', { item_name: item.name });
            setSelectedProduct(item);
          }} className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-4 relative rounded-sm border border-white/5 group-hover:border-white/20 transition-colors">
              {/* SHOP PAGE IMAGE - REMOVED GRAYSCALE */}
              <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
              {item.stock !== "Sold Out" ? (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 text-[8px] tracking-[0.3em] uppercase text-white border border-white/10">{item.stock} Left</div>
              ) : (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-xs font-bold tracking-[0.2em] uppercase border border-white px-3 py-1">Sold Out</span></div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-serif italic text-white group-hover:text-red-400 transition-colors">{item.name}</h3>
                <p className="text-[10px] tracking-widest text-gray-500 uppercase mt-1">260GSM Heavyweight</p>
              </div>
              <span className="text-white font-mono">${item.price}</span>
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
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { scrollY } = useScroll();

  // Initialize GA on mount
  useEffect(() => {
    if (GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && !window.dataLayer) {
      // Inject Google Analytics Script dynamically
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

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const addToCart = (product, size, color) => {
    logEvent('add_to_cart', { item_name: product.name, size, color, value: product.price });
    setCart([...cart, { ...product, selectedSize: size, selectedColor: color }]);
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
    const fullProduct = products.find(p => p.name === lookProduct.name) || { ...lookProduct, description: "Limited Edition Campaign Item", stock: "Limited", image: lookbook.find(l => l.product.name === lookProduct.name)?.image };
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

        /* --- HERO GLOW (Slow Multi-Color Shift) --- */
        .glass-text-hero {
          color: rgba(255, 255, 255, 0.1); 
          background: linear-gradient(
            270deg,
            #ff7eb3, 
            #ff758c, 
            #42d392, 
            #647dee, 
            #7f53ac, 
            #ff7eb3
          );
          background-size: 400% 400%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
          animation: glass-shimmer 12s ease infinite;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
        }

        /* --- CAMPAIGN GLOW (Green/Teal) --- */
        .glass-text-green {
          color: rgba(52, 211, 153, 0.1);
          background: linear-gradient(
            110deg,
            rgba(52, 211, 153, 0) 30%,
            rgba(52, 211, 153, 0.8) 50%,
            rgba(52, 211, 153, 0) 70%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(52, 211, 153, 0.5);
          animation: glass-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
        }

        /* --- ALPHA DROP GLOW (Red/Crimson) --- */
        .glass-text-red {
          color: rgba(248, 113, 113, 0.1);
          background: linear-gradient(
            110deg,
            rgba(248, 113, 113, 0) 30%,
            rgba(248, 113, 113, 0.8) 50%,
            rgba(248, 113, 113, 0) 70%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 1px rgba(248, 113, 113, 0.5);
          animation: glass-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(248, 113, 113, 0.4));
        }
      `}</style>

      {/* --- BACKGROUND EFFECTS --- */}
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

      <motion.nav 
        animate={{ opacity: (isHeaderVisible || isMenuOpen) ? 1 : 0, y: (isHeaderVisible || isMenuOpen) ? 0 : -20 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 w-full z-50 bg-black/10 backdrop-blur-lg border-b border-white/5 px-6 py-6 flex justify-between items-center ${(isHeaderVisible || isMenuOpen) ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button onClick={() => setView('home')} className="text-xl font-bold tracking-[0.3em] text-white/90 drop-shadow-lg z-50">{brandName}</button>
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

      {/* --- CART DRAWER (FIXED) --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#0f1115] border-l border-white/10 z-[100] p-6 flex flex-col shadow-2xl"
            >
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
                {/* Fixed Checkout Button using handleCartCheckout */}
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

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage setView={setView} handleQuickShop={handleQuickShop} />
          </motion.div>
        )}
        {view === 'shop' && (
          <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ShopPage setView={setView} setSelectedProduct={setSelectedProduct} />
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
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      </AnimatePresence>

    </div>
  );
};

export default App;