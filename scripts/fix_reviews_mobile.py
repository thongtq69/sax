#!/usr/bin/env python3
import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Fix the reviews section - reduce padding on mobile and fix View All button
old_reviews = '''        {/* Customer Reviews - Same Background */}
        <div className="relative py-8 sm:py-10 md:py-12">
          {/* View All Reviews Button - Absolute positioned at bottom right corner */}
          <button
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 text-secondary hover:text-primary font-medium text-xs underline underline-offset-2 transition-all z-10 flex items-center gap-1"
            onClick={() => setShowTestimonials(true)}
          >
            View All Reviews
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <div className="container mx-auto px-4">
            <div className="mb-4 sm:mb-6 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 text-amber-700 text-[10px] sm:text-xs font-medium mb-3 rounded-full shadow-md backdrop-blur-sm">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                Trusted by Musicians Worldwide
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                What Our Customers Say
              </h2>
            </div>

            {/* Reviews Carousel */}
            <ReviewsCarousel 
              reviews={reviews} 
              productImages={allProducts.slice(0, 10).map(p => p.images[0])}
              onViewAll={() => setShowTestimonials(true)}
            />
          </div>
        </div>'''

new_reviews = '''        {/* Customer Reviews - Same Background */}
        <div className="relative py-4 sm:py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="mb-3 sm:mb-6 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-4 sm:py-2 bg-white/90 text-amber-700 text-[9px] sm:text-xs font-medium mb-2 sm:mb-3 rounded-full shadow-md backdrop-blur-sm">
                <Star className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                Trusted by Musicians Worldwide
              </div>
              <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-3 drop-shadow-lg">
                What Our Customers Say
              </h2>
            </div>

            {/* Reviews Carousel */}
            <ReviewsCarousel 
              reviews={reviews} 
              productImages={allProducts.slice(0, 10).map(p => p.images[0])}
              onViewAll={() => setShowTestimonials(true)}
            />
            
            {/* View All Reviews Button - Below carousel */}
            <div className="text-center mt-3 sm:mt-4">
              <button
                className="text-white hover:text-amber-300 font-medium text-xs sm:text-sm underline underline-offset-2 transition-all flex items-center gap-1 mx-auto"
                onClick={() => setShowTestimonials(true)}
              >
                View All Reviews
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>'''

# Try to replace
if old_reviews in content:
    content = content.replace(old_reviews, new_reviews)
    with open('app/page.tsx', 'w') as f:
        f.write(content)
    print("Successfully updated reviews section!")
else:
    print("Pattern not found, trying regex...")
    # Use regex for more flexible matching
    pattern = r'\{/\* Customer Reviews - Same Background \*/\}.*?</div>\s*</div>\s*</div>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        print(f"Found match at position {match.start()}-{match.end()}")
    else:
        print("Regex pattern also not found")
