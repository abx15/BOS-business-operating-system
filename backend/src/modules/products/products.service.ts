import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import type { CreateProductInput, UpdateProductInput, UpdateStockInput } from './products.schema';
import { emitNotification } from '../../sockets/notification.socket';

// Helper — create low stock notification
async function createLowStockNotification(
  companyId: string,
  productId: string,
  productName: string,
  currentStock: number
): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      companyId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `"${productName}" ka stock sirf ${currentStock} bache hain. Restock karo.`,
      metadata: { productId, currentStock },
    },
  });

  // After notification is created in DB, emit via socket:
  emitNotification(companyId, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata,
  });
}

export const productsService = {

  // Get all products with pagination + search + filter
  async getAll(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
    category?: string,
    lowStockOnly?: boolean
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
      isActive: true,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(category && { category }),
    };

    // If lowStockOnly is true, we need to filter where stockQty <= lowStockThreshold
    // Prisma doesn't directly support comparing two fields in where clause without $where (raw) or computed fields easily in some versions.
    // However, since we want low stock alert, we can filter using lte with a field reference if supported or just filter in memory if small enough, 
    // but the prompt suggests: stockQty: { lte: prisma.product.fields.lowStockThreshold }
    // Let's check if this is supported. Actually, the prompt code says:
    // stockQty: { lte: prisma.product.fields.lowStockThreshold }
    // This is valid in modern Prisma.
    
    if (lowStockOnly) {
       // @ts-ignore - Prisma fields might not be typed correctly in all environments but this is the logic requested
       where.stockQty = { lte: prisma.product.fields.lowStockThreshold };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          stockQty: true,
          lowStockThreshold: true,
          category: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Mark which products are low stock
    const productsWithStatus = products.map((p) => ({
      ...p,
      isLowStock: p.stockQty <= p.lowStockThreshold,
    }));

    return {
      products: productsWithStatus,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get low stock products only
  async getLowStock(companyId: string) {
    // This is a specialized query for low stock
    // Since we can't easily do field comparison in all Prisma setups without raw SQL if it's dynamic,
    // we'll fetch all active products for the company and filter.
    // But for performance, let's try to use the field reference if possible.
    const products = await prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stockQty: true,
        lowStockThreshold: true,
        category: true,
      },
    });

    return products.filter((p) => p.stockQty <= p.lowStockThreshold);
  },

  // Get single product
  async getById(companyId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    return {
      ...product,
      isLowStock: product.stockQty <= product.lowStockThreshold,
    };
  },

  // Create product
  async create(companyId: string, input: CreateProductInput) {
    const product = await prisma.product.create({
      data: {
        companyId,
        name: input.name,
        price: input.price,
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold,
        category: input.category,
        description: input.description,
      },
    });

    // Check if initial stock is already low
    if (product.stockQty <= product.lowStockThreshold) {
      await createLowStockNotification(
        companyId,
        product.id,
        product.name,
        product.stockQty
      );
    }

    logger.info({ companyId, productId: product.id }, 'Product created');
    return {
      ...product,
      isLowStock: product.stockQty <= product.lowStockThreshold,
    };
  },

  // Update product details
  async update(companyId: string, productId: string, input: UpdateProductInput) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.lowStockThreshold !== undefined && { lowStockThreshold: input.lowStockThreshold }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    logger.info({ companyId, productId }, 'Product updated');
    return {
      ...updated,
      isLowStock: updated.stockQty <= updated.lowStockThreshold,
    };
  },

  // Update stock quantity
  async updateStock(companyId: string, productId: string, input: UpdateStockInput) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    let newQty: number;
    if (input.type === 'ADD') {
      newQty = product.stockQty + input.quantity;
    } else if (input.type === 'SUBTRACT') {
      newQty = product.stockQty - input.quantity;
      if (newQty < 0) throw new Error('INSUFFICIENT_STOCK');
    } else {
      // SET
      newQty = input.quantity;
      if (newQty < 0) throw new Error('INVALID_STOCK_VALUE');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stockQty: newQty },
    });

    // Low stock check after update
    if (updated.stockQty <= updated.lowStockThreshold) {
      await createLowStockNotification(
        companyId,
        productId,
        updated.name,
        updated.stockQty
      );
    }

    logger.info(
      { companyId, productId, type: input.type, newQty },
      'Stock updated'
    );
    return {
      ...updated,
      isLowStock: updated.stockQty <= updated.lowStockThreshold,
    };
  },

  // Soft delete product
  async delete(companyId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info({ companyId, productId }, 'Product soft deleted');
  },

  // Get all categories for this company
  async getCategories(companyId: string) {
    const products = await prisma.product.findMany({
      where: { companyId, deletedAt: null, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return products.map((p) => p.category).filter(Boolean);
  },
};
