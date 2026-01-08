#!/usr/bin/env python3

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_text = '''            {/* Reviews Carousel */}
            <ReviewsCarousel 
              reviews={reviews} 
              productImages={allProducts.slice(0, 10).map(p => p.images[0])}
              onViewAll={() => setShowTestimonials(true)}
            />
          </div>
        </div>
      </section>'''

new_text = '''            {/* Reviews Carousel */}
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

if old_text in content:
    content = content.replace(old_text, new_text)
    with open('app/page.tsx', 'w') as f:
        f.write(content)
    print("Added View All Reviews button!")
else:
    print("Pattern not found")
    # Show what's actually there
    import re
    match = re.search(r'ReviewsCarousel.*?</section>', content, re.DOTALL)
    if match:
        print("Found:", match.group()[:300])
