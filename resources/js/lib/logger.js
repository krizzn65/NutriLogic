const LOG_BUFFER_KEY = "__nutrilogic_log_buffer__";
const MAX_BUFFER_SIZE = 200;

const normalizeData = (input) => {
    if (input instanceof Error) {
        return {
            name: input.name,
            message: input.message,
            stack: input.stack,
        };
    }

    if (typeof input === "object" && input !== null) {
        try {
            return JSON.parse(JSON.stringify(input));
        } catch {
            return String(input);
        }
    }

    return input;
};

const appendToBuffer = (entry) => {
    if (typeof window === "undefined") {
        return;
    }

    const existing = window[LOG_BUFFER_KEY];
    const buffer = Array.isArray(existing) ? existing : [];
    buffer.push(entry);

    if (buffer.length > MAX_BUFFER_SIZE) {
        buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
    }

    window[LOG_BUFFER_KEY] = buffer;
};

const log = (level, message, ...meta) => {
    const entry = {
        level,
        message: normalizeData(message),
        meta: meta.map(normalizeData),
        timestamp: new Date().toISOString(),
    };

    appendToBuffer(entry);
};

const logger = {
    error: (message, ...meta) => log("error", message, ...meta),
    warn: (message, ...meta) => log("warn", message, ...meta),
    info: (message, ...meta) => log("info", message, ...meta),
    debug: (message, ...meta) => log("debug", message, ...meta),
};

export default logger;
