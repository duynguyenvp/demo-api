import "reflect-metadata";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import mongoose from "mongoose";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import "dotenv/config";

import api from "./api";
import {
  responseFormatter,
  errorHandler,
  notFound
} from "./middlewares/response";

import logger from "./logger";

import CategoryResolver from "./resolvers/categoryResolver";
import { buildDataLoaders } from "./utils/dataLoader";
import { buildSchema } from "type-graphql";
import { Context } from "./types/Context";
import { getUserFromToken } from "./utils/getUserFromToken";
import { authChecker } from "./utils/authChecker";
import UserResolver from "./resolvers/userResolver";

const port = process.env.PORT || 5000;

const mongoString = process.env.DATABASE_URL as string;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", error => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Store Management API",
      description: "Store Management API Information",
      contact: {
        name: "duynguyen"
      },
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:5001/api/v1"
      }
    ]
  },
  apis: ["src/api/auth.ts"]
};

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: await buildSchema({
    resolvers: [CategoryResolver, UserResolver],
    authChecker: authChecker,
    validate: false
  }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});
await server.start();

app.use(
  "/graph",
  cors(),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req, res }): Promise<Context> => {
      let user = null;
      let error = null;
      try {
        user = await getUserFromToken(req.headers.authorization as string);
      } catch (err) {
        error = err
      }
      return {
        token: req.headers.authorization,
        request: req,
        response: res,
        dataLoaders: buildDataLoaders(),
        user,
        error,
      };
    }
  })
);

const swaggerDocs = swaggerjsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(compression());

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(responseFormatter);
app.use(errorHandler);

app.use("/api/v1", api);

app.use(notFound);

// Modified server startup
await new Promise(resolve =>
  httpServer.listen({ port: port }, resolve as () => void)
);
logger.info(`Server is listening on port ${port}!`);
