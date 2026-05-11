import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permite qualquer IP da rede local (qualquer dispositivo na mesma rede)
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.*.*', '10.0.*.*', '172.16.*.*'],

  // Ou usar wildcard para todos (menos seguro, mas mais prático)
  // allowedDevOrigins: ['*'],
};

export default nextConfig;