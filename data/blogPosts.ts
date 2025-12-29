export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  categories: string[];
  image: string;
  readTime?: number;
}

export interface BlogCategory {
  name: string;
  slug: string;
}

export const blogCategories: BlogCategory[] = [
  { name: 'Saxophones', slug: 'saxophones' },
  { name: 'Clarinets', slug: 'clarinets' },
  { name: 'Flutes', slug: 'flutes' },
  { name: 'Instrument Care', slug: 'instrument-care' },
  { name: 'Reviews', slug: 'reviews' },
  { name: 'Industry News', slug: 'industry-news' },
  { name: 'Tips & Guides', slug: 'tips-guides' },
  { name: 'History', slug: 'history' },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Selmer Signature Saxophone: A New Chapter in French Craftsmanship',
    slug: 'selmer-signature-saxophone',
    excerpt: 'Following the groundbreaking Selmer Supreme, the Signature model represents a thoughtful evolution in professional saxophone design, offering players a more accessible entry point to true Parisian quality.',
    content: `
      <p>When Selmer Paris unveiled the Supreme saxophone in 2021, the music world took notice. This flagship instrument represented the culmination of decades of research and development. But what many players wondered was: where does this leave the rest of the line?</p>
      
      <p>Enter the Selmer Signature—a saxophone that bridges the gap between the legendary Series II and III horns and the revolutionary Supreme. The Signature incorporates many of the acoustic innovations developed during the Supreme project while maintaining a more approachable character.</p>
      
      <h3>Key Features of the Signature</h3>
      <p>The Signature borrows the Supreme's improved intonation system, particularly in the palm keys and lower register. Players will notice immediately that notes speak with greater ease and consistency across all registers.</p>
      
      <p>Perhaps most importantly, the Signature maintains that characteristic Selmer Paris warmth—a quality that has made French saxophones the instruments of choice for classical and jazz musicians alike for over a century.</p>
      
      <h3>Who Is the Signature For?</h3>
      <p>While the Supreme represents the ultimate expression of Selmer's current technology, the Signature provides an excellent alternative for professionals seeking exceptional playability, students ready to upgrade to a professional horn, and players who appreciate traditional Selmer characteristics with modern enhancements.</p>
    `,
    date: '2024-12-28',
    author: 'James Kessler',
    categories: ['Saxophones', 'Reviews'],
    image: '/images/blog/selmer-signature.png',
    readTime: 5,
  },
  {
    id: '2',
    title: 'Yanagisawa WO Series: Elevating an Already Exceptional Standard',
    slug: 'yanagisawa-wo-series-saxophones',
    excerpt: 'The Japanese master craftsmen at Yanagisawa have done it again. The WO Series represents a refined evolution of their already acclaimed saxophone line, delivering unprecedented consistency and tonal beauty.',
    content: `
      <p>Yanagisawa has long been revered among serious saxophonists for their exceptional craftsmanship and remarkable consistency. When a company already produces instruments of this caliber, how do they improve? The WO Series provides an eloquent answer.</p>
      
      <h3>The Evolution from A- and T-Series</h3>
      <p>The transition from the previous generation wasn't merely about adding features—it was about refining every aspect of the instrument's design. The bell geometry has been subtly modified to enhance projection and tonal center, while the key mechanisms have been reengineered for even more precise action.</p>
      
      <h3>Handcrafted Excellence</h3>
      <p>Each WO saxophone is individually hand-finished by master technicians in Japan. This attention to detail ensures that every instrument meets Yanagisawa's exacting standards. The result is a saxophone that responds instantly to the player's intentions, with a tonal palette that ranges from whisper-soft to full-bodied projection.</p>
      
      <h3>Bronze vs. Brass</h3>
      <p>The WO Series continues Yanagisawa's tradition of offering both brass and bronze body options. The bronze models provide a darker, more complex fundamental tone, while the brass instruments offer brilliant projection and clarity.</p>
    `,
    date: '2024-12-25',
    author: 'James Kessler',
    categories: ['Saxophones', 'Reviews'],
    image: '/images/blog/yanagisawa-wo.jpg',
    readTime: 6,
  },
  {
    id: '3',
    title: 'Buffet Prodige & Premium: Redefining Student Clarinets',
    slug: 'buffet-prodige-premium-clarinets',
    excerpt: 'Buffet Crampon has reimagined their student clarinet line with the new Prodige and Premium models, replacing the venerable B12 and E11 with instruments that offer better playability and tone quality.',
    content: `
      <p>For generations, the Buffet B12 and E11 clarinets have served as reliable stepping stones for developing clarinetists. These instruments introduced countless players to the world of wind music. Now, Buffet Crampon has taken everything they learned from these iconic models and created something better.</p>
      
      <h3>The Prodige: Professional Aspirations at Student Prices</h3>
      <p>The Prodige represents Buffet's new entry-level offering, but don't let that designation fool you. This instrument incorporates design elements borrowed from Buffet's professional line, including improved bore dimensions and more ergonomic key placement.</p>
      
      <h3>The Premium: Bridging the Gap</h3>
      <p>For students ready to advance, the Premium offers an intermediate option that genuinely prepares players for professional instruments. The Premium features grenadilla-inspired composite material for consistent performance regardless of climate conditions.</p>
      
      <h3>Why the Change?</h3>
      <p>Modern manufacturing techniques have allowed Buffet to offer better instruments at these price points. The new models benefit from the same research that went into developing the Tosca and Festival professional clarinets, filtered down to make quality accessible to all players.</p>
    `,
    date: '2024-12-20',
    author: 'James Kessler',
    categories: ['Clarinets', 'Reviews'],
    image: '/images/blog/buffet-prodige.jpg',
    readTime: 5,
  },
  {
    id: '4',
    title: 'Does Saxophone Finish Really Affect Sound? An Honest Assessment',
    slug: 'saxophone-finish-sound-impact',
    excerpt: 'The debate has raged for decades: lacquer vs. silver vs. unlacquered—does the finish actually change how a saxophone sounds? We examine the evidence and share insights from our extensive testing.',
    content: `
      <p>Walk into any saxophone forum online, and you'll find heated discussions about whether finish affects sound. Proponents of unlacquered saxophones swear by their "freer blowing" instruments, while others insist it's all psychological. So what's the truth?</p>
      
      <h3>The Physics Perspective</h3>
      <p>From a pure physics standpoint, any coating on a vibrating body will affect its resonance. Lacquer adds mass and slightly dampens vibration. Silver plating, being thinner, has less effect. Unlacquered instruments theoretically vibrate most freely.</p>
      
      <h3>Real-World Testing</h3>
      <p>We've tested dozens of saxophones over the years—sometimes the same model in different finishes. Our findings? The differences are subtle but real. More importantly, they're often overshadowed by other factors like mouthpiece choice, reed selection, and player technique.</p>
      
      <h3>What Actually Matters</h3>
      <p>Rather than obsessing over finish, consider these more impactful factors: the quality of the instrument's construction, the precision of the keywork, the geometry of the neck and mouthpiece, and of course, dedicated practice. A well-made lacquered saxophone will outperform a poorly made unlacquered one every time.</p>
      
      <h3>Our Recommendation</h3>
      <p>Choose your finish based on aesthetics and maintenance preferences. If you love the look of raw brass and don't mind polishing, go unlacquered. If you want easier maintenance, lacquer is excellent. The most important thing is finding an instrument that inspires you to practice.</p>
    `,
    date: '2024-12-15',
    author: 'James Kessler',
    categories: ['Saxophones', 'Tips & Guides'],
    image: '/images/blog/sax-finish.jpg',
    readTime: 7,
  },
  {
    id: '5',
    title: 'Understanding Tariffs on Musical Instruments: What Players Need to Know',
    slug: 'tariffs-musical-instruments',
    excerpt: 'Recent trade policy changes have affected the pricing of imported instruments. We break down what this means for musicians looking to purchase new instruments.',
    content: `
      <p>Trade policies can feel abstract until they affect something you care about—like the cost of your next instrument. Recent tariff changes have impacted the musical instrument industry in significant ways.</p>
      
      <h3>Which Instruments Are Affected?</h3>
      <p>Instruments manufactured in certain countries may be subject to additional duties. This affects not just finished instruments but also components, cases, and accessories. European and Japanese manufacturers have seen their products become more expensive, while American-made instruments have become relatively more competitive.</p>
      
      <h3>Impact on Prices</h3>
      <p>Dealers have absorbed some of these increased costs, but inevitably, some have been passed along to consumers. Professional instruments from major European makers have seen price increases ranging from 5% to 25% depending on the specific product and timing.</p>
      
      <h3>What You Can Do</h3>
      <p>If you're planning a major instrument purchase, consider timing carefully. Work with reputable dealers who can advise on current pricing and potential future changes. And remember that a quality instrument is a long-term investment that will serve you for decades.</p>
    `,
    date: '2024-12-10',
    author: 'James Kessler',
    categories: ['Industry News'],
    image: '/images/products/selmer-sa80-alto-main.jpg',
    readTime: 4,
  },
  {
    id: '6',
    title: 'Boveda Humidification: Protecting Your Wooden Instruments',
    slug: 'boveda-humidification-instruments',
    excerpt: 'Proper humidification is crucial for wooden instruments like clarinets and oboes. Boveda packs offer a simple, reliable solution for maintaining optimal humidity levels.',
    content: `
      <p>If you play a wooden instrument, you've likely experienced the anxiety that comes with changing seasons. Dry winter air can cause cracking, while humid summers can lead to sticky keys and swelling. Boveda humidification systems offer an elegant solution.</p>
      
      <h3>How Boveda Works</h3>
      <p>Unlike traditional humidifiers that only add moisture, Boveda packs both add and absorb humidity to maintain a precise level. They use a patented salt solution that maintains 49% relative humidity—ideal for most wooden instruments.</p>
      
      <h3>Easy Implementation</h3>
      <p>Simply place a Boveda pack in your instrument case, and it works automatically. There's no water to add, no monitoring required. When the pack becomes rigid, it's time to replace it—typically every 2-4 months depending on conditions.</p>
      
      <h3>Why We Recommend It</h3>
      <p>We've seen too many beautiful clarinets and oboes damaged by improper humidity. The cost of a Boveda pack is nothing compared to an expensive repair or, worse, a cracked bore. It's simple insurance for your investment.</p>
    `,
    date: '2024-12-05',
    author: 'James Kessler',
    categories: ['Instrument Care', 'Tips & Guides'],
    image: '/images/products/buffet-r13-main.jpg',
    readTime: 4,
  },
  {
    id: '7',
    title: 'Choosing Your First Soprano Saxophone: A Comprehensive Guide',
    slug: 'choosing-soprano-saxophone',
    excerpt: 'The soprano saxophone presents unique challenges and rewards. We guide you through the essential considerations for selecting an instrument that matches your needs and budget.',
    content: `
      <p>The soprano saxophone occupies a special place in the saxophone family. Its brilliant, penetrating tone can soar above an ensemble or provide intimate solo expression. But it's also notoriously challenging to play in tune.</p>
      
      <h3>Why Soprano Is Different</h3>
      <p>The soprano's smaller size means less room for manufacturing error—slight imperfections that might be unnoticeable on an alto become glaring on soprano. This is why we always recommend investing in quality when it comes to this instrument.</p>
      
      <h3>Curved vs. Straight</h3>
      <p>Curved sopranos are easier to hold and play in tune, making them excellent choices for beginners. Straight sopranos offer a more focused, projecting tone but require more developed embouchure control. Many players eventually own both.</p>
      
      <h3>Our Top Recommendations</h3>
      <p>For students and intermediate players, the Yamaha YSS-475 offers reliable intonation and easy playability. For professionals, the Yanagisawa S-WO series provides exceptional craftsmanship, while the Selmer Series III remains a classic choice.</p>
    `,
    date: '2024-11-28',
    author: 'James Kessler',
    categories: ['Saxophones', 'Tips & Guides'],
    image: '/images/products/haynes-piccolo-a10751-main.jpg',
    readTime: 6,
  },
  {
    id: '8',
    title: 'The Confusing History of the Buffet E11 Clarinet',
    slug: 'buffet-e11-clarinet-history',
    excerpt: 'The Buffet E11 has gone through numerous iterations over the decades, leaving many players confused about what they actually own. We trace the complete evolution of this iconic model.',
    content: `
      <p>Ask somebody about the Buffet E11, and you might get very different responses. That's because the E11 name has been applied to quite different instruments over the years, manufactured in different countries with varying quality standards.</p>
      
      <h3>The Original E11</h3>
      <p>The E11 began as a German-made student clarinet designed to offer an intermediate step between entry-level instruments and Buffet's professional French-made clarinets. It featured solid construction and reasonable playing characteristics.</p>
      
      <h3>Manufacturing Changes</h3>
      <p>Over the years, E11 production has moved between countries, with each transition affecting quality and consistency. Some years saw excellent instruments; others were less distinguished. This creates challenges when evaluating used E11 clarinets.</p>
      
      <h3>The Modern E11</h3>
      <p>Today's E11, and its successor the Premium, are manufactured to modern standards with improved quality control. However, when considering a used E11, we recommend having it evaluated by a knowledgeable technician who can assess both the condition and the specific vintage.</p>
    `,
    date: '2024-11-20',
    author: 'James Kessler',
    categories: ['Clarinets', 'History'],
    image: '/images/products/buffet-r13-main.jpg',
    readTime: 5,
  },
];

// Helper functions
export function formatBlogDate(dateString: string): { day: string; month: string; year: string; full: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    year: date.getFullYear().toString(),
    full: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

export function getBlogPosts(category?: string): BlogPost[] {
  if (!category) return blogPosts;
  return blogPosts.filter(post =>
    post.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase())
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRecentPosts(count: number = 5): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getCategoryPostCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  blogCategories.forEach(cat => {
    counts[cat.slug] = blogPosts.filter(post =>
      post.categories.some(postCat => postCat.toLowerCase().replace(/\s+/g, '-') === cat.slug)
    ).length;
  });
  return counts;
}

export function paginatePosts(
  posts: BlogPost[],
  page: number,
  perPage: number = 6
): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const totalPages = Math.ceil(posts.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (currentPage - 1) * perPage;

  return {
    posts: posts.slice(startIndex, startIndex + perPage),
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
