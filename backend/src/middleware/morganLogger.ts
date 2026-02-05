import morgan from "morgan";
import { httpLogStream } from "../config/logger.ts";

const skip = () => process.env.NODE_ENV === "test";

const morganLogger = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  {
    stream: httpLogStream,
    skip,
  },
);

export default morganLogger;
