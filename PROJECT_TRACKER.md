# ALS Connect Tacloban: An Integrated Web Hub for Learning, Communication, and Progress Tracking for Anibong, Tacloban City Learning Center

## Proposal Overview
The Tacloban Alternative Learning System (ALS) program provides crucial education to out-of-school youth and adults. However, its operations in the Anibong, Tacloban City Learning Center face significant challenges due to fragmented communication, manual record-keeping, and limited access to centralized learning resources. This project proposes ALS Connect Tacloban, a comprehensive web-based integrated hub designed specifically for Anibong ALS learners, teachers, and administrators. The platform aims to digitize and streamline administrative tasks, facilitate real-time communication, and provide a centralized repository for learning materials and progress tracking. This overview introduces the core problem, the proposed IT solution, and a high-level implementation roadmap. The subsequent sections of this proposal will detail the project rationale, methodology, specific deliverables, and evaluation plan.

## Problem Summary
The current ALS implementation in Anibong, Tacloban City relies heavily on face-to-face interactions, paper-based records, and disparate communication channels (e.g., personal messaging apps). This leads to inefficient scheduling, difficulty in tracking student progress, challenges in distributing and updating learning modules, and communication gaps between teachers, learners, and the district office. The context is a non-formal education system serving learners with diverse schedules and often limited consistent internet access, requiring an adaptable, integrated digital solution.
This project will include the development of ALS Connect Tacloban, a functional integrated web hub with user roles for students, teachers, and administrators. It will feature module management, progress tracking, announcement systems, and basic forum capabilities. It will not include mobile application development, advanced video conferencing tools, or full-scale content creation for all ALS learning strands beyond a foundational repository.

## IT Solution
The proposed solution is ALS Connect Tacloban, a responsive web portal built using common full-stack technologies (e.g., React/Node.js or Laravel). The system will centralize operations: Learners can access materials and track progress; Teachers can manage classes, upload resources, and monitor students; Administrators can oversee user accounts, generate reports, and disseminate information. The solution directly addresses the problem by replacing manual processes with automated digital workflows, creating a single source of truth for data, and providing a unified, integrated platform for interaction and resource sharing.

## Project Goals, Objectives, and Deliverables

### Goal 1: Streamline Administrative and Academic Processes for Tacloban ALS
**Description:**
This goal focuses on replacing manual, paper-based administrative tasks with automated digital workflows to improve efficiency, reduce errors, and save time for teachers and administrators.

**Objective 1.1: Digitize Student and Teacher Registration and Profile Management**
*   **Description:** Develop a secure online registration system where learners and teachers can create and manage their profiles, replacing paper forms.
*   **Measurement Criteria:**
    *   Reduction in registration processing time from an average of 3 days to less than 1 day.
    *   100% of registered users have digital profiles accessible to authorized personnel.
    *   Successful migration of at least 50 existing learner records (dummy data) into the system during testing.

**Objective 1.2: Automate Tracking of Learner Progress and Module Completion**
*   **Description:** Implement a digital progress tracking dashboard where teachers can log completion of modules, assessments, and milestones, and learners can view their own progress.
*   **Measurement Criteria:**
    *   Teachers can update a learner’s progress in under 2 minutes per entry.
    *   System generates accurate progress reports for each learner, reflecting updated completion status.
    *   At least 90% of test users (teachers) confirm the system is easier than manual tracking methods.

**Deliverables for Goal 1:**
*   **D1.1: User Registration & Profile Management Module**
    *   A fully functional module allowing sign-up, login, role-based access (Student, Teacher, Admin), and editable user profiles.
*   **D1.2: Digital Progress Tracking Dashboard**
    *   An interactive dashboard for teachers to input and monitor learner progress, and for learners to view their completion status and certificates.
*   **D1.3: Admin Panel for User Management**
    *   A backend interface for administrators to approve registrations, manage accounts, and oversee system users.

### Goal 2: Enhance Accessibility and Organization of Learning Resources
**Description:**
This goal aims to centralize ALS learning materials into a searchable, categorized digital repository, making resources easier to find, update, and distribute.

**Objective 2.1: Create a Centralized, Role-Based Digital Library for Learning Modules**
*   **Description:** Develop a module library where admins and teachers can upload, categorize, and update learning materials (PDFs, videos, links) accessible based on user roles.
*   **Measurement Criteria:**
    *   Users can find a resource using search/filter functions within 3 clicks.
    *   100% of uploaded resources are tagged with metadata (subject, level, type).

**Objective 2.2: Ensure Platform Responsiveness for Low-Bandwidth and Mobile Access**
*   **Description:** Design and develop the portal to be lightweight, mobile-responsive, and functional in low-internet scenarios.
*   **Measurement Criteria:**
    *   Portal achieves a Lighthouse performance score of ≥80 on mobile.
    *   Core pages load within 3 seconds on a 3G connection.
    *   Successful usability test with at least 5 users on mobile devices.

**Deliverables for Goal 2:**
*   **D2.1: Digital Learning Resource Repository**
    *   A searchable, categorized file library where teachers/admins can upload, tag, and manage learning materials (PDFs, videos, links).
*   **D2.2: Mobile-Responsive Interface Design**
    *   A lightweight, responsive UI that functions smoothly on mobile devices and low-bandwidth connections.

### Goal 3: Improve Communication and Engagement Among ALS Stakeholders
**Description:**
To foster a stronger ALS community by providing reliable, structured communication channels between learners, teachers, and administrators.

**Objective 3.1: Implement a System for Official Announcements and Notifications**
*   **Description:** Build an announcement board and automated notification system (in-app and email/SMS) for important updates.
*   **Measurement Criteria:**
    *   Notifications are delivered within 5 minutes of posting.
    *   95% of test users receive and acknowledge a test announcement.
    *   Admins can schedule and target announcements to specific user groups.

