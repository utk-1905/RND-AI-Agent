const { buildSeoPrompt } = require("../prompts/seo.prompt");

/**
 * Detect what type of SEO task the CEO is asking for.
 * This is mock-mode logic. Later Claude can classify this more intelligently.
 */
const detectSeoTaskCategory = (task, revisionFeedback = "") => {
  const text = `
    ${task.title || ""}
    ${task.description || ""}
    ${revisionFeedback || ""}
  `.toLowerCase();

  const contentKeywords = [
    "blog",
    "article",
    "content",
    "caption",
    "copy",
    "write",
    "meta title",
    "meta description",
    "landing page",
    "faq",
    "cta",
    "website copy",
    "service page content",
  ];

  const auditKeywords = [
    "audit",
    "analyze",
    "analysis",
    "technical seo",
    "on-page",
    "keywords",
    "ranking",
    "optimization",
    "geo",
    "aeo",
    "llm",
    "sitemap",
    "robots",
    "speed",
    "broken links",
    "seo plan",
    "improvement plan",
  ];

  const hasContentIntent = contentKeywords.some((keyword) =>
    text.includes(keyword)
  );

  const hasAuditIntent = auditKeywords.some((keyword) => text.includes(keyword));

  if (hasContentIntent && hasAuditIntent) {
    return "mixed";
  }

  if (hasContentIntent) {
    return "content_generation";
  }

  return "seo_audit";
};

const buildSeoAnalysis = (isRevision, revisionFeedback) => {
  return {
    seo_summary: isRevision
      ? `Revised SEO analysis generated based on CEO feedback: ${revisionFeedback}`
      : "The website should be improved through SEO audit, keyword optimization, on-page SEO, technical SEO, content strategy, AEO, GEO, and LLM optimization.",

    seo_audit_plan: [
      "Review current website structure, service pages, metadata, and content quality.",
      "Check technical SEO factors such as speed, mobile responsiveness, sitemap, robots.txt, and broken links.",
      "Analyze keyword targeting for website development, SEO, branding, software, and social media services.",
      "Review local SEO presence for Vapi, Gujarat, and nearby business areas.",
      "Prepare a prioritized SEO improvement checklist.",
    ],

    target_keywords: [
      "IT services in Vapi",
      "website development company in Vapi",
      "SEO services in Gujarat",
      "branding agency in Gujarat",
      "software development company",
      "social media marketing services",
      "local SEO for IT company",
    ],

    on_page_suggestions: [
      "Optimize page titles with primary service and location-based keywords.",
      "Add clear meta descriptions for all important service pages.",
      "Use proper H1, H2, and H3 heading structure.",
      "Add internal links between website, app development, SEO, branding, and social media service pages.",
      "Add service-specific call-to-action sections.",
      "Add FAQ blocks on important service pages.",
    ],

    technical_seo_suggestions: [
      "Improve page loading speed.",
      "Compress images and use modern image formats.",
      "Create and submit sitemap.xml.",
      "Check robots.txt configuration.",
      "Fix broken links and 404 pages.",
      "Make sure the website is mobile responsive.",
      "Add schema markup for organization, services, and FAQs.",
    ],

    content_strategy: [
      "Create blog posts around website development, SEO, branding, and digital marketing.",
      "Add case-study style content for completed client work.",
      "Create FAQ sections for each service page.",
      "Add location-based landing pages for Vapi, Gujarat, and nearby business areas.",
      "Create comparison content such as SEO vs social media marketing and website vs web app.",
    ],

    aeo_suggestions: [
      "Add direct question-answer content for common client queries.",
      "Use FAQ schema on service pages.",
      "Write short answer blocks for voice search and answer engines.",
      "Create pages that answer service pricing, timeline, process, and maintenance questions.",
    ],

    geo_suggestions: [
      "Optimize Google Business Profile.",
      "Add local keywords such as Vapi, Gujarat, Valsad, Daman, Silvassa, and nearby service areas.",
      "Collect client reviews and display them on the website.",
      "Add NAP details: name, address, and phone number consistently.",
      "Create location-specific landing pages for nearby industrial and business areas.",
    ],

    llm_optimization_suggestions: [
      "Write clear service descriptions that AI search engines can understand.",
      "Add structured company information on the website.",
      "Create comparison and explainer pages for services.",
      "Use natural language FAQs that match user search intent.",
      "Add concise summaries at the top of service pages.",
    ],

    next_steps: [
      "Perform full website SEO audit.",
      "Prepare keyword research sheet.",
      "Fix technical SEO issues.",
      "Update service page content.",
      "Create 30-day SEO content plan.",
      "Prepare local SEO optimization checklist.",
    ],
  };
};

