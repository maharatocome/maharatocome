module.exports = {
  apps: [
    {
      name: "maharatocome",
      script: ".next/standalone/server.js",
      cwd: "/www/wwwroot/maharatocome",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      error_file: "/www/wwwroot/maharatocome/logs/err.log",
      out_file: "/www/wwwroot/maharatocome/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm",
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
