import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function StoreLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2C2A29] font-sans antialiased">
      

      {/* Header */}
      <header className="sticky top-0 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#EAE6E2] z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex flex-col items-center">
            <Link to="/" className="text-2xl font-semibold tracking-[0.25em] uppercase text-[#1A1919]">Elephanta</Link>
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#8C847E] -mt-1">Timeless Jewellery</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase text-[#544F4B]">
            <Link to="/" className="hover:text-[#A37E58] border-b-2 border-transparent pb-1">Home</Link>
            <Link to="/store/products" className="hover:text-[#A37E58] transition-colors pb-1">Shop</Link>
            <Link to="/store/collections" className="hover:text-[#A37E58] transition-colors pb-1">Collections</Link>
            <Link to="/about" className="hover:text-[#A37E58] transition-colors pb-1">About Us</Link>
            <Link to="/contact" className="hover:text-[#A37E58] transition-colors pb-1">Contact</Link>
          </nav>

          <div className="flex items-center gap-5 text-[#333130]">
            <div className="hidden lg:flex items-center bg-[#F4F1EE] border border-[#E2DDD9] rounded-full px-4 py-1.5 w-64">
              <svg className="w-4 h-4 text-[#8C847E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0x"/></svg>
              <input type="text" placeholder="Search for jewellery..." className="bg-transparent border-none text-xs ml-2 w-full focus:outline-none placeholder-[#AA9F96]" />
            </div>
            <Link to="/login" aria-label="Profile"><svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></Link>
            <button aria-label="Wishlist"><svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></button>
            <Link to="/store/cart" aria-label="Cart" className="relative"><svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span className="absolute -top-1 -right-1 bg-[#A37E58] text-[#FDFCFB] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            </Link>

            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        <div className={`${mobileOpen ? 'block' : 'hidden'} md:hidden border-t border-[#EAE6E2] bg-[#FDFCFB]`}> 
          <div className="px-6 py-4 flex flex-col gap-3 text-sm">
            <Link to="/">Home</Link>
            <Link to="/store/products">Shop</Link>
            <Link to="/store/products">Collections</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      <footer className="bg-[#0f1b1a] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-serif text-2xl">Elephanta</h4>
            <p className="text-sm text-white/70 mt-3">Premium artisanal pieces designed with legacy craftsmanship for every precious milestone.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Quick Links</h5>
            <ul className="text-sm text-white/70 space-y-1">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/store/products" className="hover:text-white">Shop All Jewellery</Link></li>
              <li><Link to="/store/collections" className="hover:text-white">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Customer Care</h5>
            <ul className="text-sm text-white/70 space-y-1">
              <li><a href="/faqs" className="hover:text-white">FAQs</a></li>
              <li><a href="/shipping" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-white">Return & Refund</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Social Media</h5>
            <p className="text-sm text-white/70 mb-2">Follow us for new collections, behind-the-scenes and exclusive drops.</p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><path d="M17.5 6.5h.01"/></svg>
                <span className="text-sm text-white/80">Instagram</span>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3z"/></svg>
                <span className="text-sm text-white/80">Facebook</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-white/60">© {new Date().getFullYear()} Elephanta. All rights reserved.</div>
      </footer>
    </div>
  )
}
