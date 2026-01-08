#!/usr/bin/env python3
import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Remove the absolute positioned button
old_button = '''          {/* View All Reviews Button - Absolute positioned at bottom right corner */}
          <button
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 text-secondary hover:text-primary font-medium text-xs underline underline-offset-2 transition-all z-10 flex items-center gap-1"
            onClick={() => setShowTestimonials(true)}
          >
            View All Reviews
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <div className="container mx-auto px-4">'''

new_button = '''          <div className="container mx-auto px-4">'''

if old_button in content:
    content = content.replace(old_button, new_button)
    print("Removed absolute button")
else:
    print("Button pattern not found, trying to find it...")
    # Try regex
    pattern = r'\{/\* View All Reviews Button.*?</button>\s*<div className="container'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        print(f"Found at: {match.group()[:100]}...")
        content = re.sub(pattern, '<div className="container', content, flags=re.DOTALL)
        print("Replaced with regex")

# Now add the button after ReviewsCarousel
old_carousel = '''            {/* Reviews Carousel */}
            <ReviewsCarousel 
              reviews={reviews} 
              productImages={allProducts.slice(0, 10).map(p => p.images[0])}
              onViewAll={() => setShowTestimonials(true)}
            />
          </div>
        </div>
      </section>'''

new_carousel = '''            {/* Reviews Carousel */}
            <ReviewsCarousel 
              reviews={reviews} 
              productImages={allProducts.slice(0, 10).map(p => p.images[0])}
              onViewAll={() => setShowTestimonials(true)}
            />
            
            {/* View All Reviews Button */}
            <div className="text-center mt-3 sm:mt-4">
              <button
                className="text-white hover:text-amber-300 font-medium text-xs sm:text-sm underline underline-offset-2 transition-all inline-flex items-center gap-1"
                onClick={() => setShowTestimonials(true)}
              >
                View All Reviews
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>'''

if old_carousel in content:
    content = content.replace(old_carousel, new_carousel)
    print("Added button after carousel")
else:
    print("Carousel pattern not found")

with open('app/page.tsx', 'w') as f:
    f.write(content)
print("Done!")
