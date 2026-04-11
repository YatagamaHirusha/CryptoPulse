module.exports = {
  apps: [
    {
      name: "news-bot",
      script: "npm",
      args: "run bot",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
