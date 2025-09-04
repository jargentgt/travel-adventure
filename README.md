# Jarvis Trip - Itinerary Website Generator

A beautiful Next.js application that converts your CSV/Excel itinerary files into stunning, interactive travel websites using FlyonUI components.

## ✨ Features

- 🎨 **Beautiful UI** - Built with FlyonUI and Tailwind CSS
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark/Light Theme** - Toggle between themes
- 🎨 **Custom Colors** - Choose from multiple accent colors
- 📁 **File Upload** - Drag & drop CSV/XLSX files
- 📊 **Excel & CSV Support** - Parse both file formats
- ⚡ **Timeline View** - Interactive day-by-day timeline
- 🏷️ **Smart Icons** - Auto-detect activity types
- 🌧️ **Rain Plan Support** - Separate rain day activities
- 💾 **HTML Export** - Download complete HTML websites

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 2. Run Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm  
pnpm dev
```

### 3. Open Your Browser

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📦 What's Included

### Dependencies
- **Next.js 14** - React framework
- **FlyonUI** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **PapaParse** - CSV parsing library
- **XLSX** - Excel file parsing library
- **TypeScript** - Type safety

### Project Structure

```
jarvis-trip/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles with FlyonUI
│   │   ├── layout.tsx       # Root layout with themes
│   │   └── page.tsx         # Main page
│   └── components/
│       └── ItineraryGenerator.tsx  # Main component
├── public/
│   └── flyonui.js          # FlyonUI JavaScript
├── tailwind.config.js      # Tailwind + FlyonUI config
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies
```

## 🎯 Usage

### 1. Upload Files
- Drag & drop CSV or XLSX files
- Or click to browse and select files
- Files should contain columns: 來源日曆, 日期, 開始時間, 結束時間, 活動摘要, 地點, 描述/備註

### 2. Customize
- Enter a trip title
- Choose light or dark theme
- Select an accent color

### 3. Generate
- Click "Preview Itinerary" to generate
- View the beautiful timeline
- Click "Download HTML" to save

### 4. Share
- The downloaded HTML file is completely standalone
- Share it directly or host it anywhere
- All styles and functionality included

## 📊 File Format

Your CSV/XLSX files should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| 來源日曆 | Calendar source | "Main" or "Rain Plan" |
| 日期 | Date | "2025-03-15" |
| 開始時間 | Start time | "09:00" |
| 結束時間 | End time | "10:30" |
| 活動摘要 | Activity title | "Visit Tokyo Tower" |
| 地點 | Location | "Tokyo Tower, Japan" |
| 描述/備註 | Description/Notes | "Bring camera for photos" |

## 🎨 Customization

### Themes
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes
- **More themes**: Available in FlyonUI config

### Colors
Choose from 5 beautiful accent colors:
- 🟠 Orange (#F6AD55)
- 🔵 Blue (#63B3ED) 
- 🟢 Green (#48BB78)
- 🩷 Pink (#ED64A6)
- 🟣 Purple (#9F7AEA)

### Icons
Smart auto-detection for:
- ✈️ Flights (飛)
- 🍽️ Meals (早餐, 午餐, 晚餐)
- 🚗 Transportation (車, 租車)
- 🏨 Hotels (酒店, 入住)
- 🛍️ Shopping (購物, 市場)
- 📸 Photo spots (拍照)
- 🎯 Activities (樂園, 博物館, etc.)

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Adding New Features

1. **New Activity Icons**: Add to `KEYWORD_ICON_MAP` and `ICON_SVG_STRINGS`
2. **New Themes**: Update `tailwind.config.js` flyonui themes
3. **New File Formats**: Extend parsing logic in component

### FlyonUI Components Used

- `card` - Main container
- `form-control` - Form inputs  
- `input` - Text inputs
- `radio` - Theme selection
- `badge` - File indicators
- `btn` - Action buttons
- `alert` - Feedback messages
- `timeline` - Day schedules
- `collapse` - Expandable details
- `tabs` - Day navigation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FlyonUI](https://flyonui.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Next.js](https://nextjs.org/) - React framework
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [SheetJS](https://sheetjs.com/) - Excel parsing

---

**Built with ❤️ by Jarvis Chan**

For support or questions, please open an issue on GitHub. 