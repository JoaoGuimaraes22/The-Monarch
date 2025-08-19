// lib/api/logger.ts
// Simple but effective logging system for API requests

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class APILogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isDevelopment = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    // Console output for development/debugging
    if (this.isDevelopment) {
      const logMethod = this.getConsoleMethod(level);
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp}`;

      if (data) {
        logMethod(`${prefix} ${message}`, data);
      } else {
        logMethod(`${prefix} ${message}`);
      }
    }

    // Store in memory (in production, you'd integrate with external logging service)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // In production, you might want to send critical errors to external service
    if (level === "error" && !this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case "error":
        return console.error;
      case "warn":
        return console.warn;
      case "debug":
        return console.debug;
      default:
        return console.log;
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Integrate with external logging service (e.g., LogRocket, Sentry, etc.)
    // For now, just a placeholder
    if (process.env.EXTERNAL_LOGGING_ENDPOINT) {
      // Would send to external service
      console.log("Would send to external logging service:", entry);
    }
  }

  // Public logging methods
  debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: any): void {
    this.log("error", message, data);
  }

  // Utility methods
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = level
      ? this.logs.filter((log) => log.level === level)
      : this.logs;

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit); // Get last N logs
    }

    return filteredLogs;
  }

  getLogStats(): { [key in LogLevel]: number } & { total: number } {
    const stats = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      total: this.logs.length,
    };

    this.logs.forEach((log) => {
      stats[log.level]++;
    });

    return stats;
  }

  clearLogs(): void {
    this.logs = [];
  }

  // API request specific logging helpers
  logRequest(
    requestId: string,
    method: string,
    url: string,
    userAgent?: string | null
  ): void {
    this.info("API Request", {
      requestId,
      method,
      url,
      userAgent,
    });
  }

  logResponse(requestId: string, status: number, duration: number): void {
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    this.log(level, "API Response", {
      requestId,
      status,
      duration,
    });
  }

  logError(requestId: string, error: Error | string, context?: any): void {
    this.error("API Error", {
      requestId,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
      context,
    });
  }
}

// Export singleton instance
export const logger = new APILogger();

// Export for testing
export { APILogger };
