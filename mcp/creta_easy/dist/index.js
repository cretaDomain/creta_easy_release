#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { spawn, exec } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { promisify } from "util";
const execAsync = promisify(exec);
// Creta_easy.exe 고정 경로
const CRETA_EASY_EXE_PATH = "C:\\SQISOFT\\Creta\\Creta_easy.exe";
// 지원되는 애니메이션 타입 목록
const SUPPORTED_ANIMATIONS = [
    "slideTransition",
    "scaleTransition",
    "rotate",
    "fidget",
    "fade",
    "shimmer",
    "typewriter",
];
// Creta_easy.exe 프로세스가 실행 중인지 확인하는 함수
async function isCretaEasyRunning() {
    try {
        const { stdout: listOutput } = await execAsync('tasklist /FI "IMAGENAME eq Creta_easy.exe"');
        // "INFO: No tasks" 메시지가 있으면 프로세스가 없는 것
        if (listOutput.includes("INFO:") && listOutput.toLowerCase().includes("no tasks")) {
            return false;
        }
        // 실제 프로세스 이름이 출력에 있는지 확인 (대소문자 무시)
        const lowerOutput = listOutput.toLowerCase();
        return lowerOutput.includes("creta_easy.exe");
    }
    catch (error) {
        return false;
    }
}
// Creta_easy.exe 프로세스를 종료하는 함수
async function killCretaEasy() {
    try {
        const isRunning = await isCretaEasyRunning();
        if (!isRunning) {
            return {
                success: true,
                message: "프로세스가 실행되고 있지 않음"
            };
        }
        // taskkill 명령으로 프로세스 종료
        await execAsync('taskkill /IM Creta_easy.exe /F');
        return {
            success: true,
            message: "프로세스 종료 완료"
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `프로세스 종료 실패: ${errorMessage}`
        };
    }
}
// Creta_easy.exe 단순 실행 Tool 정의
const START_CRETA_TOOL = {
    name: "start_creta_easy",
    description: "Creta_easy.exe를 아무 옵션 없이 단순 실행합니다. 사용자가 프로그램을 열어서 직접 사용하고 싶을 때 사용하세요.",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};
// Creta_easy.exe 종료 Tool 정의
const STOP_CRETA_TOOL = {
    name: "stop_creta_easy",
    description: "실행 중인 Creta_easy.exe 프로세스를 종료합니다. 사용자가 프로그램을 닫고 싶을 때 사용하세요.",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};
// 애니메이션 목록 조회 Tool 정의
const LIST_ANIMATIONS_TOOL = {
    name: "list_creta_animations",
    description: `Creta Easy에서 텍스트 전송 시 사용할 수 있는 애니메이션 종류를 보여줍니다.
    
사용자가 다음과 같은 요청을 할 때 이 도구를 사용하세요:
- "애니메이션 종류에 뭐가 있는지 보여줘"
- "어떤 애니메이션을 쓸 수 있어?"
- "텍스트 애니메이션 목록 보여줘"`,
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};
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
      - 배경 파일(이미지 또는 동영상)이 필요한지 물어보세요.
        예시: "배경 파일(이미지 또는 동영상)을 함께 전송하시겠습니까? (파일 경로 또는 랜덤)"
      - 특정 배경 파일이 있으면 bg_image 매개변수에 전달하세요.
      - 랜덤 배경을 원하면 bg_random을 true로 설정하세요.
      - ⚠️ 중요: 사용자가 애니메이션을 지정했으면 animation 매개변수에 전달하세요.
        만약 사용자가 애니메이션을 지정하지 않았다면, 이 도구를 호출하지 말고 먼저 사용자에게 
        7가지 애니메이션 중 어떤 것을 적용할지 물어보세요:
        "텍스트에 적용할 애니메이션을 선택해 주세요:
        1. slideTransition - 슬라이드 전환
        2. scaleTransition - 크기 전환
        3. rotate - 회전
        4. fidget - 떨림
        5. fade - 페이드
        6. shimmer - 반짝임
        7. typewriter - 타자기
        원하는 애니메이션 이름을 알려주세요."

2. 그 다음 사용자에게 디바이스명을 지정할지 물어보세요.
   예시: "전송할 디바이스명을 지정하시겠습니까? (예: device1 device2)"
   - 사용자가 디바이스명을 제공하면 devices 매개변수에 배열로 전달하세요.
   - 사용자가 필요없다고 하거나 아무 말이 없으면 devices 매개변수를 비워두세요.

