export interface PrintfulProduct {
  id: string;
  name: string;
  type: string;
  image: string;
}

export interface PrintfulMockupRequest {
  product_id: string;
  variant_id: string;
  files: Array<{
    url: string;
    position: string;
  }>;
}

const PRINTFUL_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-api`;

async function callPrintfulAPI(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: unknown) {
  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Printful API error: ${response.status}`);
  }

  return response.json();
}

export class PrintfulAPI {
  static async getCatalogProducts(): Promise<PrintfulProduct[]> {
    try {
      const result = await callPrintfulAPI('/products');
      if (result.result && Array.isArray(result.result)) {
        return result.result.map((item: any) => ({
          id: item.id?.toString(),
          name: item.type_name || item.title || 'Unknown Product',
          type: item.type || 'product',
          image: item.image || '/api/placeholder/300/400',
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching Printful catalog:', error);
      return [];
    }
  }

  static async getProducts(): Promise<PrintfulProduct[]> {
    try {
      const result = await callPrintfulAPI('/store/products');
      if (result.result && Array.isArray(result.result)) {
        return result.result.map((item: any) => ({
          id: item.id?.toString() || item.sync_product?.id?.toString(),
          name: item.name || item.sync_product?.name || 'Unknown Product',
          type: item.sync_product?.type || 'product',
          image: item.thumbnail_url || item.sync_product?.thumbnail_url || '/api/placeholder/300/400',
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching Printful products:', error);
      return [];
    }
  }

  static async getProductDetails(productId: string): Promise<any> {
    try {
      const result = await callPrintfulAPI(`/products/${productId}`);
      return result.result || null;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  }

  static async generateMockup(request: PrintfulMockupRequest): Promise<string[]> {
    try {
      const result = await callPrintfulAPI('/mockup-generator/create-task/71', 'POST', {
        variant_ids: [request.variant_id],
        format: 'jpg',
        files: request.files.map(f => ({
          placement: f.position,
          image_url: f.url,
        })),
      });

      if (result.result?.task_key) {
        const taskKey = result.result.task_key;
        await new Promise(resolve => setTimeout(resolve, 3000));

        const mockupResult = await callPrintfulAPI(`/mockup-generator/task?task_key=${taskKey}`);
        if (mockupResult.result?.mockups) {
          return mockupResult.result.mockups.map((m: any) => m.mockup_url);
        }
      }
      return [];
    } catch (error) {
      console.error('Error generating Printful mockup:', error);
      return [];
    }
  }

  static async createOrder(designId: string, productData: unknown): Promise<{ order_id: string }> {
    try {
      const result = await callPrintfulAPI('/orders', 'POST', {
        external_id: designId,
        items: productData,
      });
      return { order_id: result.result?.id || `PF-${Date.now()}` };
    } catch (error) {
      console.error('Error creating Printful order:', error);
      return { order_id: `PF-${Date.now()}` };
    }
  }

  static async checkOrderStatus(orderId: string): Promise<'pending' | 'fulfilled' | 'cancelled'> {
    try {
      const result = await callPrintfulAPI(`/orders/${orderId}`);
      const status = result.result?.status;
      if (status === 'fulfilled') return 'fulfilled';
      if (status === 'canceled') return 'cancelled';
      return 'pending';
    } catch (error) {
      console.error('Error checking Printful order status:', error);
      return 'pending';
    }
  }
}

export const PRINT_SAFE_ZONES = {
  hoodie: { width: 3600, height: 4200, safeArea: { x: 100, y: 100, width: 3400, height: 4000 } },
  tee: { width: 4500, height: 5400, safeArea: { x: 100, y: 100, width: 4300, height: 5200 } },
  joggers: { width: 3000, height: 3600, safeArea: { x: 100, y: 100, width: 2800, height: 3400 } },
  hat: { width: 1800, height: 1800, safeArea: { x: 100, y: 100, width: 1600, height: 1600 } },
  bag: { width: 3600, height: 3600, safeArea: { x: 100, y: 100, width: 3400, height: 3400 } },
};
