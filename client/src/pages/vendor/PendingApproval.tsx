
import React from 'react';
import { Link } from 'wouter';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const PendingApproval = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'الحساب قيد المراجعة' : 'Account Under Review'}
          </h2>

          <p className="text-gray-600 mb-6">
            {isRTL
              ? 'شكراً لتسجيلك كبائع في فستان. حسابك حالياً قيد المراجعة من قبل الإدارة. سيتم إشعارك عبر البريد الإلكتروني فور تفعيل الحساب.'
              : 'Thank you for registering as a vendor on Fustan. Your account is currently under review by the administration. You will be notified via email once your account is activated.'}
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 text-start">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              {isRTL ? 'ماذا يحدث الآن؟' : 'What happens now?'}
            </h3>
            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
              <li>{isRTL ? 'يقوم فريقنا بمراجعة تفاصيل متجرك' : 'Our team reviews your store details'}</li>
              <li>{isRTL ? 'يتم التحقق من الوثائق والمعلومات' : 'Documents and information are verified'}</li>
              <li>{isRTL ? 'تستغرق العملية عادة 24-48 ساعة' : 'Process usually takes 24-48 hours'}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              {isRTL ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
