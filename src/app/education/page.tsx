"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Educational content data
const CONTRACEPTIVE_METHODS = [
  {
    id: "birth-control-pills",
    name: "Birth Control Pills",
    effectiveness: "91-99%",
    type: "Hormonal",
    description: "Daily oral contraceptives that prevent ovulation through hormone regulation.",
    howItWorks: "Contains synthetic hormones (estrogen and/or progestin) that prevent the ovaries from releasing eggs and thicken cervical mucus to block sperm.",
    pros: [
      "Highly effective when used correctly",
      "Can regulate menstrual cycles",
      "May reduce menstrual cramps and acne",
      "Reversible - fertility returns quickly after stopping"
    ],
    cons: [
      "Must be taken daily at the same time",
      "Possible side effects like nausea, mood changes",
      "No protection against STIs",
      "May increase risk of blood clots in some women"
    ],
    suitableFor: "Women who can remember to take daily medication and don't have contraindications to hormones."
  },
  {
    id: "condoms",
    name: "Condoms",
    effectiveness: "82-98%",
    type: "Barrier",
    description: "Thin sheaths worn over the penis or inserted into the vagina to prevent sperm from reaching the egg.",
    howItWorks: "Creates a physical barrier that prevents sperm from entering the uterus and provides protection against STIs.",
    pros: [
      "Protects against STIs and HIV",
      "No hormonal side effects",
      "Available without prescription",
      "Can be used as needed"
    ],
    cons: [
      "Must be used every time you have sex",
      "Can break or slip off",
      "May reduce sensation for some people",
      "Latex allergies in some individuals"
    ],
    suitableFor: "Anyone who wants STI protection along with pregnancy prevention, especially those with multiple partners."
  },
  {
    id: "iud",
    name: "Intrauterine Device (IUD)",
    effectiveness: "99%+",
    type: "Long-acting",
    description: "Small T-shaped device inserted into the uterus by a healthcare provider.",
    howItWorks: "Hormonal IUDs release progestin to prevent ovulation and thicken cervical mucus. Copper IUDs create an environment toxic to sperm.",
    pros: [
      "Extremely effective",
      "Long-lasting (3-10 years depending on type)",
      "No daily maintenance required",
      "Fertility returns quickly after removal"
    ],
    cons: [
      "Requires medical procedure for insertion/removal",
      "Possible side effects vary by type",
      "No STI protection",
      "Initial cost can be high"
    ],
    suitableFor: "Women seeking long-term, highly effective contraception with minimal maintenance."
  },
  {
    id: "implant",
    name: "Contraceptive Implant",
    effectiveness: "99%+",
    type: "Hormonal",
    description: "Small flexible rod inserted under the skin of the upper arm that releases hormones.",
    howItWorks: "Continuously releases progestin to prevent ovulation and thicken cervical mucus.",
    pros: [
      "Extremely effective",
      "Lasts up to 3 years",
      "No daily maintenance",
      "Can be removed anytime"
    ],
    cons: [
      "Requires minor surgical procedure",
      "May cause irregular bleeding",
      "Possible weight gain or mood changes",
      "No STI protection"
    ],
    suitableFor: "Women who want long-term hormonal contraception without daily pills."
  },
  {
    id: "injection",
    name: "Contraceptive Injection",
    effectiveness: "94-99%",
    type: "Hormonal",
    description: "Hormone injection given every 3 months by a healthcare provider.",
    howItWorks: "Releases progestin to prevent ovulation and thicken cervical mucus.",
    pros: [
      "Highly effective",
      "Only need to remember every 3 months",
      "May reduce menstrual bleeding",
      "Private method"
    ],
    cons: [
      "Requires regular medical visits",
      "May cause irregular bleeding or weight gain",
      "Fertility may take time to return",
      "No STI protection"
    ],
    suitableFor: "Women who prefer not to take daily pills but want effective hormonal contraception."
  }
];

