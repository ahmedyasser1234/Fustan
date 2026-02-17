import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

// Request Interceptor: Attach token to headers if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('app_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Capture token from response body
api.interceptors.response.use((response) => {
    if (response.data && response.data.token) {
        console.log('📝 Debug: Token captured from response, saving to localStorage');
        localStorage.setItem('app_token', response.data.token);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

export default api;

export const endpoints = {
    auth: {
        me: () => api.get('/auth/me'),
        logout: () => api.post('/auth/logout'),
        getProfile: () => api.get('/auth/profile').then(res => res.data),
        updateProfile: (data: any) => api.post('/auth/profile', data).then(res => res.data),
    },
    products: {
        list: (params?: any) => api.get('/products', { params }).then(res => res.data),
        create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
        featured: () => api.get('/products/featured').then(res => res.data),
        get: (id: number) => api.get(`/products/${id}`).then(res => res.data),
        update: (id: number, data: FormData) => api.patch(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
        delete: (id: number) => api.delete(`/products/${id}`).then(res => res.data),
        getColors: (productId: number) => api.get(`/products/${productId}/colors`).then(res => res.data),
        addColor: (productId: number, data: any) => api.post(`/products/${productId}/colors`, data).then(res => res.data),
        updateColor: (colorId: number, data: any) => api.patch(`/products/colors/${colorId}`, data).then(res => res.data),
        removeColor: (colorId: number) => api.delete(`/products/colors/${colorId}`).then(res => res.data),
    },
    reviews: {
        product: {
            list: (productId: number) => api.get(`/reviews/product/${productId}`).then(res => res.data),
            create: (data: { productId: number; rating: number; title?: string; comment?: string }) =>
                api.post('/reviews/product', data).then(res => res.data),
        },
        vendor: {
            list: (vendorId: number) => api.get(`/reviews/vendor/${vendorId}`).then(res => res.data),
            create: (data: { vendorId: number; rating: number; comment?: string }) =>
                api.post('/reviews/vendor', data).then(res => res.data),
        },
    },
    categories: {
        list: () => api.get('/categories').then(res => res.data),
        get: (id: number) => api.get(`/categories/${id}`).then(res => res.data),
        create: (data: any) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
        update: (id: number, data: any) => api.patch(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
        delete: (id: number) => api.delete(`/categories/${id}`).then(res => res.data),
    },
    cart: {
        get: () => api.get('/cart').then(res => res.data),
        add: (productId: number, quantity: number, size?: string, color?: string) => api.post('/cart', { productId, quantity, size, color }).then(res => res.data),
        update: (cartItemId: number, quantity: number) => api.post('/cart/update', { cartItemId, quantity }).then(res => res.data),
        remove: (cartItemId: number) => api.delete(`/cart/${cartItemId}`).then(res => res.data),
        clear: () => api.post('/cart/clear').then(res => res.data),
    },
    orders: {
        list: () => api.get('/orders').then(res => res.data),
        get: (id: number) => api.get(`/orders/${id}`).then(res => res.data),
        create: (data: any) => api.post('/orders', data).then(res => res.data),
        updateStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }).then(res => res.data),
    },
    vendors: {
        list: () => api.get('/vendors').then(res => res.data),
        get: (id: string) => api.get(`/vendors/${id}`).then(res => res.data),
        dashboard: () => api.get('/vendors/dashboard').then(res => res.data),
        analytics: () => api.get('/vendors/analytics').then(res => res.data),
        orders: (params?: any) => api.get('/vendors/orders', { params }).then(res => res.data),
        customers: () => api.get('/vendors/customers').then(res => res.data),
        customerDetails: (id: number) => api.get(`/vendors/customers/${id}`).then(res => res.data),
        update: (id: number, data: FormData) => api.patch(`/vendors/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    },
    collections: {
        list: (vendorId?: number, categoryId?: number) => api.get('/collections', { params: { vendorId, categoryId } }).then(res => res.data),
        get: (id: number) => api.get(`/collections/${id}`).then(res => res.data),
        create: (data: any) => api.post('/collections', data).then(res => res.data),
        update: (id: number, data: any) => api.patch(`/collections/${id}`, data).then(res => res.data),
        delete: (id: number) => api.delete(`/collections/${id}`).then(res => res.data),
    },
    offers: {
        list: (vendorId: number) => api.get('/offers', { params: { vendorId } }).then(res => res.data),
        get: (id: number) => api.get(`/offers/${id}`).then(res => res.data),
        create: (data: any) => api.post('/offers', data).then(res => res.data),
        update: (id: number, data: any) => api.patch(`/offers/${id}`, data).then(res => res.data),
        delete: (id: number) => api.delete(`/offers/${id}`).then(res => res.data),
    },
    content: {
        list: (type: string) => api.get('/content', { params: { type } }).then(res => res.data),
        update: (id: number, data: any) => api.patch(`/content/${id}`, data).then(res => res.data),
        setupInstagram: (token: string) => api.post('/content/instagram/setup', { token }).then(res => res.data),
        syncInstagram: () => api.post('/content/instagram/sync').then(res => res.data),
    },
    storeReviews: {
        list: () => api.get('/store-reviews').then(res => res.data),
        create: (data: any) => api.post('/store-reviews', data).then(res => res.data),
    },
    vendorRequests: {
        create: (data: any) => api.post('/vendor-requests', data).then(res => res.data),
    },
    coupons: {
        create: (data: any) => api.post('/coupons', data).then(res => res.data),
        list: (vendorId: number) => api.get('/coupons', { params: { vendorId } }).then(res => res.data),
        validate: (code: string) => api.post('/coupons/validate', { code }).then(res => res.data),
        delete: (id: number) => api.delete(`/coupons/${id}`).then(res => res.data),
        update: (id: number, data: any) => api.patch(`/coupons/${id}`, data).then(res => res.data),
    },
    shipping: {
        list: () => api.get('/shipping').then(res => res.data),
        getByProduct: (productId: number) => api.get(`/shipping/product/${productId}`).then(res => res.data),
        upsert: (productId: number, shippingCost: number) => api.post('/shipping', { productId, shippingCost }).then(res => res.data),
        delete: (productId: number) => api.delete(`/shipping/${productId}`).then(res => res.data),
    },
    notifications: {
        list: () => api.get('/notifications').then(res => res.data),
        getUnreadCount: () => api.get('/notifications/unread-count').then(res => res.data),
        markAsRead: (id: number) => api.patch(`/notifications/${id}/read`).then(res => res.data),
        markAllAsRead: () => api.patch('/notifications/read-all').then(res => res.data),
    },
    chat: {
        conversations: () => api.get('/chat/conversations').then(res => res.data),
        getMessages: (conversationId: number) => api.get(`/chat/messages/${conversationId}`).then(res => res.data),
        sendMessage: (data: { conversationId?: number; content: string; vendorId?: number; userId?: number }) => api.post('/chat/messages', data).then(res => res.data),
        start: (data: { vendorId: number; content: string }) => api.post('/chat/start', data).then(res => res.data),
        unreadCount: () => api.get('/chat/unread-count').then(res => res.data),
        markRead: (id: number) => api.patch(`/chat/conversations/${id}/read`).then(res => res.data),
    },
    admin: {
        getVendors: () => api.get('/admin/vendors').then(res => res.data),
        createVendor: (data: any) => api.post('/admin/vendors', data).then(res => res.data),
        getCustomers: () => api.get('/admin/customers').then(res => res.data),
        getOrders: () => api.get('/admin/orders').then(res => res.data),
        getProducts: (search?: string) => api.get('/admin/products', { params: { search } }).then(res => res.data),
        globalSearch: (q: string) => api.get('/admin/search', { params: { q } }).then(res => res.data),
        updateVendorEmail: (id: number, email: string) => api.patch(`/admin/vendors/${id}/email`, { email }).then(res => res.data),
        deleteVendor: (id: number) => api.delete(`/admin/vendors/${id}`).then(res => res.data),
        updateVendorCommission: (id: number, rate: number) => api.patch(`/admin/vendors/${id}/commission`, { commissionRate: rate }).then(res => res.data),
        vendors: {
            listPending: () => api.get('/vendors/pending').then(res => res.data),
            updateStatus: (id: number, status: string) => api.patch(`/vendors/${id}/status`, { status }).then(res => res.data),
            updateCommission: (id: number, commissionRate: number) => api.patch(`/admin/vendors/${id}/commission`, { commissionRate }).then(res => res.data),
        },
        reports: {
            getCommissions: () => api.get('/admin/reports/commissions').then(res => res.data),
            getAnalytics: () => api.get('/admin/reports/analytics').then(res => res.data),
        }
    },
    ai: {
        analyzeAnalytics: (data: any) => api.post('/ai/analyze-analytics', data).then(res => res.data),
    },
    wishlist: {
        list: () => api.get('/wishlist').then(res => res.data),
        add: (productId: number) => api.post('/wishlist', { productId }).then(res => res.data),
        remove: (productId: number) => api.delete(`/wishlist/${productId}`).then(res => res.data),
        check: (productId: number) => {
            if (!productId || productId <= 0 || isNaN(productId)) {
                return Promise.resolve({ isFavorite: false });
            }
            return api.get(`/wishlist/check/${productId}`).then(res => res.data);
        },
        getSettings: () => api.get('/wishlist/settings').then(res => res.data),
        updateSettings: (isPublic: boolean) => api.post('/wishlist/settings', { isPublic }).then(res => res.data),
        getShared: (token: string) => api.get(`/wishlist/shared/${token}`).then(res => res.data),
    },
    wallets: {
        getMyWallet: () => api.get('/wallets/my-wallet').then(res => res.data),
    },
    points: {
        getMyPoints: () => api.get('/points/my-points').then(res => res.data),
    }
};
