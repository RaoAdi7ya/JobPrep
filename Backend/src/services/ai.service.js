const Groq = require("groq-sdk");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "openai/gpt-oss-120b";

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
    ),

  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The technical question that can be asked in the interview",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this question",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, and what approach to take",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and suggested answers",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question that can be asked in the interview",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this question",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, and what approach to take",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and suggested answers",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap and its impact on the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),

  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .int()
          .min(1)
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe("The main focus of this day in the preparation plan"),
        tasks: z
          .array(z.string())
          .describe("List of tasks to complete on this day"),
      }),
    )
    .describe("A day-wise preparation plan for the candidate to follow"),

  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    console.log("1. Sending request to Groq...");

    const jsonSchema = zodToJsonSchema(interviewReportSchema);

    const prompt = `
Generate a detailed interview report for a candidate with the following details.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

Your responsibilities:

1. Analyze the candidate's resume against the job description.
2. Calculate an honest match score between 0 and 100.
3. Generate relevant technical interview questions.
4. Generate relevant behavioral interview questions.
5. Explain the interviewer's intention behind each question.
6. Provide detailed, practical answers and important points to cover.
7. Identify missing or weak skills and assign severity.
8. Create a practical day-wise preparation plan.

Important:
- Base your evaluation on the supplied information.
- Do not invent qualifications or experience.
- Make questions relevant to the actual job description.
- Provide actionable preparation tasks.
- Return all fields required by the JSON schema.
`;

    const response = await groq.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter and interview preparation specialist. Analyze candidates objectively and generate detailed, accurate interview reports. Always return structured JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "interview_report",
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    const rawText = response.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error("Groq returned an empty response");
    }

    const report = JSON.parse(rawText);

    const validatedReport = interviewReportSchema.parse(report);

    console.log("2. Interview report generated successfully!");

    return validatedReport;
  } catch (error) {
    console.error("Groq Interview Report Error:", error);
    throw error;
  }
}

async function generatePdfFromHtml(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe("Complete HTML content of the ATS-friendly resume"),
  });

  try {
    console.log("1. Generating tailored resume using Groq...");

    const resumeJsonSchema = zodToJsonSchema(resumePdfSchema);

    const prompt = `
Generate a professional, ATS-friendly resume for the candidate.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

Requirements:

1. Tailor the resume to the given job description.
2. Highlight relevant skills, projects, and experience.
3. Use professional, natural, human-sounding language.
4. Do not invent experience, qualifications, or achievements.
5. Keep the resume ideally 1-2 pages long.
6. Use a clean and professional design.
7. Ensure the resume is ATS-friendly and easy to parse.
8. Use semantic HTML elements and simple CSS.
9. Include all relevant candidate information.
10. Return the complete HTML document, including CSS.

The response must contain a single JSON field named "html".
`;

    const response = await groq.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert professional resume writer and HTML designer. Create accurate, ATS-friendly resumes. Always return valid structured JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_html",
          strict: true,
          schema: resumeJsonSchema,
        },
      },
    });

    const rawText = response.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error("Groq returned an empty resume response");
    }

    const jsonContent = resumePdfSchema.parse(JSON.parse(rawText));

    console.log("2. Resume HTML generated successfully!");

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    console.log("3. Resume PDF generated successfully!");

    return pdfBuffer;
  } catch (error) {
    console.error("Groq Resume PDF Error:", error);
    throw error;
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};
