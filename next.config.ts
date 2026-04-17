import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev({
    remoteBindings: !!process.env.NEXT_REMOTE_BINDINGS,
  });
}

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

export default nextConfig;
