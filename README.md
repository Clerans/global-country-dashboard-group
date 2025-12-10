
# 🌍 Global Country Insights Dashboard

A modern neon-themed dashboard that allows users to explore countries worldwide with real-time data on:

✔ General Information (Capital, Population, Currency, Flag)  
✔ Live Weather conditions  
✔ COVID-19 statistics  
✔ Google Account login  
✔ Save researched results into MongoDB securely  

This system is created as the **SOC Mini Project - Year 3**.

---

## 🚀 Technologies Used

| Layer | Technology |
|------|------------|
| Frontend | HTML, CSS, JavaScript |
| UI Theme | Neon / Dark Theme |
| Authentication | Google Identity Services (OAuth 2.0) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ORM) |
| APIs | RestCountries, OpenWeatherMap, Disease.sh |

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| Country Search | Fetches detailed insights based on user input |
| Weather Module | Fetches live weather data using coordinates |
| COVID-19 Data | Visual & structured pandemic stats |
| Secure Login | Only authenticated users can save data |
| Save Results | Stores user-selected insights into database |
| Responsive UI | Works smoothly on PC & Mobile |

---

## 🏛 System Architecture

User Browser (Client)  
⇩  
Node.js + Express Server  
⇩  
MongoDB Atlas Database  

---

## 📷 Screenshots

screenshots inside this folder path:
```
Screenshots/
  Home-UI.PNG
  Results-UI.PNG
```

---

## 📂 Folder Structure

```
GLOBAL-COUNTRY-DASHBOARD-GROUP/
│
├── client/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── Screenshots/
│   ├── Home-UI.PNG
│   └── Results-UI.PNG
│
├── server/
│   ├── controllers/
│   │   └── saveController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── CountryInsight.js
│   ├── routes/
│   │   └── api.js
│   ├── node_modules/
│   ├── server.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md

```

---

## 🔧 Setup & Installation

### 1️⃣ Install Server Dependencies
```sh
cd server
npm install
```

### 2️⃣ Setup Environment Variables
Create a `.env` file inside server/

```
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
API_KEY=SL_PROJECT_2025_SOC
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### 3️⃣ Start Backend Server
```sh
npm start


### 4️⃣ Run UI
Open the file below using Live Server:

client/index.html

### 5️⃣ Add Your OpenWeatherMap API Key
Edit:
```
client/script.js
```

Add:
```javascript
const WEATHER_API_KEY = "YOUR_OPEN_WEATHERMAP_API_KEY";
```

Ensure your fetch call includes:
```javascript
fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${WEATHER_API_KEY}`)
```

---

## 🔑 Authentication Headers


Authorization: Bearer <Google_ID_Token>
x-api-key: SL_PROJECT_2025_SOC


---

## 🌐 Third-Party APIs

| Service | Used For |
|--------|----------|
| RestCountries | Country core details |
| OpenWeatherMap | Live weather temperature & humidity |
| Disease.sh API | COVID-19 statistics |

---

## 👨‍💻 Project Team

| Name | Role |
|------|------|
| Michael Clerans | Team Lead / Full Stack Developer |
| AVSanju | Contributor |
| Sivabalan Jineshini | Contributor |
| Dhanushan Yogamoorthy | Contributor |

---

## 📌 Repository Access

Add repo link here:
```
https://github.com/your-repository-url
```

---

## 📜 License

This project is for educational purposes only.

---

### ⭐ Show some love — Star the repo!
