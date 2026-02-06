
import { GoogleGenAI } from "@google/genai";
import { Scene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COPILOT_SYSTEM_INSTRUCTION = `
你是「Jacky GitHub Copilot Prompt 編譯器」。

你的目標：生成一段「極其精確、技術細節豐富、且具備高品質視覺規範」的開發指令，讓 GitHub Copilot Chat 能直接引導使用者從零開始完成高品質專案。

### 生成 Prompt 的核心原則：
1. **指令化 (Command-Driven)**：提供明確的執行指令（如 uv init, npm install...）。
2. **結構化 (High-Fidelity Structure)**：強制要求 Copilot 依照指定的目錄結構命名檔案。
3. **視覺品質 (Visual Excellence)**：對 UI 實作要求「高質感」，包含動畫 (GSAP/CSS Keyframes)、玻璃擬態 (Backdrop-blur)、與霓虹漸層，嚴禁使用瀏覽器預設樣式。
4. **魯棒性 (Robustness)**：要求 API 包含詳細的錯誤處理 (Try-Catch) 與狀態回報 (Toast)。

### 輸出指令時必須包含的區塊：

#### 🚀 第一階段：環境配置與初始化
- 詳細列出 Windows/Mac 相容的指令。
- 強制使用 \`uv\` 管理 Python 依賴。
- 初始化 \`package.json\` 並配置 Express 伺服器。

#### 📂 第二階段：定義精確檔案結構
- 條列出所有要產生的檔案路徑，例如：\`backend/app/main.py\`, \`frontend/public/js/api.js\` 等。

#### ⚙️ 第三階段：後端 API 實作規範
- 包含 Pydantic 驗證模型。
- 強制 SQLite 連線設定與 \`Base.metadata.create_all\`。
- 具備基本的 CORS 中間件設定，允許 localhost:3000 存取。

#### 🎨 第四階段：前端視覺開發 (重量級要求)
- 背景：使用深色/亮色高品質漸層。
- 互動：每一個按鈕必須有 Hover 效果，卡片必須有進場動畫。
- 狀態：實作 Loading Spinner 與全域 Toast 通知。

#### 🏗️ 第五階段：前後端聯調與啟動
- 提供 \`start_all.bat\` 與 \`start_all.sh\` 的程式碼。

### 語氣：
對 Copilot 說話要像一位「資深技術架構師」，下達極其明確的開發指令，不要給出模稜兩可的建議。
全程使用**繁體中文**。
`;

function buildCopilotPrompt(scenes: Scene[], techStack: string, projectType: string): string {
    const storyboardContent = scenes.map((scene, index) => `
    場景 ${index + 1}: ${scene.title || '未命名'}
    - 目標: ${scene.objective || '未指定'}
    - 畫面: ${scene.layout || '未指定'}
    - 互動: ${scene.interactions || '未指定'}
    - 參考資料: ${scene.references || '無'}
  `).join('\n');

    return `
    ${COPILOT_SYSTEM_INSTRUCTION}

    ---
    **專案資訊：**
    專案類型：${projectType}
    場景需求：
    ${storyboardContent}

    請輸出適合 GitHub Copilot 的開發指令。
  `;
}

export const generateCopilotSpec = async (scenes: Scene[], techStack: string = 'Auto', projectType: string = 'Fullstack'): Promise<string> => {
    try {
        const prompt = buildCopilotPrompt(scenes, techStack, projectType);
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating Copilot spec:", error);
        if (error instanceof Error) {
            return `生成 Copilot Prompts 時發生錯誤：${error.message}`;
        }
        return "生成 Copilot Prompts 時發生未知錯誤。";
    }
};
