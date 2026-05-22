const { buildSeoPrompt } = require("../prompts/seo.prompt");

/**
 * SEO Agent
 * For now this runs in mock mode.
 * Later this file can call Claude API using the same task input.
 */
const runSeoAgent = async (task) => {
  const prompt = buildSeoPrompt(task);

  const mockOutput = {
    agent_name: "SEO AI Agent",
    mode: process.env.AI_MODE || "mock",
    task_id: task.id,
    task_title: task.title,

    seo_summary:
      "The website should be improved through keyword optimization, on-page SEO, technical SEO fixes, content planning, AEO, GEO, and LLM-focused optimization.",

    target_keywords: [
      "IT services in Vapi",
      "website development company",
      "SEO services",
      "branding agency",
      "software development company",
      "social media marketing services",
    ],

    on_page_suggestions: [
      "Optimize page titles with primary service keywords.",
      "Add clear meta descriptions for all important service pages.",
      "Use proper H1, H2, and H3 heading structure.",
      "Add internal links between website, app development, SEO, branding, and social media service pages.",
      "Add service-specific call-to-action sections.",
    ],

    technical_seo_suggestions: [
      "Improve page loading speed.",
      "Compress images and use modern image formats.",
      "Create and submit sitemap.xml.",
      "Check robots.txt configuration.",
      "Fix broken links and 404 pages.",
      "Make sure the website is mobile responsive.",
    ],

    content_strategy: [
      "Create blog posts around website development, SEO, branding, and digital marketing.",
      "Add case-study style content for completed client work.",
      "Create FAQ sections for each service page.",
      "Add location-based landing pages for target business areas.",
    ],

    aeo_suggestions: [
      "Add direct question-answer content for common client queries.",
      "Use FAQ schema on service pages.",
      "Write short answer blocks for voice search and answer engines.",
    ],

    geo_suggestions: [
      "Optimize Google Business Profile.",
      "Add local keywords such as Vapi, Gujarat, and nearby service areas.",
      "Collect client reviews and display them on the website.",
      "Add NAP details: name, address, and phone number consistently.",
    ],

    llm_optimization_suggestions: [
      "Write clear service descriptions that AI search engines can understand.",
      "Add structured company information on the website.",
      "Create comparison and explainer pages for services.",
      "Use natural language FAQs that match user search intent.",
    ],

    next_steps: [
      "Perform full website SEO audit.",
      "Prepare keyword research sheet.",
      "Fix technical SEO issues.",
      "Update service page content.",
      "Create 30-day SEO content plan.",
    ],

    internal_prompt_preview: prompt,
  };

  return mockOutput;
};

module.exports = {
  runSeoAgent,
};