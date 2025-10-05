# SafeHerHub - Women's Safety Platform

A comprehensive Women's Safety Website built with the MERN stack, featuring innovative safety tools, community support, and real-time protection mechanisms.

## 🌟 Features

### Core Safety Features

- **Whisper Alert Chain**: Silent location sharing with trusted contacts that auto-escalates if no response
- **Shadow Report Vault**: Anonymous encrypted vault for logging incidents with voice-to-text transcription
- **Echo Forum Threads**: Community support with AI-powered similar story suggestions for empathy
- **Pulse Check Scheduler**: Random safety check-ins with gamified streaks and community heatmaps
- **Guardian Profile Sync**: Sync safety settings with loved ones using affirmation locks for security
- **Community Pulse**: Real-time neighborhood safety insights from opted-in community members

### Additional Features

- **Emergency Quick Actions**: One-tap emergency features for immediate safety response
- **Safety Route Planner**: AI-powered route planning with safety considerations
- **Incident Reporting**: Anonymous and public incident reporting with pattern analysis
- **Community Forum**: Threaded discussions with moderation and echo replies
- **Safety Streaks**: Gamified safety check-ins with badges and achievements
- **Real-time Alerts**: Socket.io powered real-time notifications and alerts

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

### Frontend
- **React.js** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **React Query** for data fetching
- **Socket.io Client** for real-time features

### Additional Tools
- **Google Maps API** for location services
- **Speech Recognition API** for voice-to-text
- **PWA** capabilities for mobile-like experience

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/safeherhub.git
   cd safeherhub
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables
   cp server/env.example server/.env
   
   # Edit .env with your configuration
   nano server/.env
   ```

4. **Configure Environment Variables**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/safeherhub
   JWT_SECRET=your_jwt_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=http://localhost:3000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev

   # Or run separately:
   # Backend only
   npm run server

   # Frontend only  
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 PWA Features

The application is built as a Progressive Web App (PWA) with:
- Offline capabilities
- Mobile-first responsive design
- Push notifications
- App-like experience on mobile devices

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers
- Encrypted data storage for sensitive information

## 🌍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/verify` - Token verification

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/emergency-contacts` - Add emergency contact
- `GET /api/users/safety-streak` - Get safety streak

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports/my-reports` - Get user reports
- `GET /api/reports/public` - Get public reports
- `GET /api/reports/heatmap/data` - Get heatmap data

### Forums
- `POST /api/forums` - Create forum post
- `GET /api/forums` - Get forum posts
- `POST /api/forums/:id/threads` - Create thread
- `GET /api/forums/search` - Search forums

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts/my-alerts` - Get user alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/alerts/whisper-chain` - Create whisper chain

### Guardians
- `POST /api/guardians` - Add guardian
- `GET /api/guardians` - Get guardians
- `POST /api/guardians/:id/affirmation-lock` - Set affirmation lock
- `POST /api/guardians/:id/sync-ritual` - Create sync ritual

### Pulse
- `POST /api/pulse` - Create pulse check
- `GET /api/pulse/my-pulses` - Get user pulses
- `GET /api/pulse/community-pulse` - Get community pulse
- `POST /api/pulse/schedule` - Create pulse schedule

## 🗄️ Database Schema

### Users
- Personal information and preferences
- Emergency contacts
- Safety settings
- Whisper chain configuration
- Safety streak and badges

### Reports
- Incident reports with location data
- Voice transcriptions
- Pattern analysis
- Moderation status

### Forums
- Threaded discussions
- Echo replies and suggestions
- Community insights
- Moderation tools

### Alerts
- Real-time alerts and notifications
- Escalation chains
- Response tracking
- Performance metrics

### Guardians
- Guardian relationships
- Affirmation locks
- Sync rituals
- Response metrics

### Pulse
- Safety check-ins
- Community pulse data
- Heatmap information
- Streak tracking

## 🎨 UI/UX Features

- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion integration
- **Accessibility**: WCAG compliant design
- **Intuitive Navigation**: Clear user flow
- **Real-time Updates**: Live data synchronization

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t safeherhub .

# Run container
docker run -p 5000:5000 safeherhub
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set up SSL certificates
- Configure email service
- Set up Google OAuth credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Women's safety organizations for inspiration
- Open source community for tools and libraries
- Beta testers and community feedback
- Security experts for safety recommendations

## 📞 Support

For support, email support@safeherhub.com or join our community forum.

## 🔒 Privacy & Safety

- All user data is encrypted and secure
- Anonymous reporting options available
- No tracking or data selling
- GDPR compliant
- Regular security audits

---

**SafeHerHub** - Empowering women with comprehensive safety tools and community support. Stay safe, stay connected, stay empowered. 💪