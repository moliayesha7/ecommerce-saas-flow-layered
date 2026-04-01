import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private itemRepository: Repository<CartItemEntity>,
    private productsService: ProductsService,
  ) {}

  async getOrCreate(tenantId: string, customerId?: string, sessionId?: string): Promise<CartEntity> {
    const where = customerId
      ? { tenantId, customerId }
      : { tenantId, sessionId };

    let cart = await this.cartRepository.findOne({ where });
    if (!cart) {
      cart = this.cartRepository.create({ tenantId, customerId, sessionId });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(tenantId: string, customerId?: string, sessionId?: string) {
    const cart = await this.getOrCreate(tenantId, customerId, sessionId);
    return this.withTotals(cart);
  }

  async addItem(
    tenantId: string,
    data: { productId: string; variantId?: string; quantity: number },
    customerId?: string,
    sessionId?: string,
  ) {
    const cart = await this.getOrCreate(tenantId, customerId, sessionId);
    const product = await this.productsService.findById(data.productId);

    const existing = cart.items?.find(
      (i) => i.productId === data.productId && i.variantId === data.variantId,
    );

    if (existing) {
      existing.quantity += data.quantity;
      await this.itemRepository.save(existing);
    } else {
      const variant = data.variantId
        ? product.variants?.find((v) => v.id === data.variantId)
        : undefined;

      const item = this.itemRepository.create({
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId,
        name: product.name,
        sku: variant?.sku || product.sku,
        quantity: data.quantity,
        unitPrice: variant?.price || product.price,
        image: product.images?.[0]?.url,
      });
      await this.itemRepository.save(item);
    }

    return this.getCart(tenantId, customerId, sessionId);
  }

  async updateItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.itemRepository.delete(cartItemId);
    } else {
      await this.itemRepository.update(cartItemId, { quantity });
    }
  }

  async removeItem(cartItemId: string) {
    await this.itemRepository.delete(cartItemId);
  }

  async clear(tenantId: string, customerId?: string, sessionId?: string) {
    const cart = await this.getOrCreate(tenantId, customerId, sessionId);
    await this.itemRepository.delete({ cartId: cart.id });
    cart.couponCode = undefined;
    cart.discountAmount = 0;
    await this.cartRepository.save(cart);
  }

  private withTotals(cart: CartEntity) {
    const subtotal = (cart.items || []).reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    const discount = Number(cart.discountAmount || 0);
    return { ...cart, subtotal, total: Math.max(0, subtotal - discount) };
  }
}
