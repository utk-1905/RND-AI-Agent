const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const supabase = require("../config/supabase");

/**
 * Adds a section title to PDF.
 */
const addSectionTitle = (doc, title) => {
  doc.moveDown(1);
  doc.fontSize(15).font("Helvetica-Bold").text(title);
  doc.moveDown(0.4);
};

/**
 * Adds a smaller subsection title.
 */
const addSubTitle = (doc, title) => {
  doc.moveDown(0.6);
  doc.fontSize(12).font("Helvetica-Bold").text(title);
  doc.moveDown(0.2);
};

/**
 * Adds normal paragraph text.
 */
const addParagraph = (doc, text) => {
  doc.fontSize(11).font("Helvetica").text(text || "No data available.", {
    lineGap: 4,
  });
};

/**
 * Adds bullet list to PDF.
 */
const addBulletList = (doc, items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    doc.fontSize(11).font("Helvetica").text("No data available.");
    return;
  }

  items.forEach((item) => {
    doc.fontSize(11).font("Helvetica").text(`• ${item}`, {
      indent: 15,
      lineGap: 3,
    });
  });
};

/**
 * Adds FAQ section.
 */
const addFaqList = (doc, faqs = []) => {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    doc.fontSize(11).font("Helvetica").text("No FAQ available.");
    return;
  }

  faqs.forEach((faq, index) => {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${index + 1}. ${faq.question || "Question not available"}`);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(faq.answer || "Answer not available.", {
        indent: 15,
        lineGap: 3,
      });

    doc.moveDown(0.3);
  });
};

/**
 * Adds SEO Analysis section.
 */
const addSeoAnalysisSection = (doc, output) => {
  const seoAnalysis = output.seo_analysis || null;

  const seoAuditPlan = seoAnalysis?.seo_audit_plan || output.seo_audit_plan;
  const targetKeywords = seoAnalysis?.target_keywords || output.target_keywords;
  const onPage = seoAnalysis?.on_page_suggestions || output.on_page_suggestions;
  const technical =
    seoAnalysis?.technical_seo_suggestions || output.technical_seo_suggestions;
  const contentStrategy = seoAnalysis?.content_strategy || output.content_strategy;
  const aeo = seoAnalysis?.aeo_suggestions || output.aeo_suggestions;
  const geo = seoAnalysis?.geo_suggestions || output.geo_suggestions;
  const llm =
    seoAnalysis?.llm_optimization_suggestions ||
    output.llm_optimization_suggestions;
  const nextSteps = seoAnalysis?.next_steps || output.next_steps;

  addSectionTitle(doc, "SEO Analysis");

  addSubTitle(doc, "SEO Summary");
  addParagraph(doc, seoAnalysis?.seo_summary || output.seo_summary);

  addSubTitle(doc, "SEO Audit Plan");
  addBulletList(doc, seoAuditPlan);

  addSubTitle(doc, "Target Keywords");
  addBulletList(doc, targetKeywords);

  addSubTitle(doc, "On-Page SEO Suggestions");
  addBulletList(doc, onPage);

  addSubTitle(doc, "Technical SEO Suggestions");
  addBulletList(doc, technical);

  addSubTitle(doc, "Content Strategy");
  addBulletList(doc, contentStrategy);

  addSubTitle(doc, "AEO Suggestions");
  addBulletList(doc, aeo);

  addSubTitle(doc, "GEO Suggestions");
  addBulletList(doc, geo);

  addSubTitle(doc, "LLM Optimization Suggestions");
  addBulletList(doc, llm);

  addSubTitle(doc, "Next Steps");
  addBulletList(doc, nextSteps);
};

/**
 * Adds Content Generation section.
 */
const addContentGenerationSection = (doc, contentGeneration) => {
  addSectionTitle(doc, "Content Generation");

  addSubTitle(doc, "Content Summary");
  addParagraph(doc, contentGeneration.content_summary);

  addSubTitle(doc, "Blog Title");
  addParagraph(doc, contentGeneration.blog_title);

  addSubTitle(doc, "Meta Title");
  addParagraph(doc, contentGeneration.meta_title);

  addSubTitle(doc, "Meta Description");
  addParagraph(doc, contentGeneration.meta_description);

  addSubTitle(doc, "Slug");
  addParagraph(doc, contentGeneration.slug);

  addSubTitle(doc, "Content Target Keywords");
  addBulletList(doc, contentGeneration.target_keywords);

  addSubTitle(doc, "Blog Outline");
  addBulletList(doc, contentGeneration.blog_outline);

  addSubTitle(doc, "Full Blog Content");
  addParagraph(doc, contentGeneration.full_blog_content);

  addSubTitle(doc, "FAQ Section");
  addFaqList(doc, contentGeneration.faq_section);

  addSubTitle(doc, "Internal Linking Suggestions");
  addBulletList(doc, contentGeneration.internal_linking_suggestions);

  addSubTitle(doc, "CTA");
  addParagraph(doc, contentGeneration.cta);
};

/**
 * Generate final SEO report PDF for an approved task.
 */
const generateFinalReport = async ({ taskId, generated_by }) => {
  // 1. Find task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Report can only be generated after approval
  if (task.status !== "approved") {
    throw new Error("Task must be approved before generating final report.");
  }

  // 3. Get latest agent output
  const { data: latestOutput, error: outputError } = await supabase
    .from("agent_outputs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (outputError) {
    throw new Error(outputError.message);
  }

  if (!latestOutput) {
    throw new Error("No agent output found for this task.");
  }

  // 4. Get latest approved review
  const { data: latestReview, error: reviewError } = await supabase
    .from("reviews")
    .select("*")
    .eq("task_id", taskId)
    .eq("decision", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  if (!latestReview) {
    throw new Error("No approved review found for this task.");
  }

  // 5. Prepare reports folder
  const reportsDir = path.join(__dirname, "../../reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfFileName = `seo-report-${taskId}.pdf`;
  const pdfFilePath = path.join(reportsDir, pdfFileName);

  const output = latestOutput.output_content || {};
  const taskCategory = output.task_category || "seo_audit";

  const hasSeoAnalysis =
    Boolean(output.seo_analysis) ||
    Boolean(output.seo_audit_plan?.length) ||
    Boolean(output.on_page_suggestions?.length) ||
    Boolean(output.technical_seo_suggestions?.length);

  const hasContentGeneration = Boolean(output.content_generation);

  // 6. Generate PDF
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  const stream = fs.createWriteStream(pdfFilePath);
  doc.pipe(stream);

  doc.fontSize(20).font("Helvetica-Bold").text("RND Technosoft AI Agent Report", {
    align: "center",
  });

  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica").text("SEO Department Final Report", {
    align: "center",
  });

  doc.moveDown(1.5);

  addSectionTitle(doc, "Task Details");
  doc.fontSize(11).font("Helvetica").text(`Task Title: ${task.title}`);
  doc.text(`Priority: ${task.priority}`);
  doc.text(`Task Category: ${taskCategory}`);
  doc.text(`Final Status: finalized`);
  doc.text(`Created By: ${task.created_by || "CEO"}`);
  doc.text(`Generated By: ${generated_by || "CEO"}`);
  doc.text(`Generated At: ${new Date().toLocaleString()}`);

  addSectionTitle(doc, "Task Description");
  addParagraph(doc, task.description);

  /**
   * Important:
   * Only add sections that actually exist.
   */
  if (hasSeoAnalysis) {
    addSeoAnalysisSection(doc, output);
  }

  if (hasContentGeneration) {
    addContentGenerationSection(doc, output.content_generation);
  }

  if (!hasSeoAnalysis && !hasContentGeneration) {
    addSectionTitle(doc, "Agent Output");
    addParagraph(doc, output.seo_summary || "No output content available.");
  }

  addSectionTitle(doc, "CEO Review");
  doc.fontSize(11).font("Helvetica").text(`Decision: ${latestReview.decision}`);
  doc.text(`Feedback: ${latestReview.feedback || "No feedback provided."}`);

  doc.moveDown(2);
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text("Generated by RND Technosoft AI Agent System", {
      align: "center",
    });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  // 7. Save report record
  const reportContent = {
    task,
    latest_output: latestOutput,
    latest_review: latestReview,
  };

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert([
      {
        task_id: taskId,
        report_title: `SEO Final Report - ${task.title}`,
        report_content: reportContent,
        pdf_file_name: pdfFileName,
        pdf_file_path: pdfFilePath,
        status: "generated",
        generated_by: generated_by || "CEO",
      },
    ])
    .select()
    .single();

  if (reportError) {
    throw new Error(reportError.message);
  }

  // 8. Update task status to finalized
  const { data: updatedTask, error: taskUpdateError } = await supabase
    .from("tasks")
    .update({
      status: "finalized",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (taskUpdateError) {
    throw new Error(taskUpdateError.message);
  }

  // 9. Add status log
  const { error: logError } = await supabase.from("task_status_logs").insert([
    {
      task_id: taskId,
      old_status: "approved",
      new_status: "finalized",
      changed_by: generated_by || "CEO",
      note: "Final PDF report generated.",
    },
  ]);

  if (logError) {
    throw new Error(logError.message);
  }

  return {
    task: updatedTask,
    report,
  };
};

/**
 * Get latest report PDF path for download.
 */
const getReportForDownload = async (taskId) => {
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("task_id", taskId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!report) {
    throw new Error("No report found for this task.");
  }

  if (!report.pdf_file_path || !fs.existsSync(report.pdf_file_path)) {
    throw new Error("PDF file not found on server.");
  }

  return report;
};

module.exports = {
  generateFinalReport,
  getReportForDownload,
};