**Objective 3.2: Provide a Platform for Asynchronous Discussion and Support**
*   **Description:** Develop a simple forum or Q&A board where learners can ask questions and teachers can provide answers.
*   **Measurement Criteria:**
    *   At least 20 discussion threads created during user acceptance testing (UAT).
    *   Average response time by teachers in the forum is under 24 hours during simulation.
    *   Users rate the communication feature ≥4 out of 5 in post-test surveys.

**Deliverables for Goal 3:**
*   **D3.1: Announcement & Notification System**
    *   A dedicated announcement panel with push notifications and email/SMS integration.
*   **D3.2: Community Forum Module**
    *   A threaded discussion board with categories, posting, and moderation features.

### Goal 4: Deliver a Fully Documented, Deployable, and Sustainable System
**Description:**
To produce not only a working software product but also complete documentation to ensure the project’s usability, maintainability, and sustainability beyond the capstone timeline.

**Objective 4.1: Develop a Stable, Tested, and Deployed Web Application**
*   **Description:** Successfully code, test, and deploy the portal to a live server accessible to end-users.
*   **Measurement Criteria:**
    *   Portal passes all unit, integration, and user acceptance tests with ≥90% success rate.
    *   Zero critical bugs at the time of deployment.
    *   System uptime of ≥99% during the demonstration period.

**Objective 4.2: Provide Comprehensive Project and System Documentation**
*   **Description:** Create clear, detailed documentation for users, administrators, and future developers.
*   **Measurement Criteria:**
    *   All documentation is reviewed and approved by the capstone adviser.
    *   User manual includes step-by-step instructions with screenshots for all major features.
    *   Technical documentation includes setup guide, database schema, and API references (if applicable).

**Deliverables for Goal 4:**
*   **D4.1: Deployed Live Web Portal**
    *   Fully functional system hosted on a reliable server (e.g., Heroku, AWS, or a local hosting solution).
*   **D4.2: Technical Documentation**
    *   Developer guide, system architecture overview, database documentation, and deployment instructions.
*   **D4.3: User Manual & Training Materials**
    *   End-user guide for students and teachers, plus slide deck for training sessions.
*   **D4.4: Final Capstone Project Report**
    *   Comprehensive written report detailing the project's development, challenges, outcomes, and recommendations.

---

## Implementation Phases

### Phase 1: Foundation & Digital Identity (Obj 1.1)
- [x] Set up role system (Admin, Teacher, Student) in database
- [x] Update User model with role helpers
- [x] Customize registration to include role selection
- [x] Build role-aware sidebar navigation
- [x] Create role-based dashboard pages
- [x] Set up role-based routing & middleware
- [x] Brand the app (ALS Connect Tacloban logo/name)

### Phase 2: Admin Panel & User Management (D1.3)
- [x] Admin dashboard with system overview stats
- [x] User CRUD management (approve, edit, disable accounts)
- [x] Bulk user import/export
- [x] System settings (school year, terms)

### Phase 3: Digital Library & Resource Management (Goal 2)
- [x] Module/Resource data models & migrations
- [x] File upload system (PDFs, videos, links)
- [x] Categorization by subject, level, type
- [x] Search & filter interface
- [x] Mobile-optimized resource viewer

### Phase 4: Progress Tracking System (Obj 1.2)
- [x] Assessment & Progress data models
- [x] Teacher gradebook interface
- [x] Student progress visualization
- [x] PDF progress report generation

### Phase 5: Communication Hub (Goal 3)
- [x] Announcement system with targeting
- [x] In-app notification system
- [x] Community forum / Q&A threads
- [x] Email notification integration

### Phase 6: QA, Deployment & Documentation (Goal 4)
- [x] Automated test suite (unit + feature)
- [x] Mobile Lighthouse audit (≥80)
- [x] User manual with screenshots
- [x] Technical documentation
- [x] Production deployment

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Laravel 12 |
| Frontend | React 19 + TypeScript |
| SSR Bridge | Inertia.js v2 |
| Auth | Laravel Fortify (headless) |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI / shadcn |
| Route Typing | Wayfinder |
| Database | MySQL / SQLite |

## Progress Log
- [x] Create Project Tracker
- [x] Fill in Proposal Overview
- [x] Fill in Problem Summary
- [x] Fill in IT Solution
- [x] Fill in Project Goals, Objectives, and Deliverables
- [x] Phase 1: Foundation & Digital Identity — role system, registration, sidebar, dashboards, middleware, branding
- [x] Phase 2: Admin Panel & User Management — stats dashboard, user CRUD, bulk import/export, system settings
- [x] Phase 3: Digital Library & Resource Management — models, file upload, categorization, search/filter, mobile viewer
- [x] Phase 4: Progress Tracking System — assessment models, teacher gradebook, student progress viz, PDF reports
- [x] Phase 5: Communication Hub — announcements with audience targeting, in-app notifications with polling bell, forum with categories/threads/replies/moderation, email notifications via Laravel Mail
- [x] Add Implementation Phases & Tech Stack
- [x] Phase 1: Foundation & Digital Identity
- [x] Phase 2: Admin Panel & User Management (core CRUD)
- [x] Phase 3: Digital Library & Resource Management
- [x] Phase 2: Bulk import/export & System settings (completed)
- [x] Phase 4: Progress Tracking System
- [x] Phase 6: QA, Deployment & Documentation — 167 tests (31 unit + 136 feature, 658 assertions, 100% pass), technical docs (architecture, DB schema, API reference, deployment guide), user manual (student/teacher/admin guides), production config (.env.production.example, deploy.sh, Nginx config)
