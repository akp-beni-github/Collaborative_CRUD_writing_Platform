module.exports = {
    apps : [
      {
        name: "authServer",
        script: "./authServer#2.js",
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        }
      },
      {
        name: "rootServer",
        script: "./rootServer#2.js",
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        }
      },
      {
        name: "crudServer",
        script: "./crudapiServer.js",
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        }
      }
    ]
  }
  