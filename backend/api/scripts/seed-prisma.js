const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test data
const testSubjects = [
  { name: 'Mathematics', description: 'Advanced mathematics including algebra, calculus, and geometry', category: 'STEM', level: 'High School' },
  { name: 'Physics', description: 'Classical mechanics, thermodynamics, and modern physics', category: 'STEM', level: 'High School' },
  { name: 'Chemistry', description: 'Organic chemistry, inorganic chemistry, and biochemistry', category: 'STEM', level: 'High School' },
  { name: 'Biology', description: 'Cell biology, genetics, and ecology', category: 'STEM', level: 'High School' },
  { name: 'English Literature', description: 'Classic and contemporary literature analysis', category: 'Humanities', level: 'High School' },
  { name: 'History', description: 'World history, American history, and government', category: 'Humanities', level: 'High School' },
  { name: 'Computer Science', description: 'Programming, algorithms, and software development', category: 'STEM', level: 'High School' },
  { name: 'Spanish', description: 'Spanish language and culture', category: 'Languages', level: 'High School' },
  { name: 'Art', description: 'Drawing, painting, and digital art', category: 'Arts', level: 'High School' },
  { name: 'Music', description: 'Music theory, composition, and performance', category: 'Arts', level: 'High School' }
];

const testInstructors = [
  {
    id: 'instructor-001',
    email: 'dr.smith@acmcloud.edu',
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    role: 'INSTRUCTOR',
    verified: true,
    birthdate: new Date('1985-03-15'),
    street: '123 Education Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'USA',
    schoolName: 'ACM Cloud Academy',
    bio: 'Experienced mathematics educator with 15+ years teaching advanced calculus and algebra. Passionate about making complex mathematical concepts accessible to all students.',
    education: ['Ph.D. Mathematics - Stanford University', 'M.S. Mathematics - UCLA', 'B.S. Mathematics - UC Berkeley'],
    experience: ['15 years teaching high school mathematics', 'Published 10+ research papers in mathematics education', 'Led district-wide curriculum development'],
    certificationUrls: ['https://example.com/cert1.pdf', 'https://example.com/cert2.pdf'],
    averageRating: 4.8,
    subjects: ['Mathematics']
  },
  {
    id: 'instructor-002',
    email: 'prof.johnson@acmcloud.edu',
    firstName: 'Professor',
    lastName: 'Johnson',
    role: 'INSTRUCTOR',
    verified: true,
    birthdate: new Date('1978-07-22'),
    street: '456 Science Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90211',
    country: 'USA',
    schoolName: 'ACM Cloud Academy',
    bio: 'Award-winning physics teacher specializing in making physics concepts engaging and understandable. Former NASA researcher.',
    education: ['Ph.D. Physics - MIT', 'M.S. Physics - CalTech', 'B.S. Physics - Harvard'],
    experience: ['12 years teaching physics', 'Former NASA research scientist', 'Author of 3 physics textbooks'],
    certificationUrls: ['https://example.com/physics-cert.pdf'],
    averageRating: 4.9,
    subjects: ['Physics']
  },
  {
    id: 'instructor-003',
    email: 'ms.garcia@acmcloud.edu',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'INSTRUCTOR',
    verified: true,
    birthdate: new Date('1990-11-08'),
    street: '789 Language Lane',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90212',
    country: 'USA',
    schoolName: 'ACM Cloud Academy',
    bio: 'Native Spanish speaker with expertise in teaching Spanish as a second language. Focuses on conversational skills and cultural understanding.',
    education: ['M.A. Spanish Literature - USC', 'B.A. Spanish - UCLA', 'TESOL Certification'],
    experience: ['8 years teaching Spanish', 'Study abroad program coordinator', 'Bilingual education specialist'],
    certificationUrls: ['https://example.com/spanish-cert.pdf', 'https://example.com/tesol-cert.pdf'],
    averageRating: 4.7,
    subjects: ['Spanish']
  },
  {
    id: 'instructor-004',
    email: 'mr.chen@acmcloud.edu',
    firstName: 'David',
    lastName: 'Chen',
    role: 'INSTRUCTOR',
    verified: true,
    birthdate: new Date('1982-04-30'),
    street: '321 Tech Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90213',
    country: 'USA',
    schoolName: 'ACM Cloud Academy',
    bio: 'Software engineer turned educator with 10+ years in the tech industry. Teaches computer science with real-world applications.',
    education: ['M.S. Computer Science - UC San Diego', 'B.S. Computer Science - UC Irvine'],
    experience: ['10 years as software engineer at Google', '5 years teaching computer science', 'Open source contributor'],
    certificationUrls: ['https://example.com/cs-cert.pdf'],
    averageRating: 4.6,
    subjects: ['Computer Science']
  },
  {
    id: 'instructor-005',
    email: 'dr.williams@acmcloud.edu',
    firstName: 'Dr. Emily',
    lastName: 'Williams',
    role: 'INSTRUCTOR',
    verified: true,
    birthdate: new Date('1975-09-14'),
    street: '654 Literature Way',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90214',
    country: 'USA',
    schoolName: 'ACM Cloud Academy',
    bio: 'Literature professor with expertise in classic and contemporary works. Helps students develop critical thinking and analytical skills.',
    education: ['Ph.D. English Literature - Yale University', 'M.A. English - Columbia University', 'B.A. English - Princeton'],
    experience: ['20 years teaching literature', 'Published author of 2 novels', 'Literary journal editor'],
    certificationUrls: ['https://example.com/literature-cert.pdf'],
    averageRating: 4.8,
    subjects: ['English Literature']
  }
];

