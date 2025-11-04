import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  // Optional headers for rankings
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "",
    "X-Title": process.env.SITE_TITLE || "Chat with Partner",
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "服务未配置：缺少 OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const { background, intimacy, tone } = await req.json();
    if (!background || typeof background !== "string") {
      return NextResponse.json({ error: "缺少背景描述" }, { status: 400 });
    }
    const intimacyNum = Number(intimacy);
    if (!intimacyNum || intimacyNum < 1 || intimacyNum > 10) {
      return NextResponse.json({ error: "亲密度需为1-10" }, { status: 400 });
    }
    const toneStr = String(tone || "理性");

    const system = `你是两性沟通与冲突化解专家与金句写手。请在心里归纳2个可能的矛盾点（不显式展示推理），并在心里使用以下“十个对话分析清问题”作为检查清单（不要显式列出）：\n1) 事实与解读的区别？ 2) 我的核心期待是什么？ 3) 哪个边界被触碰？ 4) 对方可能的动机/难处？ 5) 我可调整的部分？ 6) 如何表达感受而不指责？ 7) 期望对方的具体行动？ 8) 时间与优先级如何协调？ 9) 不满足时的备选方案？ 10) 如何收尾与复盘避免复发？\n基于用户背景生成 EXACTLY 3 条适用于与恋人/暧昧对象的高能回应：\n- 每条≤120字；就事论事，明确边界与期待，给出可执行推进。\n- 语气依据“亲密度(1-10)”与“语气”决定力度；可尖锐但不辱骂。\n- 禁止人身攻击、隐私泄露、违法内容。\n- 输出格式：Markdown，编号1-3。\n- 第3条如有必要，附一个“台阶”版本（更温和），用括号或换行标示。`;

    const user = `背景：${background}\n亲密度：${intimacyNum}\n语气：${toneStr}\n请生成三条中文回应。`;

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content || "";
    return NextResponse.json({ markdown: content });
  } catch (e: any) {
    console.error("/api/generate error", e);
    return NextResponse.json(
      { error: e?.message || "生成失败" },
      { status: 500 }
    );
  }
}