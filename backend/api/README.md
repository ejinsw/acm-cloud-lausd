# Tutoring API Documentation

This API provides a backend for managing users, students, instructors, subjects, sessions, and reviews in an online tutoring platform.

## **Table of Contents**
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Students](#students)
  - [Instructors](#instructors)
  - [Subjects](#subjects)
  - [Sessions](#sessions)
  - [Reviews](#reviews)

---

## **Getting Started**
### **Installation**
Clone the repository and install dependencies:

```
git clone https://github.com/ejinsw/find-a-tutor-backend.git
cd find-a-tutor
npm install
```

### **Environment Variables**
Create a `.env` file and add the required database connection details:

```
DATABASE_URL="mongodb+srv://ejinsw:Bokchoy1@cluster0.gf5yt.mongodb.net/Tutor?retryWrites=true&w=majority&appName=Cluster0"
```

### **Run the Server**
```
npm run dev
```

---

## **API Endpoints**

### **Users**
#### **(Coming Soon)**
Endpoints for user authentication and profile management.

---

### **Students**
#### **Get Student by ID**
- **Route:** `GET /students/:id`
- **Description:** Retrieves details of a specific student.
- **Params:**
  - `id` (string) - Student's unique identifier.

#### **Update Student by ID**
- **Route:** `PUT /students/:id`
- **Description:** Updates student information.
- **Query Params:**
  - `firstName` (string) - Updated first name.
  - `lastName` (string) - Updated last name.
  - `email` (string) - Updated email.
  - `password` (string) - Updated password.
  - `grade` (number) - Updated grade level.
  - `address` (string) - Updated address.
  - `phoneNumber` (string) - Updated phone number.

#### **Delete Student by ID**
- **Route:** `DELETE /students/:id`
- **Description:** Deletes a student by ID.

---

### **Instructors**
#### **Get All Instructors**
- **Route:** `GET /instructors`
- **Description:** Retrieves all instructors. Supports filtering by name and subject.
- **Query Params:**
  - `name` (string) - Filter by instructor's name.
  - `subject` (string) - Filter by subject.

#### **Get Instructor by ID**
- **Route:** `GET /instructors/:id`
- **Description:** Retrieves details of a specific instructor.

#### **Create Instructor**
- **Route:** `POST /instructors`
- **Description:** Creates a new instructor.
- **Body Params:**
  - `userId` (string) - Associated user ID.
  - `certificationUrls` (array of strings) - List of certification links.
  - `subjects` (array of strings) - Subjects the instructor teaches.
  - `averageRating` (number) - Instructor's rating (default 0).

#### **Update Instructor by ID**
- **Route:** `PUT /instructors/:id`
- **Description:** Updates instructor details.
- **Body Params:**
  - `certificationUrls` (array of strings) - Updated certification links.
  - `subjects` (array of strings) - Updated subjects.
  - `averageRating` (number) - Updated rating.

#### **Delete Instructor by ID**
- **Route:** `DELETE /instructors/:id`
- **Description:** Deletes an instructor by ID.

---

### **Subjects**
#### **Get All Subjects**
- **Route:** `GET /subjects`
- **Description:** Retrieves all subjects.

#### **Get Subject by Name**
- **Route:** `GET /subjects/:name`
- **Description:** Retrieves details of a specific subject by name.

#### **Create Subject**
- **Route:** `POST /subjects`
- **Description:** Creates a new subject.
- **Body Params:**
  - `name` (string) - Name of the subject.

#### **Update Subject by ID**
- **Route:** `PUT /subjects/:id`
- **Description:** Updates subject details.
- **Body Params:**
  - `name` (string) - Updated subject name.

#### **Delete Subject by ID**
- **Route:** `DELETE /subjects/:id`
- **Description:** Deletes a subject by ID.

---

### **Sessions**
#### **Get All Sessions**
- **Route:** `GET /sessions`
- **Description:** Retrieves all sessions. Supports filtering by tutor name, session name, and subject.
- **Query Params:**
  - `tutorName` (string) - Filter by instructor's name.
  - `name` (string) - Filter by session name.
  - `subject` (string) - Filter by subject.

#### **Get Session by ID**
- **Route:** `GET /sessions/:id`
- **Description:** Retrieves details of a specific session.

#### **Create Session**
- **Route:** `POST /sessions`
- **Description:** Creates a new session.
- **Body Params:**
  - `name` (string) - Session name.
  - `description` (string) - Session description.
  - `startTime` (Date) - Start time.
  - `endTime` (Date) - End time.
  - `zoomLink` (string) - Meeting link.
  - `maxAttendees` (number) - Maximum number of attendees.
  - `instructorId` (string) - Instructor's ID.
  - `subjects` (array of strings) - Subjects covered.

#### **Update Session by ID**
- **Route:** `PUT /sessions/:id`
- **Description:** Updates session details.
- **Body Params:**
  - `name` (string) - Updated name.
  - `description` (string) - Updated description.
  - `startTime` (Date) - Updated start time.
  - `endTime` (Date) - Updated end time.
  - `zoomLink` (string) - Updated meeting link.
  - `maxAttendees` (number) - Updated maximum attendees.

#### **Delete Session by ID**
- **Route:** `DELETE /sessions/:id`
- **Description:** Deletes a session by ID.

---

### **Reviews**
#### **Get All Reviews**
- **Route:** `GET /reviews`
- **Description:** Retrieves all reviews. Supports filtering by student or instructor.
- **Query Params:**
  - `studentId` (string) - Filter by reviews written by a specific student.
  - `instructorId` (string) - Filter by reviews received by a specific instructor.

#### **Get Review by ID**
- **Route:** `GET /reviews/:id`
- **Description:** Retrieves details of a specific review.

#### **Create Review**
- **Route:** `POST /reviews`
- **Description:** Creates a new review.
- **Body Params:**
  - `rating` (number) - Rating (1-5).
  - `comment` (string) - Review comment.
  - `studentId` (string) - ID of the reviewing student.
  - `instructorId` (string) - ID of the reviewed instructor.

#### **Update Review by ID**
- **Route:** `PUT /reviews/:id`
- **Description:** Updates a review.
- **Body Params:**
  - `rating` (number) - Updated rating.
  - `comment` (string) - Updated comment.

#### **Delete Review by ID**
- **Route:** `DELETE /reviews/:id`
- **Description:** Deletes a review by ID.

---

## **License**
...

---

## **Author**
Developed by ACM UCLA Cloud Consulting.