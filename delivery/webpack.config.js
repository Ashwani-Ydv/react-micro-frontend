const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const deps = require("./package.json").dependencies;

module.exports = (_, argv) => {
  // Determine the mode (development or production)
  const isProduction = argv.mode === 'production';

  // Set publicPath dynamically based on the environment
  const publicPath = isProduction ? "https://yourproductiondomain.com/" : "http://localhost:9003/";

  return {
    output: {
      publicPath: publicPath,
      filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 9003,
      historyApiFallback: true,
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(css|s[ac]ss)$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: "delivery",
        filename: "delivery-app.js",
        remotes: {},
        exposes: {
          "./DeliveryApp": "./src/App.jsx",
        },
        shared: {
          ...deps,
          react: { singleton: true, eager: true, requiredVersion: deps.react },
          "react-dom": { singleton: true, eager: true, requiredVersion: deps["react-dom"] },
        },
      }),
      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
    ],

    // Enable source maps in development for better debugging
    devtool: isProduction ? false : 'source-map',

    // Optimization settings for production
    optimization: isProduction ? {
      splitChunks: {
        chunks: 'all',
      },
    } : {},
  };
};