const testSessions = [
  {
    name: 'Advanced Calculus Fundamentals',
    description: 'Master the core concepts of calculus including limits, derivatives, and integrals. Perfect for students preparing for AP Calculus.',
    startTime: new Date('2024-02-15T14:00:00Z'),
    endTime: new Date('2024-02-15T15:30:00Z'),
    zoomLink: 'https://zoom.us/j/123456789',
    maxAttendees: 15,
    materials: ['Calculus textbook', 'Graphing calculator', 'Practice problems'],
    objectives: ['Understand limits and continuity', 'Master derivative rules', 'Learn integration techniques'],
    subjects: ['Mathematics'],
    instructorId: 'instructor-001'
  },
  {
    name: 'Physics Lab: Mechanics',
    description: 'Hands-on physics lab session covering Newton\'s laws, motion, and energy conservation.',
    startTime: new Date('2024-02-16T10:00:00Z'),
    endTime: new Date('2024-02-16T11:30:00Z'),
    zoomLink: 'https://zoom.us/j/987654321',
    maxAttendees: 12,
    materials: ['Physics lab kit', 'Motion sensors', 'Data analysis software'],
    objectives: ['Conduct motion experiments', 'Analyze force and acceleration', 'Understand energy conservation'],
    subjects: ['Physics'],
    instructorId: 'instructor-002'
  },
  {
    name: 'Spanish Conversation Practice',
    description: 'Interactive Spanish conversation session focusing on everyday vocabulary and cultural topics.',
    startTime: new Date('2024-02-17T16:00:00Z'),
    endTime: new Date('2024-02-17T17:00:00Z'),
    zoomLink: 'https://zoom.us/j/456789123',
    maxAttendees: 10,
    materials: ['Spanish vocabulary list', 'Cultural presentation slides', 'Conversation prompts'],
    objectives: ['Practice speaking Spanish', 'Learn cultural context', 'Build vocabulary'],
    subjects: ['Spanish'],
    instructorId: 'instructor-003'
  },
  {
    name: 'Introduction to Python Programming',
    description: 'Learn the basics of Python programming including variables, loops, and functions.',
    startTime: new Date('2024-02-18T13:00:00Z'),
    endTime: new Date('2024-02-18T14:30:00Z'),
    zoomLink: 'https://zoom.us/j/789123456',
    maxAttendees: 20,
    materials: ['Python IDE setup guide', 'Coding exercises', 'Reference materials'],
    objectives: ['Set up Python environment', 'Write basic programs', 'Understand programming concepts'],
    subjects: ['Computer Science'],
    instructorId: 'instructor-004'
  },
  {
    name: 'Shakespeare\'s Hamlet Analysis',
    description: 'Deep dive into Shakespeare\'s Hamlet, exploring themes, characters, and literary devices.',
    startTime: new Date('2024-02-19T15:00:00Z'),
    endTime: new Date('2024-02-19T16:30:00Z'),
    zoomLink: 'https://zoom.us/j/321654987',
    maxAttendees: 18,
    materials: ['Hamlet text', 'Character analysis guide', 'Thematic discussion points'],
    objectives: ['Analyze character motivations', 'Identify literary devices', 'Discuss themes'],
    subjects: ['English Literature'],
    instructorId: 'instructor-005'
  }
];

