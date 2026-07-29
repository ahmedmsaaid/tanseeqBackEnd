import mongoose from 'mongoose';
import { Faculty } from '../models/faculty.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tanseeq';

const facultiesData = [
  {
    faculty: "كلية الطب البشري",
    university: "جامعة القاهرة",
    city: "القاهرة",
    category: "Medical",
    educationType: "حكومي",
    duration: 5,
    description: "كلية الطب بجامعة القاهرة (قصر العيني) تعد من أقدم وأعرق كليات الطب في الشرق الأوسط وأفريقيا. تقدم تعليم طبي متميز وتضم مستشفيات جامعية ضخمة لتدريب الطلاب.",
    website: "https://kasralainy.edu.eg",
    availableSections: ["science_nature"],
    career_opportunities: [
      "طبيب امتياز بمستشفيات وزارة الصحة والتعليم العالي",
      "العمل في المستشفيات الاستثمارية والخاصة داخل وخارج مصر",
      "متابعة الدراسات العليا والبحث العلمي الطبي"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "science_nature",
        maxScore: 410,
        minimumDegree: 379.0,
        minimumPercent: 92.44
      },
      {
        year: 2025,
        section: "science_nature",
        maxScore: 320,
        minimumDegree: 303.5,
        minimumPercent: 94.84
      }
    ]
  },
  {
    faculty: "كلية الهندسة",
    university: "جامعة عين شمس",
    city: "القاهرة",
    category: "Engineering",
    educationType: "حكومي",
    duration: 5,
    description: "كلية الهندسة بجامعة عين شمس هي إحدى قلاع التعليم الهندسي في مصر، وتقدم برامج متميزة في الهندسة المدنية، الميكانيكية، الكهربائية، العمارة والاتصالات.",
    website: "http://eng.asu.edu.eg",
    availableSections: ["science_math"],
    career_opportunities: [
      "مهندس تصميم أو تنفيذ في شركات المقاولات والإنشاءات",
      "العمل في شركات الاتصالات والشبكات والكهرباء",
      "العمل كمهندس ميكانيكا وصيانة بالمصانع"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "science_math",
        maxScore: 410,
        minimumDegree: 363.0,
        minimumPercent: 88.54
      },
      {
        year: 2025,
        section: "science_math",
        maxScore: 320,
        minimumDegree: 280.0,
        minimumPercent: 87.50
      }
    ]
  },
  {
    faculty: "كلية الحاسبات والذكاء الاصطناعي",
    university: "جامعة القاهرة",
    city: "الجيزة",
    category: "ComputerScience",
    educationType: "حكومي",
    duration: 4,
    description: "تعد كلية الحاسبات والذكاء الاصطناعي بجامعة القاهرة رائدة كليات تكنولوجيا المعلومات في مصر. تقدم تخصصات حديثة مثل علوم الحاسب، نظم المعلومات، والذكاء الاصطناعي.",
    website: "https://fcai.cu.edu.eg",
    availableSections: ["science_math", "science_nature"],
    career_opportunities: [
      "مطور برمجيات وتطبيقات الهواتف والويب",
      "مهندس ذكاء اصطناعي وتعلم آلة",
      "محلل بيانات وأخصائي أمن معلومات"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "science_math",
        maxScore: 410,
        minimumDegree: 357.5,
        minimumPercent: 87.20
      },
      {
        year: 2025,
        section: "science_math",
        maxScore: 320,
        minimumDegree: 275.5,
        minimumPercent: 86.09
      },
      {
        year: 2024,
        section: "science_nature",
        maxScore: 410,
        minimumDegree: 368.5,
        minimumPercent: 89.88
      },
      {
        year: 2025,
        section: "science_nature",
        maxScore: 320,
        minimumDegree: 291.0,
        minimumPercent: 90.94
      }
    ]
  },
  {
    faculty: "كلية التجارة",
    university: "جامعة الإسكندرية",
    city: "الإسكندرية",
    category: "Business",
    educationType: "حكومي",
    duration: 4,
    description: "تقدم كلية التجارة بجامعة الإسكندرية دراسات متخصصة في المحاسبة، إدارة الأعمال، العلوم السياسية، الاقتصاد، ونظم المعلومات الإدارية باللغتين العربية والإنجليزية.",
    website: "https://comm.alexu.edu.eg",
    availableSections: ["science_nature", "science_math", "literary"],
    career_opportunities: [
      "محاسب مالي أو مراجع حسابات في الشركات والبنوك",
      "إخصائي موارد بشرية أو مدير تسويق",
      "محلل مالي ومستشار استثماري"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "literary",
        maxScore: 410,
        minimumDegree: 295.5,
        minimumPercent: 72.07
      },
      {
        year: 2025,
        section: "literary",
        maxScore: 320,
        minimumDegree: 228.0,
        minimumPercent: 71.25
      },
      {
        year: 2024,
        section: "science_math",
        maxScore: 410,
        minimumDegree: 285.0,
        minimumPercent: 69.51
      },
      {
        year: 2025,
        section: "science_math",
        maxScore: 320,
        minimumDegree: 215.0,
        minimumPercent: 67.19
      }
    ]
  },
  {
    faculty: "كلية الآداب",
    university: "جامعة القاهرة",
    city: "الجيزة",
    category: "Humanities",
    educationType: "حكومي",
    duration: 4,
    description: "تعد كلية الآداب بجامعة القاهرة من أقدم الكليات، وتضم أقساماً متميزة مثل اللغة العربية، اللغات الشرقية، اللغة الإنجليزية، التاريخ، الجغرافيا، وعلم النفس.",
    website: "https://arts.cu.edu.eg",
    availableSections: ["literary", "science_nature", "science_math"],
    career_opportunities: [
      "العمل في مجال الترجمة وكتابة المحتوى",
      "العمل كأخصائي اجتماعي أو نفسى بالمدارس والمستشفيات",
      "العمل في الصحافة والإعلام والعلاقات العامة"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "literary",
        maxScore: 410,
        minimumDegree: 280.0,
        minimumPercent: 68.29
      },
      {
        year: 2025,
        section: "literary",
        maxScore: 320,
        minimumDegree: 210.0,
        minimumPercent: 65.63
      }
    ]
  },
  {
    faculty: "كلية العلوم",
    university: "جامعة المنصورة",
    city: "المنصورة",
    category: "Science",
    educationType: "حكومي",
    duration: 4,
    description: "تتميز كلية العلوم بجامعة المنصورة بسمعة علمية مرموقة وتضم تخصصات هامة مثل الكيمياء، الفيزياء، الرياضيات، الجيولوجيا، وعلوم الحيوان والنبات.",
    website: "https://scifac.mans.edu.eg",
    availableSections: ["science_nature", "science_math"],
    career_opportunities: [
      "كيميائي أو أخصائي تحاليل طبية بالمعامل ومصانع الأدوية",
      "العمل في شركات البترول والتعدين ومعالجة المياه",
      "العمل في مراكز البحوث العلمية والتدريس"
    ],
    minimumDegrees: [
      {
        year: 2024,
        section: "science_nature",
        maxScore: 410,
        minimumDegree: 335.0,
        minimumPercent: 81.71
      },
      {
        year: 2025,
        section: "science_nature",
        maxScore: 320,
        minimumDegree: 250.0,
        minimumPercent: 78.13
      }
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Clearing old faculties data...');
    await Faculty.deleteMany({});
    
    console.log('Inserting seed faculties data...');
    await Faculty.insertMany(facultiesData);
    
    console.log('Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
