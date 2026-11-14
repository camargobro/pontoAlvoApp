import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import conectaDB from './dbConnect.js';
import cors from 'cors';

import pontosRouter from './routes/pontosRouter.js';
import acoesRouter from './routes/acoesRouter.js';
import dashboardRouter from './routes/dashboardRouter.js';
import usuariosRouter from './routes/usuariosRouter.js';
import adminRouter from './routes/adminRouter.js';
import agendamentosRouter from './routes/agendamentosRouter.js';
var app = express();

conectaDB();
app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());


app.get('/', (req, res) => {
  res.json({ mensagem: 'API funcionando' });
});

app.use('/pontos', pontosRouter);
app.use('/acoes', acoesRouter);
app.use('/dashboard', dashboardRouter);
app.use('/usuario', usuariosRouter);  
app.use('/admin', adminRouter);
app.use('/agendamentos', agendamentosRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
 res.status(err.status || 500).json({
  error: err.message
});
});


export default app;
