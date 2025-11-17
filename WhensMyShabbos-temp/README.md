# When's My Shabbos? 🕯️

A beautiful, interactive map application that helps you find Shabbos candle lighting times for any location in the world.

## Features

- 🗺️ Interactive map powered by MapTiler SDK
- 📍 Automatic location detection
- 🕯️ Displays candle lighting and Havdalah times
- 📖 Shows the weekly Torah portion (Parsha)
- 🖱️ Click anywhere on the map to get times for that location
- 📱 Fully responsive design

## Setup

### Prerequisites

- A MapTiler API key (free tier available)
- A modern web browser with location services enabled

### Getting Your MapTiler API Key

1. Go to [MapTiler Cloud](https://cloud.maptiler.com/)
2. Sign up for a free account
3. Navigate to your account dashboard
4. Copy your API key

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/greasemonkey-dev/WhensMyShabbos.git
   cd WhensMyShabbos
   ```

2. Open `main.js` in a text editor

3. Replace `YOUR_MAPTILER_API_KEY_HERE` with your actual MapTiler API key:
   ```javascript
   const MAPTILER_API_KEY = 'your-actual-api-key-here';
   ```

4. Start a local web server:
   ```bash
   npm start
   ```
   Or use Python:
   ```bash
   python3 -m http.server 8000
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

1. When you first open the app, it will request permission to access your location
2. Once granted, the map will center on your location and display the upcoming Shabbos times
3. Click anywhere on the map to get Shabbos times for that location
4. The info panel shows:
   - Candle lighting time
   - Havdalah time
   - Weekly Parsha
   - The date of Shabbos

## Technologies Used

- **MapTiler SDK** - For the interactive map interface
- **HebCal API** - For accurate Shabbos times and Jewish calendar data
- **Vanilla JavaScript** - No frameworks, just pure JS
- **Modern CSS** - Responsive design with gradients and animations

## API Credits

- Map tiles and geocoding by [MapTiler](https://www.maptiler.com/)
- Jewish calendar data from [HebCal](https://www.hebcal.com/)

## License

MIT
