import express from "express";
import templateRouter from "./routes/templateRoutes";

const app = express();

app.use(express.json());
app.use('/images', express.static('public/images'));

app.use("/api", templateRouter);

export default app;
