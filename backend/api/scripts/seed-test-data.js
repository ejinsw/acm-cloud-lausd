const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    // Create test subjects
    const mathSubject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        description: 'Advanced mathematics including algebra, calculus, and geometry',
        category: 'STEM',
        level: 'Advanced'
      }
    });

    const scienceSubject = await prisma.subject.create({
      data: {
        name: 'Physics',
        description: 'Classical mechanics, thermodynamics, and modern physics',
        category: 'STEM',
        level: 'Intermediate'
      }
    });

    // Create test instructor
    const instructor = await prisma.user.create({
      data: {
        id: 'test-instructor-id',
        email: 'instructor@test.com',
        role: 'INSTRUCTOR',
        firstName: 'John',
        lastName: 'Smith',
        verified: true,
        bio: 'Experienced mathematics instructor with 10 years of teaching experience',
        education: ['Master\'s in Mathematics', 'Teaching Certification'],
        experience: ['High School Teacher', 'Private Tutor'],
        certificationUrls: ['https://example.com/cert1.pdf'],
        averageRating: 4.8,
        subjects: {
          connect: [{ id: mathSubject.id }, { id: scienceSubject.id }]
        }
      }
    });

    // Create test student
    const student = await prisma.user.create({
      data: {
        id: 'test-student-id',
        email: 'student@test.com',
        role: 'STUDENT',
        firstName: 'Jane',
        lastName: 'Doe',
        verified: true,
        grade: '11th Grade',
        parentFirstName: 'Bob',
        parentLastName: 'Doe',
        parentEmail: 'bob.doe@email.com',
        parentPhone: '+1234567890',
        interests: ['Mathematics', 'Science'],
        learningGoals: ['Improve calculus skills', 'Prepare for college']
      }
    });

    // Create test session
    const session = await prisma.session.create({
      data: {
        name: 'Advanced Calculus Session',
        description: 'Comprehensive review of calculus concepts',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T12:00:00Z'),
        maxAttendees: 5,
        materials: ['Calculus textbook', 'Practice problems'],
        objectives: ['Master derivatives', 'Understand integrals'],
        instructorId: instructor.id,
        students: {
          connect: [{ id: student.id }]
        },
        subjects: {
          connect: [{ id: mathSubject.id }]
        }
      }
    });

    // Create test review
    const review = await prisma.review.create({
      data: {
        rating: 5.0,
        comment: 'Excellent teaching style and very patient with explanations',
        studentId: student.id,
        instructorId: instructor.id
      }
    });

    console.log('Test data seeded successfully!');
    console.log('Test Users:');
    console.log('- Instructor ID:', instructor.id);
    console.log('- Student ID:', student.id);
    console.log('Test Subjects:', [mathSubject.id, scienceSubject.id]);
    console.log('Test Session ID:', session.id);
    console.log('Test Review ID:', review.id);

  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 