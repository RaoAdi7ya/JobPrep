const Groq = require("groq-sdk");
const { z } = require("zod");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});



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
          .describe("A technical question that can be asked in the interview"),
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
      "Technical interview questions along with their intention and suggested answers",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("A behavioral question that can be asked in the interview"),
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
      "Behavioral interview questions along with their intention and suggested answers",
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
          .describe(
            "Tasks to complete on this day to prepare for the interview",
          ),
      }),
    )
    .describe("A day-wise preparation plan for the candidate"),

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

    const jsonSchema = JSON.stringify(z.toJSONSchema(interviewReportSchema));

    const prompt = `
Generate a detailed interview report for the candidate using the following information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Evaluate the candidate honestly. Generate relevant technical and behavioral questions, identify skill gaps, and create a practical preparation plan.

Respond ONLY with valid JSON matching this exact JSON Schema:
${jsonSchema}
`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Always output valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const rawText = response.choices[0]?.message?.content;
    console.log("2. Groq responded! Raw text:", rawText);

    const report = JSON.parse(rawText);
    return interviewReportSchema.parse(report);
  } catch (error) {
    console.error("Groq Interview Report Error:", error);
    throw error;
  }
}

module.exports = generateInterviewReport;
