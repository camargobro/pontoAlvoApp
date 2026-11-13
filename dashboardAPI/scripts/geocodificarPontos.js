import 'dotenv/config';
import mongoose from 'mongoose';
import { Pontos } from '../model/modelPonto.js';
import { geocodificar } from '../model/geocodificar.js';

try {
  if (!process.env.GEOCODING_EMAIL) {
    console.warn('GEOCODING_EMAIL não definido; configure um contato no User-Agent para identificar o aplicativo.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const pontos = await Pontos.find({ lat: null });
  console.log(`${pontos.length} ponto(s) sem coordenadas`);

  for (const ponto of pontos) {
    const coords = await geocodificar(ponto);
    if (coords) {
      await Pontos.updateOne({ _id: ponto._id }, coords);
      console.log('ok:', ponto.nome);
    } else {
      console.log('não encontrado:', ponto.nome);
    }
  }
} catch (error) {
  console.error('Geocodificação interrompida:', error.message);
  if (error.status === 429) {
    console.error('Os pontos já atualizados foram salvos. Após aguardar, execute o script novamente para continuar com os restantes.');
  }
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}