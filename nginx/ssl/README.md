# SSL Certificate Placeholder
# 
# Для production используйте Let's Encrypt или другой SSL сертификат
# 
# Для получения бесплатного SSL сертификата с Let's Encrypt:
# 1. Установите certbot на VDS
# 2. Запустите: certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com
# 3. Сертификаты будут сохранены в /etc/letsencrypt/live/yourdomain.com/
# 4. Скопируйте их в ./nginx/ssl/:
#    - fullchain.pem
#    - privkey.pem
#
# Для автоматического обновления добавьте в crontab:
# 0 0 * * * certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
