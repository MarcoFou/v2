# Overview

This is a URL shortener microservice API built with Node.js and Express. The application allows users to submit long URLs and receive shortened versions that redirect to the original URLs. It's designed as a freeCodeCamp API project and provides both a web interface and REST API endpoints for URL shortening functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **Express.js**: Chosen as the web framework for its simplicity and extensive middleware ecosystem
- **Node.js 12.18.3**: Specific version pinned for consistency across environments
- **RESTful API design**: Single POST endpoint `/api/shorturl/new` for creating short URLs

## Database Layer
- **MongoDB with Mongoose**: Selected for document-based storage of URL mappings
- **Simple schema design**: Stores original URL and generated short URL pairs
- **Connection handling**: Includes error handling that allows server to continue running even if database is unavailable

## URL Processing
- **ShortID library**: Generates unique short identifiers for URLs
- **Valid-url library**: Validates incoming URLs to ensure they are properly formatted web URIs
- **Error handling**: Returns JSON error responses for invalid URLs

## Frontend Interface
- **Static HTML/CSS**: Simple web form for user interaction
- **No JavaScript framework**: Minimal approach using standard HTML forms
- **Responsive design**: Custom CSS with imported Google Fonts for styling

## Middleware Stack
- **CORS**: Enables cross-origin requests
- **Body-parser**: Handles URL-encoded form data
- **Static file serving**: Serves CSS and HTML assets from public and views directories

## Development Tools
- **ESLint**: Code quality enforcement with Airbnb-style configuration
- **Environment variables**: Uses dotenv for configuration management
- **Prettier**: Code formatting consistency

# External Dependencies

## Database
- **MongoDB**: Primary data storage for URL mappings via MONGO_URI environment variable

## NPM Packages
- **express**: Web application framework
- **mongoose**: MongoDB object modeling library
- **shortid**: Unique ID generator for shortened URLs
- **valid-url**: URL validation utility
- **cors**: Cross-origin resource sharing middleware
- **body-parser**: Request body parsing middleware
- **dotenv**: Environment variable management

## Development Dependencies
- **ESLint ecosystem**: Multiple plugins for code quality (Airbnb config, TypeScript, React, etc.)
- **Prettier**: Code formatting tool
- **Babel ESLint**: JavaScript parsing for older syntax support

## External Services
- **Google Fonts**: Russo One font family imported via CDN
- **MongoDB Atlas/Self-hosted**: Database connection via environment variable configuration