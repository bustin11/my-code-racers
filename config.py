import os 

class BaseConfig(object):
    """Base configuration."""

    # main config
    SECRET_KEY = 'my_precious'
    SECURITY_PASSWORD_SALT = 'my_precious_two'
    DEBUG = False
    BCRYPT_LOG_ROUNDS = 13
    WTF_CSRF_ENABLED = True
    DEBUG_TB_ENABLED = False
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    # mail settings
    MAIL_SERVER = 'smtp.gmail.com' # 'smtp.googlemail.com'
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True

    # gmail authentication
    MAIL_USERNAME = os.environ['APP_MAIL_USERNAME']
    MAIL_PASSWORD = os.environ['APP_MAIL_PASSWORD'] # yjxxwxhldtjuyouk


    # mail accounts
    MAIL_DEFAULT_SENDER = MAIL_USERNAME

    JWT_ACCESS_LIFESPAN = { 'hours': 24 }
    JWT_REFRESH_LIFESPAN = { 'days': 30 }
    SECURITY_PASSWORD_SALT = 'SUPER_SEcret key that no body will get'