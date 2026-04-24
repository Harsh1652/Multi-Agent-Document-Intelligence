import { API_BASE } from "./constants";

export async function analyzeDocument(file: File): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });
}

export async function loadSampleFile(filename: string): Promise<File> {
  const resp = await fetch(`/samples/${filename}`);
  if (!resp.ok) throw new Error(`Could not load sample: ${filename}`);
  const blob = await resp.blob();
  return new File([blob], filename, { type: "application/pdf" });
}

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

export async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        try {
          yield { type: currentEvent, data: JSON.parse(raw) };
        } catch {
          // skip malformed
        }
        currentEvent = "";
      }
    }
  }
}
