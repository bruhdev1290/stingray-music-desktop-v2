# Stingray Music Desktop Client

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)

A desktop music streaming client application built with Vue.js and Laravel, designed to connect with Stingray Music services.

## Introduction

**Stingray Music Desktop Client** is a modern desktop application for streaming and managing your music library. Built with Vue.js on the frontend and Laravel on the backend, this application provides a seamless music streaming experience across Windows and Linux platforms.

## Features

- 🎵 Music streaming and playback
- 📁 Local media library management
- 🎨 Modern, responsive user interface
- 🔐 User authentication and profiles
- 📻 Radio station support
- 🎙️ Podcast support
- 🎨 Customizable themes
- 🔍 Advanced search functionality
- 📱 Remote control support
- ☁️ Cloud storage integration (local, SFTP, S3, Dropbox)

## Screenshots

_Screenshots will be added here showing the application interface and key features._

## System Requirements

### Windows
- Windows 10 or later
- PHP 8.2 or higher
- MySQL 5.7+ / MariaDB 10.3+ / PostgreSQL 9.6+ / SQL Server 2017+
- Node.js 18+ and pnpm
- Composer

### Linux
- Modern Linux distribution (Ubuntu 20.04+, Debian 11+, Fedora 35+, etc.)
- PHP 8.2 or higher
- MySQL 5.7+ / MariaDB 10.3+ / PostgreSQL 9.6+ / SQL Server 2017+
- Node.js 18+ and pnpm
- Composer

### Required PHP Extensions
- exif
- gd
- fileinfo
- json
- SimpleXML
- zip (optional, for downloading multiple songs)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/bruhdev1290/stingray-music-desktop-v2.git
cd stingray-music-desktop-v2
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
pnpm install
```

### 4. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure your database connection and other settings:

```env
APP_NAME="Stingray Music"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stingray_music
DB_USERNAME=your_username
DB_PASSWORD=your_password
MEDIA_PATH=/path/to/your/media
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Database Setup

Run database migrations:

```bash
php artisan migrate
```

### 7. Initialize the Application

```bash
composer koel:init
```

This will set up the initial admin user and perform other initialization tasks.

## Build and Deployment

### Development Build

To run the application in development mode with hot module replacement:

```bash
composer dev
```

This will start:
- Laravel development server (http://localhost:8000)
- Queue worker for background jobs
- Vite development server with HMR

Access the application at `http://localhost:8000`

### Production Build

#### 1. Build Frontend Assets

```bash
pnpm build
```

This compiles and minifies the Vue.js frontend for production.

#### 2. Optimize Backend

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 3. Deploy to Production Server

For production deployment:

1. Copy all files to your production server
2. Configure your web server (Apache/Nginx) to point to the `public` directory
3. Set up proper file permissions:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```
4. Set up a process manager (like Supervisor) for the queue worker:
   ```bash
   php artisan queue:work --tries=3
   ```
5. Set up a cron job for scheduled tasks:
   ```cron
   * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
   ```

### Windows Deployment

For Windows systems:

1. Install PHP, MySQL/MariaDB, and Composer
2. Install Node.js and pnpm
3. Follow the installation steps above
4. Use a web server like XAMPP or configure IIS
5. Set up Windows Task Scheduler for cron jobs
6. Use NSSM or similar tool to run the queue worker as a service

### Linux Deployment

For Linux systems:

1. Install required packages:
   ```bash
   sudo apt-get update
   sudo apt-get install php8.2 php8.2-{cli,common,curl,gd,mysql,xml,mbstring,zip} \
       mysql-server composer nodejs npm
   ```
2. Install pnpm:
   ```bash
   npm install -g pnpm
   ```
3. Follow the installation steps above
4. Configure Nginx or Apache (example Nginx config is in `nginx.conf.example`)
5. Set up systemd services for the queue worker
6. Configure cron jobs for scheduled tasks

## Configuration

### Media Library

Configure your media library path in `.env`:

```env
MEDIA_PATH=/path/to/your/music
```

You can also configure this through the web interface in Settings > Media.

### Storage Drivers

The application supports multiple storage drivers:

- **local**: Store files on local filesystem
- **sftp**: Store files on remote SFTP server
- **s3**: Store files on Amazon S3 or compatible services
- **dropbox**: Store files on Dropbox

Configure the storage driver in `.env`:

```env
STORAGE_DRIVER=local
```

### Database Options

Supported databases:
- MySQL/MariaDB (default)
- PostgreSQL
- Microsoft SQL Server
- SQLite

Change `DB_CONNECTION` in `.env` to use a different database.

## Usage

### First Time Setup

1. Navigate to `http://localhost:8000` (or your configured URL)
2. Log in with the admin credentials created during initialization
3. Go to Settings to configure your media library
4. Scan your media files
5. Start enjoying your music!

### Managing Users

Admins can:
- Create new user accounts
- Invite users via email
- Manage user permissions
- View user activity

### Creating Playlists

- Click "Create Playlist" in the sidebar
- Add songs by dragging them to playlists
- Create smart playlists with automatic rules
- Share playlists with other users

### Radio Stations

Add internet radio stations:
1. Go to Radio section
2. Click "Add Station"
3. Enter station URL and details
4. Start streaming

## Development

### Running Tests

```bash
# Frontend unit tests
pnpm test

# Backend tests
composer test

# E2E tests
pnpm test:e2e
```

### Code Quality

```bash
# Lint JavaScript/TypeScript/Vue
pnpm lint
pnpm lint:fix

# Lint PHP
composer cs
composer cs:fix

# Static analysis
composer analyze
```

### Project Structure

```
stingray-music-desktop-v2/
├── app/                    # Laravel application code
├── bootstrap/              # Laravel bootstrap files
├── config/                 # Configuration files
├── database/               # Database migrations and seeders
├── public/                 # Web root directory
├── resources/
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   └── js/            # Vue.js application
│   └── views/             # Blade templates
├── routes/                 # Application routes
├── storage/                # Application storage
├── tests/                  # Test files
└── vendor/                 # Composer dependencies
```

## Stingray Music Integration

This application includes integration capabilities for Stingray Music services. Configuration for Stingray Music connectivity can be added through the settings interface or via environment variables.

_Note: Actual Stingray Music API integration requires proper API credentials and will be configured based on your Stingray Music service subscription._

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify database credentials in `.env`
- Ensure database server is running
- Check database user has proper permissions

**Permission Errors**
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache  # Linux
```

**Media Not Scanning**
- Verify MEDIA_PATH is correct and accessible
- Check file permissions on media directory
- Ensure PHP has read access to media files

**Frontend Not Loading**
- Run `pnpm build` to rebuild assets
- Clear browser cache
- Check browser console for errors

### Getting Help

If you encounter issues:
1. Check the [Issues](https://github.com/bruhdev1290/stingray-music-desktop-v2/issues) page
2. Search existing issues for solutions
3. Create a new issue with detailed information

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Run linters before committing

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

This project was originally based on Koel, adapted and rebranded for Stingray Music integration.

## Support

For support and questions:
- Open an [issue](https://github.com/bruhdev1290/stingray-music-desktop-v2/issues)
- Check existing documentation
- Review troubleshooting section

---

Made with ❤️ for music lovers
