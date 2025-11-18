#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
// 기본값 설정
const DEFAULT_API_BASE_URL = "http://localhost:3000/";
const DEFAULT_SELECT_COLUMN = ["name"];
const DEFAULT_DEVICE_SELECT_COLUMN = ["name"];
const DEFAULT_CLOUD_TYPE = "firebase";
// 환경변수 또는 기본값에서 설정 가져오기
const API_BASE_URL = process.env.CRETA_API_BASE_URL || DEFAULT_API_BASE_URL;
// selectColumn은 환경변수가 있으면 JSON 파싱, 없으면 기본값
const DEFAULT_SELECT_COLUMN_CONFIG = process.env.CRETA_SELECT_COLUMN
    ? JSON.parse(process.env.CRETA_SELECT_COLUMN)
    : DEFAULT_SELECT_COLUMN;
const DEFAULT_DEVICE_SELECT_COLUMN_CONFIG = process.env.CRETA_DEVICE_SELECT_COLUMN
    ? JSON.parse(process.env.CRETA_DEVICE_SELECT_COLUMN)
    : DEFAULT_DEVICE_SELECT_COLUMN;
const DEFAULT_CLOUD_TYPE_CONFIG = (process.env.CRETA_CLOUD_TYPE || DEFAULT_CLOUD_TYPE);
/**
 * Creta 데이터베이스에서 발행된 책 목록을 가져옵니다
 */