주의사항:
- file_path와 text 중 하나만 제공해야 합니다.
- bg_image와 bg_random은 text와 함께만 사용 가능합니다 (file_path와는 사용 불가).
- bg_image와 bg_random을 동시에 사용할 수 없습니다.
- animation은 text와 함께만 사용 가능합니다 (file_path와는 사용 불가).

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
            animation: {
                type: "string",
                enum: ["slideTransition", "scaleTransition", "rotate", "fidget", "fade", "shimmer", "typewriter"],
                description: "텍스트에 적용할 애니메이션 타입 (text와 함께만 사용 가능). 지원되는 애니메이션: slideTransition(슬라이드), scaleTransition(크기 전환), rotate(회전), fidget(떨림), fade(페이드), shimmer(반짝임), typewriter(타자기)",
            },
            bg_image: {
                type: "string",
                description: "텍스트와 함께 전송할 배경 파일(이미지 또는 동영상) 경로 (text와 함께만 사용 가능, bg_random과 동시 사용 불가). 이미지 예: C:\\Users\\username\\Pictures\\background.jpg, 동영상 예: C:\\Users\\username\\Videos\\background.mp4",
            },
            bg_random: {
                type: "boolean",
                description: "텍스트와 함께 랜덤 배경(이미지 또는 동영상)을 전송할지 여부 (text와 함께만 사용 가능, bg_image와 동시 사용 불가). true로 설정하면 Creta_easy가 알아서 랜덤 배경을 선택합니다.",
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
        tools: [START_CRETA_TOOL, STOP_CRETA_TOOL, LAUNCH_CRETA_TOOL, LIST_ANIMATIONS_TOOL],
    };
});
// Tool 호출 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Creta Easy 단순 실행
    if (request.params.name === "start_creta_easy") {
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
        try {
            // 기존에 실행 중인 프로세스가 있으면 종료
            let statusMessage = "";
            const wasRunning = await isCretaEasyRunning();
            if (wasRunning) {
                const killResult = await killCretaEasy();
                if (!killResult.success) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `오류: 기존 프로세스 종료 실패\n${killResult.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
                statusMessage = "⚠️ 기존에 실행 중이던 Creta Easy를 종료했습니다.\n\n";
            }
            // Creta_easy.exe를 아무 옵션 없이 실행 (프로그램 종료를 기다리지 않음)
            const child = spawn(CRETA_EASY_EXE_PATH, [], {
                detached: true, // 부모 프로세스와 분리하여 독립 실행
                stdio: 'ignore' // 표준 입출력 무시
            });
            // 부모 프로세스와 완전히 분리
            child.unref();
            return {
                content: [
                    {
                        type: "text",
                        text: `${statusMessage}✅ Creta Easy 프로그램이 실행되었습니다.\n\n실행 파일: ${CRETA_EASY_EXE_PATH}`,
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
    // Creta Easy 종료
    if (request.params.name === "stop_creta_easy") {
        try {
            const isRunning = await isCretaEasyRunning();
            if (!isRunning) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "ℹ️ Creta Easy 프로세스가 실행되고 있지 않습니다.",
                        },
                    ],
                };
            }
            const killResult = await killCretaEasy();
            if (!killResult.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `오류: ${killResult.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Creta Easy 프로세스가 종료되었습니다.\n\n종료된 프로세스: Creta_easy.exe`,
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
                        text: `오류: Creta Easy 프로세스 종료 실패\n${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
    // 애니메이션 목록 조회
    if (request.params.name === "list_creta_animations") {
        const animationDescriptions = {
            slideTransition: "슬라이드 전환 - 텍스트가 슬라이드하며 나타납니다",
            scaleTransition: "크기 전환 - 텍스트가 크기가 변하며 나타납니다",
            rotate: "회전 - 텍스트가 회전하며 나타납니다",
            fidget: "떨림 - 텍스트가 떨리는 효과가 적용됩니다",
            fade: "페이드 - 텍스트가 서서히 나타납니다",
            shimmer: "반짝임 - 텍스트에 반짝이는 효과가 적용됩니다",
            typewriter: "타자기 - 텍스트가 타자기처럼 한 글자씩 나타납니다",
        };
        let responseText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 Creta Easy 텍스트 애니메이션 목록
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

텍스트 전송 시 사용할 수 있는 애니메이션 종류입니다:

`;
        SUPPORTED_ANIMATIONS.forEach((animation, index) => {
            responseText += `${index + 1}. ${animation}\n   └ ${animationDescriptions[animation]}\n\n`;
        });
        responseText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 사용 방법: 텍스트 전송 시 원하는 애니메이션 이름을 함께 지정하세요.
   예: "안녕하세요 텍스트를 typewriter 애니메이션으로 전송해줘"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        return {
            content: [
                {
                    type: "text",
                    text: responseText,
                },
            ],
        };
    }
    // 파일 또는 텍스트 전송
    if (request.params.name === "launch_creta_easy") {
        const filePath = request.params.arguments?.file_path;
        const text = request.params.arguments?.text;
        const animation = request.params.arguments?.animation;
        const bgImage = request.params.arguments?.bg_image;
        const bgRandom = request.params.arguments?.bg_random;
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
        // bg_image와 bg_random은 text와 함께만 사용 가능
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
        if (bgRandom && !text) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: bg_random은 text 매개변수와 함께만 사용할 수 있습니다.",
                    },
                ],
                isError: true,
            };
        }
        // bg_image와 bg_random을 동시에 사용할 수 없음
        if (bgImage && bgRandom) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: bg_image와 bg_random을 동시에 사용할 수 없습니다. 하나만 선택하세요.",
                    },
                ],
                isError: true,
            };
        }
        // animation은 text와 함께만 사용 가능
        if (animation && !text) {
            return {
                content: [
                    {
                        type: "text",
                        text: "오류: animation은 text 매개변수와 함께만 사용할 수 있습니다.",
                    },
                ],
                isError: true,
            };
        }
        // animation 유효성 검사
        if (animation && !SUPPORTED_ANIMATIONS.includes(animation)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: 지원되지 않는 애니메이션 타입입니다: ${animation}\n\n지원되는 애니메이션 목록:\n${SUPPORTED_ANIMATIONS.map((ani, idx) => `${idx + 1}. ${ani}`).join('\n')}`,
                    },
                ],
                isError: true,
            };
        }
        // 텍스트 전송인데 애니메이션이 지정되지 않은 경우 - 사용자에게 선택 요청
        if (text && !animation) {
            return {
                content: [
                    {
                        type: "text",
                        text: `📝 텍스트 전송에 적용할 애니메이션을 선택해 주세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 사용 가능한 애니메이션 목록:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. slideTransition - 슬라이드 전환
2. scaleTransition - 크기 전환
3. rotate - 회전
4. fidget - 떨림
5. fade - 페이드
6. shimmer - 반짝임
7. typewriter - 타자기

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
원하는 애니메이션 이름을 알려주세요.
예: "typewriter" 또는 "fade"`,
                    },
                ],
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
        // 배경 파일 존재 확인
        if (bgImage && !existsSync(bgImage)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: 배경 파일(이미지 또는 동영상)을 찾을 수 없습니다: ${bgImage}`,
                    },
                ],
                isError: true,
            };
        }
        try {
            // 기존에 실행 중인 프로세스가 있으면 종료
            let statusMessage = "";
            const wasRunning = await isCretaEasyRunning();
            if (wasRunning) {
                const killResult = await killCretaEasy();
                if (!killResult.success) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `오류: 기존 프로세스 종료 실패\n${killResult.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
                statusMessage = "⚠️ 기존에 실행 중이던 Creta Easy를 종료했습니다.\n\n";
            }
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
                // 애니메이션 옵션 추가
                if (animation) {
                    args.push(`--ani=${animation}`);
                }
                // 배경 파일 옵션 추가
                if (bgRandom) {
                    // 랜덤 배경 파일 옵션
                    args.push('--bg-random');
                }
                else if (bgImage) {
                    // 특정 배경 파일 (이미지 또는 동영상)
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
            let responseText = statusMessage + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
                // 애니메이션 옵션 표시
                if (animation) {
                    responseText += `\n애니메이션: ${animation}`;
                }
                // 배경 파일 옵션 표시
                if (bgRandom) {
                    responseText += `\n배경: 랜덤 (--bg-random 옵션 사용)`;
                }
                else if (bgImage) {
                    const targetBgPath = path.resolve(bgImage);
                    responseText += `\n배경 파일: ${path.basename(targetBgPath)}`;
                    responseText += `\n배경 파일 경로: ${targetBgPath}`;
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
