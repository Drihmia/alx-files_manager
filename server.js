import express from 'express';
import route from './routes/index';

const app = express();

app.use(express.json());
app.use(route);
const port = process.env.PORT;

app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
