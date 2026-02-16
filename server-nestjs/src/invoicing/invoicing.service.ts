import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class InvoicingService {
    async generateInvoice(order: any): Promise<string> {
        const invoicesDir = join(process.cwd(), 'uploads', 'invoices');
        if (!existsSync(invoicesDir)) {
            mkdirSync(invoicesDir, { recursive: true });
        }

        const fileName = `invoice-${order.orderNumber}.pdf`;
        const filePath = join(invoicesDir, fileName);
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        return new Promise((resolve, reject) => {
            const stream = createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('FUSTAN STORE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`فاتورة رقم: ${order.orderNumber}`, { align: 'right' });
            doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'right' });
            doc.moveDown();

            // Customer Info
            doc.text(`العميل: ${order.shippingAddress?.name || 'غير معروف'}`, { align: 'right' });
            doc.text(`العنوان: ${order.shippingAddress?.address || ''}`, { align: 'right' });
            doc.moveDown();

            // Table Header
            const tableTop = 250;
            doc.text('المنتج', 400, tableTop);
            doc.text('الكمية', 300, tableTop);
            doc.text('السعر', 200, tableTop);
            doc.text('الإجمالي', 100, tableTop);

            // Items (Mock display for now, should loop through orderItems)
            doc.text('منتج تجريبي', 400, tableTop + 30);
            doc.text('1', 300, tableTop + 30);
            doc.text(`${order.total} ر.س`, 200, tableTop + 30);
            doc.text(`${order.total} ر.س`, 100, tableTop + 30);

            // Total
            doc.moveDown();
            doc.fontSize(16).text(`الإجمالي الكلي: ${order.total} ر.س`, { align: 'left' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}
