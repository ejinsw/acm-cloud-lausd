import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";

import studentRouter from "./routes/studentRouter";
import instructorRouter from "./routes/instructorRouter";
import sessionRouter from "./routes/sessionRouter";
import reviewRouter from "./routes/reviewRouter";

dotenv.config();

const app: Application = express();

/**
 * Middleware
 */
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

/**
 * Routes
 */
// TODO: Add routes... i.e. app.use("/<route>", <router>)
app.use("/api", studentRouter);
app.use("/api", instructorRouter);
app.use("/api", sessionRouter);
app.use("/api", reviewRouter)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/**
 * FOR SERVER
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// export default app;

// FOR SERVERLESS
// If we decide to deploy on AWS Lambda
// replace
// ```
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// ```
// with
// ```
export const handler = serverless(app);
// ```
