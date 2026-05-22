const { buildSeoPrompt } = require("../prompts/seo.prompt");

/**
 * SEO Agent
 * Runs in mock mode for now.
 * Later this can call Claude API using the same task + revision feedback input.
 */
const runSeoAgent = async (task, revisionFeedback = null) => {
  const prompt = buildSeoPrompt(task);

  const isRevision = Boolean(revisionFeedback);

  const mockOutput = {
    agent_name: "SEO AI Agent",
    mode: process.env.AI_MODE || "mock",
    task_id: task.id,
    task_title: task.title,
    output_version: isRevision ? "revised_draft" : "initial_draft",

    seo_summary: isRevision
      ? `Revised SEO plan generated based on CEO feedback: ${revisionFeedback}`
      : "The website should be improved through keyword optimization, on-page SEO, technical SEO fixes, content planning, AEO, GEO, and LLM-focused optimization.",

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

    revision_notes: isRevision
      ? [
          "CEO feedback was considered while regenerating this output.",
          revisionFeedback,
          "More local SEO, GEO, and business-area targeting suggestions were added.",
        ]
      : [],

    next_steps: [
      "Perform full website SEO audit.",
      "Prepare keyword research sheet.",
      "Fix technical SEO issues.",
      "Update service page content.",
      "Create 30-day SEO content plan.",
      "Prepare local SEO optimization checklist.",
    ],

    internal_prompt_preview: prompt,
  };

  return mockOutput;
};

module.exports = {
  runSeoAgent,
};