// Helper function to create subjects
async function createSubjects() {
  console.log('Creating subjects...');
  for (const subject of testSubjects) {
    try {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: {},
        create: subject
      });
      console.log(`✓ Created/Updated subject: ${subject.name}`);
    } catch (error) {
      console.error(`✗ Error creating subject ${subject.name}:`, error.message);
    }
  }
}

// Helper function to create instructors
async function createInstructors() {
  console.log('\nCreating instructors...');
  for (const instructor of testInstructors) {
    try {
      // Create the user first
      const userData = {
        id: instructor.id,
        email: instructor.email,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        role: instructor.role,
        verified: instructor.verified,
        birthdate: instructor.birthdate,
        street: instructor.street,
        city: instructor.city,
        state: instructor.state,
        zip: instructor.zip,
        country: instructor.country,
        schoolName: instructor.schoolName,
        bio: instructor.bio,
        education: instructor.education,
        experience: instructor.experience,
        certificationUrls: instructor.certificationUrls,
        averageRating: instructor.averageRating
      };

      await prisma.user.upsert({
        where: { id: instructor.id },
        update: userData,
        create: userData
      });

      // Connect subjects
      if (instructor.subjects.length > 0) {
        for (const subjectName of instructor.subjects) {
          const subject = await prisma.subject.findUnique({
            where: { name: subjectName }
          });
          if (subject) {
            await prisma.user.update({
              where: { id: instructor.id },
              data: {
                subjects: {
                  connect: { id: subject.id }
                }
              }
            });
          }
        }
      }

      console.log(`✓ Created/Updated instructor: ${instructor.firstName} ${instructor.lastName}`);
    } catch (error) {
      console.error(`✗ Error creating instructor ${instructor.firstName} ${instructor.lastName}:`, error.message);
    }
  }
}

// Helper function to create sessions
async function createSessions() {
  console.log('\nCreating sessions...');
  for (const session of testSessions) {
    try {
      const sessionData = {
        name: session.name,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        zoomLink: session.zoomLink,
        maxAttendees: session.maxAttendees,
        materials: session.materials,
        objectives: session.objectives,
        instructorId: session.instructorId
      };

      const createdSession = await prisma.session.create({
        data: sessionData
      });

      // Connect subjects
      if (session.subjects.length > 0) {
        for (const subjectName of session.subjects) {
          const subject = await prisma.subject.findUnique({
            where: { name: subjectName }
          });
          if (subject) {
            await prisma.session.update({
              where: { id: createdSession.id },
              data: {
                subjects: {
                  connect: { id: subject.id }
                }
              }
            });
          }
        }
      }

      console.log(`✓ Created session: ${session.name}`);
    } catch (error) {
      console.error(`✗ Error creating session ${session.name}:`, error.message);
    }
  }
}

// Main function to run the seeding
async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    await createSubjects();
    await createInstructors();
    await createSessions();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Created ${testSubjects.length} subjects`);
    console.log(`👨‍🏫 Created ${testInstructors.length} instructors`);
    console.log(`📚 Created ${testSessions.length} sessions`);
    
  } catch (error) {
    console.error('\n❌ Error during database seeding:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, testSubjects, testInstructors, testSessions }; 