const FAQS = [
  {
    id: "effectiveness",
    question: "How effective are different birth control methods?",
    answer: "Effectiveness varies by method and correct usage. IUDs and implants are over 99% effective, birth control pills are 91-99% effective with perfect use, and condoms are 82-98% effective. The key is consistent and correct use of your chosen method."
  },
  {
    id: "side-effects",
    question: "What are common side effects of hormonal birth control?",
    answer: "Common side effects may include nausea, breast tenderness, mood changes, irregular bleeding, and headaches. Most side effects are mild and often improve after 2-3 months. Serious side effects are rare but can include blood clots, especially in smokers over 35."
  },
  {
    id: "fertility-return",
    question: "How quickly does fertility return after stopping birth control?",
    answer: "For most methods, fertility returns quickly. Pills, patches, and rings: usually within 1-3 months. IUDs and implants: typically within a month of removal. Injections may take 6-12 months for fertility to fully return."
  },
  {
    id: "missed-pill",
    question: "What should I do if I miss a birth control pill?",
    answer: "Take the missed pill as soon as you remember. If you miss one pill, take it immediately and continue as normal. If you miss two or more pills, take the most recent missed pill, use backup contraception for 7 days, and consider emergency contraception if you've had unprotected sex."
  },
  {
    id: "emergency-contraception",
    question: "What is emergency contraception and when should it be used?",
    answer: "Emergency contraception (Plan B, ella, or copper IUD) can prevent pregnancy after unprotected sex or contraceptive failure. It's most effective when used as soon as possible, ideally within 72 hours, but can work up to 5 days after unprotected sex."
  },
  {
    id: "sti-protection",
    question: "Which birth control methods protect against STIs?",
    answer: "Only barrier methods provide STI protection. Male and female condoms are the most effective at preventing STIs, including HIV. Dental dams can be used for oral sex protection. Hormonal methods and IUDs do not protect against STIs."
  }
];

const MYTHS_AND_FACTS = [
  {
    myth: "Birth control pills cause weight gain",
    fact: "Most studies show no significant weight gain from birth control pills. Some women may experience temporary water retention, but this typically resolves within a few months."
  },
  {
    myth: "You need to take a break from the pill",
    fact: "There's no medical need to take breaks from birth control pills. You can safely use them for years as long as you don't have contraindications."
  },
  {
    myth: "IUDs are only for women who have had children",
    fact: "IUDs are safe and effective for women of all ages, including those who haven't had children. Modern IUDs are smaller and easier to insert than older versions."
  },
  {
    myth: "Condoms aren't effective enough",
    fact: "When used correctly and consistently, condoms are highly effective at preventing both pregnancy and STIs. They're 98% effective with perfect use."
  },
  {
    myth: "Birth control causes infertility",
    fact: "Birth control methods do not cause infertility. Fertility typically returns to normal quickly after stopping most contraceptive methods."
  },
  {
    myth: "You can't get pregnant while breastfeeding",
    fact: "While breastfeeding can suppress ovulation, it's not a reliable form of contraception. You can ovulate before your first period returns after childbirth."
  }
];

