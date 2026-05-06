import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  Briefcase, 
  Mail, 
  Home as HomeIcon, 
  Settings, 
  Send, 
  Trash2, 
  LogOut, 
  LogIn,
  CheckCircle2,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  MapPin,
  User as UserIcon,
  MessageSquare,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  onAuthStateChanged,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from './lib/firebase';

const View = {
  HOME: 'home',
  PRODUCTS: 'products',
  SERVICES: 'services',
  CONTACT: 'contact',
  ADMIN: 'admin',
  CHECKOUT: 'checkout'
};

const CATEGORIES = ["All", "Branding", "Stationery", "Admin", "Awards"];

const PRODUCTS = [
  { name: "Learning Tools", category: "Stationery", price: 1200, image: "https://picsum.photos/seed/tool/400/300", description: "Enhance learning with our tools." },
  { name: "Awasi Boys School Logo", category: "Branding", price: 2500, image: "https://picsum.photos/seed/awasi/400/300", description: "Professional school identity design." },
  { name: "Clock Branding", category: "Branding", price: 1500, image: "https://picsum.photos/seed/clock/400/300", description: "Custom wall clocks with school logo." },
  { name: "Kairi Secondary Logo", category: "Branding", price: 2500, image: "https://picsum.photos/seed/kairi/400/300", description: "Logo for Kairi Secondary School." },
  { name: "Poiywek School Logo", category: "Branding", price: 2500, image: "https://picsum.photos/seed/poiywek/400/300", description: "Logo for Poiywek Secondary School." },
  { name: "Achengo Mixed Logo", category: "Branding", price: 2500, image: "https://picsum.photos/seed/achengo/400/300", description: "Logo for Achengo Mixed Secondary." },
  { name: "Custom Badges", category: "Stationery", price: 500, image: "https://picsum.photos/seed/badge/400/300", description: "Premium school badges and key holders." },
  { name: "Medals and Trophies", category: "Awards", price: 1800, image: "https://picsum.photos/seed/medal/400/300", description: "Quality recognition materials." },
  { name: "Podiums", category: "Admin", price: 15000, image: "https://picsum.photos/seed/podiums/400/300", description: "Sturdy wood and acrylic podiums." },
  { name: "Labels and Signs", category: "Stationery", price: 300, image: "https://picsum.photos/seed/labels/400/300", description: "Directional and room identifiers." },
  { name: "Stamp & Company Seal", category: "Admin", price: 3500, image: "https://picsum.photos/seed/stamp/400/300", description: "Fast-dry school and company stamps." },
  { name: "Plaques", category: "Awards", price: 4500, image: "https://picsum.photos/seed/plaques/400/300", description: "Elegant retirement and merit plaques." },
  { name: "School Registers", category: "Admin", price: 800, image: "https://picsum.photos/seed/register/400/300", description: "Standard attendance and classwork books." },
];

const SERVICES = [
  { name: "Web Design", description: "Modern, responsive websites for schools and businesses." },
  { name: "Learning Materials", description: "K-12 and CBC/CBE materials for Kenyan schools." },
  { name: "Branding", description: "Logo design, merchandise branding, and corporate identity." },
  { name: "Admin Materials", description: "Classwork registers, school stationeries, and admin tools." },
];

