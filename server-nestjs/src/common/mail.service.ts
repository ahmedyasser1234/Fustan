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
}
