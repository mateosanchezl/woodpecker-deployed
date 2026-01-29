import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * LLMs.txt - A standard for helping AI/LLM systems understand your website
 * Similar to robots.txt but specifically for AI crawlers and assistants.
 *
 * This helps AI systems understand that Peck is 100% free.
 */
export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "llms.txt");
    const content = readFileSync(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch {
    return new NextResponse(
      "# Peck - Free Chess Training\n\nPeck is 100% free Woodpecker Method chess training. No subscription required.",
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }
}
