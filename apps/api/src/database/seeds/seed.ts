import 'reflect-metadata';
import AppDataSource from '../data-source';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding database...\n');

  const userRepo = AppDataSource.getRepository('users');
  const tenantRepo = AppDataSource.getRepository('tenants');
  const settingsRepo = AppDataSource.getRepository('tenant_settings');
  const planRepo = AppDataSource.getRepository('subscription_plans');
  const subRepo = AppDataSource.getRepository('tenant_subscriptions');
  const categoryRepo = AppDataSource.getRepository('categories');
  const productRepo = AppDataSource.getRepository('products');
  const inventoryRepo = AppDataSource.getRepository('inventory');

  // ── 1. Super Admin ──────────────────────────────────────────────────────────
  console.log('Creating super admin...');
  const adminHash = await bcrypt.hash('Admin@123456', 12);
  let admin = await userRepo.findOne({ where: { email: 'admin@saas-commerce.com' } });
  if (!admin) {
    admin = await userRepo.save(userRepo.create({
      firstName: 'Super', lastName: 'Admin',
      email: 'admin@saas-commerce.com',
      passwordHash: adminHash,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
    }));
  }

  // ── 2. Subscription Plans ──────────────────────────────────────────────────
  console.log('Creating subscription plans...');
  const plans = [
    { name: 'Starter', slug: 'starter', price: 500, interval: 'monthly', trialDays: 14, maxProducts: 50, maxStaff: 2, features: ['50 Products', '2 Staff', 'Basic Reports', 'Email Support'], isPopular: false, sortOrder: 1 },
    { name: 'Professional', slug: 'professional', price: 1500, interval: 'monthly', trialDays: 14, maxProducts: 500, maxStaff: 10, features: ['500 Products', '10 Staff', 'Advanced Reports', 'Priority Support', 'Custom Domain'], isPopular: true, sortOrder: 2 },
    { name: 'Enterprise', slug: 'enterprise', price: 5000, interval: 'monthly', trialDays: 14, maxProducts: null, maxStaff: null, features: ['Unlimited Products', 'Unlimited Staff', 'Full Analytics', '24/7 Support', 'Custom Domain', 'API Access'], isPopular: false, sortOrder: 3 },
  ];

  const savedPlans: Record<string, unknown>[] = [];
  for (const plan of plans) {
    let existing = await planRepo.findOne({ where: { slug: plan.slug } });
    if (!existing) existing = await planRepo.save(planRepo.create(plan));
    savedPlans.push(existing as Record<string, unknown>);
  }

  // ── 3. Demo Tenants ────────────────────────────────────────────────────────
  console.log('Creating demo tenants...');
  const tenantData = [
    { name: 'Fashion Hub', slug: 'fashion-hub', email: 'owner@fashionhub.com', phone: '+8801700000001' },
    { name: 'Tech Gadgets', slug: 'tech-gadgets', email: 'owner@techgadgets.com', phone: '+8801700000002' },
    { name: 'Home Essentials', slug: 'home-essentials', email: 'owner@homeessentials.com', phone: '+8801700000003' },
  ];

  const tenantOwnerHash = await bcrypt.hash('Owner@123456', 12);

  for (let i = 0; i < tenantData.length; i++) {
    const td = tenantData[i];

    let owner = await userRepo.findOne({ where: { email: td.email } });
    if (!owner) {
      const [firstName, ...rest] = td.name.split(' ');
      owner = await userRepo.save(userRepo.create({
        firstName, lastName: rest.join(' ') || 'Owner',
        email: td.email,
        passwordHash: tenantOwnerHash,
        role: 'tenant_owner',
        phone: td.phone,
        isActive: true,
        isEmailVerified: true,
      }));
    }

    let tenant = await tenantRepo.findOne({ where: { slug: td.slug } });
    if (!tenant) {
      tenant = await tenantRepo.save(tenantRepo.create({
        ...td, ownerId: (owner as { id: string }).id, status: 'active', approvedAt: new Date(),
      }));
      await settingsRepo.save(settingsRepo.create({ tenantId: (tenant as { id: string }).id }));
      await userRepo.update((owner as { id: string }).id, { tenantId: (tenant as { id: string }).id });
    }

    // Create subscription
    const existingSub = await subRepo.findOne({ where: { tenantId: (tenant as { id: string }).id } });
    if (!existingSub) {
      const plan = savedPlans[i % savedPlans.length] as { id: string; price: number; currency: string };
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 86400000);
      await subRepo.save(subRepo.create({
        tenantId: (tenant as { id: string }).id,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        amount: plan.price,
        currency: plan.currency || 'BDT',
      }));
    }
  }

  // ── 4. Global Categories ──────────────────────────────────────────────────
  console.log('Creating categories...');
  const globalCats = ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports', 'Beauty', 'Food', 'Toys', 'Automotive', 'Health'];
  for (let i = 0; i < globalCats.length; i++) {
    const name = globalCats[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await categoryRepo.findOne({ where: { slug, tenantId: null } });
    if (!existing) {
      await categoryRepo.save(categoryRepo.create({ name, slug, tenantId: null, sortOrder: i }));
    }
  }

  // ── 5. Sample Products ─────────────────────────────────────────────────────
  console.log('Creating sample products...');
  const tenants = await tenantRepo.find();
  const categories = await categoryRepo.find();

  const sampleProducts = [
    { name: 'Wireless Headphones Pro', price: 2500, sku: 'WHP-001' },
    { name: 'Smart Watch Series 5', price: 8500, sku: 'SWS-001' },
    { name: 'Cotton T-Shirt Classic', price: 450, sku: 'CTS-001' },
    { name: 'Denim Jacket Premium', price: 2200, sku: 'DJP-001' },
    { name: 'Running Shoes Pro', price: 3500, sku: 'RSP-001' },
    { name: 'Office Chair Ergonomic', price: 12000, sku: 'OCE-001' },
    { name: 'LED Desk Lamp Smart', price: 1800, sku: 'LDS-001' },
    { name: 'Backpack Travel 40L', price: 2800, sku: 'BPT-001' },
    { name: 'Yoga Mat Premium', price: 900, sku: 'YMP-001' },
    { name: 'Coffee Maker Drip', price: 4500, sku: 'CMD-001' },
  ];

  for (const tenant of tenants) {
    const tenantId = (tenant as { id: string }).id;
    for (let i = 0; i < sampleProducts.length; i++) {
      const p = sampleProducts[i];
      const slug = `${p.sku.toLowerCase()}-${tenantId.slice(0, 8)}`;
      const existing = await productRepo.findOne({ where: { tenantId, slug } });
      if (!existing) {
        const cat = categories[i % categories.length];
        const product = await productRepo.save(productRepo.create({
          tenantId,
          name: p.name,
          slug,
          sku: `${p.sku}-${tenantId.slice(0, 4).toUpperCase()}`,
          price: p.price,
          compareAtPrice: Math.round(p.price * 1.2),
          status: 'active',
          categoryId: (cat as { id: string }).id,
          description: `High quality ${p.name.toLowerCase()} for everyday use.`,
          trackInventory: true,
        }));

        // Create inventory
        await inventoryRepo.save(inventoryRepo.create({
          tenantId,
          productId: (product as { id: string }).id,
          quantity: Math.floor(Math.random() * 100) + 10,
          lowStockThreshold: 5,
        }));
      }
    }
  }

  console.log('\n✅ Seeding complete!\n');
  console.log('Admin credentials:');
  console.log('  Email: admin@saas-commerce.com');
  console.log('  Password: Admin@123456\n');
  console.log('Tenant owner credentials:');
  console.log('  Email: owner@fashionhub.com | owner@techgadgets.com | owner@homeessentials.com');
  console.log('  Password: Owner@123456\n');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
