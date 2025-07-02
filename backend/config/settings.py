from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-l=xm*%#1195(fokhf8hjcbop##rsge5!)(z3#i_=@=tnlu0uce'

DEBUG = True

# Allow all hosts for VS Code port forwarding & development
ALLOWED_HOSTS = ['*']  # <- Corrected from [*] to ['*']

# Media configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB

# CORS configuration - Comprehensive setup for login and API access
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development
CORS_ALLOW_CREDENTIALS = True  # Required for authentication

# Specific allowed origins (backup if CORS_ALLOW_ALL_ORIGINS is disabled)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Common Vite port
    "http://127.0.0.1:5173",
    "http://13.204.66.176:5174",
    "http://172.31.8.148:5174",
]

# Allow all headers that might be needed for authentication and API calls
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-allow-origin',
    'access-control-allow-credentials',
    'access-control-allow-headers',
    'access-control-allow-methods',
    'cache-control',
    'pragma',
    'expires',
    'last-modified',
    'if-modified-since',
]

# Allow all HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
    'HEAD',
]

# Additional CORS settings for better compatibility
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours
CORS_EXPOSE_HEADERS = [
    'access-control-allow-origin',
    'access-control-allow-credentials',
]

# Disable CSRF for API endpoints (since we're using JWT)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://13.204.66.176:5174",
    "http://172.31.8.148:5174",
]

INSTALLED_APPS = [
    'rest_framework_simplejwt',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',  # keep this here
    'django_filters',  # Add django-filters for accounting filtering
    # your apps
    'services',
    'hr',
    'drivers',
    'code',
    'accounts_module',
    'vehicle',
    'logs',
    'usermanagement',
    'company',
    'accounting',  # Add the new accounting app
]
# settings.py
AUTH_USER_MODEL = 'usermanagement.CustomUser'



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Disabled for API-only backend with JWT
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # You can set template dirs here
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# PostgreSQL Database Config (update user/password if needed)
#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.postgresql',
#       'NAME': 'hr_management_db',
#        'USER': 'admin',
#        'PASSWORD': 'admin@vellore',
#        'HOST': 'localhost',
#        'PORT': '5432',
#    }
#}
import os   


DATABASES = {
     'default': {
         'ENGINE': 'django.db.backends.postgresql',
         'NAME': os.getenv('DATABASE_NAME', 'hr_management_db'),
         'USER': os.getenv('DATABASE_USER', 'admin'),
         'PASSWORD': os.getenv('DATABASE_PASSWORD', 'admin@vellore'),
         'HOST': os.getenv('DATABASE_HOST', 'localhost'),
         'PORT': os.getenv('DATABASE_PORT', '5432'),
     }
 }


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

ALLOWED_HOSTS = ['*']
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}



# AUTHENTICATION_BACKENDS = [
#     'usermanagement.backends.EmailBackend',
#     'django.contrib.auth.backends.ModelBackend',
# ]
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]


# settings.py
import os

# ... other settings

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# your_project/settings.py

CORS_ALLOW_CREDENTIALS = True
