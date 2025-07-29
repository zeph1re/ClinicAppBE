// clinic-api/index.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Klinik Appointment API',
      version: '1.0.0',
      description: 'API untuk pengelolaan janji temu di Klinik Pratama',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Cek status API
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.send('Klinik API is running');
});

let appointments = [];

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Buat janji temu baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientName:
 *                 type: string
 *               doctorId:
 *                 type: integer
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Janji temu berhasil dibuat
 */
app.post('/appointments', (req, res) => {
  const appointment = { id: Date.now(), ...req.body, status: 'pending' };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Lihat semua janji temu
 *     responses:
 *       200:
 *         description: List semua appointment
 */
app.get('/appointments', (req, res) => {
  res.json(appointments);
});

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Ubah status janji temu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Status berhasil diperbarui
 *       404:
 *         description: Appointment tidak ditemukan
 */
app.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = appointments.findIndex((a) => a.id == id);
  if (index !== -1 && ['approved', 'rejected'].includes(status)) {
    appointments[index].status = status;
    return res.json(appointments[index]);
  }
  res.status(404).json({ error: 'Appointment not found or invalid status' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