async function getPublishedBooks(input) {
    const url = `${API_BASE_URL}getPublishedBooks`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`크레타북 목록 가져오기 실패: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Creta 데이터베이스에서 디바이스 목록을 가져옵니다
 */
async function getDevices(input) {
    const url = `${API_BASE_URL}getDevices`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`디바이스 목록 가져오기 실패: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Creta 디바이스에 크레타북을 방송/전송합니다
 */
async function updateDevice(input) {
    const url = `${API_BASE_URL}updateDevice`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`디바이스 업데이트 실패: ${error.message}`);
        }
        throw error;
    }
}
// MCP 서버 생성
const server = new Server({
    name: "creta-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = [
        {
            name: "get_published_books",
            description: "Creta 데이터베이스에서 발행된 크레타북 목록을 가져옵니다. " +
                "userId는 필수이며, selectColumn과 cloudType은 선택사항입니다 (설정된 기본값 사용).",
            inputSchema: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        description: "사용자 ID (이메일 형식)",
                    },
                    selectColumn: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: `선택할 컬럼 목록 (예: ['mid', 'name', 'description']). 기본값: ${JSON.stringify(DEFAULT_SELECT_COLUMN_CONFIG)}`,
                    },
                    cloudType: {
                        type: "string",
                        enum: ["supabase", "firebase"],
                        description: `클라우드 데이터베이스 타입. 기본값: ${DEFAULT_CLOUD_TYPE_CONFIG}`,
                    },
                },
                required: ["userId"],
            },
        },
        {
            name: "get_devices",
            description: "Creta 데이터베이스에서 사용자의 디바이스 목록을 가져옵니다. " +
                "userId는 필수이며, selectColumn과 cloudType은 선택사항입니다 (설정된 기본값 사용).",
            inputSchema: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        description: "사용자 ID (이메일 형식)",
                    },
                    selectColumn: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: `선택할 컬럼 목록 (예: ['mid', 'name', 'modelName']). 기본값: ${JSON.stringify(DEFAULT_DEVICE_SELECT_COLUMN_CONFIG)}`,
                    },
                    cloudType: {
                        type: "string",
                        enum: ["supabase", "firebase"],
                        description: `클라우드 데이터베이스 타입. 기본값: ${DEFAULT_CLOUD_TYPE_CONFIG}`,
                    },
                },
                required: ["userId"],
            },
        },
        {
            name: "update_device",
            description: "Creta 디바이스에 크레타북을 방송/전송합니다. " +
                "deviceId와 bookName은 필수이며, cloudType은 선택사항입니다 (설정된 기본값 사용).",
            inputSchema: {
                type: "object",
                properties: {
                    deviceId: {
                        type: "string",
                        description: "디바이스 ID (예: 'SQI-0001')",
                    },
                    bookName: {
                        type: "string",
                        description: "방송할 크레타북 이름 (예: '풍경을 담은 북')",
                    },
                    cloudType: {
                        type: "string",
                        enum: ["supabase", "firebase"],
                        description: `클라우드 데이터베이스 타입. 기본값: ${DEFAULT_CLOUD_TYPE_CONFIG}`,
                    },
                },
                required: ["deviceId", "bookName"],
            },
        },
    ];
    return { tools };
});
// 도구 호출 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_published_books") {
        const args = request.params.arguments;
        // 입력 유효성 검사
        if (!args.userId || typeof args.userId !== "string") {
            throw new Error("userId는 필수 문자열 파라미터입니다");
        }
        // 기본값 적용
        const input = {
            userId: args.userId,
            selectColumn: args.selectColumn || DEFAULT_SELECT_COLUMN_CONFIG,
            cloudType: args.cloudType || DEFAULT_CLOUD_TYPE_CONFIG,
        };
        // 유효성 검사
        if (!Array.isArray(input.selectColumn) || input.selectColumn.length === 0) {
            throw new Error("selectColumn은 비어있지 않은 배열이어야 합니다");
        }
        if (!["supabase", "firebase"].includes(input.cloudType)) {
            throw new Error("cloudType은 'supabase' 또는 'firebase'여야 합니다");
        }
        try {
            const books = await getPublishedBooks(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            count: books.length,
                            books: books,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
    else if (request.params.name === "get_devices") {
        const args = request.params.arguments;
        // 입력 유효성 검사
        if (!args.userId || typeof args.userId !== "string") {
            throw new Error("userId는 필수 문자열 파라미터입니다");
        }
        // 기본값 적용
        const input = {
            userId: args.userId,
            selectColumn: args.selectColumn || DEFAULT_DEVICE_SELECT_COLUMN_CONFIG,
            cloudType: args.cloudType || DEFAULT_CLOUD_TYPE_CONFIG,
        };
        // 유효성 검사
        if (!Array.isArray(input.selectColumn) || input.selectColumn.length === 0) {
            throw new Error("selectColumn은 비어있지 않은 배열이어야 합니다");
        }
        if (!["supabase", "firebase"].includes(input.cloudType)) {
            throw new Error("cloudType은 'supabase' 또는 'firebase'여야 합니다");
        }
        try {
            const devices = await getDevices(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            count: devices.length,
                            devices: devices,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
    else if (request.params.name === "update_device") {
        const args = request.params.arguments;
        // 입력 유효성 검사
        if (!args.deviceId || typeof args.deviceId !== "string") {
            throw new Error("deviceId는 필수 문자열 파라미터입니다");
        }
        if (!args.bookName || typeof args.bookName !== "string") {
            throw new Error("bookName은 필수 문자열 파라미터입니다");
        }
        // 기본값 적용
        const input = {
            deviceId: args.deviceId,
            bookName: args.bookName,
            cloudType: args.cloudType || DEFAULT_CLOUD_TYPE_CONFIG,
        };
        // 유효성 검사
        if (!["supabase", "firebase"].includes(input.cloudType)) {
            throw new Error("cloudType은 'supabase' 또는 'firebase'여야 합니다");
        }
        try {
            const result = await updateDevice(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: `디바이스 '${input.deviceId}'에 '${input.bookName}' 방송/전송 완료`,
                            result: result,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
    throw new Error(`알 수 없는 도구: ${request.params.name}`);
});
// 서버 시작
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Creta MCP 서버가 시작되었습니다");
    console.error(`API Base URL: ${API_BASE_URL}`);
    console.error(`Default Select Columns (Books): ${JSON.stringify(DEFAULT_SELECT_COLUMN_CONFIG)}`);
    console.error(`Default Select Columns (Devices): ${JSON.stringify(DEFAULT_DEVICE_SELECT_COLUMN_CONFIG)}`);
    console.error(`Default Cloud Type: ${DEFAULT_CLOUD_TYPE_CONFIG}`);
}
main().catch((error) => {
    console.error("서버 시작 실패:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map