export default function App() {
  const [currentView, setCurrentView] = useState(View.HOME);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [formStatus, setFormStatus] = useState('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.email === 'ibgroup.live@gmail.com') {
      const qInquiries = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInquiries(items);
      });

      const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubOrders = onSnapshot(qOrders, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(items);
      });

      return () => {
        unsubInquiries();
        unsubOrders();
      };
    }
  }, [user]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.name === product.name);
      if (exists) return prev;
      return [...prev, product];
    });
    // Optional: Switch to products if adding from home or just give feedback
  };

  const removeFromCart = (name) => {
    setCart(prev => prev.filter(item => item.name !== name));
  };

  const handleShare = async (product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nuru: ${product.name}`,
          text: `Check out ${product.name} from Nuru Stationeries and Services. Price: KES ${product.price}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  // SEO: JSON-LD injection
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Nuru Stationeries and Services",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE"
      },
      "url": "https://nuru-stationeries.com",
      "telephone": "+254719301330",
      "description": "Provider of school custom stationeries, digital services, branding, and K-12 learning materials for CBC in Kenya.",
      "areaServed": "East Africa"
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    const formData = new FormData(e.currentTarget);
    const path = 'orders';
    
    const orderData = {
      customerName: formData.get('name'),
      school: formData.get('school'),
      location: formData.get('location'),
      role: formData.get('role'),
      contact: formData.get('contact'),
      items: cart.map(item => item.name),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, path), orderData);
      
      // WhatsApp Integration
      const message = `*New Order from Nuru Site*\n\n*Name:* ${orderData.customerName}\n*School:* ${orderData.school}\n*Location:* ${orderData.location}\n*Role:* ${orderData.role}\n*Contact:* ${orderData.contact}\n\n*Items:*\n${orderData.items.map(i => `- ${i}`).join('\n')}`;
      const whatsappUrl = `https://wa.me/254719301330?text=${encodeURIComponent(message)}`;
      
      setFormStatus('success');
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => {
        setFormStatus('idle');
        setCart([]);
        setCurrentView(View.HOME);
      }, 3000);
      e.target.reset();
    } catch (error) {
      console.error('Order Error:', error);
      setFormStatus('idle');
    }
  };

  const deleteOrder = async (id) => {
    if (id) await deleteDoc(doc(db, 'orders', id));
  };

  const deleteInquiry = async (id) => {
    if (id) await deleteDoc(doc(db, 'inquiries', id));
  };

  const filteredProducts = activeCategory === "All" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const NavLink = ({ view, label, icon: Icon }) => (
    <button 
      onClick={() => { setCurrentView(view); setIsMenuOpen(false); }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
        currentView === view ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-seagreen-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-seagreen-200">
              N
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">NURU</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Stationeries & Services</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink view={View.HOME} label="Home" icon={HomeIcon} />
            <NavLink view={View.PRODUCTS} label="Shop" icon={ShoppingBag} />
            <NavLink view={View.SERVICES} label="Services" icon={Briefcase} />
            <NavLink view={View.CONTACT} label="Contact" icon={Mail} />
            <button 
              onClick={() => setCurrentView(View.CHECKOUT)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                currentView === View.CHECKOUT ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart size={18} />
              <span className="font-medium">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">
                  {cart.length}
                </span>
              )}
            </button>
            {user?.email === 'ibgroup.live@gmail.com' && (
              <NavLink view={View.ADMIN} label="Admin" icon={Settings} />
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600 border border-slate-200 rounded-lg">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-b border-slate-200 absolute w-full px-4 py-4 space-y-2 shadow-xl"
            >
              <NavLink view={View.HOME} label="Home" icon={HomeIcon} />
              <NavLink view={View.PRODUCTS} label="Shop" icon={ShoppingBag} />
              <NavLink view={View.SERVICES} label="Services" icon={Briefcase} />
              <NavLink view={View.CONTACT} label="Contact" icon={Mail} />
              <button 
                onClick={() => { setCurrentView(View.CHECKOUT); setIsMenuOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-xl transition-all ${
                  currentView === View.CHECKOUT ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={18} />
                  <span className="font-medium">Cart</span>
                </div>
                {cart.length > 0 && (
                  <span className={`${currentView === View.CHECKOUT ? 'bg-white text-primary' : 'bg-primary text-white'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    {cart.length} Items
                  </span>
                )}
              </button>
              {user?.email === 'ibgroup.live@gmail.com' && (
                <NavLink view={View.ADMIN} label="Admin" icon={Settings} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {currentView === View.HOME && (
            <motion.section 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-seagreen-50 text-seagreen-700 rounded-full text-xs font-bold uppercase tracking-wider border border-seagreen-100">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    <span>Kenya's Top School Supplier</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
                    Your School's Future <br/>
                    <span className="text-primary italic">Starts with Better Design.</span>
                  </h2>
                  <p className="text-base text-slate-500 max-w-lg leading-relaxed">
                    Custom stationery solutions and digital branding for progressive educational institutions across East Africa.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setCurrentView(View.PRODUCTS)}
                      className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-seagreen-200 hover:bg-primary-dark transition-all"
                    >
                      Shop Catalog
                    </button>
                    <a 
                      href="https://wa.me/254719301330"
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center space-x-2"
                    >
                      <Phone size={18} />
                      <span>Request Quote</span>
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-6 bg-seagreen-100 rounded-[3rem] blur-3xl opacity-40 -z-10"></div>
                  <img 
                    src="https://picsum.photos/seed/k-12/800/600" 
                    alt="Education Support" 
                    className="w-full h-[380px] object-cover rounded-[2.5rem] shadow-2xl border-2 border-white ring-8 ring-slate-100/50"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Best Sellers Preview */}
              <div className="space-y-8">
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-bold text-slate-800">Top Rated Products</h3>
                  <button onClick={() => setCurrentView(View.PRODUCTS)} className="text-sm font-bold text-primary hover:underline">View All &rarr;</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {PRODUCTS.slice(0, 4).map((p, i) => (
                    <div key={i} className="group bg-white p-4 rounded-3xl border border-slate-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => addToCart(p)}>
                      <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform" />
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{p.name}</h4>
                      <p className="text-primary font-black text-xs">KES {p.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {currentView === View.PRODUCTS && (
            <motion.section 
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* E-commerce Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nuru Store</h2>
                  <p className="text-slate-500 text-sm">Quality school branding & materials delivered.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeCategory === cat 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-seagreen-100 transition-all flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(p); }}
                        className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-md rounded-full text-slate-700 hover:bg-white hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Share2 size={16} />
                      </button>
                      <div className="absolute bottom-3 left-3">
                         <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter ring-1 ring-slate-100">
                           {p.category}
                         </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-2">{p.description}</p>
                        <p className="text-primary font-black text-base">KES {p.price.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                          cart.find(item => item.name === p.name)
                            ? 'bg-seagreen-100 text-primary-dark cursor-default'
                            : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-seagreen-100'
                        }`}
                      >
                        {cart.find(item => item.name === p.name) ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {currentView === View.SERVICES && (
            <motion.section 
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Digital & CBC Professional Services</h2>
                  <div className="space-y-6">
                    {SERVICES.map((s, i) => (
                      <div key={i} className="flex items-start space-x-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                        <div className="mt-1">
                          <CheckCircle2 className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                          <p className="text-slate-500 mb-4">{s.description}</p>
                          <button 
                            onClick={() => addToCart(s)}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 border ${
                              cart.find(item => item.name === s.name)
                                ? 'bg-seagreen-100 text-primary-dark border-seagreen-200 cursor-default'
                                : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                            }`}
                          >
                             {cart.find(item => item.name === s.name) ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                             <span>{cart.find(item => item.name === s.name) ? 'Selected' : 'Enquire Now'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <img 
                    src="https://picsum.photos/seed/nuru-service/800/1000" 
                    alt="Digital Services" 
                    className="w-full h-auto rounded-[2.5rem] shadow-2xl ring-1 ring-slate-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.section>
          )}

          {currentView === View.CONTACT && (
            <motion.section 
              key="contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid md:grid-cols-2">
                <div className="bg-primary p-12 text-white flex flex-col justify-between">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold font-serif italic">Get in Touch</h2>
                    <p className="text-seagreen-50 text-lg">We are based in Nairobi but supply throughout East Africa. Reach out for a custom quote.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
                        <Phone size={20} />
                      </div>
                      <span className="font-medium">+254 719 301330</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <span className="font-medium">nuru.services@example.com</span>
                    </div>
                  </div>
                </div>
                <div className="p-12">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                      <input name="name" required placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                        <input name="email" type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</label>
                        <input name="whatsapp" placeholder="+254..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                      <select name="subject" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all">
                        <option>General Inquiry</option>
                        <option>Product Order</option>
                        <option>Web Design Service</option>
                        <option>CBC Materials</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Message</label>
                      <textarea name="message" required rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={formStatus === 'submitting'}
                      className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center space-x-2 shadow-lg shadow-seagreen-100"
                    >
                      {formStatus === 'submitting' ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : formStatus === 'success' ? (
                        <>
                          <CheckCircle2 size={20} />
                          <span>Sent Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.section>
          )}

          {currentView === View.CHECKOUT && (
            <motion.section 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-seagreen-100">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Checkout</h2>
                  <p className="text-slate-500">Review your selection and complete your request.</p>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center space-y-6">
                  <ShoppingBag className="mx-auto text-slate-100" size={80} />
                  <h3 className="text-2xl font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-slate-500">Browse our products and services to add items here.</p>
                  <button 
                    onClick={() => setCurrentView(View.PRODUCTS)}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-2xl"
                  >
                    Go to Products
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 ml-2">Selected Items</h3>
                    <div className="space-y-4">
                      {cart.map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group">
                          <div className="flex items-center space-x-4">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-xl" />
                            ) : (
                              <div className="w-16 h-16 bg-seagreen-50 text-primary flex items-center justify-center rounded-xl">
                                <Briefcase size={24} />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-800">{item.name}</h4>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.name)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
                      <h3 className="text-xl font-bold mb-6">Order Details</h3>
                      <form onSubmit={handleOrderSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Full Name</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input name="name" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">School Name</label>
                          <div className="relative">
                            <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input name="school" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input name="location" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role/Position</label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input name="role" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact No (WhatsApp)</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input name="contact" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 mt-6 space-y-4">
                          <button 
                            type="submit" 
                            disabled={formStatus === 'submitting'}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-seagreen-100 hover:bg-primary-dark transition-all disabled:opacity-50"
                          >
                            {formStatus === 'submitting' ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Send size={20} />
                                <span>Place Order & WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {currentView === View.ADMIN && (
            <motion.section 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic">Admin Portal</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold bg-seagreen-50 px-3 py-1 rounded-full text-primary">{user?.email}</span>
                  <button onClick={() => signOut(auth)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 font-bold text-sm transition-all flex items-center space-x-2">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {!user ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-6">
                  <Settings className="mx-auto text-primary-light opacity-20" size={80} />
                  <h3 className="text-2xl font-bold">Admin Restricted Area</h3>
                  <p className="text-slate-500">Authorized personnel only.</p>
                  <button 
                    onClick={() => signInWithPopup(auth, googleProvider)}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-2xl flex items-center space-x-2 mx-auto"
                  >
                    <LogIn size={20} />
                    <span>Sign In to Continue</span>
                  </button>
                </div>
              ) : user.email !== 'ibgroup.live@gmail.com' ? (
                <div className="bg-red-50 p-12 rounded-[2.5rem] border border-red-100 text-center space-y-4">
                  <X className="mx-auto text-red-200" size={80} />
                  <h3 className="text-2xl font-bold text-red-800">Access Denied</h3>
                  <p className="text-red-600 font-medium">Your account is not recognized as an administrator.</p>
                  <button onClick={() => signOut(auth)} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200">Switch Account</button>
                </div>
              ) : (
                <div className="space-y-16">
                  {/* Orders Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 ml-2">
                      <ShoppingBag className="text-primary" size={24} />
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recent Orders</h3>
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-16 text-center text-slate-300 italic">No orders received yet.</td>
                            </tr>
                          ) : orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                                {order.createdAt?.toDate?.() ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-800">{order.customerName}</p>
                                <p className="text-xs text-indigo-600 font-medium">{order.contact}</p>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                <p className="font-medium text-slate-700">{order.school}</p>
                                <p className="text-xs">{order.location} • {order.role}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {order.items?.map((item, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{item}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => deleteOrder(order.id)}
                                  className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 ml-2">
                      <MessageSquare className="text-primary" size={24} />
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Feedback & Inquiries</h3>
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{inquiries.length}</span>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">From</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {inquiries.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-16 text-center text-slate-300 italic">No feedback messages yet.</td>
                            </tr>
                          ) : inquiries.map((inq) => (
                            <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                                {inq.createdAt?.toDate?.() ? inq.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-800">{inq.name}</p>
                                <p className="text-xs text-indigo-600 font-medium">{inq.whatsapp}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-seagreen-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{inq.subject}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">{inq.message}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => deleteInquiry(inq.id)}
                                  className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h2 className="text-xl font-black italic tracking-tighter">NURU<span className="text-primary">.</span></h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Kenya's premier school stationery and digital service provider. Empowering schools through design and supply excellence.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Navigation</h3>
            <ul className="space-y-2 text-sm font-medium text-slate-600">
              <li className="cursor-pointer hover:text-primary" onClick={() => setCurrentView(View.PRODUCTS)}>Products</li>
              <li className="cursor-pointer hover:text-primary" onClick={() => setCurrentView(View.SERVICES)}>Services</li>
              <li className="cursor-pointer hover:text-primary" onClick={() => setCurrentView(View.CONTACT)}>Contact</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</h3>
            <ul className="space-y-2 text-sm font-medium text-slate-600">
              <li>Nairobi, Kenya</li>
              <li>+254 719 301330</li>
              <li className="text-primary">Available across East Africa</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect</h3>
            <div className="flex space-x-3">
              <a href="https://wa.me/254719301330" className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <Phone size={18} />
              </a>
              <a href="mailto:nuru.services@example.com" className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2024 Nuru Stationeries and Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
