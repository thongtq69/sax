// Verify all reviews are properly imported and displayed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyReviews() {
  console.log('🔍 VERIFYING REVIEWS SYSTEM\n');
  
  // Check reviews
  const totalReviews = await prisma.review.count();
  console.log(`📝 Total Reviews: ${totalReviews}`);
  
  // Check products with reviews
  const productsWithReviews = await prisma.product.findMany({
    where: { reviewCount: { gt: 0 } },
    select: {
      id: true,
      name: true,
      rating: true,
      reviewCount: true,
      reviews: {
        select: { id: true, rating: true },
      },
    },
    orderBy: { reviewCount: 'desc' },
  });
  
  console.log(`\n📦 Products with Reviews: ${productsWithReviews.length}`);
  
  // Verify rating calculations
  let issues = 0;
  for (const product of productsWithReviews) {
    const actualReviewCount = product.reviews.length;
    const actualRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
    
    if (actualReviewCount !== product.reviewCount) {
      console.log(`  ⚠️  ${product.name}: Review count mismatch (DB: ${product.reviewCount}, Actual: ${actualReviewCount})`);
      issues++;
    }
    
    if (Math.abs(actualRating - (product.rating || 0)) > 0.1) {
      console.log(`  ⚠️  ${product.name}: Rating mismatch (DB: ${product.rating?.toFixed(1)}, Actual: ${actualRating.toFixed(1)})`);
      issues++;
    }
  }
  
  if (issues === 0) {
    console.log('  ✅ All ratings and review counts are correct!');
  }
  
  // Check products without reviews
  const productsWithoutReviews = await prisma.product.findMany({
    where: { reviewCount: 0 },
    select: { name: true },
  });
  
  console.log(`\n📦 Products without Reviews: ${productsWithoutReviews.length}`);
  if (productsWithoutReviews.length > 0 && productsWithoutReviews.length <= 10) {
    productsWithoutReviews.forEach(p => {
      console.log(`  - ${p.name}`);
    });
  }
  
  // Rating distribution
  const ratingDist = await prisma.review.groupBy({
    by: ['rating'],
    _count: { id: true },
    orderBy: { rating: 'desc' },
  });
  
  console.log('\n⭐ Rating Distribution:');
  ratingDist.forEach(r => {
    console.log(`  ${r.rating}★: ${r._count.id} reviews`);
  });
  
  // Summary
  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total Reviews: ${totalReviews}`);
  console.log(`   Average Rating: ${avgRating._avg.rating?.toFixed(1) || 'N/A'}★`);
  console.log(`   Products with Reviews: ${productsWithReviews.length}`);
  console.log(`   Products without Reviews: ${productsWithoutReviews.length}`);
  console.log(`   Issues Found: ${issues}`);
  
  if (issues === 0) {
    console.log('\n✅ All reviews are properly imported and calculated!');
  } else {
    console.log(`\n⚠️  Found ${issues} issues that need to be fixed.`);
  }
}

verifyReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

