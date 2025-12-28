import { getUncachableStripeClient } from '../server/infrastructure/stripe/stripeClient';

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  priceAmount: number;
  recurring: boolean;
}

const products: ProductConfig[] = [
  {
    name: 'Free Tier',
    description: '50 free API calls per month',
    metadata: { tier: 'free', calls_per_month: '50' },
    priceAmount: 0,
    recurring: true,
  },
  {
    name: 'Unlimited',
    description: 'Unlimited API calls for Abionti Unrestricted API',
    metadata: { tier: 'unlimited', calls_per_month: 'unlimited' },
    priceAmount: 999,
    recurring: true,
  },
];

async function findExistingProduct(stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>, name: string) {
  const existingProducts = await stripe.products.search({
    query: `name:'${name}'`,
  });
  return existingProducts.data[0] || null;
}

async function seedStripeProducts() {
  console.log('Starting Stripe products seed...\n');

  const stripe = await getUncachableStripeClient();

  for (const productConfig of products) {
    console.log(`Processing product: ${productConfig.name}`);

    const existingProduct = await findExistingProduct(stripe, productConfig.name);

    if (existingProduct) {
      console.log(`  Product already exists: ${existingProduct.id}`);
      
      const prices = await stripe.prices.list({
        product: existingProduct.id,
        active: true,
        limit: 1,
      });
      
      if (prices.data[0]) {
        console.log(`  Existing price: ${prices.data[0].id}`);
      }
      console.log('');
      continue;
    }

    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: productConfig.metadata,
    });
    console.log(`  Created product: ${product.id}`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productConfig.priceAmount,
      currency: 'usd',
      recurring: productConfig.recurring ? { interval: 'month' } : undefined,
    });
    console.log(`  Created price: ${price.id}`);
    console.log('');
  }

  console.log('Stripe products seed completed successfully!');
}

seedStripeProducts().catch((error) => {
  console.error('Error seeding Stripe products:', error);
  process.exit(1);
});
