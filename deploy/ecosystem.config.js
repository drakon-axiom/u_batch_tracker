module.exports = {
  apps: [
    {
      name: "batch-tracker",
      script: "/opt/batch-tracker/current/.next/standalone/server.js",
      cwd: "/opt/batch-tracker/current",
      env_file: "/opt/batch-tracker/.env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1", // Only listen on loopback; nginx fronts it
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
