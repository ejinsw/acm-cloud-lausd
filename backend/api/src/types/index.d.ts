declare global {
  declare namespace Express {
    export interface User {
      // TODO: Add User fields
    }
    
    // TODO: Add the rest of the schema (...or import types from ORM)
    export interface Request {
      user: User;
    }
  }
}

export interface CreateInstructorDto {
  userId: string,
  certificationUrls: string[],
  subjects: string[],
  firstName: string,
  lastName: string,
  email: string, 
  dateOfBirth: Date, 
  phoneNumber: string, 
  address: string, 
  city: string, 
  state: string, 
  zipCode: string, 
  country: string, 
  schoolName: string
}
export {};
