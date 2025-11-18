#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";
// Creta_easy.exe 고정 경로
const CRETA_EASY_EXE_PATH = "C:\\SQISOFT\\Creta\\Creta_easy.exe";
// Creta_easy.exe 실행 Tool 정의
const LAUNCH_CRETA_TOOL = {
    name: "launch_creta_easy",
    description: `Creta_easy.exe를 실행하여 지정된 파일 또는 텍스트를 전송합니다.
    
중요: 이 도구를 사용하기 전에:
1. 사용자가 파일을 전송하려는지 텍스트를 전송하려는지 확인하세요.
   
   A) 파일 전송인 경우:
      - 파일의 전체 경로를 물어보세요.
        예시: "파일의 전체 경로를 알려주세요. 예: C:\\Users\\사용자명\\Downloads\\파일명.jpg"
      - file_path 매개변수에 전달하세요.
   
   B) 텍스트 전송인 경우:
      - 전송할 텍스트를 물어보세요.
        예시: "전송하실 텍스트 내용을 알려주세요."
      - text 매개변수에 전달하세요.
      - 배경 이미지가 필요한지 물어보세요.
        예시: "배경 이미지를 함께 전송하시겠습니까? (파일 경로)"
      - 배경 이미지가 있으면 bg_image 매개변수에 전달하세요.

2. 그 다음 사용자에게 디바이스명을 지정할지 물어보세요.
   예시: "전송할 디바이스명을 지정하시겠습니까? (예: device1 device2)"
   - 사용자가 디바이스명을 제공하면 devices 매개변수에 배열로 전달하세요.
   - 사용자가 필요없다고 하거나 아무 말이 없으면 devices 매개변수를 비워두세요.

주의사항:
- file_path와 text 중 하나만 제공해야 합니다.
- bg_image는 text와 함께만 사용 가능합니다 (file_path와는 사용 불가).

이 도구는 자동으로 --autosend 옵션을 추가하여 자동으로 전송되도록 합니다.`,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Creta_easy.exe로 전송할 파일의 전체 Windows 경로. 예: C:\\Users\\username\\Downloads\\image.jpg (text와 동시 사용 불가)",
            },
            text: {
                type: "string",
                description: "전송할 텍스트 메시지. 예: \"안녕하세요\" (file_path와 동시 사용 불가)",
            },
            bg_image: {
                type: "string",
                description: "텍스트와 함께 전송할 배경 이미지 파일 경로 (text와 함께만 사용 가능). 예: C:\\Users\\username\\Pictures\\background.jpg",
            },
            devices: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "전송할 대상 디바이스명 목록 (선택사항). 예: [\"device1\", \"device2\", \"device3\"]",
            },
        },
        required: [],
    },
};
// MCP 서버 생성
const server = new Server({
    name: "creta-easy-mcp",
    version: "1.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Tools 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [LAUNCH_CRETA_TOOL],
    };
});
// Tool 호출 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // 파일 또는 텍스트 전송
    if (request.params.name === "launch_creta_easy") {
        const filePath = request.params.arguments?.file_path;
        const text = request.params.arguments?.text;
        const bgImage = request.params.arguments?.bg_image;
        const devices = request.params.arguments?.devices;
        // file_path와 text 중 하나만 제공되어야 함
        if (!filePath && !text) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: file_path 또는 text 매개변수 중 하나가 필요합니다.",
                    },
                ],
                isError: true,
            };
        }
        if (filePath && text) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: file_path와 text 매개변수를 동시에 사용할 수 없습니다. 하나만 선택하세요.",
                    },
                ],
                isError: true,
            };
        }
        // bg_image는 text와 함께만 사용 가능
        if (bgImage && !text) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: bg_image는 text 매개변수와 함께만 사용할 수 있습니다.",
                    },
                ],
                isError: true,
            };
        }
        // Creta_easy.exe 존재 확인
        if (!existsSync(CRETA_EASY_EXE_PATH)) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Creta Easy가 설치되어있지 않습니다. 먼저 Creta Easy를 설치하여 주십시요",
                    },
                ],
                isError: true,
            };
        }
        // 파일 전송인 경우 파일 존재 확인
        if (filePath && !existsSync(filePath)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: 파일을 찾을 수 없습니다: ${filePath}`,
                    },
                ],
                isError: true,
            };
        }
        // 배경 이미지 파일 존재 확인
        if (bgImage && !existsSync(bgImage)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: 배경 이미지 파일을 찾을 수 없습니다: ${bgImage}`,
                    },
                ],
                isError: true,
            };
        }
        try {
            // 명령줄 인자 구성
            const args = [];
            // --autosend 옵션은 무조건 추가
            args.push('--autosend');
            // --devices 옵션이 있으면 추가
            if (devices && devices.length > 0) {
                args.push('--devices');
                args.push(...devices);
            }
            // 파일 또는 텍스트 추가
            if (filePath) {
                // 파일 전송
                const targetFilePath = path.resolve(filePath);
                args.push('--file');
                args.push(targetFilePath);
            }
            else if (text) {
                // 텍스트 전송
                args.push('--text');
                args.push(text);
                // 배경 이미지가 있으면 추가
                if (bgImage) {
                    const targetBgPath = path.resolve(bgImage);
                    args.push('--bg');
                    args.push(targetBgPath);
                }
            }
            // Creta_easy.exe 실행 (프로그램 종료를 기다리지 않음)
            const child = spawn(CRETA_EASY_EXE_PATH, args, {
                detached: true, // 부모 프로세스와 분리하여 독립 실행
                stdio: 'ignore' // 표준 입출력 무시
            });
            // 부모 프로세스와 완전히 분리
            child.unref();
            // 응답 메시지 구성 - 디버깅을 위해 실행된 명령어를 최우선으로 표시
            let responseText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 실행된 명령어 (Command Line):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행 파일: ${CRETA_EASY_EXE_PATH}

인자 (Arguments):`;
            args.forEach((arg, index) => {
                responseText += `\n  [${index + 1}] ${arg}`;
            });
            responseText += `\n\n전체 명령어:
${CRETA_EASY_EXE_PATH} ${args.join(' ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 실행 결과:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
            // 파일 전송인지 텍스트 전송인지 표시
            if (filePath) {
                const targetFilePath = path.resolve(filePath);
                responseText += `\n전송 타입: 파일 전송`;
                responseText += `\n파일: ${path.basename(targetFilePath)}`;
                responseText += `\n전체 경로: ${targetFilePath}`;
            }
            else if (text) {
                responseText += `\n전송 타입: 텍스트 전송`;
                responseText += `\n텍스트 내용: "${text}"`;
                // 배경 이미지가 있으면 표시
                if (bgImage) {
                    const targetBgPath = path.resolve(bgImage);
                    responseText += `\n배경 이미지: ${path.basename(targetBgPath)}`;
                    responseText += `\n배경 이미지 경로: ${targetBgPath}`;
                }
            }
            if (devices && devices.length > 0) {
                responseText += `\n대상 디바이스: ${devices.join(', ')}`;
            }
            responseText += `\n자동 전송 모드: 활성화`;
            // 프로세스 시작 후 바로 응답 반환
            return {
                content: [
                    {
                        type: "text",
                        text: responseText,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: Creta_easy.exe 실행 실패\n${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
    return {
        content: [
            {
                type: "text",
                text: `알 수 없는 tool: ${request.params.name}`,
            },
        ],
        isError: true,
    };
});
// 서버 시작
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Creta Easy MCP 서버가 시작되었습니다.");
}
main().catch((error) => {
    console.error("서버 시작 실패:", error);
    process.exit(1);
});
