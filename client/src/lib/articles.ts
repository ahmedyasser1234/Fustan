export interface Article {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  content: {
    intro: string;
    sections: {
      title: string;
      text?: string;
      list?: string[];
      table?: any;
      steps?: any[];
    }[];
  };
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "how-to-choose-your-wedding-dress",
    category: "دليل الاختيار",
    title: "كيف تختارين فستان زفافك المثالي؟",
    excerpt: "دليلك الشامل لاختيار فستان الزفاف الذي يناسب شكل جسمك وشخصيتعك.",
    readTime: "5 دقائق",
    content: {
      intro: "اختيار فستان الزفاف هو من أهم القرارات التي تتخذها العروس. سنساعدك في هذا الدليل على اتخاذ القرار الصحيح.",
      sections: [
        {
          title: "الخطوة الأولى: تحديد الميزانية",
          text: "قبل البدء في البحث، حددي ميزانيتك بوضوح.",
        },
        {
          title: "أنواع القصات",
          list: ["حورية البحر", "A-Line", "منفوش"]
        }
      ]
    }
  },
  {
    id: "2",
    slug: "types-of-wedding-dress-fabrics",
    category: "الأقمشة",
    title: "تعرفي على أشهر أنواع أقمشة فساتين الزفاف",
    excerpt: "الفرق بين الدانتيل، التول، الساتان، وكيف تختارين الأنسب لكِ.",
    readTime: "4 دقائق",
    content: {
      intro: "يؤثر نوع القماش بشكل كبير على مظهر الفستان وراحتك.",
      sections: [
        {
          title: "الدانتيل",
          text: "يعطي مظهراً كلاسيكياً ورومانسياً."
        }
      ]
    }
  }
];
