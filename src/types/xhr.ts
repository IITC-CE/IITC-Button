// XHR request routed through the extension (content script -> background/sandbox)
export interface XhrRequestData {
  task_uuid: string;
  task_type: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  user?: string;
  password?: string;
  overrideMimeType?: string;
  timeout?: number;
  withCredentials?: boolean;
}

// XHR response returned by the sandbox iframe or fetch fallback
export interface XhrResponseData {
  readyState: number;
  responseHeaders: string;
  responseText: string;
  status: number;
  statusText: string;
}

// postMessage contract between content script and sandbox iframe
export interface XhrIframeRequest {
  type: "xhr_request";
  uuid: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  user?: string;
  password?: string;
  overrideMimeType?: string;
  timeout?: number;
  withCredentials?: boolean;
}

export interface XhrIframeResponse {
  type: "xhr_response";
  uuid: string;
  response: XhrResponseData;
}
