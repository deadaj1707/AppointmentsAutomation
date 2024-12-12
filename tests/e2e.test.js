const request = require('supertest');
const app = require('../server'); // Your Express app
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

const generateRandomString = (length) => {
    return Math.random().toString(36).substring(2, length + 2);
};

describe('E2E Test: Student booking an appointment with Professor', () => {
    let tokenStudentA1;
    let tokenStudentA2;
    let tokenProfessorP1;
    let professorId;
    let availabilityId;
    
    // Dynamic data for users with random values
    const usersData = {
        studentA1: {
            name: `Student ${generateRandomString(5)}`,
            email: `${generateRandomString(8)}@example.com`,
            password: `password ${generateRandomString(5)}`,
            role: 'student',
        },
        studentA2: {
            name: `Student ${generateRandomString(5)}`,
            email: `${generateRandomString(8)}@example.com`,
            password: `password ${generateRandomString(5)}`,
            role: 'student',
        },
        professorP1: {
            name: `Professor ${generateRandomString(5)}`,
            email: `${generateRandomString(8)}@example.com`,
            password: `password ${generateRandomString(5)}`,
            role: 'professor',
        },
    };

    beforeAll(async () => {
        // Setup: Create users dynamically
        // const studentA1 = await User.create(usersData.studentA1);
        // const studentA2 = await User.create(usersData.studentA2);
        // const professorP1 = await User.create(usersData.professorP1);

        // Login to get JWT tokens dynamically
        const resStudentA1 = await request('http://localhost:5000').post('/api/auth/signup').send(usersData.studentA1);
        console.log(usersData.studentA1);
        tokenStudentA1 = resStudentA1.body.token;
        console.log(resStudentA1.body);

        const resStudentA2 = await request('http://localhost:5000').post('/api/auth/signup').send(usersData.studentA2);
        tokenStudentA2 = resStudentA2.body.token;
        console.log(resStudentA2.body);
        const resProfessorP1 = await request('http://localhost:5000').post('/api/auth/signup').send(usersData.professorP1);
        tokenProfessorP1 = resProfessorP1.body.token;
        console.log(resProfessorP1.body);
        // Create availability for Professor P1 dynamically
        const availability = await request('http://localhost:5000')
            .post('/api/availability/add')
            .set('Authorization', `Bearer ${tokenProfessorP1}`)
            .send({
                date: '2024-12-15',
                slots: [{ time: '10:00', isBooked: false }, { time: '11:00', isBooked: false }],
            });
        professorId = availability.body.availability.professor;
        availabilityId = availability.body.availability._id;
    });

    it('should allow Student A1 to book a time slot with Professor P1', async () => {
        // Step 1: Student A1 views available slots for Professor P1
        const resSlots = await request('http://localhost:5000')
            .get('/api/availability/view')
            .set('Authorization', `Bearer ${tokenStudentA1}`)
            .query({ professorName: usersData.professorP1.name });
        expect(resSlots.status).toBe(200);
        expect(resSlots.body.availability.length).toBeGreaterThan(0);
        expect(resSlots.body.availability[0].slots).toHaveLength(2); // 2 available slots

        // Step 2: Student A1 books appointment for time '10:00'
        const resBookA1 = await request('http://localhost:5000')
            .post('/api/appointment/book')
            .set('Authorization', `Bearer ${tokenStudentA1}`)
            .send({
                professorName: usersData.professorP1.name,
                date: '2024-12-15',
                time: '10:00',
            });
        console.log(resBookA1.body);
        expect(resBookA1.status).toBe(200);
        expect(resBookA1.body.message).toBe('Appointment booked successfully');

        // Step 3: Student A2 books appointment for time '11:00'
        const resBookA2 = await request('http://localhost:5000')
            .post('/api/appointment/book')
            .set('Authorization', `Bearer ${tokenStudentA2}`)
            .send({
                professorName: usersData.professorP1.name,
                date: '2024-12-15',
                time: '11:00',
            });
        expect(resBookA2.status).toBe(200);
        expect(resBookA2.body.message).toBe('Appointment booked successfully');
    });

    it('should allow Professor P1 to cancel the appointment of Student A1', async () => {
        // Step 4: Professor P1 cancels the appointment with Student A1
        const resCancel = await request('http://localhost:5000')
            .put('/api/appointment/cancel')
            .set('Authorization', `Bearer ${tokenProfessorP1}`)
            .send({
                date: '2024-12-15',
                time: '10:00',
            });
        console.log(resCancel.body);
        expect(resCancel.status).toBe(200);
        expect(resCancel.body.message).toBe('Appointment cancelled successfully');
    });

    it('should show no appointments for Student A1 after cancellation', async () => {
        // Step 5: Student A1 checks appointments
        const resCheckAppointments = await request('http://localhost:5000')
            .get('/api/appointment/check')
            .set('Authorization', `Bearer ${tokenStudentA1}`);
        expect(resCheckAppointments.status).toBe(200);
        expect(resCheckAppointments.body.appointments).toHaveLength(0); // No pending appointments
    });

    afterAll(async () => {
        // Cleanup: Delete test users and availability dynamically
        await User.deleteMany({ email: { $in: [usersData.studentA1.email, usersData.studentA2.email, usersData.professorP1.email] } });
        await Availability.deleteMany({ professor: professorId });
    });
});
