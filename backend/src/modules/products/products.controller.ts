import { Request, Response } from 'express';
import { productsService } from './products.service';
import { sendSuccess, sendError } from '../../utils/response';

export const productsController = {

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.companyId!;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const lowStockOnly = req.query.lowStockOnly === 'true';

      const result = await productsService.getAll(
        companyId,
        page,
        limit,
        search,
        category,
        lowStockOnly
      );
      sendSuccess(res, result.products, { meta: result.meta });
    } catch {
      sendError(res, 'Failed to fetch products', { statusCode: 500 });
    }
  },

  async getLowStock(req: Request, res: Response): Promise<void> {
    try {
      const products = await productsService.getLowStock(req.companyId!);
      sendSuccess(res, products);
    } catch {
      sendError(res, 'Failed to fetch low stock products', { statusCode: 500 });
    }
  },

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await productsService.getCategories(req.companyId!);
      sendSuccess(res, categories);
    } catch {
      sendError(res, 'Failed to fetch categories', { statusCode: 500 });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.getById(req.companyId!, req.params.id);
      sendSuccess(res, product);
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
        sendError(res, 'Product not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch product', { statusCode: 500 });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.create(req.companyId!, req.body);
      sendSuccess(res, product, { statusCode: 201, message: 'Product created successfully' });
    } catch {
      sendError(res, 'Failed to create product', { statusCode: 500 });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.update(req.companyId!, req.params.id, req.body);
      sendSuccess(res, product, { message: 'Product updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
        sendError(res, 'Product not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to update product', { statusCode: 500 });
    }
  },

  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.updateStock(
        req.companyId!,
        req.params.id,
        req.body
      );
      sendSuccess(res, product, { message: 'Stock updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
        sendError(res, 'Product not found', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
        sendError(res, 'Insufficient stock — cannot subtract more than available', {
          statusCode: 400,
        });
        return;
      }
      if (err instanceof Error && err.message === 'INVALID_STOCK_VALUE') {
        sendError(res, 'Stock value cannot be negative', { statusCode: 400 });
        return;
      }
      sendError(res, 'Failed to update stock', { statusCode: 500 });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await productsService.delete(req.companyId!, req.params.id);
      sendSuccess(res, null, { message: 'Product deleted successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
        sendError(res, 'Product not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to delete product', { statusCode: 500 });
    }
  },
};
