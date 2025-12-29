export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  categories: string[];
  image: string;
  commentCount?: number;
}

export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

// All available blog categories
export const blogCategories = [
  'General',
  'Sax',
  'Woodwinds',
  'Product Reviews',
  'Clarinet',
  'Flute',
  'Trumpet',
  'Brasswinds',
  'Oboe',
  'Orchestral',
] as const;

export type BlogCategoryType = typeof blogCategories[number];

// Mock blog posts data
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Evolution of the Modern Saxophone: From Adolphe Sax to Today',
    slug: 'evolution-of-modern-saxophone',
    excerpt: 'Discover the fascinating journey of the saxophone from its invention in the 1840s to the cutting-edge instruments we play today. Learn how manufacturing techniques and player demands have shaped this iconic instrument.',
    content: `
      <p>The saxophone, invented by Adolphe Sax in the 1840s, has undergone remarkable transformations over nearly two centuries. What started as an attempt to bridge the gap between woodwinds and brass has become one of the most versatile and beloved instruments in music.</p>
      
      <h2>The Early Days</h2>
      <p>Adolphe Sax patented his invention in 1846, creating a family of instruments that combined the projection of brass with the agility of woodwinds. The original designs laid the groundwork for everything that followed.</p>
      
      <h2>The Jazz Revolution</h2>
      <p>The early 20th century saw the saxophone become central to jazz music. Players like Coleman Hawkins and Charlie Parker pushed the instrument to new heights, and manufacturers responded with innovations in key work and acoustics.</p>
      
      <h2>Modern Innovations</h2>
      <p>Today's saxophones benefit from computer-aided design, precision manufacturing, and decades of accumulated knowledge. Brands like Selmer, Yamaha, and Yanagisawa continue to refine their instruments for players of all levels.</p>
    `,
    date: '2024-12-15',
    categories: ['Sax', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Saxophone+Evolution',
    commentCount: 12,
  },
  {
    id: '2',
    title: 'Choosing Your First Professional Clarinet: A Comprehensive Guide',
    slug: 'choosing-first-professional-clarinet',
    excerpt: 'Making the leap from student to professional clarinet is a significant investment. Here\'s everything you need to know about selecting the right instrument for your needs and budget.',
    content: `
      <p>Upgrading to a professional clarinet is one of the most exciting milestones in a clarinetist's journey. This guide will help you navigate the options and make an informed decision.</p>
      
      <h2>Understanding Wood Quality</h2>
      <p>Professional clarinets are typically made from African Blackwood (Grenadilla). The density and age of the wood significantly affect the instrument's tone and response.</p>
      
      <h2>Key Systems</h2>
      <p>Most professional clarinets use the Boehm system, but there are subtle variations between manufacturers. French-style keys tend to be lighter, while German-style keys offer more resistance.</p>
      
      <h2>Top Recommendations</h2>
      <p>The Buffet R13 remains the industry standard, while the Yamaha CSVR and Selmer Recital offer excellent alternatives with their own unique characteristics.</p>
    `,
    date: '2024-12-10',
    categories: ['Clarinet', 'Product Reviews', 'Woodwinds'],
    image: 'https://via.placeholder.com/600x400?text=Professional+Clarinet',
    commentCount: 8,
  },
  {
    id: '3',
    title: 'Essential Warm-Up Routines for Brass Players',
    slug: 'warmup-routines-brass-players',
    excerpt: 'A proper warm-up routine is crucial for brass players of all levels. Learn the exercises that professionals use to prepare for practice and performance.',
    content: `
      <p>Every great brass performance starts with a thorough warm-up. Here's the routine used by professionals around the world.</p>
      
      <h2>Breathing Exercises</h2>
      <p>Start with 5 minutes of deep breathing exercises to engage your diaphragm and prepare your air support system.</p>
      
      <h2>Long Tones</h2>
      <p>Begin in the middle register and slowly expand outward. Focus on tone quality and consistent air flow.</p>
      
      <h2>Lip Slurs</h2>
      <p>Gradual lip slur exercises help build flexibility and endurance. Start slowly and increase speed as you warm up.</p>
    `,
    date: '2024-12-08',
    categories: ['Brasswinds', 'Trumpet', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Brass+Warmup',
    commentCount: 15,
  },
  {
    id: '4',
    title: 'Review: Yamaha YFL-677H Professional Flute',
    slug: 'review-yamaha-yfl-677h-flute',
    excerpt: 'We put the Yamaha YFL-677H through its paces. Find out if this sterling silver flute lives up to Yamaha\'s reputation for excellence.',
    content: `
      <p>The Yamaha YFL-677H represents Yamaha's commitment to creating professional-quality instruments at accessible prices. Let's dive into what makes this flute special.</p>
      
      <h2>Build Quality</h2>
      <p>The sterling silver headjoint and body produce a warm, rich tone with excellent projection. The French-style pointed key arms add elegance and improve balance.</p>
      
      <h2>Playability</h2>
      <p>Response is immediate across all registers. The B foot joint extends the range while maintaining even tone quality throughout.</p>
      
      <h2>Verdict</h2>
      <p>At its price point, the YFL-677H offers exceptional value for advancing students and professionals seeking a reliable secondary instrument.</p>
    `,
    date: '2024-12-05',
    categories: ['Product Reviews', 'Flute', 'Woodwinds'],
    image: 'https://via.placeholder.com/600x400?text=Yamaha+Flute+Review',
    commentCount: 6,
  },
  {
    id: '5',
    title: 'The Art of Saxophone Mouthpiece Selection',
    slug: 'saxophone-mouthpiece-selection',
    excerpt: 'Your mouthpiece is arguably the most important factor in your sound. Learn how to find the perfect match for your playing style and musical goals.',
    content: `
      <p>Finding the right mouthpiece can transform your playing. This guide covers everything from tip openings to facing curves.</p>
      
      <h2>Understanding Tip Openings</h2>
      <p>The tip opening determines how much reed vibration is possible. Larger openings offer more flexibility but require stronger embouchure control.</p>
      
      <h2>Chamber Design</h2>
      <p>Small chambers produce a brighter, more focused sound. Large chambers create a darker, more spread tone ideal for classical playing.</p>
      
      <h2>Material Matters</h2>
      <p>Hard rubber remains the most popular choice, but metal mouthpieces offer unique tonal characteristics preferred by many jazz players.</p>
    `,
    date: '2024-12-01',
    categories: ['Sax', 'Woodwinds', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Saxophone+Mouthpieces',
    commentCount: 22,
  },
  {
    id: '6',
    title: 'Maintaining Your Oboe: Essential Care Tips',
    slug: 'maintaining-your-oboe',
    excerpt: 'Oboes require special attention to stay in peak playing condition. Here are the maintenance practices every oboist should know.',
    content: `
      <p>The oboe is one of the most delicate woodwind instruments. Proper care can extend its life and maintain optimal playing quality.</p>
      
      <h2>Daily Care</h2>
      <p>Swab your oboe after every playing session. Moisture is the enemy of the delicate mechanism and can cause pads to deteriorate.</p>
      
      <h2>Reed Storage</h2>
      <p>Keep reeds in a proper reed case with humidity control. Dry reeds crack, while overly wet reeds become waterlogged and unplayable.</p>
      
      <h2>Professional Maintenance</h2>
      <p>Schedule annual checkups with a qualified repair technician. They can address small issues before they become expensive problems.</p>
    `,
    date: '2024-11-28',
    categories: ['Oboe', 'Woodwinds', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Oboe+Maintenance',
    commentCount: 4,
  },
  {
    id: '7',
    title: 'Bach Stradivarius vs Yamaha Xeno: The Ultimate Trumpet Showdown',
    slug: 'bach-stradivarius-vs-yamaha-xeno',
    excerpt: 'Two legendary trumpet lines go head to head. We compare the iconic Bach Stradivarius with the increasingly popular Yamaha Xeno series.',
    content: `
      <p>The debate between Bach and Yamaha has raged for decades. Let's break down what makes each unique and help you decide.</p>
      
      <h2>The Bach Legacy</h2>
      <p>The Stradivarius has been the professional standard for over 50 years. Its distinctive sound has defined orchestral and solo trumpet playing worldwide.</p>
      
      <h2>Yamaha's Innovation</h2>
      <p>The Xeno series represents Yamaha's commitment to combining traditional craftsmanship with modern manufacturing precision.</p>
      
      <h2>Side by Side</h2>
      <p>In blind tests, many players find the Yamaha more consistent, while the Bach offers that unmistakable "Strad" character that some players consider irreplaceable.</p>
    `,
    date: '2024-11-25',
    categories: ['Trumpet', 'Brasswinds', 'Product Reviews'],
    image: 'https://via.placeholder.com/600x400?text=Trumpet+Comparison',
    commentCount: 31,
  },
  {
    id: '8',
    title: 'Starting Your Child on a Wind Instrument: What Parents Need to Know',
    slug: 'starting-child-wind-instrument',
    excerpt: 'Thinking about getting your child started on a wind instrument? Here\'s practical advice on timing, instrument selection, and supporting their musical journey.',
    content: `
      <p>Starting a child on a wind instrument is an investment in their future. Here's how to set them up for success.</p>
      
      <h2>When to Start</h2>
      <p>Most children can begin flute, clarinet, or trumpet around age 8-9 when their teeth are developed enough. Larger instruments should wait until they have the physical size to handle them.</p>
      
      <h2>Rent vs Buy</h2>
      <p>Renting initially is almost always the smart choice. Children can switch instruments, and you avoid depreciation on a student instrument.</p>
      
      <h2>Practice Support</h2>
      <p>Create a dedicated practice space and establish a routine. Your involvement—even just being present—makes a significant difference.</p>
    `,
    date: '2024-11-20',
    categories: ['General', 'Woodwinds', 'Brasswinds'],
    image: 'https://via.placeholder.com/600x400?text=Kids+Music',
    commentCount: 18,
  },
  {
    id: '9',
    title: 'The Complete Guide to Orchestral Audition Preparation',
    slug: 'orchestral-audition-preparation',
    excerpt: 'Preparing for an orchestral audition requires months of focused work. This comprehensive guide covers everything from repertoire preparation to managing performance anxiety.',
    content: `
      <p>Orchestral auditions are among the most competitive events in the music world. Here's how to give yourself the best chance of success.</p>
      
      <h2>Know Your Excerpts</h2>
      <p>Standard excerpts are fixed, but committees pay attention to nuance. Study recordings by principal players from major orchestras.</p>
      
      <h2>Mock Auditions</h2>
      <p>Simulate audition conditions as often as possible. Play behind a screen, record yourself, and invite critical listeners.</p>
      
      <h2>Mental Preparation</h2>
      <p>Develop a pre-audition routine that puts you in the optimal mental state. Visualization and controlled breathing are essential tools.</p>
    `,
    date: '2024-11-15',
    categories: ['Orchestral', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Orchestra+Audition',
    commentCount: 27,
  },
  {
    id: '10',
    title: 'Understanding Saxophone Neck Variations and Their Impact on Sound',
    slug: 'saxophone-neck-variations',
    excerpt: 'The neck is often overlooked, but it plays a crucial role in your saxophone\'s response and tone. Learn about the different options available.',
    content: `
      <p>A saxophone neck upgrade can transform your instrument. Understanding the options helps you make the right choice.</p>
      
      <h2>Material Choices</h2>
      <p>Brass necks offer warmth, bronze adds complexity, and solid silver provides brilliance. Each material shifts the tonal balance.</p>
      
      <h2>Bore Geometry</h2>
      <p>The internal taper affects response and projection. Some players prefer vintage-style tapers while others favor modern designs.</p>
      
      <h2>Octave Key Placement</h2>
      <p>Subtle differences in octave key pip placement can affect intonation in the upper register. Test thoroughly before committing.</p>
    `,
    date: '2024-11-10',
    categories: ['Sax', 'Woodwinds', 'Product Reviews'],
    image: 'https://via.placeholder.com/600x400?text=Sax+Necks',
    commentCount: 9,
  },
  {
    id: '11',
    title: 'The Renaissance of the Flugelhorn in Modern Music',
    slug: 'flugelhorn-modern-music',
    excerpt: 'Once relegated to brass bands, the flugelhorn has found new life in jazz and contemporary classical music. Explore its unique voice and growing popularity.',
    content: `
      <p>The flugelhorn's mellow, dark sound has captivated a new generation of musicians. Here's why this instrument is experiencing a renaissance.</p>
      
      <h2>Jazz Applications</h2>
      <p>From Chet Baker to Roy Hargrove, jazz trumpeters have long appreciated the flugelhorn's intimate quality. Modern players continue this tradition.</p>
      
      <h2>Classical Crossover</h2>
      <p>Contemporary composers are writing for flugelhorn, attracted by its unique color that sits between trumpet and French horn.</p>
      
      <h2>Choosing an Instrument</h2>
      <p>The Yamaha YFH-631G and Conn Vintage One are popular choices, offering professional quality at different price points.</p>
    `,
    date: '2024-11-05',
    categories: ['Brasswinds', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Flugelhorn',
    commentCount: 7,
  },
  {
    id: '12',
    title: 'Selmer Paris Reference 54: A Modern Legend in the Making',
    slug: 'selmer-paris-reference-54-review',
    excerpt: 'The Reference 54 pays homage to the golden era of saxophone manufacturing while incorporating modern innovations. We take an in-depth look at this remarkable instrument.',
    content: `
      <p>Selmer's Reference series represents the pinnacle of modern saxophone manufacturing. The Reference 54 is the culmination of decades of development.</p>
      
      <h2>Design Philosophy</h2>
      <p>Inspired by the legendary Mark VI saxophones of the 1950s and 60s, the Reference 54 captures that vintage character with modern precision.</p>
      
      <h2>Playability</h2>
      <p>The response is immediate and even across all registers. Altissimo speaks easily, and the low end maintains focus and power.</p>
      
      <h2>Worth the Investment?</h2>
      <p>At over $5,000, the Reference 54 is a significant investment. For serious players, it's an instrument that can last a lifetime.</p>
    `,
    date: '2024-10-30',
    categories: ['Sax', 'Product Reviews', 'Woodwinds'],
    image: 'https://via.placeholder.com/600x400?text=Selmer+Reference+54',
    commentCount: 14,
  },
  {
    id: '13',
    title: 'French vs German Clarinet: Understanding the Differences',
    slug: 'french-vs-german-clarinet',
    excerpt: 'The clarinet world is divided between French and German systems. Learn the key differences and which might be right for you.',
    content: `
      <p>The divide between French (Boehm) and German (Oehler) clarinet systems is one of the longest-standing debates in woodwind history.</p>
      
      <h2>Key System Differences</h2>
      <p>German clarinets use additional keys for improved intonation in certain passages, but require different fingerings that take time to master.</p>
      
      <h2>Tonal Characteristics</h2>
      <p>French clarinets tend toward a brighter, more flexible sound. German instruments offer a darker, more focused tone preferred in Central European orchestras.</p>
      
      <h2>Making Your Choice</h2>
      <p>Your choice often depends on geographic location and musical goals. Most American and French players use Boehm system instruments.</p>
    `,
    date: '2024-10-25',
    categories: ['Clarinet', 'Woodwinds', 'General'],
    image: 'https://via.placeholder.com/600x400?text=Clarinet+Systems',
    commentCount: 11,
  },
  {
    id: '14',
    title: 'Building Endurance for Long Rehearsals and Performances',
    slug: 'building-musical-endurance',
    excerpt: 'Whether you\'re preparing for a marathon opera or a weekend of back-to-back gigs, endurance matters. Here\'s how to build and maintain your stamina.',
    content: `
      <p>Physical and mental endurance separate professional musicians from amateurs. Here's how to develop the stamina you need.</p>
      
      <h2>Physical Conditioning</h2>
      <p>Regular cardiovascular exercise improves breath control and mental focus. Many professionals incorporate swimming or running into their routines.</p>
      
      <h2>Efficient Practice</h2>
      <p>Quality trumps quantity. Focused 45-minute sessions with breaks are more effective than marathon practice sessions.</p>
      
      <h2>Recovery</h2>
      <p>Rest is as important as practice. Adequate sleep, proper nutrition, and strategic breaks prevent overuse injuries and burnout.</p>
    `,
    date: '2024-10-20',
    categories: ['General', 'Orchestral'],
    image: 'https://via.placeholder.com/600x400?text=Music+Endurance',
    commentCount: 16,
  },
  {
    id: '15',
    title: 'The Best Flute Headjoints for Different Playing Styles',
    slug: 'flute-headjoints-playing-styles',
    excerpt: 'A headjoint upgrade can dramatically change your flute\'s character. Explore options for classical, jazz, and contemporary styles.',
    content: `
      <p>The headjoint is the most personal part of your flute. Finding the right one can unlock new dimensions in your playing.</p>
      
      <h2>Classical Choices</h2>
      <p>For orchestral and chamber music, look for headjoints with even response and refined tone. Powell, Brannen, and Lafin are popular choices.</p>
      
      <h2>Jazz and Contemporary</h2>
      <p>Jazz players often prefer headjoints with more edge and projection. Some opt for modified cuts that enhance overtones.</p>
      
      <h2>The Testing Process</h2>
      <p>Never buy a headjoint without extensive testing. Bring familiar repertoire and try multiple headjoints back-to-back.</p>
    `,
    date: '2024-10-15',
    categories: ['Flute', 'Woodwinds', 'Product Reviews'],
    image: 'https://via.placeholder.com/600x400?text=Flute+Headjoints',
    commentCount: 8,
  },
  {
    id: '16',
    title: 'Why Every Serious Player Needs a Practice Mute',
    slug: 'practice-mutes-brass-players',
    excerpt: 'Practice mutes aren\'t just for apartment dwellers. Modern practice mutes preserve playing feel while reducing volume dramatically.',
    content: `
      <p>Today's practice mutes are sophisticated tools that let you practice effectively without disturbing neighbors or family.</p>
      
      <h2>Technology Advances</h2>
      <p>Yamaha's Silent Brass system combines a pickup mute with electronics that restore natural resonance through headphones.</p>
      
      <h2>Acoustic Options</h2>
      <p>Traditional practice mutes from Sshhmute and Best Brass offer excellent volume reduction with good playing resistance.</p>
      
      <h2>Choosing Right</h2>
      <p>Consider your primary use case. Electronics-based systems offer the most natural feel but at higher cost.</p>
    `,
    date: '2024-10-10',
    categories: ['Brasswinds', 'Trumpet', 'Product Reviews'],
    image: 'https://via.placeholder.com/600x400?text=Practice+Mutes',
    commentCount: 5,
  },
];

// Helper function to format date for display
export function formatBlogDate(dateString: string): { day: string; month: string; full: string } {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  return {
    day,
    month,
    full: `${day} ${month} ${date.getFullYear()}`,
  };
}

// Get all blog posts, optionally filtered by category
export function getBlogPosts(category?: string): BlogPost[] {
  if (!category) return blogPosts;
  return blogPosts.filter(post => 
    post.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
  );
}

// Get a single blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

// Get recent posts (for sidebar)
export function getRecentPosts(count: number = 5): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

// Get all categories with their post counts
export function getCategoriesWithCount(): BlogCategory[] {
  const categoryCounts: Record<string, number> = {};
  
  blogPosts.forEach(post => {
    post.categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
  });
  
  return Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Paginate blog posts
export function paginatePosts(
  posts: BlogPost[],
  page: number,
  perPage: number = 9
): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const totalPages = Math.ceil(posts.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * perPage;
  
  return {
    posts: posts.slice(startIndex, startIndex + perPage),
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
