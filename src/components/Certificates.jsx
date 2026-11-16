import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { Award, X, Maximize2, Calendar, Tag, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import CompetencyMap from './competency-map/CompetencyMap';

export default function Certificates() {
  const { certificates } = usePortfolio();
  const [activeItem, setActiveItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const items = useMemo(() => {
    return Array.isArray(certificates) ? certificates : [];
  }, [certificates]);

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const set = new Set(['All']);
    items.forEach((item) => {
      if (item.tag) set.add(item.tag);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((item) => (item.tag || '').toLowerCase() === activeCategory.toLowerCase());
  }, [items, activeCategory]);

  return (
    <section id="certificates" className="py-24 relative overflow-hidden bg-[#131110]">
      {/* Ambient background typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden h-fit">
        <h2 className="text-[16vw] sm:text-[11vw] md:text-[13vw] font-black text-white/[0.02] leading-none uppercase tracking-tighter">
          Accolades
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-0 sm:px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3">
            <Award size={14} />
            <span>Certificates & Achievements</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Certificates & Achievements
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-xl text-white/70 max-w-3xl leading-relaxed font-normal">
            Recognitions, competitive hackathons, industry certifications, and technical credentials validating engineering capability, continuous learning, and problem-solving.
          </p>

          {/* Category Filter Chips */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-accent-orange text-white shadow-md shadow-accent-orange/25 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Competency Map */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-black mb-1">Competency Map</h2>
            <p className="text-xs text-white/40">
              Click a node to filter related certifications below
            </p>
          </div>
          <CompetencyMap certificates={items} />
        </div>

        {/* Pinterest-Style Masonry Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-12 sm:py-16 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
            <p className="text-white/40 text-xs sm:text-sm">No certificates found in this category.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
                className="break-inside-avoid mb-3 sm:mb-4 group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-[#1a1817] shadow-xl cursor-pointer"
                onClick={() => setActiveItem(item)}
              >
                {/* Natural aspect-ratio image - never cropped */}
                <OptimizedImage
                  src={item.image}
                  alt={item.title || 'Certificate or Achievement'}
                  width={600}
                  className="w-full h-auto block"
                  imgClassName="w-full h-auto block object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />

                {/* Hover overlay with smooth gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-accent-orange uppercase tracking-wider">
                      <Tag size={10} />
                      {item.tag || 'Certificate'}
                    </span>

                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-white">
                      <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {item.date && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={10} />
                          {item.date}
                        </span>
                      )}
                      {item.issuer && (
                        <span className="text-[9px] sm:text-[10px] font-medium text-white/40 truncate">
                          • {item.issuer}
                        </span>
                      )}
                    </div>
                    {item.title && (
                      <h4 className="text-white text-xs sm:text-base font-bold tracking-tight leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-white/60 text-[11px] sm:text-xs line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal Preview */}
      <AnimatePresence>
        {activeItem && (
          <div
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#171514] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveItem(null)}
                aria-label="Close dialog"
                className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="max-h-[55vh] sm:max-h-[72vh] overflow-hidden bg-black/40 flex items-center justify-center">
                <OptimizedImage
                  src={activeItem.image}
                  alt={activeItem.title || 'Certificate Preview'}
                  width={1200}
                  priority={true}
                  className="max-h-[55vh] sm:max-h-[72vh] w-auto mx-auto flex items-center justify-center"
                  imgClassName="max-h-[55vh] sm:max-h-[72vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="p-4 sm:p-8 bg-[#171514] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-y-auto">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} />
                      {activeItem.tag || 'Certificate'}
                    </span>
                    {activeItem.issuer && (
                      <span className="text-white/60 text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        {activeItem.issuer}
                      </span>
                    )}
                    {activeItem.date && (
                      <span className="text-white/40 text-[11px] sm:text-xs font-medium">
                        • {activeItem.date}
                      </span>
                    )}
                  </div>
                  {activeItem.title && (
                    <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                      {activeItem.title}
                    </h3>
                  )}
                  {activeItem.description && (
                    <p className="text-white/65 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                      {activeItem.description}
                    </p>
                  )}
                </div>

                {activeItem.credentialUrl && (
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <a
                      href={activeItem.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-[#e05722] text-white text-xs font-bold transition-all shadow-lg shadow-accent-orange/20"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