const FAMILY_PLANNING_ARTICLES = [
  {
    id: "planning-pregnancy",
    title: "Planning for Pregnancy: What You Need to Know",
    summary: "Essential steps to take before trying to conceive, including preconception health, timing, and lifestyle changes.",
    content: `
      Planning for pregnancy is an important step that can help ensure the healthiest possible outcome for both you and your future baby. Here are key considerations:

      **Before Trying to Conceive:**
      • Start taking folic acid supplements (400-800 mcg daily)
      • Schedule a preconception checkup with your healthcare provider
      • Update vaccinations and discuss any medications you're taking
      • Maintain a healthy weight and exercise regularly
      • Quit smoking and limit alcohol consumption

      **Understanding Your Fertility:**
      • Track your menstrual cycle to identify your fertile window
      • Ovulation typically occurs 14 days before your next period
      • Your fertile window is about 6 days: 5 days before ovulation plus the day of ovulation
      • Consider using ovulation predictor kits or tracking basal body temperature

      **Timing Intercourse:**
      • Have regular intercourse throughout your cycle, especially during your fertile window
      • Every other day during the fertile window is usually sufficient
      • Don't stress too much about perfect timing - regular intercourse is key

      **When to Seek Help:**
      • If you're under 35 and haven't conceived after 12 months of trying
      • If you're over 35 and haven't conceived after 6 months of trying
      • If you have irregular periods or known fertility issues
    `
  },
  {
    id: "reproductive-health",
    title: "Understanding Your Reproductive Health",
    summary: "Comprehensive guide to female reproductive anatomy, menstrual cycle, and maintaining reproductive health.",
    content: `
      Understanding your reproductive health is crucial for making informed decisions about contraception, fertility, and overall wellness.

      **Menstrual Cycle Basics:**
      • Average cycle length is 28 days, but 21-35 days is normal
      • Menstruation typically lasts 3-7 days
      • The cycle has four phases: menstrual, follicular, ovulation, and luteal

      **Signs of Healthy Reproductive Function:**
      • Regular menstrual cycles
      • Manageable menstrual symptoms
      • Normal vaginal discharge that changes throughout the cycle
      • No persistent pelvic pain or unusual bleeding

      **Maintaining Reproductive Health:**
      • Regular gynecological checkups and screenings
      • Practice safe sex to prevent STIs
      • Maintain a healthy lifestyle with good nutrition and exercise
      • Manage stress levels
      • Stay up to date with vaccinations (HPV, etc.)

      **When to See a Healthcare Provider:**
      • Irregular or absent periods
      • Severe menstrual pain or heavy bleeding
      • Unusual vaginal discharge or odor
      • Pelvic pain or pressure
      • Pain during intercourse
    `
  },
  {
    id: "contraception-choosing",
    title: "Choosing the Right Contraception for You",
    summary: "Factors to consider when selecting a birth control method, including lifestyle, health, and personal preferences.",
    content: `
      Choosing the right contraception is a personal decision that depends on various factors. Here's how to make the best choice for your situation:

      **Factors to Consider:**
      • Your age and health status
      • Whether you want children in the future
      • How often you have sex
      • Your comfort level with hormones
      • Need for STI protection
      • Cost and insurance coverage

      **Questions to Ask Yourself:**
      • Do I want something I use only when having sex, or continuous protection?
      • Am I comfortable with a method that affects my hormones?
      • Do I need protection against STIs?
      • How important is it that I can stop the method myself?
      • What are my feelings about having periods?

      **Discussing with Your Healthcare Provider:**
      • Be honest about your sexual activity and health history
      • Discuss any medications you're taking
      • Ask about side effects and what to expect
      • Understand how to use your chosen method correctly
      • Know when to seek help or consider switching methods

      **Remember:**
      • No method is perfect for everyone
      • You can change methods if your current one isn't working
      • Using two methods (like pills + condoms) can increase effectiveness
      • The best method is one you'll use consistently and correctly
    `
  }
];

export default function EducationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Filter content based on search term
  const filteredMethods = CONTRACEPTIVE_METHODS.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFAQs = FAQS.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = FAMILY_PLANNING_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Education Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn about family planning, contraceptive methods, and reproductive health with evidence-based information.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search topics, methods, or questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="methods">Contraceptive Methods</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="myths">Myths & Facts</TabsTrigger>
        </TabsList>

        {/* Contraceptive Methods */}
        <TabsContent value="methods" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMethods.map((method) => (
              <Card 
                key={method.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedMethod === method.id ? 'ring-2 ring-pink-500' : ''
                }`}
                onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <Badge variant="secondary">{method.effectiveness}</Badge>
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                  <Badge variant="outline" className="w-fit">{method.type}</Badge>
                </CardHeader>
                
                {selectedMethod === method.id && (
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">How It Works:</h4>
                      <p className="text-sm text-gray-600">{method.howItWorks}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-green-700">Pros:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {method.pros.map((pro, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-red-700">Cons:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {method.cons.map((con, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Best For:</h4>
                      <p className="text-sm text-gray-600">{method.suitableFor}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Articles */}
        <TabsContent value="articles" className="space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>{article.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {article.content.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                      return (
                        <h3 key={index} className="font-semibold text-lg mt-4 mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    
                    if (paragraph.trim().startsWith('•')) {
                      return (
                        <li key={index} className="ml-4 mb-1">
                          {paragraph.replace('•', '').trim()}
                        </li>
                      );
                    }
                    
                    return (
                      <p key={index} className="mb-3 text-gray-700">
                        {paragraph.trim()}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about birth control and reproductive health</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Myths & Facts */}
        <TabsContent value="myths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Myths vs Facts</CardTitle>
              <CardDescription>Debunking common misconceptions about birth control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MYTHS_AND_FACTS.map((item, index) => (
                  <div key={index} className="border-l-4 border-red-200 pl-4">
                    <div className="mb-2">
                      <Badge variant="destructive" className="mb-2">MYTH</Badge>
                      <p className="text-gray-700 font-medium">{item.myth}</p>
                    </div>
                    <div>
                      <Badge variant="default" className="mb-2 bg-green-600">FACT</Badge>
                      <p className="text-gray-600">{item.fact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for personalized medical guidance and before making decisions about your reproductive health.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
