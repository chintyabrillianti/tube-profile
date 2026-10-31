
# Stage 1: Build Laravel Vite assets
FROM node:24-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: Laravel PHP + Apache
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_pgsql \
    mbstring \
    curl \
    zip \
    opcache

# Enable Apache rewrite and configure Laravel public directory
RUN a2enmod rewrite \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' \
       /etc/apache2/sites-available/000-default.conf \
       /etc/apache2/apache2.conf \
    && sed -ri 's/AllowOverride None/AllowOverride All/g' \
       /etc/apache2/apache2.conf \
    && sed -ri 's/Listen 80/Listen 8080/' \
       /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' \
       /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install production dependencies
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader

# Copy Laravel application
COPY . .

# Copy compiled Vite assets
COPY --from=frontend-build /app/public/build ./public/build

# Generate optimized autoload and discover packages
RUN composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan package:discover --ansi

# Set Laravel permissions
RUN mkdir -p storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

ENV PORT=8080

EXPOSE 8080
