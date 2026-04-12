#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new Server(
  {
    name: "lich-skills",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const NANO_BANANA_SCRIPT = join(__dirname, "skills/nano-banana/scripts/generate_image.py");
const TAVILY_SEARCH_SCRIPT = join(__dirname, "skills/tavily-search/scripts/search.py");

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "nano-banana",
        description: "Generate or edit images with Google's Nano Banana 2 (`gemini-3.1-flash-image-preview`). Supports 512, 1K, 2K, 4K resolutions.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Image description or edit instruction",
            },
            filename: {
              type: "string",
              description: "Output filename (e.g., image.png)",
            },
            inputImage: {
              type: "string",
              description: "Optional input image for edit mode",
            },
            resolution: {
              type: "string",
              enum: ["512", "1K", "2K", "4K"],
              default: "1K",
              description: "Output resolution",
            },
          },
          required: ["prompt", "filename"],
        },
      },
      {
        name: "tavily-search",
        description: "Web search and content extraction via the Tavily API.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
            extract: {
              type: "string",
              description: "URL to extract content from instead of searching",
            },
            maxResults: {
              type: "number",
              default: 5,
              description: "Number of results (1-20)",
            },
            depth: {
              type: "string",
              enum: ["basic", "advanced"],
              default: "basic",
            },
            topic: {
              type: "string",
              enum: ["general", "news"],
              default: "general",
            },
            days: {
              type: "number",
              description: "Last N days (news only)",
            },
            rawContent: {
              type: "boolean",
              default: false,
              description: "Include full article body",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "nano-banana") {
      const pythonArgs = [
        NANO_BANANA_SCRIPT,
        "--prompt", args.prompt,
        "--filename", args.filename,
        "--resolution", args.resolution || "1K",
      ];
      if (args.inputImage) {
        pythonArgs.push("--input-image", args.inputImage);
      }

      const result = spawnSync("uv", ["run", ...pythonArgs], {
        encoding: "utf-8",
        env: process.env,
      });

      if (result.status !== 0) {
        return {
          content: [{ type: "text", text: `Error: ${result.stderr}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: result.stdout }],
      };
    }

    if (name === "tavily-search") {
      const pythonArgs = [TAVILY_SEARCH_SCRIPT];
      
      if (args.extract) {
        pythonArgs.push("--extract", args.extract);
      } else if (args.query) {
        pythonArgs.push(args.query);
      } else {
        throw new Error("Provide query or extract URL");
      }

      if (args.maxResults) pythonArgs.push("--max-results", String(args.maxResults));
      if (args.depth) pythonArgs.push("--depth", args.depth);
      if (args.topic) pythonArgs.push("--topic", args.topic);
      if (args.days) pythonArgs.push("--days", String(args.days));
      if (args.rawContent) pythonArgs.push("--raw-content");
      
      const result = spawnSync("uv", ["run", ...pythonArgs], {
        encoding: "utf-8",
        env: process.env,
      });

      if (result.status !== 0) {
        return {
          content: [{ type: "text", text: `Error: ${result.stderr}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: result.stdout }],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