const buildContentGeneration = (isRevision, revisionFeedback) => {
  return {
    content_summary: isRevision
      ? `Revised SEO content generated based on CEO feedback: ${revisionFeedback}`
      : "SEO-friendly content has been generated with blog title, meta details, outline, full blog content, FAQs, internal linking suggestions, and CTA.",

    blog_title: "Why Local Businesses in Vapi Need SEO Services to Grow Online",

    meta_title: "Why Vapi Businesses Need SEO Services | RND Technosoft",

    meta_description:
      "Learn why local businesses in Vapi need SEO services to improve visibility, attract leads, build trust, and grow through digital marketing.",

    target_keywords: [
      "SEO services in Vapi",
      "local SEO for businesses",
      "digital marketing in Gujarat",
      "website development and SEO",
      "SEO company for local business",
    ],

    slug: "why-vapi-businesses-need-seo-services",

    blog_outline: [
      "Introduction",
      "Why online visibility matters for local businesses",
      "How SEO helps customers find services",
      "Importance of local SEO and Google Business Profile",
      "How SEO supports website development and branding",
      "Benefits of SEO for lead generation",
      "Conclusion with CTA",
    ],

    full_blog_content:
      "Local businesses in Vapi are no longer competing only through physical presence. Customers now search online before choosing a service provider, visiting a store, or contacting a company. This makes SEO an important growth tool for businesses that want to appear in front of the right audience.\n\nSEO helps a business improve its visibility on search engines by optimizing website content, keywords, page structure, and technical performance. For an IT service company, branding agency, manufacturer, consultant, or local service provider, SEO can help attract people who are already searching for related services.\n\nLocal SEO is especially useful for businesses targeting Vapi, Valsad, Daman, Silvassa, and nearby Gujarat business areas. By optimizing Google Business Profile, adding local keywords, collecting reviews, and keeping business information consistent, companies can improve their chances of appearing in local searches.\n\nSEO also supports website development and branding. A well-designed website becomes more valuable when it is searchable, fast, mobile-friendly, and structured around customer questions. Blog content, FAQ sections, case studies, and service pages help build trust and explain the company’s expertise.\n\nFor businesses that want more leads, SEO creates long-term value. Paid ads stop when the budget ends, but optimized content can continue bringing organic traffic over time. This makes SEO a strong digital foundation for local business growth.\n\nRND Technosoft can help businesses improve their online presence through website development, SEO, branding, software solutions, and digital marketing services.",

    faq_section: [
      {
        question: "Why is SEO important for local businesses?",
        answer:
          "SEO helps local businesses appear in search results when customers look for services online.",
      },
      {
        question: "What is local SEO?",
        answer:
          "Local SEO focuses on improving visibility for location-based searches such as services in Vapi or nearby areas.",
      },
      {
        question: "Does SEO help generate leads?",
        answer:
          "Yes, SEO can attract users who are already searching for relevant products or services.",
      },
      {
        question: "How does content help SEO?",
        answer:
          "Blogs, FAQs, and service pages help answer customer questions and improve keyword visibility.",
      },
    ],

    internal_linking_suggestions: [
      "Link this blog to the SEO services page.",
      "Link to website development services where website optimization is mentioned.",
      "Link to branding services when discussing trust and online presence.",
      "Link to contact or inquiry page through the CTA.",
    ],

    cta:
      "Want your business to be found online? Contact RND Technosoft for SEO, website development, branding, and digital marketing services.",
  };
};

/**
 * SEO Agent
 * Runs in mock mode for now.
 * Later this can call Claude API using the same task + revision feedback input.
 */
const runSeoAgent = async (task, revisionFeedback = null) => {
  const prompt = buildSeoPrompt(task);
  const isRevision = Boolean(revisionFeedback);

  const taskCategory = detectSeoTaskCategory(task, revisionFeedback);

  const shouldIncludeSeoAnalysis =
    taskCategory === "seo_audit" || taskCategory === "mixed";

  const shouldIncludeContentGeneration =
    taskCategory === "content_generation" || taskCategory === "mixed";

  const seoAnalysis = shouldIncludeSeoAnalysis
    ? buildSeoAnalysis(isRevision, revisionFeedback)
    : null;

  const contentGeneration = shouldIncludeContentGeneration
    ? buildContentGeneration(isRevision, revisionFeedback)
    : null;

  const mockOutput = {
    agent_name: "SEO AI Agent",
    mode: process.env.AI_MODE || "mock",
    task_id: task.id,
    task_title: task.title,
    task_category: taskCategory,
    output_version: isRevision ? "revised_draft" : "initial_draft",

    seo_analysis: seoAnalysis,
    content_generation: contentGeneration,

    // Compatibility fields for existing frontend/PDF logic
    seo_summary:
      seoAnalysis?.seo_summary ||
      contentGeneration?.content_summary ||
      "SEO Agent output generated.",

    seo_audit_plan: seoAnalysis?.seo_audit_plan || [],
    target_keywords:
      seoAnalysis?.target_keywords || contentGeneration?.target_keywords || [],
    on_page_suggestions: seoAnalysis?.on_page_suggestions || [],
    technical_seo_suggestions: seoAnalysis?.technical_seo_suggestions || [],
    content_strategy: seoAnalysis?.content_strategy || [],
    aeo_suggestions: seoAnalysis?.aeo_suggestions || [],
    geo_suggestions: seoAnalysis?.geo_suggestions || [],
    llm_optimization_suggestions: seoAnalysis?.llm_optimization_suggestions || [],
    next_steps: seoAnalysis?.next_steps || [],

    revision_notes: isRevision
      ? [
          "CEO feedback was considered while regenerating this output.",
          revisionFeedback,
          `Detected task category: ${taskCategory}`,
        ]
      : [],

    internal_prompt_preview: prompt,
  };

  return mockOutput;
};

module.exports = {
  runSeoAgent,
};