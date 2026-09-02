import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clerkMiddleware: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: mocks.clerkMiddleware,
  createRouteMatcher: (patterns: string[]) => (request: Request) => {
    const path = new URL(request.url).pathname;
    return patterns.some((pattern) => {
      const prefix = pattern.replace("(.*)", "");
      return path === prefix || path.startsWith(prefix);
    });
  },
}));

type TestProxy = {
  (request: NextRequest): Promise<{ protect: ReturnType<typeof vi.fn> }>;
  options: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
  };
};

async function importProxy() {
  const imported = await import("@/proxy");
  return imported.default as unknown as TestProxy;
}

describe("Morphic proxy", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.clerkMiddleware.mockImplementation((handler, options) => {
      const middleware = async (request: NextRequest) => {
        const protect = vi.fn();
        await handler({ protect }, request);
        return { protect };
      };
      return Object.assign(middleware, { options });
    });
  });

  it("requires Clerk protection for private product routes only", async () => {
    const proxy = await importProxy();

    const protectedResult = await proxy(
      new NextRequest("https://morphic.test/workspaces"),
    );
    const publicResult = await proxy(new NextRequest("https://morphic.test/"));

    expect(protectedResult.protect).toHaveBeenCalledOnce();
    expect(publicResult.protect).not.toHaveBeenCalled();
  });

  it("passes safe framing and object restrictions into Clerk CSP", async () => {
    const proxy = await importProxy();

    expect(proxy.options.contentSecurityPolicy.directives).toEqual(
      expect.objectContaining({
        "base-uri": ["'self'"],
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"],
      }),
    );
  });
});
