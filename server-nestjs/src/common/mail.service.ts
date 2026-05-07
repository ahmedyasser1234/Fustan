import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<boolean>('MAIL_SECURE') || false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const from = this.configService.get<string>('MAIL_FROM', '"Fustan" <noreply@fustan.com>');
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      // Don't throw error in dev if mail fails, just log it
      if (this.configService.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  async sendVerificationCode(to: string, code: string) {
    const subject = 'كود التحقق - فستان';
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
        <h2 style="color: #e11d48;">أهلاً بكِ في فستان!</h2>
        <p>كود التحقق الخاص بكِ هو:</p>
        <div style="font-size: 32px; font-weight: bold; color: #e11d48; margin: 20px 0; letter-spacing: 5px;">
          ${code}
        </div>
        <p>يرجى إدخال هذا الكود لتأكيد حسابكِ.</p>
        <p style="font-size: 12px; color: #6b7280;">إذا لم تقومي بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة.</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendPasswordResetCode(to: string, code: string) {
    const subject = 'إعادة تعيين كلمة المرور - فستان';
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
        <h2 style="color: #e11d48;">طلب إعادة تعيين كلمة المرور</h2>
        <p>لقد طلبتِ إعادة تعيين كلمة المرور الخاصة بكِ. كود التحقق هو:</p>
        <div style="font-size: 32px; font-weight: bold; color: #e11d48; margin: 20px 0; letter-spacing: 5px;">
          ${code}
        </div>
        <p>يرجى إدخال هذا الكود لتتمكني من تغيير كلمة المرور.</p>
        <p style="font-size: 12px; color: #6b7280;">إذا لم تطلبي إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendVendorApprovalStatus(to: string, storeName: string, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved ? 'تم قبول متجرك في فستان! 🎉' : 'بخصوص طلب الانضمام كبائع في فستان';
    const title = isApproved ? 'تهانينا! تم قبول متجرك' : 'بخصوص طلبك';
    const color = isApproved ? '#10b981' : '#ef4444';
    const message = isApproved 
      ? `تمت الموافقة على متجرك <b>"${storeName}"</b>. يمكنك الآن البدء في إضافة منتجاتك وبيعها على المنصة.`
      : `نأسف لإبلاغك بأنه لم يتم قبول طلبك لمتجر <b>"${storeName}"</b> في الوقت الحالي. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.`;

    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl; border-top: 5px solid ${color};">
        <h2 style="color: ${color};">${title}</h2>
        <p style="font-size: 16px; color: #374151;">${message}</p>
        ${isApproved ? `
        <div style="margin: 30px 0;">
          <a href="https://fustan.com/vendor/login" 
             style="background-color: ${color}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            الدخول إلى لوحة التحكم
          </a>
        </div>
        ` : ''}
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">شكراً لاهتمامك بالانضمام إلينا.</p>
        <p style="font-weight: bold; color: #e11d48;">فريق فستان</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }
}
