import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { Users, X, Maximize2, Sparkles, Calendar, Tag } from 'lucide-react';

export default function Community() {
  const { community } = usePortfolio();
  const [activeItem, setActiveItem] = useState(null);

  // If no community items exist yet, don't show an empty broken section
  const items = community && community.length > 0 ? community : [];

  return (
    <section id="community" className="py-24 relative overflow-hidden bg-[#151312]">
      {/* Subtle background ambient text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden h-fit">
        <h2 className="text-[20vw] sm:text-[14vw] md:text-[18vw] font-black text-white/[0.02] leading-none uppercase tracking-tighter">
          Impact
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-0 sm:px-4 relative z-10">
        {/* Section Header matching the screenshot */}
        <div className="mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-accent-lime/10 border border-accent-lime/20 text-accent-lime text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3">
            <Users size={14} />
            <span>Community Impact</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Community Impact
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-xl text-white/70 max-w-3xl leading-relaxed font-normal">
            <strong className="text-white font-black">Mentored 5,000+ students</strong> through developer workshops, tech communities, and hands-on mentoring sessions focused on building real-world projects.
          </p>
        </div>

        {/* Pinterest-Style Masonry Grid */}
        {items.length === 0 ? (
          <div className="py-12 sm:py-16 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
            <p className="text-white/40 text-xs sm:text-sm">No community photos uploaded yet. Add photos from the Admin CMS.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
                className="break-inside-avoid mb-3 sm:mb-4 group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-[#1c1a19] shadow-xl cursor-pointer"
                onClick={() => setActiveItem(item)}
              >
                {/* Natural aspect-ratio image - never cropped or forced */}
                <img
                  src={item.image}
                  alt={item.title || 'Community Impact'}
                  loading="lazy"
                  className="w-full h-auto block object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />

                {/* Hover overlay with smooth gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-accent-lime uppercase tracking-wider">
                      <Tag size={10} />
                      {item.tag || 'Community'}
                    </span>

                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-white">
                      <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>

                  <div>
                    {item.date && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1 mb-0.5 sm:mb-1">
                        <Calendar size={10} />
                        {item.date}
                      </span>
                    )}
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
              className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#181615] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="max-h-[55vh] sm:max-h-[72vh] overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={activeItem.image}
                  alt={activeItem.title || 'Community Photo'}
                  className="max-h-[55vh] sm:max-h-[72vh] w-auto object-contain mx-auto"
                />
              </div>

              {(activeItem.title || activeItem.description || activeItem.tag) && (
                <div className="p-4 sm:p-8 bg-[#181615] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-y-auto">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-lime/10 border border-accent-lime/20 text-accent-lime text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {activeItem.tag || 'Community'}
                      </span>
                      {activeItem.date && (
                        <span className="text-white/40 text-[11px] sm:text-xs font-medium">{activeItem.date}</span>
                      )}
                    </div>
                    {activeItem.title && (
                      <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                        {activeItem.title}
                      </h3>
                    )}
                    {activeItem.description && (
                      <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                        {activeItem.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
