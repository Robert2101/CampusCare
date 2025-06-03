# CampusCare

## Short Description
CampusCare is a web-based platform designed to connect students with mentors for mental health support, peer guidance, and emergency assistance. The application enables students to reach out anonymously, book appointments, and receive immediate help from available mentors, fostering a supportive campus environment.

## Features
- **Student & Mentor Dashboards:** Personalized dashboards for both students and mentors to manage conversations and appointments.
- **Anonymous Chat:** Students can chat with mentors anonymously for confidential support.
- **Appointment Booking:** Students can schedule regular or emergency appointments with mentors.
- **Emergency Support:** Immediate connection to mentors in urgent situations.
- **Mentor Management:** Mentors can view, accept, or decline appointments and manage emergency requests.
- **24/7 Peer Support:** Continuous access to help and resources.
- **Responsive UI:** User-friendly design optimized for different devices.

## Installation Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Robert2101/CampusCare.git
   cd CampusCare
   ```

2. **Install dependencies for the frontend:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install dependencies for the backend:**  
   *(Assuming a `backend` directory exists; update if needed)*
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables:**  
   - Create `.env` files in both `frontend` and `backend` directories as needed.
   - Add necessary variables (API URLs, keys, etc.).

5. **Start the backend server:**
   ```bash
   
   npm run dev
   ```

6. **Start the frontend app:**
   ```bash
   cd ../frontend
   npm run dev
   ```

7. Access the app at `http://localhost:5173`.

## Usage

### Student
- **Dashboard:** Browse available mentors and book appointments.
- **Chat:** Initiate anonymous chats with mentors.
- **Emergency:** Use the Emergency Support feature for immediate help.

### Mentor
- **Dashboard:** View student conversations and manage appointments.
- **Chat:** Respond to student queries.
- **Emergency:** Accept or decline urgent appointment requests.

#### Example: Starting an Anonymous Chat (Frontend Logic)
```javascript
// Start an anonymous chat with a mentor
const startChat = (mentorId) => {
  navigate(`/chat/${mentorId}`);
};
```
#### Example: Booking an Appointment (Frontend Logic)
```javascript
// Book an appointment with a mentor (pseudocode)
const handleBookAppointmentClick = (mentor) => {
  setSelectedMentor(mentor);
  setIsModalOpen(true);
};
```

## Technologies Used

- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js (assumed from API usage)
- **API:** RESTful endpoints (Axios for HTTP requests)
- **Authentication:** JWT token-based authentication
- **State Management:** React Context API, useState, useEffect
- **Database:** (Not explicitly found; likely MongoDB or similar – update if known)
- **Other:** SVG Icons, Google Fonts, modular components

## Contributing Guidelines

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with clear messages.
4. Push to your branch and open a Pull Request.
5. Ensure your code follows the style and passes all tests.

*If a `CONTRIBUTING.md` file exists, please review it for more information.*

## License

This project is licensed under the MIT License.  
*If a LICENSE file is present, please refer to it for details. Otherwise, update this section with your project's license information.*

