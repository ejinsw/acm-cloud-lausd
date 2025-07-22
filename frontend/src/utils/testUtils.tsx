import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data for tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student' as const,
  grade: '10th',
}

export const mockInstructor = {
  id: '2',
  email: 'instructor@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'instructor' as const,
  subjects: ['Math', 'Science'],
  averageRating: 4.5,
}

export const mockSession = {
  id: '1',
  name: 'Math Tutoring Session',
  description: 'Advanced algebra concepts',
  startTime: new Date('2024-01-15T10:00:00Z'),
  endTime: new Date('2024-01-15T11:00:00Z'),
  instructorId: '2',
  instructor: mockInstructor,
  maxAttendees: 10,
  currentAttendees: 5,
  zoomLink: 'https://zoom.us/j/123456789',
  materials: ['Algebra Textbook', 'Practice Problems'],
  objectives: ['Solve quadratic equations', 'Understand factoring'],
  subjects: ['Math'],
}

export const mockReview = {
  id: '1',
  rating: 5,
  comment: 'Excellent teaching style and very patient',
  studentId: '1',
  instructorId: '2',
  createdAt: new Date('2024-01-10T12:00:00Z'),
  student: mockUser,
  instructor: mockInstructor,
} 